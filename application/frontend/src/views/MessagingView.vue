<template>
  <div class="messaging">
    <div class="container">
      <h1>Messages</h1>
      <div class="messaging-layout">
        <aside class="conversations">
          <div class="conversations-header"><h3>Conversations</h3></div>

          <div v-if="conversations.length" class="conv-list">
            <button
              v-for="conv in conversations"
              :key="conv.id"
              class="conv-item"
              :class="{ 'conv-item--active': activeId === conv.id }"
              @click="activeId = conv.id"
            >
              <div class="conv-avatar">{{ conv.otherPartyName[0] }}</div>
              <div class="conv-info">
                <p class="conv-name">{{ conv.otherPartyName }}</p>
                <p class="conv-listing">{{ conv.listingTitle }}</p>
                <p class="conv-last">{{ lastMessage(conv) }}</p>
              </div>
            </button>
          </div>

          <div v-else class="empty-conversations">
            <p>No conversations yet.</p>
          </div>
        </aside>

        <main class="thread">
          <template v-if="activeConversation">
            <div class="thread-header">
              <div class="thread-avatar">{{ activeConversation.otherPartyName[0] }}</div>
              <div>
                <p class="thread-name">{{ activeConversation.otherPartyName }}</p>
                <router-link :to="'/listing/' + activeConversation.listingId" class="thread-listing">
                  Re: {{ activeConversation.listingTitle }}
                </router-link>
              </div>
            </div>

            <div class="messages-area" ref="messagesArea">
              <div
                v-for="msg in activeConversation.messages"
                :key="msg.id"
                class="message-bubble"
                :class="msg.sender === 'me' ? 'bubble--me' : 'bubble--them'"
              >
                <p>{{ msg.body }}</p>
                <span class="bubble-time">{{ msg.time }}</span>
              </div>
            </div>

            <div class="reply-bar">
              <input
                v-model="replyText"
                type="text"
                placeholder="Type a message..."
                @keyup.enter="sendReply"
              />
              <button class="btn-primary" @click="sendReply" :disabled="!replyText.trim()">Send</button>
            </div>
          </template>

          <div v-else class="empty-thread">
            <p>💬 Select a conversation to start messaging.</p>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import { conversations } from '../data/mockData.js'

export default {
  name: 'MessagingView',
  data() {
    return {
      conversations,
      activeId: conversations.length ? conversations[0].id : null,
      replyText: ''
    }
  },
  computed: {
    activeConversation() {
      return this.conversations.find(c => c.id === this.activeId) || null
    }
  },
  mounted() {
    const listingId = this.$route.query.listing
    if (listingId) {
      const match = this.conversations.find(c => c.listingId === parseInt(listingId))
      if (match) this.activeId = match.id
    }
  },
  methods: {
    lastMessage(conv) {
      const last = conv.messages[conv.messages.length - 1]
      return last ? last.body : ''
    },
    sendReply() {
      if (!this.replyText.trim() || !this.activeConversation) return
      this.activeConversation.messages.push({
        id: Date.now(),
        sender: 'me',
        body: this.replyText.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      this.replyText = ''
      this.$nextTick(() => {
        const area = this.$refs.messagesArea
        if (area) area.scrollTop = area.scrollHeight
      })
    }
  }
}
</script>

<style scoped>
.messaging { padding: 40px 0 80px; background: #f8faff; }

h1 { font-size: 40px; color: #111827; margin-bottom: 28px; }

.messaging-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  overflow: hidden;
  height: 600px;
}

.conversations { border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; }

.conversations-header { padding: 20px; border-bottom: 1px solid #e5e7eb; flex-shrink: 0; }

.conversations-header h3 { font-size: 16px; color: #111827; }

.conv-list { overflow-y: auto; flex: 1; }

.conv-item {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  text-align: left;
  transition: background 0.15s;
}

.conv-item:hover { background: #f9fafb; }

.conv-item--active { background: #eef2ff; }

.conv-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4f46e5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  flex-shrink: 0;
}

.conv-info { flex: 1; min-width: 0; }

.conv-name { font-size: 14px; font-weight: 700; color: #111827; }

.conv-listing { font-size: 12px; color: #4f46e5; font-weight: 600; margin: 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.conv-last { font-size: 12px; color: #9ca3af; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.empty-conversations { padding: 32px 20px; text-align: center; color: #9ca3af; font-size: 14px; }

.thread { display: flex; flex-direction: column; }

.thread-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.thread-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4f46e5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  flex-shrink: 0;
}

.thread-name { font-size: 15px; font-weight: 700; color: #111827; }

.thread-listing { font-size: 12px; color: #4f46e5; text-decoration: none; font-weight: 600; }

.thread-listing:hover { text-decoration: underline; }

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bubble--them {
  align-self: flex-start;
  background: #f3f4f6;
  border-bottom-left-radius: 4px;
}

.bubble--me {
  align-self: flex-end;
  background: #4f46e5;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-bubble p { font-size: 15px; line-height: 1.5; }

.bubble-time { font-size: 11px; opacity: 0.65; align-self: flex-end; }

.reply-bar {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.reply-bar input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 15px;
  font-family: Arial, sans-serif;
}

.reply-bar input:focus { outline: none; border-color: #4f46e5; }

button:disabled { opacity: 0.5; cursor: not-allowed; }

.empty-thread { flex: 1; display: flex; align-items: center; justify-content: center; color: #9ca3af; }

@media (max-width: 768px) {
  .messaging-layout { grid-template-columns: 1fr; height: auto; }
  .conversations { height: 240px; border-right: none; border-bottom: 1px solid #e5e7eb; }
  .thread { height: 420px; }
}
</style>
