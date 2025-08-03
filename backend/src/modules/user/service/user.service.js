import { initDB } from '../../../config/db.js';

export async function getUserById(id) {
  const db = await initDB();
  const user = await db.get('SELECT id, username, email, avatar, wins, losses FROM users WHERE id = ?', [id]);
  return user;
}

export async function getUserByUsername(username) {
  const db = await initDB();
  const user = await db.get('SELECT id, username, email, avatar, wins, losses FROM users WHERE username = ?', [username]);
  return user;
}

export async function findUserById(id) {
  const db = await initDB();
  const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
  return user;
}

export async function updateProfile(userId, { username, email, avatar }) {
  const db = await initDB();
  
  // Check if username is already taken
  if (username) {
    const existingUser = await db.get('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId]);
    if (existingUser) {
      throw new Error('Username already taken');
    }
  }

  // Check if email is already taken
  if (email) {
    const existingEmail = await db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
    if (existingEmail) {
      throw new Error('Email already taken');
    }
  }

  // Update user
  const result = await db.run(
    'UPDATE users SET username = COALESCE(?, username), email = COALESCE(?, email), avatar = COALESCE(?, avatar) WHERE id = ?',
    [username, email, avatar, userId]
  );

  if (result.changes === 0) {
    throw new Error('User not found');
  }

  return await getUserById(userId);
}

export async function getUserPublicInfo(id) {
  const db = await initDB();
  const user = await db.get('SELECT id, username, avatar, wins, losses FROM users WHERE id = ?', [id]);
  return user;
}

export async function getUsersPublicInfo(ids) {
  if (!ids || ids.length === 0) return [];
  
  const db = await initDB();
  const placeholders = ids.map(() => '?').join(',');
  const users = await db.all(
    `SELECT id, username, avatar, wins, losses FROM users WHERE id IN (${placeholders})`,
    ids
  );
  return users;
}

