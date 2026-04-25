<template>
  <div class="messaging">
    <div class="container">
      <h1>Messages</h1>
      <p v-if="error" class="err">{{ error }}</p>
      <div class="messaging-layout">
        <aside class="conversations">
          <div class="conversations-header"><h3>Conversations</h3></div>

          <div v-if="loading" class="empty-conversations"><p>Loading…</p></div>

          <div v-else-if="conversations.length" class="conv-list">
            <button
              v-for="conv in conversations"
              :key="conv.id"
              class="conv-item"
              :class="{ 'conv-item--active': Number(activeId) === Number(conv.id) }"
              @click="selectConv(Number(conv.id))"
            >
              <div class="conv-avatar">{{ (conv.partner_name || '?')[0] }}</div>
              <div class="conv-info">
                <p class="conv-name">{{ conv.partner_name }}</p>
                <p class="conv-listing">{{ conv.item_title }}</p>
                <p class="conv-last">{{ conv.last_message_preview || '' }}</p>
              </div>
            </button>
          </div>

          <div v-else class="empty-conversations">
            <p>No conversations yet.</p>
          </div>
        </aside>

        <main class="thread">
          <template v-if="activeConversationMeta && threadLoaded">
            <div class="thread-header">
              <div class="thread-avatar">{{ (activeConversationMeta.partner_name || '?')[0] }}</div>
              <div>
                <p class="thread-name">{{ activeConversationMeta.partner_name }}</p>
                <router-link
                  v-if="activeConversationMeta.item_id"
                  :to="'/listing/' + activeConversationMeta.item_id"
                  class="thread-listing"
                >
                  Re: {{ activeConversationMeta.item_title }}
                </router-link>
              </div>
            </div>

            <div class="messages-area" ref="messagesArea">
              <div
                v-for="msg in threadMessages"
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
              <button class="btn-primary" @click="sendReply" :disabled="!replyText.trim() || sendBusy">Send</button>
            </div>
          </template>

          <div v-else-if="!loading" class="empty-thread">
            <p>💬 Select a conversation to start messaging.</p>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import { apiJson, getStoredUser } from '../api.js'

export default {
  name: 'MessagingView',
  data() {
    return {
      conversations: [],
      activeId: null,
      replyText: '',
      threadMessages: [],
      threadLoaded: false,
      loading: true,
      sendBusy: false,
      error: ''
    }
  },
  computed: {
    activeConversationMeta() {
      const aid = Number(this.activeId)
      return this.conversations.find(c => Number(c.id) === aid) || null
    }
  },
  async mounted() {
    const user = getStoredUser()
    if (!user?.id) {
      this.$router.push('/login')
      return
    }
    await this.loadConversations()

    const qConv = this.$route.query.conversation
    const qListing = this.$route.query.listing

    if (qListing) {
      try {
        const data = await apiJson('/api/conversations', {
          method: 'POST',
          body: JSON.stringify({
            buyer_id: user.id,
            item_id: Number.parseInt(qListing, 10)
          })
        })
        await this.loadConversations()
        this.activeId = data.conversation_id
        this.$router.replace({ query: { conversation: String(data.conversation_id) } })
        await this.loadThread(this.activeId)
      } catch (e) {
        this.error = e.message || 'Could not open conversation.'
      }
    } else if (qConv) {
      this.activeId = Number.parseInt(qConv, 10)
      if (Number.isInteger(this.activeId)) await this.loadThread(this.activeId)
    } else if (this.conversations.length) {
      this.activeId = this.conversations[0].id
      await this.loadThread(this.activeId)
    }
  },
  methods: {
    async loadConversations() {
      const user = getStoredUser()
      this.loading = true
      this.error = ''
      try {
        const data = await apiJson(`/api/messages/conversations?user_id=${user.id}`)
        this.conversations = data.conversations || []
      } catch (e) {
        this.error = e.message || 'Failed to load conversations.'
      } finally {
        this.loading = false
      }
    },
    mapThreadMessages(rows, currentUserId) {
      return (rows || []).map(m => ({
        id: m.id,
        sender: m.sender_id === currentUserId ? 'me' : 'them',
        body: m.body,
        time: m.created_at
          ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : ''
      }))
    },
    async loadThread(conversationId) {
      const user = getStoredUser()
      if (!user?.id || !conversationId) return
      this.threadLoaded = false
      try {
        const data = await apiJson(
          `/api/messages/conversations/${conversationId}?user_id=${user.id}`
        )
        this.threadMessages = this.mapThreadMessages(data.messages, user.id)
        this.threadLoaded = true
        this.$nextTick(() => this.scrollThread())
      } catch (e) {
        this.error = e.message || 'Failed to load messages.'
        this.threadMessages = []
        this.threadLoaded = true
      }
    },
    scrollThread() {
      const area = this.$refs.messagesArea
      if (area) area.scrollTop = area.scrollHeight
    },
    async selectConv(id) {
      this.activeId = id
      await this.loadThread(id)
    },
    async sendReply() {
      const text = this.replyText.trim()
      const user = getStoredUser()
      if (!text || !this.activeId || !user?.id) return
      this.sendBusy = true
      try {
        await apiJson(`/api/messages/conversations/${this.activeId}/messages`, {
          method: 'POST',
          body: JSON.stringify({ user_id: user.id, body: text })
        })
        this.replyText = ''
        await this.loadThread(this.activeId)
        await this.loadConversations()
      } catch (e) {
        this.error = e.message || 'Send failed.'
      } finally {
        this.sendBusy = false
      }
    }
  }
}
</script>

<style scoped>
.messaging { padding: 40px 0 80px; background: #f8faff; }

.err { color: #dc2626; margin-bottom: 12px; }

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
