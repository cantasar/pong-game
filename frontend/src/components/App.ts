import { getToken, getMe } from '../api';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { MainLayout } from './MainLayout';

// Simple app state
const state = {
  isAuthenticated: false,
  screen: 'login' as 'login' | 'register' | 'main',
  user: null as any,
  loading: false,
};

function render(root: HTMLElement) {
  root.innerHTML = '';
  
  if (state.loading) {
    root.innerHTML = '<div class="flex items-center justify-center min-h-screen text-gray-400">Loading...</div>';
    return;
  }

  if (!state.isAuthenticated) {
    if (state.screen === 'login') {
      root.appendChild(LoginForm(handleLogin, () => {
        state.screen = 'register';
        render(root);
      }));
    } else {
      root.appendChild(RegisterForm(() => {
        state.screen = 'login';
        render(root);
      }, () => {
        state.screen = 'login';
        render(root);
      }));
    }
  } else {
    if (!state.user) {
      root.innerHTML = '<div class="flex items-center justify-center min-h-screen text-red-400">Failed to load user</div>';
      return;
    }
    root.appendChild(MainLayout(state.user, handleLogout));
  }
}

async function handleLogin() {
  state.loading = true;
  render(document.getElementById('app')!);
  
  try {
    state.user = await getMe();
    state.isAuthenticated = true;
    state.screen = 'main';
  } catch {
    state.user = null;
    state.isAuthenticated = false;
  }
  
  state.loading = false;
  render(document.getElementById('app')!);
}

function handleLogout() {
  state.isAuthenticated = false;
  state.user = null;
  state.screen = 'login';
  render(document.getElementById('app')!);
}

export function App(root: HTMLElement) {
  if (getToken()) {
    state.loading = true;
    render(root);
    
    getMe().then(user => {
      state.user = user;
      state.isAuthenticated = true;
      state.screen = 'main';
    }).catch(() => {
      state.isAuthenticated = false;
    }).finally(() => {
      state.loading = false;
      render(root);
    });
  } else {
    render(root);
  }
} 