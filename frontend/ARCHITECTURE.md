# Clean & Simple Frontend Architecture

Bu proje çok temiz, basit ve modüler bir frontend architecture kullanır.

## 🎯 Proje Yapısı

```
src/
├── core/              # Temel sistem
│   ├── Router.ts      # Basit routing
│   └── Component.ts   # Component base class
├── components/        # Bağımsız componentler  
│   ├── ProfileComponent.ts    # Profil kartı
│   ├── GameComponent.ts       # Oyun alanı
│   └── TournamentComponent.ts # Turnuva listesi
├── pages/             # Sayfa fonksiyonları
│   ├── HomePage.ts    # Ana sayfa (3 bölümlü)
│   ├── ProfilePage.ts # Profil ayarları
│   └── GamePage.ts    # Oyun arenası
└── main.ts           # Uygulama giriş noktası
```

## 🏠 HomePage Layoutu

**3 Bölümlü Tasarım:**
- **Sol**: ProfileComponent (kullanıcı bilgileri)
- **Orta**: GameComponent (oyun alanı ve modları)
- **Sağ**: TournamentComponent (turnuvalar + leaderboard)

## 🧩 Component Sistemi

### ProfileComponent
```typescript
const profile: UserProfile = {
  name: 'Player One',
  level: 5,
  wins: 15,
  losses: 3,
  rank: 42
};

const profileComponent = new ProfileComponent(profile);

// Profil güncelleme
profileComponent.updateProfile(newProfile);
```

### GameComponent
```typescript
const gameConfig: GameConfig = {
  modes: ['1v1', 'vs AI', 'Training', 'Custom'],
  isPlaying: false
};

const gameComponent = new GameComponent(gameConfig, (mode) => {
  console.log(`Starting: ${mode}`);
});

// Oyun durumu güncelleme
gameComponent.updateGameState(newConfig);
```

### TournamentComponent
```typescript
const tournaments: Tournament[] = [
  {
    id: '1',
    name: 'Summer Cup',
    players: 16,
    maxPlayers: 32,
    status: 'waiting'
  }
];

const tournamentComponent = new TournamentComponent(
  tournaments,
  leaderboard,
  (tournamentId) => {
    console.log(`Joining: ${tournamentId}`);
  }
);

// Turnuva verilerini güncelleme
tournamentComponent.updateData(newTournaments, newLeaderboard);
```

## 🔄 Router Kullanımı

```typescript
// Route ekleme
router.add('/path', pageFunction);

// Navigasyon
router.go('/path');

// Chaining
router
  .add('/', createHomePage)
  .add('/profile', createProfilePage)
  .add('/game', createGamePage);
```

## 📄 Yeni Sayfa Ekleme

```typescript
// pages/NewPage.ts
export function createNewPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-900 p-6';
  
  container.innerHTML = `
    <h1 class="text-3xl font-bold text-white">New Page</h1>
    <p class="text-gray-300">Page content here...</p>
  `;
  
  return container;
}

// main.ts'ye ekle
router.add('/new-page', createNewPage);
```

## 🎨 Tasarım Prensipleri

- **Temiz**: Minimum kod, maksimum işlevsellik
- **Basit**: Anlaşılır ve bakımı kolay
- **Modüler**: Her component bağımsız çalışır
- **İşlevsel**: Interface'ler ile kolay veri yönetimi
- **Genişletilebilir**: Kolayca yeni özellik eklenebilir

## 🔧 API Entegrasyonu

Component'ler interface'ler kullanır, bu sayede:

```typescript
// API'den veri al
const userProfile = await fetchUserProfile();
profileComponent.updateProfile(userProfile);

// Turnuva verilerini güncelle  
const tournaments = await fetchTournaments();
tournamentComponent.updateData(tournaments, leaderboard);
```

Bu architecture sayesinde her şeyi tek interface ile yönetebilir, kolayca değiştirebilir ve genişletebilirsiniz!
