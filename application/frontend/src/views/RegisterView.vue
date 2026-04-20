<template>
  <div class="page">
    <div class="topbar">
      <div class="logo">Gator Freighter</div>
      <div class="top-links">
        <router-link to="/login" class="top-link">Log in</router-link>
        <router-link to="/register" class="top-button">Sign up</router-link>
      </div>
    </div>

    <div class="content">
      <div class="left-panel">
        <p class="eyebrow">JOIN THE COMMUNITY</p>
        <h1>Start listing, browsing, and connecting on campus.</h1>
        <p class="description">
          Create your Gator Freighter account to reach fellow SFSU students,
          post listings easily, and keep your exchanges within a familiar campus network.
        </p>

        <div class="feature-row">
          <div class="feature-box">Campus-focused marketplace</div>
          <div class="feature-box">Easy buyer-seller contact</div>
        </div>
      </div>

      <div class="right-panel">
        <div class="auth-card">
          <p class="card-brand">Create Account</p>
          <h2>Sign up for Gator Freighter</h2>
          <p class="card-subtitle">
            Join the marketplace to start buying and selling with SFSU students.
          </p>

          <form @submit.prevent="handleRegister" class="form">
            <div class="field">
              <label>Full Name</label>
              <input v-model="name" placeholder="Enter your full name" />
            </div>

            <div class="field">
              <label>Email</label>
              <input v-model="email" type="email" placeholder="yourname@sfsu.edu" />
            </div>

            <div class="field">
              <label>Password</label>
              <div class="password-wrap">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Create a password"
                />
                <button type="button" class="toggle-btn" @click="showPassword = !showPassword">
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>

            <div class="field">
              <label>Confirm Password</label>
              <input
                v-model="confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Re-enter your password"
              />
            </div>

            <p v-if="error" class="error">{{ error }}</p>

            <button class="btn" type="submit">Create Account</button>
          </form>

          <p class="switch">
            Already have an account?
            <router-link to="/login">Log in</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      error: ''
    }
  },
  methods: {
    handleRegister() {
      const pattern = /^[^\s@]+@sfsu\.edu$/i

      if (!this.name || !this.email || !this.password || !this.confirmPassword) {
        this.error = 'Please fill in all fields.'
        return
      }

      if (!pattern.test(this.email)) {
        this.error = 'Enter a valid SFSU email.'
        return
      }

      if (this.password.length < 6) {
        this.error = 'Password must be at least 6 characters.'
        return
      }

      if (this.password !== this.confirmPassword) {
        this.error = 'Passwords do not match.'
        return
      }

      this.error = ''
      alert('Account created')
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
  max-width: 440px;
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