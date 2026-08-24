<template>
  <nav class="navbar">
    <!-- Disclaimer banner — required on all pages -->
    <div class="disclaimer-banner">
      SFSU Software Engineering Project CSC 648-848, Spring 2026. For Demonstration Only
    </div>

    <!-- Main nav row -->
    <div class="navbar-main">
      <router-link to="/" class="logo">
        <img :src="logoSrc" alt="Gator Freightor logo" class="logo-img" />
        Gator Freighter
      </router-link>

      <!-- Hamburger button (mobile only) -->
      <button class="hamburger" @click="menuOpen = !menuOpen" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>

      <!-- Nav links (desktop always visible; mobile toggled) -->
      <div class="nav-links" :class="{ open: menuOpen }">
        <router-link to="/" class="nav-link" @click="menuOpen = false">Home</router-link>
        <router-link to="/search" class="nav-link" @click="menuOpen = false">Browse</router-link>
        <router-link to="/about" class="nav-link" @click="menuOpen = false">About</router-link>
        <router-link to="/team" class="nav-link" @click="menuOpen = false">Team</router-link>
        <template v-if="!loggedIn">
          <router-link to="/login" class="nav-link" @click="menuOpen = false">Log in</router-link>
          <router-link to="/register" class="nav-button" @click="menuOpen = false">Sign up</router-link>
        </template>
        <template v-else>
          <router-link to="/create-listing" class="nav-button nav-button--post" @click="menuOpen = false">+ Post Listing</router-link>
          <router-link to="/dashboard" class="nav-link" @click="menuOpen = false">Dashboard</router-link>
          <router-link to="/messages" class="nav-link" @click="menuOpen = false">Messages</router-link>
          <router-link to="/trades" class="nav-link" @click="menuOpen = false">Trades</router-link>
          <button class="nav-button nav-button--outline" @click="logout">Log out</button>
        </template>
      </div>
    </div>
  </nav>
</template>

<script>

import gatorLogo from '../assets/GatorFreightor.png'

export default {
  name: 'NavBar',
  data() {
    return {
      loggedIn: !!localStorage.getItem('gf_user'),
      logoSrc: gatorLogo,
      menuOpen: false
    }
  },
  watch: {
    $route() {
      this.loggedIn = !!localStorage.getItem('gf_user')
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('gf_user')
      this.loggedIn = false
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  flex-direction: column;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 100;
}

/* ── Disclaimer banner ── */
.disclaimer-banner {
  width: 100%;
  background: #312e81;
  color: #ffffff;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 16px;
  box-sizing: border-box;
  letter-spacing: 0.01em;
}

/* ── Main nav row ── */
.navbar-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 42px;
  width: 100%;
  box-sizing: border-box;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  font-weight: 800;
  color: #312e81;
  text-decoration: none;
}

.logo-img {
  height: 50px;
  width: auto;
}

/* ── Hamburger button (hidden on desktop) ── */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.hamburger span {
  display: block;
  width: 26px;
  height: 3px;
  background: #312e81;
  border-radius: 2px;
}

/* ── Nav links ── */
.nav-links {
  display: flex;
  align-items: center;
  gap: 14px;
}

.nav-link {
  color: #374151;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active { color: #4f46e5; }

.nav-button {
  background: #4f46e5;
  color: white;
  text-decoration: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 15px;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.nav-button:hover { background: #4338ca; }

.nav-button--post {
  background: linear-gradient(135deg, #4f46e5, #6366f1);
}

.nav-button--outline {
  background: transparent;
  color: #4f46e5;
  border: 2px solid #4f46e5;
}

.nav-button--outline:hover { background: #eef2ff; }

/* ── Mobile ── */
@media (max-width: 768px) {
  .navbar-main {
    padding: 16px 20px;
    flex-wrap: wrap;
  }

  .hamburger {
    display: flex;
  }

  .nav-links {
    display: none;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
    padding: 12px 0 16px;
    border-top: 1px solid #e5e7eb;
  }

  .nav-links.open {
    display: flex;
  }

  .nav-button {
    width: 100%;
    text-align: center;
  }

  .disclaimer-banner {
    font-size: 11px;
    padding: 5px 12px;
  }
}
</style>
