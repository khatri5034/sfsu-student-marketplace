
<template>
  <div class="page">
    <div class="topbar">
      
    </div>

    <div class="content">
      <div class="left-panel">
        <p class="eyebrow">SFSU STUDENT MARKETPLACE</p>
        <h1>Move your campus buying and selling forward.</h1>
        <p class="description">
          Gator Freighter helps SFSU students buy, sell, and connect in one place.
          Find affordable items, post listings quickly, and trade within the campus community.
        </p>

        <div class="feature-row">
          <div class="feature-box">Trusted SFSU community</div>
          <div class="feature-box">Fast local exchanges</div>
        </div>
      </div>

      <div class="right-panel">
        <div class="auth-card">
          <p class="card-brand">Welcome Back</p>
          <h2>Log in to your account</h2>
          <p class="card-subtitle">
            Access your dashboard, listings, and messages.
          </p>

          <form novalidate class="form" @submit.prevent="handleLogin">
            <div class="field">
              <label>Email</label>
              <input
                v-model="email"
                type="email"
                name="email"
                autocomplete="username"
                placeholder="yourname@sfsu.edu"
              />
            </div>

            <div class="field">
              <label>Password</label>
              <div class="password-wrap">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  name="password"
                  autocomplete="current-password"
                  placeholder="Enter your password"
                />
                <button type="button" class="toggle-btn" @click="showPassword = !showPassword">
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>

            <p v-if="error" class="error">{{ error }}</p>

            <button class="btn" type="submit" :disabled="loading">{{ loading ? '…' : 'Log In' }}</button>
          </form>

          <p class="switch">
            Don’t have an account?
            <router-link to="/register">Create one</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { apiJson } from '../api.js'

export default {
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      error: '',
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      const pattern = /^[^\s@]+@sfsu\.edu$/i

      if (!this.email || !this.password) {
        this.error = 'Please fill in all fields.'
        return
      }

      if (!pattern.test(this.email)) {
        this.error = 'Enter a valid SFSU email.'
        return
      }

      this.error = ''
      this.loading = true
      try {
        const u = await apiJson('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: this.email.trim().toLowerCase(), password: this.password })
        })
        const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.school_email
        localStorage.setItem(
          'gf_user',
          JSON.stringify({
            id: u.id,
            email: u.school_email,
            first_name: u.first_name,
            last_name: u.last_name,
            name
          })
        )
        this.$router.push('/dashboard')
      } catch (e) {
        this.error = e.message || 'Login failed.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8faff 0%, #eef2ff 100%);
  padding: 28px 42px;
  font-family: Arial, sans-serif;
  box-sizing: border-box;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.logo {
  font-size: 28px;
  font-weight: 800;
  color: #312e81;
}

.top-links {
  display: flex;
  align-items: center;
  gap: 14px;
}

.top-link {
  color: #312e81;
  text-decoration: none;
  font-weight: 600;
}

.top-link.active {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.top-button {
  background: #4f46e5;
  color: white;
  text-decoration: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 700;
}

.content {
  display: grid;
  grid-template-columns: 1.15fr 0.9fr;
  gap: 40px;
  align-items: center;
  min-height: calc(100vh - 120px);
}

.left-panel {
  padding-right: 30px;
}

.eyebrow {
  color: #4f46e5;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1px;
  margin-bottom: 14px;
}

h1 {
  font-size: 60px;
  line-height: 1.05;
  margin: 0 0 18px 0;
  color: #111827;
  max-width: 680px;
}

.description {
  font-size: 18px;
  line-height: 1.7;
  color: #4b5563;
  max-width: 620px;
  margin-bottom: 28px;
}

.feature-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.feature-box {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 14px 18px;
  border-radius: 12px;
  font-weight: 600;
  color: #374151;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
}

.right-panel {
  display: flex;
  justify-content: center;
}

.auth-card {
  width: 100%;
  max-width: 430px;
  background: white;
  padding: 32px;
  border-radius: 22px;
  box-shadow: 0 18px 40px rgba(79, 70, 229, 0.10);
}

.card-brand {
  color: #4f46e5;
  font-weight: 800;
  margin-bottom: 10px;
}

h2 {
  margin: 0 0 10px 0;
  font-size: 34px;
  color: #111827;
}

.card-subtitle {
  color: #6b7280;
  margin-bottom: 22px;
  line-height: 1.6;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
}

input {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  box-sizing: border-box;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #4f46e5;
}

.password-wrap {
  position: relative;
}

.password-wrap input {
  padding-right: 78px;
}

.toggle-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: #4f46e5;
  font-weight: 700;
  cursor: pointer;
}

.btn {
  margin-top: 6px;
  padding: 14px;
  background: linear-gradient(90deg, #4f46e5 0%, #6366f1 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.error {
  color: #dc2626;
  font-size: 14px;
  margin: 0;
}

.switch {
  margin-top: 20px;
  text-align: center;
  color: #4b5563;
}

.switch a {
  color: #4f46e5;
  font-weight: 700;
  text-decoration: none;
  margin-left: 6px;
}

.switch a:hover {
  text-decoration: underline;
}

@media (max-width: 980px) {
  .content {
    grid-template-columns: 1fr;
  }

  .left-panel {
    padding-right: 0;
  }

  h1 {
    font-size: 42px;
  }
}
</style>
