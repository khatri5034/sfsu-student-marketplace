const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const authError = document.getElementById('authError');

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (authError) authError.textContent = '';

    if (!email.endsWith('@sfsu.edu')) {
      if (authError) authError.textContent = 'Please use your SFSU email (@sfsu.edu)';
      return;
    }
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (authError) authError.textContent = payload.error || 'Login failed';
        return;
      }

      const resolvedName = `${payload.first_name || ''} ${payload.last_name || ''}`.trim();
      localStorage.setItem('isLoggedIn', 'true');
      if (payload.school_email) {
        localStorage.setItem('currentUserEmail', payload.school_email);
      } else if (email) {
        localStorage.setItem('currentUserEmail', email);
      }
      if (resolvedName) {
        localStorage.setItem('currentUserName', resolvedName);
      }
      window.location.href = '/dashboard';
    } catch (error) {
      if (authError) authError.textContent = 'Login failed';
    }
  });
}
