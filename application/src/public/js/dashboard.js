function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(value) {
  if (!value) return 'No messages yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No messages yet';
  return date.toLocaleString();
}

function renderConversationCard(conversation, currentUserName) {
  const partnerName = conversation.partner_name || 'Unknown user';
  const itemTitle = conversation.item_title || 'Unknown item';
  const preview = conversation.last_message_preview || 'No messages yet';
  return `
    <article class="card">
      <div class="card-content">
        <h3>Conversation #${conversation.id}</h3>
        <p>Participants: ${escapeHtml(currentUserName)}, ${escapeHtml(partnerName)}</p>
        <div class="row">
          <span><strong>Item:</strong> ${escapeHtml(itemTitle)}</span>
        </div>
        <div class="row">
          <span><strong>Last message:</strong> ${escapeHtml(preview)}</span>
          <span><strong>Updated:</strong> ${escapeHtml(formatDate(conversation.last_activity_at))}</span>
        </div>
        <p style="margin-top: 10px;">
          <a href="/messages/${conversation.id}">Open thread</a>
        </p>
      </div>
    </article>
  `;
}

async function fetchCurrentUser() {
  const email = localStorage.getItem('currentUserEmail');
  if (!email) return null;

  const response = await fetch(`/api/users/me?email=${encodeURIComponent(email)}`);
  if (!response.ok) return null;
  return response.json();
}

async function fetchConversations(userId) {
  const response = await fetch(`/api/messages/conversations?user_id=${encodeURIComponent(userId)}`);
  if (!response.ok) {
    throw new Error('Failed to load conversations');
  }
  return response.json();
}

function setupLogoutButton() {
  const logoutButton = document.getElementById('logoutButton');
  if (!logoutButton) return;

  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('currentUserName');
    window.location.href = '/';
  });
}

async function renderDashboard() {
  const conversationList = document.getElementById('conversationList');
  const currentUserLabel = document.getElementById('currentUserLabel');
  if (!conversationList) return;

  if (localStorage.getItem('isLoggedIn') !== 'true') {
    if (currentUserLabel) currentUserLabel.textContent = 'Not logged in';
    conversationList.innerHTML = '<div class="empty">Please log in to view your dashboard.</div>';
    return;
  }

  try {
    const user = await fetchCurrentUser();
    if (!user) {
      const fallbackName = localStorage.getItem('currentUserName') || 'Unknown user';
      if (currentUserLabel) currentUserLabel.textContent = fallbackName;
      conversationList.innerHTML = (
        '<div class="empty">Could not find this user in the database. ' +
        'Log in with an existing account to view conversations.</div>'
      );
      return;
    }

    const currentUserName = `${user.first_name} ${user.last_name}`.trim();
    if (currentUserLabel) currentUserLabel.textContent = currentUserName;

    const data = await fetchConversations(user.id);
    if (!data.conversations || !data.conversations.length) {
      conversationList.innerHTML = '<div class="empty">No conversations yet.</div>';
      return;
    }

    conversationList.innerHTML = data.conversations
      .map((conversation) => renderConversationCard(conversation, currentUserName))
      .join('');
  } catch (error) {
    if (currentUserLabel) currentUserLabel.textContent = 'Unknown user';
    conversationList.innerHTML = '<div class="empty">No conversations yet.</div>';
    console.error(error);
  }
}

setupLogoutButton();
renderDashboard();
