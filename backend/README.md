# Pong Game Backend API

Bu proje, Pong oyunu için geliştirilmiş modern bir REST API backend'idir. **Fastify** framework'ü kullanılarak geliştirilmiş olup, modüler mimari ile tasarlanmıştır.

## 📁 Proje Mimarisi

```
backend/
├── dev.db                # SQLite veritabanı dosyası
├── package.json          # Proje bağımlılıkları ve scriptler
├── src/                  # Kaynak kod dizini
│   ├── app.js            # Ana uygulama yapılandırması
│   ├── server.js         # Server başlatma dosyası
│   ├── config/           # Yapılandırma dosyaları
│   │   └── db.js         # Veritabanı bağlantı yapılandırması
│   ├── modules/          # İş mantığı modülleri
│   │   ├── auth/         # Kimlik doğrulama modülü
│   │   ├── friend/       # Arkadaş sistemi modülü
│   │   └── user/         # Kullanıcı yönetimi modülü
│   ├── plugins/          # Fastify plugin'leri
│   │   ├── jwt.js        # JWT token yönetimi
│   │   └── sensible.js   # HTTP hata yönetimi
│   └── utils/            # Yardımcı fonksiyonlar
│       ├── hash.js       # Şifre hashleme utilities
│       └── response.js   # API yanıt formatları
```

## 🏗️ Modüler Mimari Yapısı

### 1. **Katmanlı Mimari (Layered Architecture)**

Her modül aşağıdaki katmanları içerir:

```
modules/[module-name]/
├── schema.js             # JSON Schema doğrulama
├── controller/           # HTTP request/response handling
│   └── [module].controller.js
├── service/              # İş mantığı katmanı
│   └── [module].service.js
└── routes/               # Route tanımlamaları
    └── [module].routes.js
```

### 2. **Sorumluluk Alanları**

- **Routes**: HTTP endpoint'lerini tanımlar ve middleware'leri yapılandırır
- **Controllers**: HTTP isteklerini alır, service katmanını çağırır ve yanıt döner
- **Services**: İş mantığını uygular, veritabanı işlemlerini gerçekleştirir
- **Schemas**: Gelen verilerin doğrulanması için JSON Schema tanımları

## 🚀 Teknoloji Stack'i

- **Framework**: [Fastify](https://www.fastify.io/) - Yüksek performanslı web framework
- **Veritabanı**: SQLite - Development ortamı için hafif veritabanı
- **ORM**: Native SQL queries
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: Argon2 - Modern şifre hashleme algoritması
- **Validation**: JSON Schema - Fastify entegreli doğrulama
- **CORS**: @fastify/cors - Cross-origin resource sharing

## 📦 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js v18+ 
- npm veya yarn

### Adımlar

1. **Bağımlılıkları yükleyin:**
```bash
cd backend
npm install
```

2. **Ortam değişkenlerini ayarlayın:**
```bash
# .env dosyası oluşturun
echo "JWT_SECRET=your-super-secret-jwt-key" > .env
echo "DATABASE_URL=./dev.db" >> .env
echo "PORT=3000" >> .env
```

3. **Sunucuyu başlatın:**
```bash
# Development modu
npm run dev

# Production modu
npm start
```

4. **API testi:**
```bash
curl http://localhost:3000
# Yanıt: {"message":"Welcome to the Pong Game API!"}
```

## 🔧 Geliştirme Kılavuzu

### Yeni Modül Ekleme

Mevcut `auth` modülünü örnek alarak yeni bir modül nasıl ekleneceğini görelim:

#### 1. **Modül dizinini oluşturun:**
```bash
mkdir -p src/modules/[module-name]/{controller,service,routes}
touch src/modules/[module-name]/schema.js
```

#### 2. **Schema tanımlayın** (`schema.js`) - Auth modülü örneği:
```javascript
// src/modules/auth/schema.js örneği
const userResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    username: { type: 'string' },
    email: { type: 'string', format: 'email' }
  },
  required: ['id', 'username', 'email']
};

export const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 }
    },
    additionalProperties: false
  },
  response: {
    200: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        user: userResponseSchema
      }
    }
  }
};
```

#### 3. **Service katmanını oluşturun** - Auth service örneği:
```javascript
// src/modules/auth/service/auth.service.js örneği
import { initDB } from '../../../config/db.js';
import argon2 from 'argon2';

export async function loginUser({ email, password }) {
  const db = await initDB();

  // Kullanıcıyı email ile bul
  const user = await db.get(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  if (!user) {
    throw new Error('User not found');
  }

  // Şifre doğru mu?
  const passwordMatch = await argon2.verify(user.password, password);
  if (!passwordMatch) {
    throw new Error('Invalid credentials');
  }

  // Hassas bilgileri çıkar
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
```

#### 4. **Controller oluşturun** - Auth controller örneği:
```javascript
// src/modules/auth/controller/auth.controller.js örneği
import { loginUser } from '../service/auth.service.js';

export async function loginController(request, reply) {
  const { email, password } = request.body;

  try {
    const user = await loginUser({ email, password });

    const token = await reply.jwtSign({
      id: user.id,
      email: user.email
    });

    reply.send({ token, user });
  } catch (err) {
    reply.code(401).send({ error: err.message });
  }
}
```

#### 5. **Routes tanımlayın** - Auth routes örneği:
```javascript
// src/modules/auth/routes/auth.routes.js örneği
import { loginController } from '../controller/auth.controller.js';
import { loginSchema } from '../schema.js';

export default async function authRoutes(app, options) {
  app.post('/login', {
    schema: loginSchema
  }, loginController);
}
```

#### 6. **Ana uygulamaya kaydedin** (`app.js`):
```javascript
// src/app.js dosyasına ekleyin
import authRoutes from './modules/auth/routes/auth.routes.js';

await app.register(authRoutes, { prefix: '/auth' });
```

Bu örnekten yola çıkarak kendi modülünüzü oluşturabilirsiniz.

### Veritabanı Tablosu Ekleme

`src/config/db.js` dosyasına yeni tablo tanımı ekleyin:

```javascript
await db.exec(`
  CREATE TABLE IF NOT EXISTS [table_name] (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    field1 TEXT NOT NULL,
    field2 INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
```

### Middleware Ekleme

Authentication gerektiren endpoint'ler için:

```javascript
// routes dosyasında
app.post('/protected-endpoint', {
  preHandler: app.authenticate, // JWT doğrulama middleware
  schema: yourSchema
}, yourController);
```

## 🔐 Güvenlik Özellikleri

- **JWT Authentication**: Stateless token tabanlı kimlik doğrulama
- **Argon2 Hashing**: Şifreler için güvenli hashleme
- **Input Validation**: JSON Schema ile gelen verilerin doğrulanması
- **CORS**: Cross-origin isteklerin kontrolü
- **Environment Variables**: Hassas bilgilerin ortam değişkenlerinde saklanması

## 🧪 Test Etme

### Manuel API Testi

**Kullanıcı Kaydı:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Kullanıcı Girişi:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 📊 Veritabanı Şeması

### Users Tablosu
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  avatar TEXT,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0
);
```

## 🔄 Gelecek Geliştirmeler

### Planlanan Özellikler:
- [ ] **Friend System**: Arkadaş ekleme/çıkarma API'leri
- [ ] **User Profile**: Profil güncelleme endpoint'leri
- [ ] **Game Statistics**: Oyun istatistikleri tracking
- [ ] **Tournament System**: Turnuva yönetimi
- [ ] **Real-time Communication**: WebSocket entegrasyonu

### Teknik İyileştirmeler:
- [ ] **Docker**: Containerization
- [ ] **Monitoring**: Health check endpoint'leri

## 📞 İletişim

Backend ile ilgili teknik sorularınız için:
- Detaylı contributing kuralları için ana dizindeki [CONTRIBUTING.md](../CONTRIBUTING.md) dosyasına bakın

---

**Happy Backend Development! 🚀⚙️**
