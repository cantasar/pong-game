import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export const initDB = async () => {
  const db = await open({
    filename: process.env.DATABASE_URL || './dev.db',
    driver: sqlite3.Database
  });

  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT,
      avatar TEXT,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0
    )
  `);

  // Create friends table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requesterID INTEGER NOT NULL,
      recipientID INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (requesterID) REFERENCES users(id),
      FOREIGN KEY (recipientID) REFERENCES users(id)
    )
  `);

  // Create blocked_users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS blocked_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      blockerId INTEGER NOT NULL,
      blockedId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (blockerId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (blockedId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create messages table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      senderId INTEGER NOT NULL,
      receiverId INTEGER NOT NULL,
      content TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      isRead INTEGER DEFAULT 0,
      delivered INTEGER DEFAULT 0,
      FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiverId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  return db;
};