import { Router } from './core/Router.js';
import { createHomePage } from './pages/HomePage.js';
import { createProfilePage } from './pages/ProfilePage.js';
import { createGamePage } from './pages/GamePage.js';
import { createLoginPage } from './pages/LoginPage.js';
import { createRegisterPage } from './pages/RegisterPage.js';

class App {
  private router: Router;

  constructor() {
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new Error('App container not found');
    }

    this.router = new Router(appContainer);
    
    this.setupRoutes();
    
    this.router.start();
  }

  private setupRoutes(): void {
    this.router
      .add('/', createHomePage, true) // Requires authentication
      .add('/profile', createProfilePage, true) // Requires authentication
      .add('/game', createGamePage, true) // Requires authentication
      .add('/login', createLoginPage, false) // No authentication required
      .add('/register', createRegisterPage, false) // No authentication required
  }
}

// DOM yüklendiğinde uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
