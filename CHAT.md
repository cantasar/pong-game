# Chat System

Real-time mesajlaşma sistemi. WebSocket + REST API hibrit yaklaşımı kullanır.

## 🎯 Nasıl Çalışır

- **Real-time mesajlar**: WebSocket ile anlık gönderim/alma
- **Chat geçmişi**: REST API ile sayfalama destekli
- **Offline mesajlar**: Kullanıcı bağlandığında otomatik gönderilir
- **Okundu işaretleme**: Hem WebSocket hem REST API

## 📡 WebSocket Kullanımı

### Bağlantı
```javascript
const token = localStorage.getItem('token');
const ws = new WebSocket('ws://localhost:3000/ws', token);
```

### Mesaj Gönder
```javascript
ws.send(JSON.stringify({
  type: 'message',
  receiverId: 2,
  content: 'Merhaba!'
}));
```

### Mesajları Okundu İşaretle
```javascript
// Belirli kullanıcıdan gelen mesajları
ws.send(JSON.stringify({
  type: 'read',
  senderId: 2
}));

// Tüm mesajları
ws.send(JSON.stringify({
  type: 'read'
}));
```

### Gelen Mesajları Dinle
```javascript
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'message':
      // Yeni mesaj geldi
      console.log('From:', message.from, 'Content:', message.content);
      break;
      
    case 'missedMessages':
      // Kaçırılan mesajlar (bağlantı kurulduğunda)
      console.log('Missed messages:', message.data);
      break;
      
    case 'userStatus':
      // Kullanıcı online/offline durumu
      console.log('User', message.userId, 'is', message.status);
      break;
  }
};
```

## 🌐 REST API Endpoints

### 1. Chat Geçmişi Al

**GET** `/chat/history/:userId`

```bash
curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:3000/chat/history/2?limit=50&offset=0"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 123,
        "senderId": 1,
        "receiverId": 2,
        "content": "Merhaba!",
        "isRead": 1,
        "delivered": 1,
        "createdAt": "2025-01-01T12:00:00.000Z"
      }
    ],
    "totalCount": 150,
    "hasMore": true,
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total": 150
    }
  }
}
```

### 2. Mesajları Okundu İşaretle

**PUT** `/chat/mark-read/:userId`

```bash
curl -X PUT \
     -H "Authorization: Bearer TOKEN" \
     "http://localhost:3000/chat/mark-read/2"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "markedCount": 3
  }
}
```

### 3. Okunmamış Mesaj Sayısı

**GET** `/chat/unread-count`

```bash
curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:3000/chat/unread-count"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 12
  }
}
```

### 4. Chat İstatistikleri

**GET** `/chat/statistics`

```bash
curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:3000/chat/statistics"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSent": 45,
    "totalReceived": 67,
    "unreadCount": 5,
    "activeConversations": 8,
    "conversationUsers": [2, 5, 8, 12, 15, 18, 22, 25]
  }
}
```

## 💻 JavaScript Kullanım Örnekleri

### Chat Geçmişi Yükle
```javascript
async function loadChatHistory(userId) {
  const response = await fetch(`/chat/history/${userId}?limit=50`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  
  const data = await response.json();
  return data.success ? data.data.messages : [];
}
```

### Sayfalama ile Daha Fazla Mesaj
```javascript
async function loadMoreMessages(userId, offset) {
  const response = await fetch(`/chat/history/${userId}?limit=20&offset=${offset}`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  
  const data = await response.json();
  return data.success ? data.data : null;
}
```

### Mesajları Okundu Yap
```javascript
async function markAsRead(userId) {
  await fetch(`/chat/mark-read/${userId}`, {
    method: 'PUT',
    headers: { 'Authorization': 'Bearer ' + token }
  });
}
```

### Okunmamış Sayısını Al
```javascript
async function getUnreadCount() {
  const response = await fetch('/chat/unread-count', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  
  const data = await response.json();
  return data.success ? data.data.unreadCount : 0;
}
```

## ⚡ Hızlı Başlangıç

```javascript
// 1. WebSocket bağlantısı kur
const ws = new WebSocket('ws://localhost:3000/ws', token);

// 2. Chat geçmişini yükle
const messages = await loadChatHistory(userId);

// 3. Mesajları okundu işaretle
await markAsRead(userId);

// 4. Yeni mesaj gönder
ws.send(JSON.stringify({
  type: 'message',
  receiverId: userId,
  content: 'Hello!'
}));
```
