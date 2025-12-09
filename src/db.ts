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

db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emoji TEXT DEFAULT '🔹',
    name TEXT NOT NULL,
    callback_id TEXT NOT NULL UNIQUE,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS portfolio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    photo_id TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS portfolio_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emoji TEXT DEFAULT '📌',
    name TEXT NOT NULL,
    callback_id TEXT NOT NULL UNIQUE,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    username TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'worker',
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS user_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    username TEXT,
    full_name TEXT,
    question TEXT NOT NULL,
    replied INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

const defaultServices = [
  { emoji: '🎨', name: 'Grafika dizayni (post, banner, logo...)', callback_id: 'service_grafika' },
  { emoji: '🖨', name: 'Poligrafiya (vizitka, flyer, buklet, katalog)', callback_id: 'service_poligrafiya' },
  { emoji: '🧱', name: '3D lettering va hajmli yozuvlar', callback_id: 'service_3d' },
  { emoji: '🧬', name: 'Brending / Rebrending', callback_id: 'service_brending' },
  { emoji: '📱', name: 'SMM dizayn (Instagram, TikTok, YouTube)', callback_id: 'service_smm' },
  { emoji: '🧾', name: 'Boshqa xizmat (izohda yozaman)', callback_id: 'service_boshqa' }
];

const defaultCategories = [
  { emoji: '📌', name: '3D lettering va hajmli yozuvlar', callback_id: 'portfolio_3d' },
  { emoji: '🖨', name: 'Banner va poligrafiya', callback_id: 'portfolio_banner' },
  { emoji: '🎨', name: 'Logotip va brending', callback_id: 'portfolio_logo' },
  { emoji: '📱', name: 'SMM dizaynlar', callback_id: 'portfolio_smm' }
];

const defaultSettings = [
  { key: 'phone1', value: '+998 90 123 45 67' },
  { key: 'phone2', value: '+998 91 234 56 78' },
  { key: 'telegram', value: '@milliybrend' },
  { key: 'address', value: 'Samarkand shahar, Amir Temur ko\'chasi 1' },
  { key: 'about_text', value: `🎯 Milliy Brend Reklama Agentligi
"Grafika, poligrafiya va innovatsion reklama markazi"

Asosiy yo'nalishlar:
• Grafika va SMM dizayn
• Poligrafiya (vizitka, flyer, buklet, menyu, katalog)
• 3D burtma harflar va hajmli yozuvlar
• Brending va rebrending
• Veb-sayt va taqdimot dizayni

Bizning maqsadimiz – sizning biznesingizni yangi bosqichga olib chiqish va brendingizni bozorda ajralib turadigan darajaga chiqarish.` }
];

const initDefaultData = () => {
  const serviceCount = db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number };
  if (serviceCount.count === 0) {
    const stmt = db.prepare('INSERT INTO services (emoji, name, callback_id) VALUES (?, ?, ?)');
    for (const s of defaultServices) {
      stmt.run(s.emoji, s.name, s.callback_id);
    }
  }

  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM portfolio_categories').get() as { count: number };
  if (categoryCount.count === 0) {
    const stmt = db.prepare('INSERT INTO portfolio_categories (emoji, name, callback_id) VALUES (?, ?, ?)');
    for (const c of defaultCategories) {
      stmt.run(c.emoji, c.name, c.callback_id);
    }
  }

  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
  if (settingsCount.count === 0) {
    const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    for (const s of defaultSettings) {
      stmt.run(s.key, s.value);
    }
  }
};

initDefaultData();

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

export interface Service {
  id: number;
  emoji: string;
  name: string;
  callback_id: string;
  is_active: number;
  created_at: string;
}

export interface PortfolioCategory {
  id: number;
  emoji: string;
  name: string;
  callback_id: string;
  is_active: number;
  created_at: string;
}

export interface PortfolioItem {
  id: number;
  category: string;
  title: string;
  description: string;
  photo_id: string | null;
  is_active: number;
  created_at: string;
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

export const getActiveServices = (): Service[] => {
  return db.prepare('SELECT * FROM services WHERE is_active = 1 ORDER BY id').all() as Service[];
};

export const getAllServices = (): Service[] => {
  return db.prepare('SELECT * FROM services ORDER BY id').all() as Service[];
};

export const addService = (emoji: string, name: string): Service => {
  const callbackId = 'service_' + Date.now();
  const stmt = db.prepare('INSERT INTO services (emoji, name, callback_id) VALUES (?, ?, ?)');
  stmt.run(emoji, name, callbackId);
  return db.prepare('SELECT * FROM services WHERE callback_id = ?').get(callbackId) as Service;
};

export const deleteService = (id: number): boolean => {
  const result = db.prepare('DELETE FROM services WHERE id = ?').run(id);
  return result.changes > 0;
};

export const getServiceByCallbackId = (callbackId: string): Service | undefined => {
  return db.prepare('SELECT * FROM services WHERE callback_id = ?').get(callbackId) as Service | undefined;
};

export const getActivePortfolioCategories = (): PortfolioCategory[] => {
  return db.prepare('SELECT * FROM portfolio_categories WHERE is_active = 1 ORDER BY id').all() as PortfolioCategory[];
};

export const getAllPortfolioCategories = (): PortfolioCategory[] => {
  return db.prepare('SELECT * FROM portfolio_categories ORDER BY id').all() as PortfolioCategory[];
};

export const addPortfolioCategory = (emoji: string, name: string): PortfolioCategory => {
  const callbackId = 'portfolio_' + Date.now();
  const stmt = db.prepare('INSERT INTO portfolio_categories (emoji, name, callback_id) VALUES (?, ?, ?)');
  stmt.run(emoji, name, callbackId);
  return db.prepare('SELECT * FROM portfolio_categories WHERE callback_id = ?').get(callbackId) as PortfolioCategory;
};

export const deletePortfolioCategory = (id: number): boolean => {
  const result = db.prepare('DELETE FROM portfolio_categories WHERE id = ?').run(id);
  return result.changes > 0;
};

export const getPortfolioItemsByCategory = (category: string): PortfolioItem[] => {
  return db.prepare('SELECT * FROM portfolio WHERE category = ? AND is_active = 1 ORDER BY id DESC').all(category) as PortfolioItem[];
};

export const getAllPortfolioItems = (): PortfolioItem[] => {
  return db.prepare('SELECT * FROM portfolio ORDER BY id DESC').all() as PortfolioItem[];
};

export const addPortfolioItem = (category: string, title: string, description: string, photoId: string | null): PortfolioItem => {
  const stmt = db.prepare('INSERT INTO portfolio (category, title, description, photo_id) VALUES (?, ?, ?, ?)');
  const result = stmt.run(category, title, description, photoId);
  return db.prepare('SELECT * FROM portfolio WHERE id = ?').get(result.lastInsertRowid) as PortfolioItem;
};

export const deletePortfolioItem = (id: number): boolean => {
  const result = db.prepare('DELETE FROM portfolio WHERE id = ?').run(id);
  return result.changes > 0;
};

export const getSetting = (key: string): string | undefined => {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value;
};

export const setSetting = (key: string, value: string): void => {
  db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)').run(key, value);
};

export const getAllSettings = (): Record<string, string> => {
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
};

export interface Admin {
  id: number;
  user_id: number;
  username: string | null;
  full_name: string | null;
  role: string;
  is_active: number;
  created_at: string;
}

export interface UserQuestion {
  id: number;
  user_id: number;
  username: string | null;
  full_name: string | null;
  question: string;
  replied: number;
  created_at: string;
}

export const addAdmin = (userId: number, username: string | null, fullName: string | null, role: string = 'worker'): Admin | null => {
  try {
    db.prepare('INSERT INTO admins (user_id, username, full_name, role) VALUES (?, ?, ?, ?)').run(userId, username, fullName, role);
    return db.prepare('SELECT * FROM admins WHERE user_id = ?').get(userId) as Admin;
  } catch (e) {
    return null;
  }
};

export const removeAdmin = (userId: number): boolean => {
  const result = db.prepare('DELETE FROM admins WHERE user_id = ?').run(userId);
  return result.changes > 0;
};

export const getAdminByUserId = (userId: number): Admin | undefined => {
  return db.prepare('SELECT * FROM admins WHERE user_id = ? AND is_active = 1').get(userId) as Admin | undefined;
};

export const getAllAdmins = (): Admin[] => {
  return db.prepare('SELECT * FROM admins WHERE is_active = 1 ORDER BY created_at DESC').all() as Admin[];
};

export const getWorkerAdmins = (): Admin[] => {
  return db.prepare('SELECT * FROM admins WHERE role = ? AND is_active = 1 ORDER BY created_at DESC').all('worker') as Admin[];
};

export const saveUserQuestion = (userId: number, username: string | null, fullName: string | null, question: string): UserQuestion => {
  const result = db.prepare('INSERT INTO user_questions (user_id, username, full_name, question) VALUES (?, ?, ?, ?)').run(userId, username, fullName, question);
  return db.prepare('SELECT * FROM user_questions WHERE id = ?').get(result.lastInsertRowid) as UserQuestion;
};

export const getQuestionById = (id: number): UserQuestion | undefined => {
  return db.prepare('SELECT * FROM user_questions WHERE id = ?').get(id) as UserQuestion | undefined;
};

export const markQuestionReplied = (id: number): boolean => {
  const result = db.prepare('UPDATE user_questions SET replied = 1 WHERE id = ?').run(id);
  return result.changes > 0;
};

export default db;
