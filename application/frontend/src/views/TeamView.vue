<template>
  <div class="team-page">
    <div class="container">
      <section class="team-hero">
        <p class="eyebrow">OUR TEAM</p>
        <h1>Meet the Team</h1>
        <p class="subtitle">CSC 648 Team 14 — SFSU Spring 2026.</p>
      </section>

      <div class="team-grid">
        <div class="team-card" v-for="member in team" :key="member.name">
          <div class="member-avatar">
            <img v-if="member.photo" :src="member.photo" :alt="member.name" />
            <div v-else class="avatar-placeholder">{{ member.initials }}</div>
          </div>
          <h3>{{ member.name }}</h3>
          <p class="member-role">{{ member.role }}</p>
          <p class="member-bio">{{ member.bio }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TeamView',
  data() {
    return {
      team: [
        { name: 'Jordan Westover',   initials: 'JW', role: 'Frontend Lead',  bio: 'TODO', photo: null },
        { name: 'Kiran Khatri',      initials: 'KK', role: 'TODO',           bio: 'TODO', photo: null },
        { name: 'Leslie Garcia',     initials: 'LG', role: 'TODO',           bio: 'TODO', photo: null },
        { name: 'Christopher Huynh', initials: 'CH', role: 'TODO',           bio: 'TODO', photo: null },
        { name: 'Gursimran Grewal',  initials: 'GG', role: 'TODO',           bio: 'TODO', photo: null },
        { name: 'Stiofan Condon',    initials: 'SC', role: 'TODO',           bio: 'TODO', photo: null },
        { name: 'Gabriel Purizaca',  initials: 'GP', role: 'TODO',           bio: 'TODO', photo: null },
      ]
    }
  }
}
</script>

<style scoped>
.team-page { padding: 60px 0 80px; background: linear-gradient(135deg, #f8faff 0%, #eef2ff 100%); }

.team-hero { text-align: center; margin-bottom: 56px; }

.eyebrow { color: #4f46e5; font-size: 13px; font-weight: 800; letter-spacing: 1px; margin-bottom: 14px; }

h1 { font-size: 52px; color: #111827; margin-bottom: 16px; }

.subtitle { font-size: 18px; color: #4b5563; }

.team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }

.team-card { background: white; border: 1px solid #e5e7eb; border-radius: 20px; padding: 32px 24px; text-align: center; transition: box-shadow 0.2s; }

.team-card:hover { box-shadow: 0 12px 32px rgba(79, 70, 229, 0.1); }

.member-avatar { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 16px; overflow: hidden; background: #eef2ff; display: flex; align-items: center; justify-content: center; }

.member-avatar img { width: 100%; height: 100%; object-fit: cover; }

.avatar-placeholder { font-size: 24px; font-weight: 800; color: #4f46e5; }

.team-card h3 { font-size: 18px; color: #111827; margin-bottom: 6px; }

.member-role { font-size: 13px; font-weight: 700; color: #4f46e5; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }

.member-bio { font-size: 14px; color: #6b7280; line-height: 1.6; }
</style>