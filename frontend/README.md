# ft_transcendence Frontend Architecture

A minimal, clean TypeScript + Tailwind CSS Single Page Application (SPA) with client-side routing.

## 🏗️ Architecture Overview

# Pong Game Frontend

Bu proje, Pong oyunu için geliştirilmiş modern ve temiz bir frontend uygulamasıdır. **TypeScript** ve **Tailwind CSS** kullanılarak geliştirilmiş olup, modüler component-based mimari ile tasarlanmıştır.

## 📁 Proje Mimarisi

```
frontend/
├── package.json             # Proje bağımlılıkları ve build scriptleri
├── tailwind.config.js       # Tailwind CSS yapılandırması
├── tsconfig.json           # TypeScript yapılandırması
├── ARCHITECTURE.md         # Detaylı mimari dökümanı
├── src/                    # Kaynak kod dizini
│   ├── index.html         # Ana HTML dosyası
│   ├── main.ts           # Uygulama giriş noktası
│   ├── config.ts         # Uygulama yapılandırması
│   ├── core/             # Temel sistem bileşenleri
│   │   ├── Component.ts  # Component base class
│   │   └── Router.ts     # Client-side routing sistemi
│   ├── components/       # Yeniden kullanılabilir bileşenler
│   │   ├── GameComponent.ts       # Oyun alanı bileşeni
│   │   ├── ProfileComponent.ts    # Kullanıcı profil bileşeni
│   │   └── TournamentComponent.ts # Turnuva listesi bileşeni
│   ├── pages/           # Sayfa bileşenleri
│   │   ├── HomePage.ts      # Ana sayfa (3 bölümlü layout)
│   │   ├── LoginPage.ts     # Giriş sayfası
│   │   ├── RegisterPage.ts  # Kayıt sayfası
│   │   ├── ProfilePage.ts   # Profil ayarları sayfası
│   │   └── GamePage.ts      # Oyun arenası sayfası
│   └── styles/         # CSS dosyaları
│       └── input.css   # Tailwind CSS entry point
```

## 🏗️ Mimari Prensipleri

### 1. **Component-Based Architecture**

Her bileşen kendi sorumluluklarına sahip, bağımsız modüllerdir:

```typescript
// Base Component class
export class Component {
  protected element: HTMLElement;
  private children: Component[] = [];

  constructor(options: ComponentOptions = {}) {
    this.element = this.createElement(options);
    this.init();
  }

  protected init(): void {
    // Override in child components
  }
}
```

### 2. **Client-Side Routing**

SPA (Single Page Application) mantığı ile çalışan basit routing sistemi:

```typescript
export class Router {
  private routes: Map<string, Route> = new Map();
  
  add(path: string, component: RouteComponent, requiresAuth: boolean): Router {
    this.routes.set(path, { component, requiresAuth });
    return this;
  }
}
```

### 3. **Sayfa Yapısı**

Her sayfa bir fonksiyon olarak export edilir:

```typescript
// pages/HomePage.ts örneği
export function createHomePage(): HTMLElement {
  const page = document.createElement('div');
  page.className = 'home-page flex h-screen';
  
  // 3 bölümlü layout
  const leftSection = new ProfileComponent().getElement();
  const centerSection = new GameComponent().getElement();
  const rightSection = new TournamentComponent().getElement();
  
  page.append(leftSection, centerSection, rightSection);
  return page;
}
```

## 🚀 Teknoloji Stack'i

- **TypeScript**: Type safety ve modern JavaScript features
- **Tailwind CSS**: Utility-first CSS framework
- **Vanilla DOM API**: Framework dependency'si olmadan
- **ES6 Modules**: Modern module sistemi
- **Python HTTP Server**: Development server (basit çözüm)

## 📦 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js v18+ 
- Python 3.x (development server için)
- npm veya yarn

### Adımlar

1. **Bağımlılıkları yükleyin:**
```bash
cd frontend
npm install
```

2. **Development modunda çalıştırın:**
```bash
# Otomatik build + file watching + dev server
npm run watch

# Tek seferlik build + dev server
npm run dev
```

3. **Production build:**
```bash
npm run build
```

4. **Uygulamaya erişin:**
```
http://localhost:8080
```

## 🔧 Geliştirme Kılavuzu

### Yeni Component Ekleme

#### 1. **Component Dosyası Oluşturun:**
```typescript
// src/components/MyComponent.ts
import { Component, ComponentOptions } from '../core/Component.js';

interface MyComponentData {
  title: string;
  items: string[];
}

export class MyComponent extends Component {
  private data: MyComponentData;

  constructor(data: MyComponentData, options: ComponentOptions = {}) {
    super({
      className: 'my-component p-4 bg-white rounded-lg',
      ...options
    });
    this.data = data;
  }

  protected init(): void {
    this.render();
    this.setupEventListeners();
  }

  private render(): void {
    this.element.innerHTML = `
      <h2 class="text-xl font-bold mb-4">${this.data.title}</h2>
      <ul class="space-y-2">
        ${this.data.items.map(item => 
          `<li class="p-2 bg-gray-100 rounded">${item}</li>`
        ).join('')}
      </ul>
    `;
  }

  private setupEventListeners(): void {
    // Event listener'ları buraya ekleyin
  }

  // Public method to update data
  updateData(newData: MyComponentData): void {
    this.data = newData;
    this.render();
  }
}
```

#### 2. **Component'i Kullanın:**
```typescript
// pages/SomePage.ts içinde
import { MyComponent } from '../components/MyComponent.js';

const myComponent = new MyComponent({
  title: 'My List',
  items: ['Item 1', 'Item 2', 'Item 3']
});

page.appendChild(myComponent.getElement());
```

### Yeni Sayfa Ekleme

#### 1. **Page Dosyası Oluşturun:**
```typescript
// src/pages/NewPage.ts
export function createNewPage(): HTMLElement {
  const page = document.createElement('div');
  page.className = 'new-page p-8';
  
  page.innerHTML = `
    <h1 class="text-2xl font-bold mb-6">New Page</h1>
    <div class="content">
      <!-- Page content here -->
    </div>
  `;
  
  return page;
}
```

#### 2. **Route Ekleyin:**
```typescript
// src/main.ts içinde
import { createNewPage } from './pages/NewPage.js';

private setupRoutes(): void {
  this.router
    .add('/', createHomePage, true)
    .add('/new-page', createNewPage, true) // Yeni route
    .add('/login', createLoginPage, false);
}
```

### Navigation Ekleme

```typescript
// Herhangi bir component içinde
const button = document.createElement('button');
button.textContent = 'Go to New Page';
button.addEventListener('click', () => {
  window.dispatchEvent(new CustomEvent('navigate', { detail: '/new-page' }));
});
```

## 🎨 Styling Kılavuzu

### Tailwind CSS Kullanımı

```typescript
// Component içinde
this.element.className = `
  flex items-center justify-between
  p-4 bg-gradient-to-r from-blue-500 to-purple-600
  text-white rounded-lg shadow-lg
  hover:shadow-xl transition-shadow duration-300
`;
```

### Custom CSS Ekleme

```css
/* src/styles/input.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom component styles */
@layer components {
  .game-arena {
    @apply w-full h-96 bg-black border-2 border-white relative;
  }
  
  .paddle {
    @apply absolute w-2 h-20 bg-white;
  }
}
```

## 🔄 State Management

### Basit Event-Driven State

```typescript
// Global event dispatcher
class EventManager {
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }
}

export const eventManager = new EventManager();
```

### Component'lerde State Kullanımı

```typescript
import { eventManager } from '../core/EventManager.js';

export class ProfileComponent extends Component {
  protected init(): void {
    // Profile updated olayını dinle
    eventManager.on('profile:updated', (newProfile) => {
      this.updateProfile(newProfile);
    });
  }

  private updateProfile(profile: UserProfile): void {
    // Profile'ı güncelle
    eventManager.emit('ui:profile-updated', profile);
  }
}
```

## 🧪 Test Etme

### Manuel Test

```bash
# Development server başlat
npm run watch

# Browser'da test et
open http://localhost:8080

# Different routes test et
http://localhost:8080/#/login
http://localhost:8080/#/profile
http://localhost:8080/#/game
```

### Console Debug

```typescript
// Component'lerde debug için
console.log('Component initialized:', this.constructor.name);
console.log('Data:', this.data);

// Browser console'da
window.app = app; // Debug için global erişim
```

## 📱 Responsive Design

### Tailwind Breakpoints

```typescript
// Responsive classes
this.element.className = `
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
  gap-4 p-4
  text-sm md:text-base lg:text-lg
`;
```

### Mobile-First Approach

```css
/* Mobile styles first */
.game-container {
  @apply flex flex-col space-y-4;
}

/* Tablet and up */
@screen md {
  .game-container {
    @apply flex-row space-y-0 space-x-4;
  }
}
```

## 🔐 Authentication Integration

```typescript
// Auth helper
export class AuthService {
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  static getToken(): string | null {
    return localStorage.getItem('token');
  }

  static logout(): void {
    localStorage.removeItem('token');
    window.dispatchEvent(new CustomEvent('navigate', { detail: '/login' }));
  }
}
```

## 📊 Performance İpuçları

### Lazy Loading

```typescript
// Component'leri dinamik olarak yükle
const loadGameComponent = async () => {
  const { GameComponent } = await import('./components/GameComponent.js');
  return new GameComponent(data);
};
```

### Memory Management

```typescript
export class Component {
  destroy(): void {
    // Event listener'ları temizle
    this.element.removeEventListener('click', this.handleClick);
    
    // Child component'leri temizle
    this.children.forEach(child => child.destroy());
    this.children = [];
    
    // Element'i DOM'dan kaldır
    this.element.remove();
  }
}
```

## 🔄 Gelecek Geliştirmeler

### Planlanan Özellikler:
- [ ] **Real-time Game**: WebSocket ile gerçek zamanlı oyun
- [ ] **PWA Support**: Service Worker ve offline functionality
- [ ] **Testing**: Jest ile unit testler
- [ ] **Bundle Optimization**: Webpack veya Vite entegrasyonu
- [ ] **State Management**: Daha gelişmiş state yönetimi
- [ ] **Animation**: CSS/JS animasyonları
- [ ] **Accessibility**: ARIA attributes ve keyboard navigation

## 📞 İletişim

- Detaylı contributing kuralları için ana dizindeki [CONTRIBUTING.md](../CONTRIBUTING.md) dosyasına bakın

---

**Happy Frontend Development! 🎮✨**

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build and run development server
npm run dev

# Build for production
npm run build
```

## 📝 How to Add New Components

### 1. Create a Component

Create `src/components/MyComponent.ts`:

```typescript
import { Component } from '../core/Component.js';

export class MyComponent extends Component {
  constructor(private data: any) {
    super();
  }

  protected createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'bg-gray-800 p-4 rounded';
    element.innerHTML = `
      <h3 class="text-white font-bold">${this.data.title}</h3>
      <button data-action="click-me" class="bg-blue-600 text-white px-4 py-2 rounded mt-2">
        Click Me
      </button>
    `;
    return element;
  }

  protected setupEventListeners(): void {
    const button = this.element.querySelector('[data-action="click-me"]');
    button?.addEventListener('click', () => {
      console.log('Button clicked!');
    });
  }
}
```

### 2. Create a Page

Create `src/pages/MyPage.ts`:

```typescript
import { MyComponent } from '../components/MyComponent.js';

export function createMyPage(): HTMLElement {
  const page = document.createElement('div');
  page.className = 'max-w-4xl mx-auto p-6';
  
  const component = new MyComponent({ title: 'Hello World' });
  page.appendChild(component.getElement());
  
  return page;
}
```

### 3. Register the Route

In `src/main.ts`, add to `setupRoutes()`:

```typescript
private setupRoutes(): void {
  this.router.addRoute('/', createHomePage);
  this.router.addRoute('/profile', createProfilePage);
  this.router.addRoute('/game', createGamePage);
  this.router.addRoute('/my-page', createMyPage); // Add this line
}
```

### 4. Add Navigation Link

In `src/components/Navigation.ts`, add a button:

```html
<button data-route="/my-page" class="nav-link px-4 py-2 rounded hover:bg-gray-700 transition-colors">
  My Page
</button>
```

## 🔄 How Routing Works

- **True SPA**: URL always stays as `/` (no browser URL changes)
- **Client-side only**: Navigation happens via `router.navigate('/path')`
- **No history API**: Pure internal state management
- **Simple**: Just a Map of routes to component functions

## 🎨 Styling Guidelines

- Use Tailwind CSS utility classes
- Dark theme: `bg-gray-900`, `bg-gray-800`, `text-white`
- Interactive elements: `hover:` states and `transition-colors`
- Responsive: Use `md:`, `lg:` prefixes for breakpoints

## 📦 Key Features

- ✅ TypeScript with strict mode
- ✅ Tailwind CSS for styling
- ✅ Component-based architecture
- ✅ Client-side routing (URL constant)
- ✅ Event handling system
- ✅ Clean separation of concerns
- ✅ Easy to extend and modify
- ✅ Single command build (`npm run build`)

## 🔧 Build System

- **TypeScript**: Compiles to ES2020 modules
- **Tailwind**: Processes CSS and minifies
- **Output**: Everything goes to `dist/` folder
- **Development**: `npm run dev` starts local server on port 8080

The architecture is designed to be minimal, understandable, and easily extensible while meeting all your project constraints.
