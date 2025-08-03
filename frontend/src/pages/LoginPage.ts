import { getApiUrl, API_CONFIG } from '../config.js';

export function createLoginPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50 flex items-center justify-center p-4';

  const loginCard = document.createElement('div');
  loginCard.className = 'bg-white rounded-lg shadow-sm p-6 w-full max-w-sm';

  loginCard.innerHTML = `
    <div class="text-center mb-6">
      <h1 class="text-xl font-semibold text-gray-800 mb-1">Login</h1>
      <p class="text-gray-500 text-sm">Welcome back</p>
    </div>

    <form id="loginForm" class="space-y-4">
      <div>
        <label for="email" class="block text-xs font-medium text-gray-600 mb-1">Email</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          required
          class="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-blue-300 focus:border-blue-300 text-sm"
          placeholder="you@example.com"
        >
      </div>

      <div>
        <label for="password" class="block text-xs font-medium text-gray-600 mb-1">Password</label>
        <input 
          type="password" 
          id="password" 
          name="password" 
          required
          class="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-blue-300 focus:border-blue-300 text-sm"
          placeholder="••••••••"
        >
      </div>

      <button 
        type="submit" 
        class="w-full bg-blue-100 text-blue-600 py-2 px-4 rounded hover:bg-blue-200 text-sm font-medium"
      >
        Sign In
      </button>

      <div class="relative my-4">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-200"></div>
        </div>
        <div class="relative flex justify-center text-xs">
          <span class="px-2 bg-white text-gray-400">or</span>
        </div>
      </div>

      <button 
        type="button" 
        id="googleLogin"
        class="w-full bg-gray-50 border border-gray-200 text-gray-600 py-2 px-4 rounded hover:bg-gray-100 text-sm font-medium flex items-center justify-center"
      >
        <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google
      </button>
    </form>

    <div class="mt-4 text-center">
      <p class="text-gray-500 text-sm">
        No account? 
        <a href="#" id="goToRegister" class="text-blue-500 hover:text-blue-600">Sign up</a>
      </p>
    </div>

    <div id="errorMessage" class="mt-3 p-2 bg-red-50 border border-red-200 text-red-600 rounded text-xs hidden"></div>
    <div id="loadingSpinner" class="mt-3 text-center hidden">
      <span class="text-gray-500 text-sm">Signing in...</span>
    </div>
  `;

  // Event listeners
  const form = loginCard.querySelector('#loginForm') as HTMLFormElement;
  const goToRegisterBtn = loginCard.querySelector('#goToRegister') as HTMLAnchorElement;
  const googleLoginBtn = loginCard.querySelector('#googleLogin') as HTMLButtonElement;
  const errorDiv = loginCard.querySelector('#errorMessage') as HTMLDivElement;
  const loadingDiv = loginCard.querySelector('#loadingSpinner') as HTMLDivElement;

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Show loading
    loadingDiv.classList.remove('hidden');
    errorDiv.classList.add('hidden');

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
        // Store JWT token
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to homepage
        window.dispatchEvent(new CustomEvent('navigate', { detail: '/' }));
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      errorDiv.textContent = error instanceof Error ? error.message : 'Login failed';
      errorDiv.classList.remove('hidden');
    } finally {
      loadingDiv.classList.add('hidden');
    }
  });

  // Navigate to register
  goToRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('navigate', { detail: '/register' }));
  });

  // Google OAuth login
  googleLoginBtn.addEventListener('click', () => {
    // Redirect to Google OAuth endpoint
    // window.location.href = getApiUrl(API_CONFIG.ENDPOINTS.AUTH.GOOGLE);
  });

  container.appendChild(loginCard);
  return container;
}
