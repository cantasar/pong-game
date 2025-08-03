# Frontend v2 - Pong Game

Bu proje, modern TypeScript ve SPA (Single Page Application) mimarisi kullanılarak geliştirilmiş bir frontend uygulamasıdır.

## 📁 Proje Yapısı

```
frontend-v2/
├── index.html          # Ana HTML dosyası
├── main.ts            # Uygulamanın giriş noktası
├── package.json       # Bağımlılıklar ve scripts
├── tailwind.config.js # Tailwind CSS yapılandırması
├── tsconfig.json      # TypeScript yapılandırması
├── core/              # Çekirdek sistem dosyaları
│   └── router.ts      # Sayfa yönlendirme sistemi
├── pages/             # Tüm sayfalar
│   ├── game/          # Oyun sayfası
│   ├── home/          # Ana sayfa
│   ├── login/         # Giriş sayfası
│   ├── profile/       # Profil sayfası
│   └── register/      # Kayıt sayfası
└── styles/            # CSS stilleri
    └── input.css      # Tailwind CSS giriş dosyası
```

## 🏗️ Mimari Açıklaması

### SPA (Single Page Application) Yapısı
- **Tek sayfalı uygulama**: Tüm uygulama tek bir HTML dosyasında çalışır
- **Dinamik içerik yükleme**: Sayfalar arası geçişte sadece içerik değişir
- **URL değişmez**: Tarayıcı adresi sabit kalır
- **Hızlı navigasyon**: Sayfa yenilenmesi olmadan geçişler

### Router Sistemi
Router, uygulamanın kalbidir ve şu işlevleri yerine getirir:

#### Temel Özellikler:
- **Sayfa yönetimi**: Hangi sayfanın gösterileceğini belirler
- **History API entegrasyonu**: Tarayıcının geri/ileri butonları çalışır
- **Dinamik modül yükleme**: Sayfalar ihtiyaç duyulduğunda yüklenir
- **Hata yönetimi**: Sayfa yükleme hatalarını yakalar ve gösterir

#### Router Çalışma Mantığı:

1. **Başlangıç**:
   ```typescript
   // Router oluşturulur ve ana sayfa yüklenir
   const router = new Router(container);
   ```

2. **Sayfa Geçişi**:
   ```typescript
   // Kullanıcı bir butona tıkladığında
   router.navigate('profile'); // profil sayfasına git
   ```

3. **Browser History**:
   - Her sayfa geçişi tarayıcı geçmişine eklenir
   - Geri/ileri butonları otomatik çalışır
   - URL değişmeden state yönetimi yapılır

4. **Sayfa Yükleme Süreci**:
   ```
   navigate('profile') çağrıldığında:
   ├── History'ye entry eklenir
   ├── Loading mesajı gösterilir
   ├── profile.html dosyası indirilir
   ├── HTML container'a yerleştirilir
   ├── profile.js modülü yüklenir
   └── init() fonksiyonu çalıştırılır
   ```

## 📄 Sayfa Yapısı

Her sayfa klasörü şu dosyaları içerir:

```
pages/örnek-sayfa/
├── örnek-sayfa.html    # Sayfanın HTML içeriği
└── örnek-sayfa.ts      # Sayfanın TypeScript kodu
```

### Sayfa Geliştirme Kuralları:

1. **HTML Dosyası**:
   - Sadece sayfa içeriğini içermeli
   - `<html>`, `<head>`, `<body>` tagları OLMAMALI
   - Tailwind CSS sınıfları kullanılmalı

2. **TypeScript Dosyası**:
   - `init()` fonksiyonu export edilmeli
   - Bu fonksiyon sayfa yüklendiğinde çalışır
   - Event listener'lar burada tanımlanmalı

### Örnek Sayfa Yapısı:

**profile.html**:
```html
<div class="h-screen bg-gray-100 p-6">
  <h1 class="text-3xl font-bold">Profil Sayfası</h1>
  <button onclick="router.navigate('home')">Ana Sayfaya Dön</button>
</div>
```

**profile.ts**:
```typescript
export function init() {
  console.log('Profil sayfası yüklendi');
  // Sayfa özel kodları buraya
}
```

## 🎯 Navigasyon Sistemi

### Sayfa Geçişleri:
```typescript
// JavaScript'te
router.navigate('sayfa-adi');

// HTML'de
<button onclick="router.navigate('sayfa-adi')">Git</button>
```

### Mevcut Sayfalar:
- `home` - Ana sayfa
- `login` - Giriş sayfası  
- `register` - Kayıt sayfası
- `profile` - Profil sayfası
- `game` - Oyun sayfası

## 🔧 Geliştirme Rehberi

### Yeni Sayfa Ekleme:

1. **Klasör oluştur**:
   ```
   pages/yeni-sayfa/
   ```

2. **HTML dosyası oluştur**:
   ```html
   <!-- pages/yeni-sayfa/yeni-sayfa.html -->
   <div class="h-screen p-6">
     <h1>Yeni Sayfa</h1>
   </div>
   ```

3. **TypeScript dosyası oluştur**:
   ```typescript
   // pages/yeni-sayfa/yeni-sayfa.ts
   export function init() {
     console.log('Yeni sayfa hazır');
   }
   ```

4. **Navigasyon ekle**:
   ```html
   <button onclick="router.navigate('yeni-sayfa')">Yeni Sayfaya Git</button>
   ```

### CSS Styling:
- **Tailwind CSS** kullanılır
- Özel stiller `styles/input.css` dosyasına eklenir
- Responsive tasarım için Tailwind sınıfları tercih edilir

### TypeScript Derleme:
```bash
npm run build  # TypeScript dosyalarını derler
```

## 🚀 Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Üretim için derle
npm run build
```

## 🔍 Debug İpuçları

### Sayfa Yüklenmiyorsa:
1. Browser console'u kontrol et
2. Dosya yollarını doğrula
3. TypeScript derleme hatalarını kontrol et
4. Network sekmesinde 404 hatalarını ara

### Router Sorunları:
- `router` objesi global olarak erişilebilir olmalı
- `init()` fonksiyonları export edilmeli
- HTML dosyalarında syntax hataları olmamalı

## 📱 Browser Desteği

- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **Minimum gereksinimler**: ES6 modül desteği
- **History API**: Geri/ileri buton desteği için

## 🎨 UI/UX Özellikleri

- **Responsive tasarım**: Mobil ve masaüstü uyumlu
- **Loading states**: Sayfa geçişlerinde loading göstergesi
- **Error handling**: Hata durumlarında kullanıcı dostu mesajlar
- **Smooth transitions**: Akıcı sayfa geçişleri

---

**Not**: Bu proje TypeScript, Tailwind CSS ve modern web standartları kullanılarak geliştirilmiştir. Geliştirme yaparken bu standartlara uygun kod yazılması önerilir.