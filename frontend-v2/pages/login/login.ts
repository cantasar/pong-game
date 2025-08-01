import { getApiUrl, API_CONFIG } from '../../config.js';

export async function init() {
  console.log('Login page loaded');
  
  const form = document.getElementById('loginForm') as HTMLFormElement;

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = (document.getElementById('email') as HTMLInputElement)?.value;
    const password = (document.getElementById('password') as HTMLInputElement)?.value;

    if (!email || !password) {
      alert('Please fill all fields!');
      return;
    }

    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert(`Login successful! Welcome ${data.user.username}!`);
        
        router.navigate('profile');
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      alert(`Error: ${errorMessage}`);
    }
  });
}
