<template>
  <div class="page">
    <div class="card">
      <h1>Login</h1>

      <input v-model="email" type="email" placeholder="SFSU Email" />
      <input v-model="password" type="password" placeholder="Password" />

      <button @click="handleLogin">Login</button>

      <p v-if="error" class="error">{{ error }}</p>

      <p class="link-text">
        Don’t have an account?
        <router-link to="/register">Register</router-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      error: ''
    }
  },
  methods: {
    handleLogin() {
      if (!this.email || !this.password) {
        this.error = 'Please fill in all fields.'
        return
      }
      this.error = ''
      alert('Login button clicked')
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f4f4f4;
}

.card {
  width: 360px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

h1 {
  margin-bottom: 20px;
  text-align: center;
}

input {
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 10px;
  cursor: pointer;
}

.error {
  color: red;
  margin-top: 10px;
}

.link-text {
  margin-top: 16px;
  text-align: center;
}
</style>