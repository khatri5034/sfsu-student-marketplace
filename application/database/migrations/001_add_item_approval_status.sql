-- Idempotent: safe on fresh schema (column already present) or old volumes.
-- Keeps existing rows visible: after ADD, default is approved; then default for new rows is pending.

SET @db = DATABASE();

SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'items' AND COLUMN_NAME = 'approval_status'
);

SET @sql_add := IF(@col_exists = 0,
  'ALTER TABLE items ADD COLUMN approval_status ENUM(''pending'', ''approved'', ''rejected'') NOT NULL DEFAULT ''approved'' AFTER status',
  'SELECT 1');

PREPARE stmt_add FROM @sql_add;
EXECUTE stmt_add;
DEALLOCATE PREPARE stmt_add;

SET @col_exists2 := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'items' AND COLUMN_NAME = 'approval_status'
);

SET @sql_mod := IF(@col_exists2 > 0 AND @col_exists = 0,
  'ALTER TABLE items MODIFY COLUMN approval_status ENUM(''pending'', ''approved'', ''rejected'') NOT NULL DEFAULT ''pending''',
  'SELECT 1');

PREPARE stmt_mod FROM @sql_mod;
EXECUTE stmt_mod;
DEALLOCATE PREPARE stmt_mod;

SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'items' AND INDEX_NAME = 'idx_items_approval_status'
);

SET @sql_idx := IF(@idx_exists = 0,
  'CREATE INDEX idx_items_approval_status ON items(approval_status)',
  'SELECT 1');

PREPARE stmt_idx FROM @sql_idx;
EXECUTE stmt_idx;
DEALLOCATE PREPARE stmt_idx;
