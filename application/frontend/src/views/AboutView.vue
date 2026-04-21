<template>
  <div class="about">
    <div class="container">
      <section class="about-hero">
        <p class="eyebrow">ABOUT US</p>
        <h1>Built by Gators, for Gators.</h1>
        <p class="subtitle">
          Gator Freighter is a student-built marketplace designed exclusively for the SFSU community.
        </p>
      </section>

      <section class="about-mission">
        <h2>Our Mission</h2>
        <p>
          To create a safe, trusted, and easy-to-use platform that empowers SFSU students
          to exchange goods and services within their campus community.
        </p>
      </section>

      <section class="about-values">
        <div class="value-grid">
          <div class="value-card">
            <h3>🔒 Safety First</h3>
            <p>Only verified SFSU students can access the platform.</p>
          </div>
          <div class="value-card">
            <h3>🤝 Community Driven</h3>
            <p>Built by students who understand what students actually need.</p>
          </div>
          <div class="value-card">
            <h3>🚀 Simple & Fast</h3>
            <p>Post a listing in minutes. Find what you need without the noise.</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default { name: 'AboutView' }
</script>

<style scoped>
.about { padding: 60px 0 80px; background: linear-gradient(135deg, #f8faff 0%, #eef2ff 100%); }

.about-hero { text-align: center; margin-bottom: 60px; }

.eyebrow { color: #4f46e5; font-size: 13px; font-weight: 800; letter-spacing: 1px; margin-bottom: 14px; }

h1 { font-size: 56px; line-height: 1.05; color: #111827; margin-bottom: 18px; }

.subtitle { font-size: 18px; color: #4b5563; line-height: 1.7; max-width: 600px; margin: 0 auto; }

.about-mission {
  background: white;
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 4px 24px rgba(79, 70, 229, 0.07);
}

.about-mission h2 { font-size: 28px; color: #111827; margin-bottom: 14px; }

.about-mission p { font-size: 17px; color: #4b5563; line-height: 1.8; }

.value-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }

.value-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 28px 24px; }

.value-card h3 { font-size: 18px; color: #111827; margin-bottom: 10px; }

.value-card p { color: #6b7280; line-height: 1.6; }

@media (max-width: 768px) {
  h1 { font-size: 36px; }
  .value-grid { grid-template-columns: 1fr; }
}
</style>