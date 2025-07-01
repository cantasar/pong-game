import { getToken, getMe } from '../api';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { MainLayout } from './MainLayout';

type AppState = {
  isAuthenticated: boolean;
  screen: 'login' | 'register' | 'main';
};

type User = { username: string; id: number };

const state: AppState & { user: User | null; loadingUser: boolean } = {
  isAuthenticated: false,
  screen: 'login',
  user: null,
  loadingUser: false,
};

function render(root: HTMLElement) {
  root.innerHTML = '';
  if (!state.isAuthenticated) {
    if (state.screen === 'login') {
      root.appendChild(LoginForm(
        async () => {
          state.isAuthenticated = true;
          state.screen = 'main';
          state.loadingUser = true;
          render(root);
          try {
            const user = await getMe();
            state.user = user;
          } catch {
            state.user = null;
          } finally {
            state.loadingUser = false;
            render(root);
          }
        },
        () => {
          state.screen = 'register';
          render(root);
        }
      ));
    } else if (state.screen === 'register') {
      root.appendChild(RegisterForm(
        () => {
          state.screen = 'login';
          render(root);
        },
        () => {
          state.screen = 'login';
          render(root);
        }
      ));
    }
  } else {
    if (state.loadingUser) {
      root.innerHTML = '<div class="flex items-center justify-center min-h-screen text-gray-400">Loading user...</div>';
      return;
    }
    if (!state.user) {
      root.innerHTML = '<div class="flex items-center justify-center min-h-screen text-red-400">Failed to load user</div>';
      return;
    }
    root.appendChild(MainLayout(state.user, () => {
      state.isAuthenticated = false;
      state.user = null;
      state.screen = 'login';
      render(root);
    }));
  }
}

export function App(root: HTMLElement) {
  if (getToken()) {
    state.isAuthenticated = true;
    state.screen = 'main';
    state.loadingUser = true;
    render(root);
    getMe().then(user => {
      state.user = user;
    }).catch(() => {
      state.user = null;
    }).finally(() => {
      state.loadingUser = false;
      render(root);
    });
  } else {
    render(root);
  }
} 