<template>
  <nav class="navbar">
    <router-link to="/" class="logo">Gator Freighter</router-link>
    <div class="nav-links">
      <router-link to="/" class="nav-link">Home</router-link>
      <router-link to="/search" class="nav-link">Browse</router-link>
      <router-link to="/about" class="nav-link">About</router-link>
      <router-link to="/team" class="nav-link">Team</router-link>
      <template v-if="!loggedIn">
        <router-link to="/login" class="nav-link">Log in</router-link>
        <router-link to="/register" class="nav-button">Sign up</router-link>
      </template>
      <template v-else>
        <router-link to="/create-listing" class="nav-button nav-button--post">+ Post Listing</router-link>
        <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
        <router-link to="/messages" class="nav-link">Messages</router-link>
        <button class="nav-button nav-button--outline" @click="logout">Log out</button>
      </template>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
  data() {
    return { loggedIn: !!localStorage.getItem('gf_user') }
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
  justify-content: space-between;
  align-items: center;
  padding: 20px 42px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  font-size: 22px;
  font-weight: 800;
  color: #312e81;
  text-decoration: none;
}

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
</style>
