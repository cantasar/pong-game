import { getApiUrl, API_CONFIG } from '../../config.js';

export async function init() {
  console.log('Register page loaded');

  // Regular register form
  const form = document.getElementById('registerForm') as HTMLFormElement;

  // Google register button
  const googleRegisterBtn = document.getElementById('googleRegisterBtn') as HTMLButtonElement;

  // Username input - gerçek zamanlı temizlik
  const usernameInput = document.getElementById('username') as HTMLInputElement;
  usernameInput?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    const cleaned = target.value.replace(/[^a-zA-Z0-9_]/g, '');
    if (target.value !== cleaned) {
      target.value = cleaned;
    }
  });

  // Google register handler
  googleRegisterBtn?.addEventListener('click', () => {
    const googleAuthUrl = getApiUrl(API_CONFIG.ENDPOINTS.AUTH.GOOGLE);
    window.location.href = googleAuthUrl;
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = (document.getElementById('username') as HTMLInputElement)?.value;
    const email = (document.getElementById('email') as HTMLInputElement)?.value;
    const password = (document.getElementById('password') as HTMLInputElement)?.value;

    if (!username || !email || !password) {
      alert('Please fill all fields!');
      return;
    }

    // Username validasyonu
    const cleanUsername = username.replace(/[^a-zA-Z0-9_]/g, '');
    if (cleanUsername.length < 3) {
      alert('Username must be at least 3 characters and contain only letters, numbers, and underscores!');
      return;
    }

    if (cleanUsername !== username) {
      alert('Username can only contain letters, numbers, and underscores. Special characters and spaces are not allowed!');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Registration successful! Welcome ${username}!`);
        router.navigate('login');
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      alert(`Error: ${errorMessage}`);
    }
  });
}
