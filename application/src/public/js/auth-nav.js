function getAuthLinkLabel() {
  return localStorage.getItem('isLoggedIn') === 'true' ? 'icon' : 'login';
}

function applyAuthNavState() {
  const authNavLink = document.getElementById('authNavLink');
  if (!authNavLink) return;

  if (getAuthLinkLabel() === 'icon') {
    authNavLink.href = '/dashboard';
    authNavLink.textContent = '👤';
    authNavLink.setAttribute('aria-label', 'Open dashboard');
    return;
  }

  authNavLink.href = '/login';
  authNavLink.textContent = 'Log in';
  authNavLink.setAttribute('aria-label', 'Open login page');
}

applyAuthNavState();
