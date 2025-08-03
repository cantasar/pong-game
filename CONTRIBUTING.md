# 🤝 Katkıda Bulunma Kılavuzu (Contributing Guide)

Bu projeye katkıda bulunmak istiyorsanız aşağıdaki adımları takip edin. **Tüm değişiklikler mutlaka Pull Request ile yapılmalıdır!**

## 📋 Proje Yapısı

Bu proje iki ana bileşenden oluşur:

### 🔧 [Backend](./backend/README.md)
- **Fastify** framework ile RESTful API
- **SQLite** veritabanı
- **JWT** authentication
- Modüler mimari yapısı

### 🎮 [Frontend](./frontend/README.md) 
- **TypeScript** + **Tailwind CSS**
- Component-based SPA mimarisi
- Client-side routing
- Vanilla DOM API kullanımı

## 🔄 Pull Request Süreci

### 1. **Repository'yi Fork Edin**
- GitHub'da bu repository'nin sağ üst köşesindeki "Fork" butonuna tıklayın
- Bu işlem projenin kendi hesabınızda bir kopyasını oluşturacak

### 2. **Local Makinenize Clone Edin**
```bash
# Kendi fork'unuzu clone edin
git clone https://github.com/cantasar/pong-game.git
cd pong-game-v2

```

### 3. **Development Environment Kurun**

#### Backend Setup:
```bash
cd backend
npm install

# backend/.env
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=./dev.db
PORT=3000

npm run dev
```

#### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```

### 4. **Development Branch Oluşturun**
```bash
# Ana branch'ten yeni bir feature branch oluşturun
git checkout -b feature/amazing-feature

# Branch isim örnekleri:
# Backend değişiklikleri için:
# feature/user-profile-api
# bugfix/login-validation
# enhancement/error-handling

# Frontend değişiklikleri için:
# feature/game-component
# bugfix/responsive-design
# enhancement/ui-animations

# Documentation için:
# docs/api-documentation
# docs/setup-guide
```

### 5. **Değişikliklerinizi Yapın**

#### Backend Değişiklikleri:
- Modüler mimariyi koruyun (Routes → Controllers → Services)
- JSON Schema validation kullanın
- Error handling implementasyonu ekleyin
- RESTful API prensiplerine uyun

#### Frontend Değişiklikleri:
- Component-based mimariye uyun
- TypeScript type safety'i koruyun
- Tailwind CSS kullanın
- Responsive design prensiplerini takip edin

#### Commit Standartları:
```bash
# Değişiklikleri staged area'ya ekleyin
git add .

# Açıklayıcı commit mesajı yazın
git commit -m "feat: add user profile update endpoint
```

### 6. **Test Edin**

#### Backend Test:
```bash
cd backend
npm run dev

# API endpoint'lerinizi test edin
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "password123"
  }'
```

#### Frontend Test:
```bash
cd frontend
npm run dev

http://localhost:8080/
```

#### Full Stack Test:
```bash
# Her iki server'ı da çalıştırın
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev

# Integration test yapın
```

### 7. **Upstream ile Senkronize Edin**
```bash
# Ana repository'deki son değişiklikleri alın
git fetch upstream
git checkout main
git merge upstream/main

# Feature branch'inizi güncelleyin
git checkout feature/amazing-feature
```

### 8. **Branch'inizi Push Edin**
```bash
git push origin feature/amazing-feature
```

### 9. **Pull Request Oluşturun**
- GitHub'da kendi fork'unuza gidin
- "Compare & pull request" butonuna tıklayın
- **Detaylı açıklama yazın:**

```markdown
## 🎯 Değişiklik Özeti
Bu PR kullanıcı profil güncelleme özelliğini ekler.

## 📁 Etkilenen Alanlar
- [ ] Backend API
- [ ] Frontend Component
- [ ] Database Schema
- [ ] Documentation

## ✨ Yapılan Değişiklikler

### Backend:
- [ ] Yeni `/user/profile` PUT endpoint'i eklendi
- [ ] Profile validation schema oluşturuldu
- [ ] User service'te profile update metodu eklendi
- [ ] Error handling iyileştirildi

### Frontend:
- [ ] ProfileComponent güncellendi
- [ ] Profile edit form eklendi
- [ ] API integration yapıldı
- [ ] Responsive design uygulandı

## 🧪 Test Edilen Senaryolar
- [x] Valid profile data ile güncelleme
- [x] Invalid data ile error handling
- [x] Authentication kontrolü
- [x] Responsive design test
- [x] Cross-browser compatibility
- [x] Mevcut functionality'nin çalışması

## 🖼️ Ekran Görüntüleri / API Örnekleri

### API Test:
```bash
curl -X PUT http://localhost:3000/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username": "newname", "avatar": "newavatar.jpg"}'
```

### UI Screenshots:
[Buraya ekran görüntüleri ekleyin]

## ✅ Checklist
- [x] Kod modüler mimariye uygun
- [x] Schema validation eklendi
- [x] Error handling mevcut
- [x] TypeScript type safety korundu
- [x] Responsive design test edildi
- [x] API test edildi
- [x] Documentation güncellendi
- [x] No breaking changes
```

## 📋 Pull Request Gereksinimleri

### ✅ **Zorunlu Kriterler:**

#### Backend:
- **Modüler Mimari**: Routes → Controllers → Services yapısı
- **Schema Validation**: JSON schema kullanımı
- **Error Handling**: Uygun hata yönetimi
- **RESTful Design**: REST API prensiplerine uygunluk
- **Security**: JWT authentication ve input validation

#### Frontend:
- **Component Architecture**: Component-based yapı
- **TypeScript**: Type safety korunmalı
- **Styling**: Tailwind CSS kullanımı
- **Responsive**: Mobile-first approach
- **Accessibility**: Temel ARIA attributes

#### Genel:
- **Testing**: Manuel olarak test edilmiş
- **Documentation**: README güncellemeleri (gerekirse)
- **No Breaking Changes**: Mevcut functionality bozulmamalı

### 🎯 **Code Review Kriterleri:**
- **Functionality**: Kod istenen işlevi yerine getiriyor mu?
- **Security**: Güvenlik açıkları var mı?
- **Performance**: Performance sorunları var mı?
- **Maintainability**: Kod okunabilir ve maintain edilebilir mi?
- **Standards**: Proje standartlarına uygun mu?
- **Documentation**: Yeterli dokümantasyon var mı?

## 🚫 **Yapılmaması Gerekenler:**
- ❌ Doğrudan `main` branch'e push yapmayın
- ❌ Büyük değişiklikleri tek commit'te yapmayın
- ❌ Test etmediğiniz kodu push etmeyin
- ❌ Breaking changes yaparken documentation güncellemeden PR açmayın
- ❌ Birden fazla feature'ı aynı PR'da birleştirmeyin
- ❌ Hard-coded values kullanmayın
- ❌ Console.log'ları production'da bırakmayın

## 🔄 **Review Süreci:**
1. **Otomatik Kontroller**: GitHub Actions (gelecekte)
2. **Code Review**: Maintainer'lar tarafından inceleme
3. **Testing**: Functionality ve integration testleri
4. **Documentation Review**: README ve comment'ların kontrolü
5. **Approval**: En az 1 approver gerekli
6. **Merge**: Squash and merge strategy kullanılır

## 💬 **İletişim ve Tartışma:**
- Büyük değişiklikler öncesi **issue açarak tartışın**
- PR'da sorularınızı **comment olarak sorun**
- Review feedback'lerini **dikkate alın** ve gerekli değişiklikleri yapın
- **Sabırlı olun** - review süreci zaman alabilir

## 🏆 **İyi PR Örnekleri:**

### ✅ **Mükemmel PR Özellikleri:**
- **Küçük ve odaklı**: Bir feature/bugfix
- **Açıklayıcı başlık**: "feat: add user authentication API"
- **Detaylı açıklama**: Ne yapıldığı, neden yapıldığı
- **Test edilmiş**: Manuel test sonuçları paylaşılmış
- **Documentation**: Gerekli dokümantasyon güncellemeleri
- **Screenshots**: UI değişiklikleri için görsel kanıt

### 📝 **Commit Message Standartları:**
```bash
# Format: type(scope): description
feat(backend): add user profile API
fix(frontend): resolve responsive design issue
docs(readme): update installation instructions
style(css): improve button hover effects
refactor(auth): simplify JWT token validation
test(api): add user registration tests
```


## 🌟 **Teşekkürler!**
