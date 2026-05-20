function getThreadIdFromPath() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts[0] === 'messages' && parts[1] ? parts[1] : null;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
}

async function fetchCurrentUser() {
  const email = localStorage.getItem('currentUserEmail');
  if (!email) return null;

  const response = await fetch(`/api/users/me?email=${encodeURIComponent(email)}`);
  if (!response.ok) return null;
  return response.json();
}

async function fetchThread(conversationId, userId) {
  const response = await fetch(
    `/api/messages/conversations/${encodeURIComponent(conversationId)}?user_id=${encodeURIComponent(userId)}`
  );
  if (!response.ok) return null;
  return response.json();
}

async function sendMessage(conversationId, userId, body) {
  const response = await fetch(
    `/api/messages/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, body }),
    }
  );

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || 'Failed to send message');
  }
}

function renderChatBubbles(messages, currentUserId) {
  if (!messages || !messages.length) {
    return '<div class="empty">No messages yet in this conversation.</div>';
  }

  return messages
    .map((message) => {
      const bubbleClass = Number(message.sender_id) === Number(currentUserId) ? 'me' : 'other';
      return `
        <article class="chat-bubble ${bubbleClass}">
          <span class="chat-sender">${escapeHtml(message.sender_name)}</span>
          <p class="chat-body">${escapeHtml(message.body)}</p>
          <span class="chat-time">${escapeHtml(formatDate(message.created_at))}</span>
        </article>
      `;
    })
    .join('');
}

async function initMessagesPage() {
  const threadId = getThreadIdFromPath();
  const threadTitle = document.getElementById('threadTitle');
  const threadMeta = document.getElementById('threadMeta');
  const messageList = document.getElementById('messageList');
  const messageForm = document.getElementById('messageForm');
  const messageInput = document.getElementById('messageInput');
  const sendMessageButton = document.getElementById('sendMessageButton');
  let currentUser = null;
  let pollTimer = null;
  let latestMessageId = 0;
  let isSending = false;

  if (!threadTitle || !threadMeta || !messageList) return;

  if (localStorage.getItem('isLoggedIn') !== 'true') {
    threadTitle.textContent = 'Please log in';
    threadMeta.textContent = 'You need to be logged in to view conversation threads.';
    messageList.innerHTML = '<div class="empty">Not logged in.</div>';
    if (messageForm) messageForm.style.display = 'none';
    return;
  }

  if (!threadId) {
    threadTitle.textContent = 'Thread not found';
    threadMeta.textContent = 'Pick a conversation from the dashboard to load a thread.';
    messageList.innerHTML = '<div class="empty">No messages to display.</div>';
    if (messageForm) messageForm.style.display = 'none';
    return;
  }

  async function refreshThread({ forceScroll = false } = {}) {
    if (!currentUser) return;

    const thread = await fetchThread(threadId, currentUser.id);
    if (!thread || !thread.conversation) {
      threadTitle.textContent = 'Thread not found';
      threadMeta.textContent = 'This conversation is unavailable or you do not have access.';
      messageList.innerHTML = '<div class="empty">No messages to display.</div>';
      if (messageForm) messageForm.style.display = 'none';
      return;
    }

    threadTitle.textContent = `Conversation #${thread.conversation.id}`;
    threadMeta.textContent = (
      `${thread.conversation.buyer_name} and ${thread.conversation.seller_name} ` +
      `• Item: ${thread.conversation.item_title}`
    );

    const messages = thread.messages || [];
    const newestId = messages.length ? Number(messages[messages.length - 1].id) : 0;
    if (newestId !== latestMessageId) {
      const shouldStickToBottom = (
        forceScroll ||
        Math.abs(messageList.scrollHeight - messageList.clientHeight - messageList.scrollTop) < 24
      );

      messageList.innerHTML = renderChatBubbles(messages, currentUser.id);
      latestMessageId = newestId;

      if (shouldStickToBottom) {
        messageList.scrollTop = messageList.scrollHeight;
      }
    }
  }

  try {
    currentUser = await fetchCurrentUser();
    if (!currentUser) {
      threadTitle.textContent = 'User not found';
      threadMeta.textContent = 'Log in with an existing account to view this thread.';
      messageList.innerHTML = '<div class="empty">No messages to display.</div>';
      if (messageForm) messageForm.style.display = 'none';
      return;
    }

    await refreshThread({ forceScroll: true });

    if (messageForm && messageInput && sendMessageButton) {
      messageForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const body = messageInput.value.trim();
        if (!body || !currentUser || isSending) return;

        isSending = true;
        sendMessageButton.disabled = true;

        try {
          await sendMessage(threadId, currentUser.id, body);
          messageInput.value = '';
          await refreshThread({ forceScroll: true });
        } catch (error) {
          threadMeta.textContent = error.message || 'Unable to send message.';
        } finally {
          isSending = false;
          sendMessageButton.disabled = false;
          messageInput.focus();
        }
      });
    }

    pollTimer = window.setInterval(() => {
      refreshThread().catch(() => {
        // Keep polling attempts quiet; user-facing error handled by previous successful load.
      });
    }, 2000);
  } catch (error) {
    threadTitle.textContent = 'Thread unavailable';
    threadMeta.textContent = 'There was a problem loading this conversation.';
    messageList.innerHTML = '<div class="empty">No messages to display.</div>';
    console.error(error);
  }

  window.addEventListener('beforeunload', () => {
    if (pollTimer) window.clearInterval(pollTimer);
  });
}

initMessagesPage();
