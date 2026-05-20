<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <span class="logo">Gator Freighter</span>
        <p>The SFSU student marketplace for buying, selling, and connecting on campus.</p>
      </div>
      <div class="footer-links">
        <div class="footer-col">
          <h4>Marketplace</h4>
          <router-link to="/search">Browse Listings</router-link>
          <router-link to="/dashboard">My Dashboard</router-link>
          <router-link to="/messages">Messages</router-link>
        </div>
        <div class="footer-col">
          <h4>About</h4>
          <router-link to="/about">About Us</router-link>
          <router-link to="/team">Our Team</router-link>
        </div>
        <div class="footer-col">
          <h4>Account</h4>
          <router-link to="/login">Log In</router-link>
          <router-link to="/register">Sign Up</router-link>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 Gator Freighter · CSC 648 Team 14 · SFSU</p>
      <p class="disclaimer">SFSU Software Engineering Project CSC 648-848, Spring 2026. For Demonstration Only.</p>
    </div>
  </footer>
</template>

<script>
export default { name: 'AppFooter' }
</script>

<style scoped>
.footer {
  background: #111827;
  color: #9ca3af;
  margin-top: auto;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 42px 32px;
  display: flex;
  gap: 60px;
  justify-content: space-between;
  flex-wrap: wrap;
}

.footer-brand { max-width: 280px; }

.logo {
  font-size: 20px;
  font-weight: 800;
  color: white;
  display: block;
  margin-bottom: 12px;
}

.footer-brand p { font-size: 14px; line-height: 1.7; }

.footer-links { display: flex; gap: 48px; flex-wrap: wrap; }

.footer-col { display: flex; flex-direction: column; gap: 10px; }

.footer-col h4 {
  color: white;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin: 0 0 4px 0;
}

.footer-col a {
  color: #9ca3af;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.footer-col a:hover { color: white; }

.footer-bottom {
  border-top: 1px solid #1f2937;
  padding: 18px 42px;
  text-align: center;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.disclaimer {
  font-size: 11px;
  color: #6b7280;
  letter-spacing: 0.3px;
}
</style>