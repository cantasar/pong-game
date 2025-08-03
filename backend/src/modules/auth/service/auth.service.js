import { initDB } from '../../../config/db.js';
import argon2 from 'argon2';

export async function registerUser({ username, email, password }) {
  const db = await initDB();

  // Username'i temizle (boşluk ve özel karakterleri kaldır)
  const cleanUsername = username.replace(/[^a-zA-Z0-9_]/g, '');
  
  if (!cleanUsername || cleanUsername.length < 3) {
    throw new Error('Username must be at least 3 characters and contain only letters, numbers, and underscores');
  }

  // Mevcut kullanıcı kontrolü
  const existingUser = await db.get(
    'SELECT * FROM users WHERE email = ? OR username = ?',
    [email, cleanUsername]
  );

  if (existingUser) {
    throw new Error('Email or username already taken');
  }

  // Şifreyi hashle
  const hashedPassword = await argon2.hash(password);

  // Yeni kullanıcıyı ekle
  const result = await db.run(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [cleanUsername, email, hashedPassword]
  );

  return { 
    id: result.lastID, 
    username: cleanUsername, 
    email 
  };
}

export async function loginUser({ email, password }) {
  const db = await initDB();

  const user = await db.get(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  if (!user) {
    throw new Error('User not found');
  }

  // Google OAuth kullanıcıları için şifre kontrolü
  if (!user.password) {
    throw new Error('This account uses Google OAuth. Please login with Google.');
  }

  // Şifre doğrulama
  const isPasswordValid = await argon2.verify(user.password, password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  return { 
    id: user.id, 
    username: user.username, 
    email: user.email,
    avatar: user.avatar
  };
}

export async function handleGoogleUser({ email, name, picture }) {
  const db = await initDB();

  // Mevcut kullanıcıyı kontrol et
  let user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

  if (!user) {
    // Yeni Google kullanıcısı oluştur
    const uniqueUsername = generateUniqueUsername(name);
    
    const result = await db.run(
      'INSERT INTO users (username, email, avatar, password) VALUES (?, ?, ?, ?)',
      [uniqueUsername, email, picture, null]
    );
    
    user = { 
      id: result.lastID, 
      username: uniqueUsername, 
      email, 
      avatar: picture 
    };
  } else {
    // Mevcut kullanıcının avatar'ını güncelle
    await db.run(
      'UPDATE users SET avatar = ? WHERE id = ?',
      [picture, user.id]
    );
    user.avatar = picture;
  }

  return { 
    id: user.id, 
    username: user.username, 
    email: user.email, 
    avatar: user.avatar 
  };
}

// google kullanıcıları için benzersiz kullanıcı adı oluştur
function generateUniqueUsername(name) {
  const timestamp = Date.now();
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');

  const baseName = cleanName || 'user';
  
  const shortName = baseName.substring(0, 10);
  const shortTimestamp = timestamp.toString().slice(-6);
  
  return `${shortName}_${shortTimestamp}`;
}
