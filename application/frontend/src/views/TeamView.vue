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
        { name: 'Leslie Garcia',     initials: 'LG', role: 'Team Lead',  bio: "Hello! I'm Leslie Garcia and I'm a senior at San Frasncisco State University who is currently pursing a Computer Science degree. I graduate in May 2026 and a few of my interests include sewing, dancing, and watching indie films. I am passionate about software development and am eager to continue learning more about maintaining software applications.", photo: null },
        { name: 'Jordan Westover',   initials: 'JW', role: 'Front-End Lead',           bio: "Hi there! I am Jordan Westover, a senior Computer Science student at San Francisco State University. I am interested in golf, gaming, and camping. While I've enjoyed the hardware aspect of computing, I got into programming because of the problem solving and creative outlet it offers.", photo: null },
        { name: 'Gursimran Grewal',  initials: 'GG', role: 'GitHub Maintainer',           bio: " Hi, I’m Gursimran Grewal, a Computer Science student at San Francisco State University. I’m passionate about software engineering, backend development, and building scalablesystems. I enjoy working with technologies like Node.js, Docker, MySQL, and AWS, and I’m currently focused on strengthening my DevOps and system design skills.", photo: null },
        { name: 'Stiofan Condon',    initials: 'SC', role: 'Back-End Lead',           bio: " I am a Computer Science student at San Francisco State University. My interests include gaming, 3D printing, and experimenting with different kinds computer hardware. I also enjoy getting out when I can to ski, hike, or just explore.", photo: null },
        { name: 'Kiran Khatri',      initials: 'KK', role: 'TODO',           bio: "Hey! I'm Kiran Khatri — a senior at San Francisco State University studying Computer Science and graduating in May 2026. I'm an international student who loves watching sci‑fi movies and hiking, and I'm interested in artificial intelligence and machine learning applications in robotics.", photo: null },
        { name: 'Christopher Huynh', initials: 'CH', role: 'TODO',           bio: "I'm a Senior majoring in  Computer Science  who's into exploring nature, video games, reading and e-sports. In terms of academics, I enjoy taking math classes, and more lower level programming. I Also enjoy taking random classes to just learn more things.", photo: null },
        { name: 'Gabriel Purizaca',  initials: 'GP', role: 'TODO',           bio: "Hi! I'm Gabriel Purizaca, a Computer Science student at San Francisco State University. I enjoy solving challenging problems, learning how systems operate at a deeper level, and algorithms. Outside of school, my hobbies are basketball, cooking, and investing. I also love trying new foods!", photo: null },
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