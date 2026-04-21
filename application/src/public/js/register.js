const registerForm = document.getElementById('registerForm');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const authError = document.getElementById('authError');

if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fullName = fullNameInput ? fullNameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (authError) authError.textContent = '';

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (authError) authError.textContent = payload.error || 'Registration failed';
        return;
      }

      const resolvedName = `${payload.first_name || ''} ${payload.last_name || ''}`.trim();
      localStorage.setItem('isLoggedIn', 'true');
      if (resolvedName) {
        localStorage.setItem('currentUserName', resolvedName);
      } else if (fullName) {
        localStorage.setItem('currentUserName', fullName);
      }
      if (payload.school_email) {
        localStorage.setItem('currentUserEmail', payload.school_email);
      } else if (email) {
        localStorage.setItem('currentUserEmail', email);
      }
      window.location.href = '/dashboard';
    } catch (error) {
      if (authError) authError.textContent = 'Registration failed';
    }
  });
}
