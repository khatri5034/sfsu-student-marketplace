<template>
  <div class="messaging">
    <div class="container">
      <h1>Messages</h1>
      <div class="messaging-layout">
        <aside class="conversations">
          <div class="conversations-header"><h3>Conversations</h3></div>
          <div class="empty-conversations">
            <p>No conversations yet.</p>
          </div>
        </aside>

        <main class="thread">
          <div class="empty-thread">
            <p>💬 Select a conversation to start messaging.</p>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
export default { name: 'MessagingView' }
</script>

<style scoped>
.messaging { padding: 40px 0 80px; background: #f8faff; }

h1 { font-size: 40px; color: #111827; margin-bottom: 28px; }

.messaging-layout { display: grid; grid-template-columns: 300px 1fr; background: white; border: 1px solid #e5e7eb; border-radius: 20px; overflow: hidden; height: 600px; }

.conversations { border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; }

.conversations-header { padding: 20px; border-bottom: 1px solid #e5e7eb; }

.conversations-header h3 { font-size: 16px; color: #111827; }

.empty-conversations { padding: 32px 20px; text-align: center; color: #9ca3af; font-size: 14px; }

.thread { display: flex; flex-direction: column; }

.empty-thread { flex: 1; display: flex; align-items: center; justify-content: center; color: #9ca3af; }

@media (max-width: 768px) {
  .messaging-layout { grid-template-columns: 1fr; height: auto; }
  .conversations { height: 240px; border-right: none; border-bottom: 1px solid #e5e7eb; }
  .thread { height: 400px; }
}
</style>