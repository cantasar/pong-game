export type RouteComponent = () => HTMLElement;
export type AuthGuard = () => boolean;

interface Route {
  component: RouteComponent;
  requiresAuth?: boolean;
}

export class Router {
  private routes: Map<string, Route> = new Map();
  private currentRoute: string = '/';
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    
    // Listen for custom navigation events
    window.addEventListener('navigate', (e: Event) => {
      const customEvent = e as CustomEvent;
      this.go(customEvent.detail);
    });

    // Listen for browser back/forward button clicks
    window.addEventListener('popstate', (event) => {
      // State'den route bilgisini al, yoksa ana sayfaya git
      const route = event.state?.route || '/';
      this.currentRoute = route;
      this.render();
    });
  }

  // Route ekleme
  add(path: string, component: RouteComponent, requiresAuth: boolean = false): Router {
    this.routes.set(path, { component, requiresAuth });
    return this; // Chaining için
  }

  // Route kaldırma
  remove(path: string): Router {
    this.routes.delete(path);
    return this;
  }

  // Navigasyon
  go(path: string): void {
    if (this.routes.has(path)) {
      const route = this.routes.get(path)!;
      
      // Check authentication
      if (route.requiresAuth && !this.isAuthenticated()) {
        // Redirect to login if not authenticated
        this.go('/login');
        return;
      }
      
      // If user is authenticated and trying to access login/register, redirect to home
      if ((path === '/login' || path === '/register') && this.isAuthenticated()) {
        this.go('/');
        return;
      }
      
      this.currentRoute = path;
      this.render();
      // State-based routing: URL sabit kalır, sadece browser history'de state tutarız
      window.history.pushState({ route: path }, '', window.location.pathname);
    } else {
      console.warn(`Route ${path} not found`);
      // Redirect to home for unknown routes
      if (path !== '/') {
        this.go('/');
      }
    }
  }

  // Mevcut route
  current(): string {
    return this.currentRoute;
  }

  // Check if user is authenticated
  private isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  // Render
  private render(): void {
    const route = this.routes.get(this.currentRoute);
    if (route) {
      this.container.innerHTML = '';
      this.container.appendChild(route.component());
    }
  }

  // Başlat
  start(): void {
    // İlk yüklemede mevcut state'i kontrol et
    const currentState = window.history.state;
    let initialRoute = '/';
    
    if (currentState && currentState.route) {
      initialRoute = currentState.route;
    }
    
    // Authentication kontrolü
    if (!this.isAuthenticated() && initialRoute !== '/login' && initialRoute !== '/register') {
      this.go('/login');
    } else if (this.isAuthenticated() && (initialRoute === '/login' || initialRoute === '/register')) {
      this.go('/');
    } else {
      this.go(initialRoute);
    }
  }
}
