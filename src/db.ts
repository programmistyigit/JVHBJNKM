import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';

const db: DatabaseType = new Database(path.join(process.cwd(), 'data.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    user_name TEXT,
    phone TEXT,
    service_type TEXT,
    company_name TEXT,
    description TEXT,
    size_format TEXT,
    address TEXT,
    deadline TEXT,
    budget_range TEXT,
    status TEXT DEFAULT 'YANGI',
    files TEXT DEFAULT '[]',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY,
    username TEXT,
    full_name TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

export interface Order {
  id: string;
  user_id: number;
  user_name: string;
  phone: string;
  service_type: string;
  company_name: string;
  description: string;
  size_format: string;
  address: string;
  deadline: string;
  budget_range: string;
  status: string;
  files: string;
  created_at: string;
  updated_at: string;
}

export const generateOrderId = (): string => {
  const count = db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number };
  const num = 1000 + count.count + 1;
  return `MBR-${num}`;
};

export const createOrder = (order: Omit<Order, 'created_at' | 'updated_at'>): Order => {
  const stmt = db.prepare(`
    INSERT INTO orders (id, user_id, user_name, phone, service_type, company_name, description, size_format, address, deadline, budget_range, status, files)
    VALUES (@id, @user_id, @user_name, @phone, @service_type, @company_name, @description, @size_format, @address, @deadline, @budget_range, @status, @files)
  `);
  stmt.run(order);
  return getOrderById(order.id)!;
};

export const getOrderById = (id: string): Order | undefined => {
  return db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Order | undefined;
};

export const getOrdersByUserId = (userId: number): Order[] => {
  return db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(userId) as Order[];
};

export const getNewOrders = (limit: number = 10): Order[] => {
  return db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC LIMIT ?').all('YANGI', limit) as Order[];
};

export const getAllOrders = (limit: number = 10): Order[] => {
  return db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT ?').all(limit) as Order[];
};

export const updateOrderStatus = (id: string, status: string): boolean => {
  const stmt = db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  const result = stmt.run(status, id);
  return result.changes > 0;
};

export const searchOrders = (query: string): Order[] => {
  const pattern = `%${query}%`;
  return db.prepare(`
    SELECT * FROM orders 
    WHERE id LIKE ? OR company_name LIKE ? OR user_name LIKE ? OR phone LIKE ?
    ORDER BY created_at DESC LIMIT 10
  `).all(pattern, pattern, pattern, pattern) as Order[];
};

export const saveUser = (userId: number, username: string | undefined, fullName: string): void => {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO users (user_id, username, full_name, created_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `);
  stmt.run(userId, username || null, fullName);
};

export const getAllUserIds = (): number[] => {
  const users = db.prepare('SELECT DISTINCT user_id FROM users').all() as { user_id: number }[];
  return users.map(u => u.user_id);
};

export default db;
