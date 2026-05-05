#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$APP_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE" >&2
  exit 1
fi

set -a
# shellcheck source=/dev/null
. "$ENV_FILE"
set +a

COMPOSE="docker compose --env-file $ENV_FILE -f $APP_DIR/docker-compose.yml"

mysql_exec() {
  $COMPOSE exec -T mysql env MYSQL_PWD="$DB_PASSWORD" mysql -u"$DB_USER" "$DB_NAME" "$@"
}

hr() {
  printf '%s\n' '--------------------------------------------------------------------------------'
}

banner() {
  hr
  printf '  %s\n' "$1"
  hr
}

print_help() {
  banner 'Command reference'
  mysql_exec --table -e "
SELECT '1' AS opt, 'List all pending listings (table)' AS description
UNION ALL SELECT '2', 'Approve one listing (prompts for ID)'
UNION ALL SELECT '3', 'Reject one listing (prompts for ID)'
UNION ALL SELECT '4', 'Counts: pending / approved / rejected'
UNION ALL SELECT '5', 'Last 10 rejected (audit trail)'
UNION ALL SELECT '6', 'Show this help again'
UNION ALL SELECT '7', 'Permanently delete one rejected listing (by ID)'
UNION ALL SELECT '8', 'Move one rejected listing back to pending (re-review)'
UNION ALL SELECT '0', 'Exit'
;
  "
  echo ""
  echo "Notes:"
  echo "  • Approve/reject only apply when the listing is still pending."
  echo "  • Option 7 removes the row from MySQL only if it is still rejected (CASCADE: images, messages, etc.)."
  echo "  • Option 8 sets approval back to pending so the listing can be approved or rejected again (not public until approved)."
  echo "  • After updates, restart the app so Meilisearch matches MySQL."
  echo ""
}

is_uint() {
  case "$1" in
    ''|*[!0-9]*) return 1 ;;
    0) return 1 ;;
  esac
  return 0
}

show_stats() {
  banner 'Listings by approval status'
  mysql_exec --table -e "
    SELECT
      approval_status AS status,
      COUNT(*)        AS count
    FROM items
    GROUP BY approval_status
    ORDER BY FIELD(approval_status, 'pending', 'approved', 'rejected');
  "
}

list_pending() {
  banner 'Pending listings (oldest first — review top rows first)'
  cnt=$(mysql_exec -N -B -e "SELECT COUNT(*) FROM items WHERE approval_status = 'pending';")
  if [ "${cnt:-0}" -eq 0 ]; then
    echo "(No pending listings.)"
    echo ""
    return 0
  fi
  printf 'Total pending: %s\n\n' "$cnt"
  mysql_exec --table -e "
    SELECT
      i.id                                               AS id,
      LEFT(i.title, 48)                                  AS title,
      TRIM(CONCAT(IFNULL(u.first_name, ''), ' ', IFNULL(u.last_name, ''))) AS seller_name,
      u.school_email                                     AS seller_email,
      DATE_FORMAT(i.created_at, '%Y-%m-%d %H:%i')        AS created,
      i.listing_type                                     AS type,
      i.status                                           AS item_status
    FROM items i
    JOIN users u ON u.id = i.seller_id
    WHERE i.approval_status = 'pending'
    ORDER BY i.created_at ASC, i.id ASC;
  "
  echo ""
}

list_rejected_all() {
  _note=${1:-'max 100 rows'}
  banner "Rejected listings ($_note)"
  cnt=$(mysql_exec -N -B -e "SELECT COUNT(*) FROM items WHERE approval_status = 'rejected';")
  if [ "${cnt:-0}" -eq 0 ]; then
    echo "(No rejected listings.)"
    echo ""
    return 1
  fi
  printf 'Total rejected: %s\n\n' "$cnt"
  mysql_exec --table -e "
    SELECT
      i.id                                        AS id,
      LEFT(i.title, 44)                           AS title,
      u.school_email                              AS seller_email,
      DATE_FORMAT(i.updated_at, '%Y-%m-%d %H:%i') AS updated
    FROM items i
    JOIN users u ON u.id = i.seller_id
    WHERE i.approval_status = 'rejected'
    ORDER BY i.id ASC
    LIMIT 100;
  "
  echo ""
  return 0
}

delete_rejected_prompt() {
  if ! list_rejected_all 'max 100 shown — pick an ID to delete permanently'; then
    return 0
  fi
  printf 'ID to DELETE from database (rejected only): '
  read -r id || true
  if ! is_uint "$id"; then
    echo "Need a positive numeric id." >&2
    return 1
  fi
  status=$(mysql_exec -N -B -e "SELECT approval_status FROM items WHERE id = $id LIMIT 1;" || true)
  if [ -z "$status" ]; then
    echo "No listing with id $id." >&2
    return 1
  fi
  if [ "$status" != "rejected" ]; then
    echo "Listing $id is '$status', not rejected. Use this option only for rejected rows." >&2
    echo ""
    return 1
  fi
  mysql_exec --table -e "
    SELECT
      i.id                                        AS id,
      LEFT(i.title, 56)                           AS title,
      i.approval_status                           AS approval,
      u.school_email                              AS seller_email
    FROM items i
    JOIN users u ON u.id = i.seller_id
    WHERE i.id = $id;
  "
  echo ""
  echo "This removes the listing and related rows (images, conversations, …) via foreign keys."
  printf 'Type DELETE in capitals to confirm: '
  read -r confirm || true
  if [ "${confirm:-}" != "DELETE" ]; then
    echo "Cancelled."
    echo ""
    return 0
  fi
  cnt=$(mysql_exec -N -B -e "
    DELETE FROM items WHERE id = $id AND approval_status = 'rejected';
    SELECT ROW_COUNT();
  ")
  if [ "${cnt:-0}" -eq 0 ]; then
    echo "No row deleted: id $id is missing or not rejected." >&2
    echo ""
    return 1
  fi
  banner "Deleted listing id=$id (was rejected)"
  echo ""
  confirm_restart
}

rejected_to_pending_prompt() {
  if ! list_rejected_all 'max 100 shown — pick an ID to return to the pending queue'; then
    return 0
  fi
  printf 'ID to set back to pending (rejected only): '
  read -r id || true
  if ! is_uint "$id"; then
    echo "Need a positive numeric id." >&2
    return 1
  fi
  status=$(mysql_exec -N -B -e "SELECT approval_status FROM items WHERE id = $id LIMIT 1;" || true)
  if [ -z "$status" ]; then
    echo "No listing with id $id." >&2
    return 1
  fi
  if [ "$status" != "rejected" ]; then
    echo "Listing $id is '$status', not rejected." >&2
    echo ""
    return 1
  fi
  mysql_exec --table -e "
    SELECT
      i.id                                        AS id,
      LEFT(i.title, 56)                           AS title,
      i.approval_status                           AS approval,
      u.school_email                              AS seller_email
    FROM items i
    JOIN users u ON u.id = i.seller_id
    WHERE i.id = $id;
  "
  echo ""
  printf 'Set this listing to pending for re-review? [y/N] '
  read -r confirm || true
  case "${confirm:-}" in
    y|Y|yes|YES) ;;
    *)
      echo "Cancelled."
      echo ""
      return 0
      ;;
  esac
  cnt=$(mysql_exec -N -B -e "
    UPDATE items SET approval_status = 'pending' WHERE id = $id AND approval_status = 'rejected';
    SELECT ROW_COUNT();
  ")
  if [ "${cnt:-0}" -eq 0 ]; then
    echo "No row updated: id $id is missing or not rejected." >&2
    echo ""
    return 1
  fi
  banner "Listing id=$id is now pending (re-review queue)"
  mysql_exec --table -e "
    SELECT
      i.id                                        AS id,
      LEFT(i.title, 56)                           AS title,
      i.approval_status                           AS approval,
      u.school_email                              AS seller_email,
      DATE_FORMAT(i.updated_at, '%Y-%m-%d %H:%i') AS updated
    FROM items i
    JOIN users u ON u.id = i.seller_id
    WHERE i.id = $id;
  "
  echo ""
  confirm_restart
}

list_rejected_recent() {
  banner 'Recently rejected (last 10)'
  mysql_exec --table -e "
    SELECT
      i.id                                        AS id,
      LEFT(i.title, 40)                           AS title,
      u.school_email                              AS seller_email,
      DATE_FORMAT(i.updated_at, '%Y-%m-%d %H:%i') AS updated
    FROM items i
    JOIN users u ON u.id = i.seller_id
    WHERE i.approval_status = 'rejected'
    ORDER BY i.updated_at DESC, i.id DESC
    LIMIT 10;
  "
  echo ""
}

set_status() {
  id="$1"
  st="$2"
  if ! is_uint "$id"; then
    echo "Invalid id: $id" >&2
    return 1
  fi
  case "$st" in
    approved|rejected) ;;
    *) echo "Invalid status" >&2; return 1 ;;
  esac
  cnt=$(mysql_exec -N -B -e "
    UPDATE items SET approval_status = '$st' WHERE id = $id AND approval_status = 'pending';
    SELECT ROW_COUNT();
  ")
  if [ "${cnt:-0}" -eq 0 ]; then
    echo "No change: id $id is missing or not pending." >&2
    return 1
  fi
  banner "Updated listing id=$id → $st"
  mysql_exec --table -e "
    SELECT
      i.id                                        AS id,
      LEFT(i.title, 56)                           AS title,
      i.approval_status                           AS approval,
      u.school_email                              AS seller_email,
      DATE_FORMAT(i.updated_at, '%Y-%m-%d %H:%i') AS updated
    FROM items i
    JOIN users u ON u.id = i.seller_id
    WHERE i.id = $id;
  "
  echo ""
  return 0
}

refresh_search_index() {
  echo "Restarting app container (Meilisearch re-sync from MySQL)..."
  $COMPOSE restart app
  echo "Done."
}

confirm_restart() {
  printf 'Restart app now so search/homepage match the database? [Y/n] '
  read -r ans || true
  case "${ans:-y}" in
    n|N|no|NO)
      echo "Skipped. When ready: docker compose --env-file .env -f docker-compose.yml restart app"
      ;;
    *)
      refresh_search_index
      ;;
  esac
  echo ""
}

prompt_id_action() {
  action="$1"
  st="$2"
  word=$([ "$st" = approved ] && echo Approve || echo Reject)
  printf '%s listing ID (see table above): ' "$word"
  read -r id || true
  if ! is_uint "$id"; then
    echo "Need a positive numeric id." >&2
    return 1
  fi
  if set_status "$id" "$st"; then
    confirm_restart
  fi
}

clear_screen() {
  if command -v clear >/dev/null 2>&1; then
    clear
  else
    printf '\n\n\n'
  fi
}

# --- main -------------------------------------------------------------------

clear_screen 2>/dev/null || true

banner 'Gator Freighter — listing approval'
echo "Database: ${DB_NAME}   (credentials from ${ENV_FILE})"
echo ""
print_help

while true; do
  echo ''
  hr
  printf '  %-3s  %s\n' '1' 'List pending'  '2' 'Approve'  '3' 'Reject'
  printf '  %-3s  %s\n' '4' 'Status counts'  '5' 'Recent rejected'  '6' 'Full help'
  printf '  %-3s  %s\n' '7' 'Delete rejected'  '8' 'Rejected → pending'  '0' 'Quit'
  hr
  printf 'Choice: '
  read -r choice || break
  case "$choice" in
    1) list_pending ;;
    2) list_pending; prompt_id_action approve approved ;;
    3) list_pending; prompt_id_action reject rejected ;;
    4) show_stats ;;
    5) list_rejected_recent ;;
    6) print_help ;;
    7) delete_rejected_prompt ;;
    8) rejected_to_pending_prompt ;;
    0|q|Q|quit|exit) break ;;
    '') ;;
    *) echo "Unknown choice: $choice (try 1–8 or 0)" ;;
  esac
done

echo ''
echo 'Goodbye.'
echo ''
