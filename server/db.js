import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path: d:\apliMandi\aaplimandi.db
const dbPath = path.join(__dirname, '..', 'aaplimandi.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');

// Initialize database schema and seed data
export function initDatabase() {
  // 1. Products Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name_mr TEXT NOT NULL,
      name_en TEXT NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT,
      emoji TEXT DEFAULT '🥬',
      farmer_rate_per_kg REAL NOT NULL,
      wholesaler_rate_per_crate REAL NOT NULL,
      crate_weight_kg REAL DEFAULT 20,
      available_crates INTEGER DEFAULT 100,
      local_mandi_price REAL DEFAULT 0,
      color TEXT DEFAULT 'bg-emerald-50 border-emerald-200',
      icon_color TEXT DEFAULT 'text-emerald-600',
      is_active INTEGER DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Farmer Bookings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS farmer_bookings (
      id TEXT PRIMARY KEY,
      farmer_id INTEGER,
      farmer_name TEXT NOT NULL,
      phone TEXT DEFAULT '9822481092',
      village TEXT NOT NULL,
      crop_id TEXT NOT NULL,
      crop_name TEXT,
      crates_count INTEGER NOT NULL,
      pickup_type TEXT NOT NULL,
      total_estimated_amount REAL NOT NULL,
      status TEXT DEFAULT 'Pending',
      tempo_eta TEXT DEFAULT '45 min',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Wholesaler Orders Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS wholesaler_orders (
      id TEXT PRIMARY KEY,
      buyer_id INTEGER,
      wholesaler_name TEXT NOT NULL,
      shop_gala_no TEXT,
      market_yard TEXT NOT NULL,
      crop_id TEXT NOT NULL,
      crop_name TEXT,
      crates_ordered INTEGER NOT NULL,
      total_weight_kg REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      delivery_status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migration checks: ensure farmer_id and buyer_id columns exist on existing database
  try {
    const fbCols = db.pragma('table_info(farmer_bookings)').map((c) => c.name);
    if (!fbCols.includes('farmer_id')) {
      db.exec('ALTER TABLE farmer_bookings ADD COLUMN farmer_id INTEGER');
    }
  } catch (err) {
    console.error('Migration note (farmer_bookings):', err.message);
  }

  try {
    const woCols = db.pragma('table_info(wholesaler_orders)').map((c) => c.name);
    if (!woCols.includes('buyer_id')) {
      db.exec('ALTER TABLE wholesaler_orders ADD COLUMN buyer_id INTEGER');
    }
    if (!woCols.includes('total_weight_kg')) {
      db.exec('ALTER TABLE wholesaler_orders ADD COLUMN total_weight_kg REAL DEFAULT 0');
    }
  } catch (err) {
    console.error('Migration note (wholesaler_orders):', err.message);
  }

  // 4. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL CHECK(role IN ('farmer', 'buyer', 'admin')),
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      pin TEXT NOT NULL,
      village TEXT DEFAULT '',
      taluka TEXT DEFAULT '',
      firm_name TEXT DEFAULT '',
      market_yard TEXT DEFAULT '',
      gala_number TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_role ON users(phone, role);
  `);

  // Seed Products if table is empty
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  if (productCount === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (
        id, name_mr, name_en, category, image_url, emoji,
        farmer_rate_per_kg, wholesaler_rate_per_crate, crate_weight_kg,
        available_crates, local_mandi_price, color, icon_color, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const seedProducts = [
      {
        id: 'tomato',
        name_mr: 'टोमॅटो',
        name_en: 'Tomato',
        category: 'भाजीपाला',
        image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60',
        emoji: '🍅',
        farmer_rate_per_kg: 32,
        wholesaler_rate_per_crate: 640,
        crate_weight_kg: 20,
        available_crates: 450,
        local_mandi_price: 28,
        color: 'bg-red-50 border-red-200',
        icon_color: 'text-red-600',
      },
      {
        id: 'onion',
        name_mr: 'कांदा',
        name_en: 'Onion',
        category: 'भाजीपाला',
        image_url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=60',
        emoji: '🧅',
        farmer_rate_per_kg: 22,
        wholesaler_rate_per_crate: 440,
        crate_weight_kg: 20,
        available_crates: 620,
        local_mandi_price: 18,
        color: 'bg-purple-50 border-purple-200',
        icon_color: 'text-purple-600',
      },
      {
        id: 'greenchilli',
        name_mr: 'हिरवी मिरची',
        name_en: 'Green Chilli',
        category: 'भाजीपाला',
        image_url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&auto=format&fit=crop&q=60',
        emoji: '🌶️',
        farmer_rate_per_kg: 55,
        wholesaler_rate_per_crate: 1100,
        crate_weight_kg: 20,
        available_crates: 180,
        local_mandi_price: 48,
        color: 'bg-green-50 border-green-200',
        icon_color: 'text-green-600',
      },
      {
        id: 'okra',
        name_mr: 'भेंडी',
        name_en: 'Okra (Bhendi)',
        category: 'भाजीपाला',
        image_url: 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=500&auto=format&fit=crop&q=60',
        emoji: '🥒',
        farmer_rate_per_kg: 40,
        wholesaler_rate_per_crate: 800,
        crate_weight_kg: 20,
        available_crates: 240,
        local_mandi_price: 35,
        color: 'bg-lime-50 border-lime-200',
        icon_color: 'text-lime-600',
      },
      {
        id: 'pomegranate',
        name_mr: 'डाळिंब',
        name_en: 'Pomegranate',
        category: 'फळे',
        image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=60',
        emoji: '🫐',
        farmer_rate_per_kg: 120,
        wholesaler_rate_per_crate: 2400,
        crate_weight_kg: 20,
        available_crates: 90,
        local_mandi_price: 105,
        color: 'bg-rose-50 border-rose-200',
        icon_color: 'text-rose-600',
      },
      {
        id: 'palak',
        name_mr: 'पालक',
        name_en: 'Spinach (Palak)',
        category: 'भाजीपाला',
        image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=60',
        emoji: '🥬',
        farmer_rate_per_kg: 25,
        wholesaler_rate_per_crate: 500,
        crate_weight_kg: 20,
        available_crates: 310,
        local_mandi_price: 20,
        color: 'bg-emerald-50 border-emerald-200',
        icon_color: 'text-emerald-600',
      },
    ];

    const seedTransaction = db.transaction((products) => {
      for (const p of products) {
        insertProduct.run(
          p.id, p.name_mr, p.name_en, p.category, p.image_url, p.emoji,
          p.farmer_rate_per_kg, p.wholesaler_rate_per_crate, p.crate_weight_kg,
          p.available_crates, p.local_mandi_price, p.color, p.icon_color
        );
      }
    });
    seedTransaction(seedProducts);
    console.log('✅ Seeded default products into SQLite database.');
  }

  // Seed Farmer Bookings if table is empty
  const bookingCount = db.prepare('SELECT COUNT(*) as count FROM farmer_bookings').get().count;
  if (bookingCount === 0) {
    const insertBooking = db.prepare(`
      INSERT INTO farmer_bookings (
        id, farmer_name, phone, village, crop_id, crop_name,
        crates_count, pickup_type, total_estimated_amount, status, tempo_eta, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedBookings = [
      {
        id: 'FR-2026-10-15-0047',
        farmer_name: 'ज्ञानेश्वर तुकाराम बोराडे',
        phone: '9822481092',
        village: 'नारायणगाव (Narayangaon)',
        crop_id: 'tomato',
        crop_name: 'टोमॅटो (Tomato)',
        crates_count: 15,
        pickup_type: 'बांधावरून (Farm Gate)',
        total_estimated_amount: 9600,
        status: 'Weighed & Paid',
        tempo_eta: '45 min',
        created_at: '2026-10-15 08:30:00',
      },
      {
        id: 'FR-2026-10-15-0052',
        farmer_name: 'बाळू विठ्ठल शिंदे',
        phone: '9850123456',
        village: 'जुन्नर (Junnar)',
        crop_id: 'onion',
        crop_name: 'कांदा (Onion)',
        crates_count: 25,
        pickup_type: 'बांधावरून (Farm Gate)',
        total_estimated_amount: 11000,
        status: 'Tempo Assigned',
        tempo_eta: '30 min',
        created_at: '2026-10-15 09:15:00',
      },
      {
        id: 'FR-2026-10-15-0061',
        farmer_name: 'संजय यशवंत गाढवे',
        phone: '9423789012',
        village: 'मंचर (Manchar)',
        crop_id: 'greenchilli',
        crop_name: 'हिरवी मिरची (Green Chilli)',
        crates_count: 8,
        pickup_type: 'संकलन केंद्र (Collection Hub)',
        total_estimated_amount: 8800,
        status: 'Pending',
        tempo_eta: '1 hr 15 min',
        created_at: '2026-10-15 10:00:00',
      },
    ];

    const seedBookingTx = db.transaction((bookings) => {
      for (const b of bookings) {
        insertBooking.run(
          b.id, b.farmer_name, b.phone, b.village, b.crop_id, b.crop_name,
          b.crates_count, b.pickup_type, b.total_estimated_amount, b.status, b.tempo_eta, b.created_at
        );
      }
    });
    seedBookingTx(seedBookings);
    console.log('✅ Seeded initial farmer bookings into SQLite database.');
  }

  // Seed Wholesaler Orders if table is empty
  const orderCount = db.prepare('SELECT COUNT(*) as count FROM wholesaler_orders').get().count;
  if (orderCount === 0) {
    const insertOrder = db.prepare(`
      INSERT INTO wholesaler_orders (
        id, wholesaler_name, shop_gala_no, market_yard,
        crop_id, crop_name, crates_ordered, total_amount, delivery_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedOrders = [
      {
        id: 'B2B-FR-1042',
        wholesaler_name: 'रमेश्वर ट्रेडिंग कंपनी (Rameshwar Trading)',
        shop_gala_no: 'गाळा क्र. ४२ (Gala 42)',
        market_yard: 'Gultekdi — Pune Market Yard',
        crop_id: 'tomato',
        crop_name: 'टोमॅटो (Tomato)',
        crates_ordered: 30,
        total_amount: 19200,
        delivery_status: 'Tempo Dispatched',
        created_at: '2026-10-15 07:45:00',
      },
      {
        id: 'B2B-FR-1055',
        wholesaler_name: 'महावीर व्हेजिटेबल सप्लायर्स (Mahavir Veg)',
        shop_gala_no: 'गाळा क्र. १८ (Gala 18)',
        market_yard: 'Vashi — Navi Mumbai APMC',
        crop_id: 'onion',
        crop_name: 'कांदा (Onion)',
        crates_ordered: 50,
        total_amount: 22000,
        delivery_status: 'Pending',
        created_at: '2026-10-15 08:50:00',
      },
      {
        id: 'B2B-FR-1070',
        wholesaler_name: 'साई कृपा फ्रेश व्हेजिटेबल्स (Sai Krupa)',
        shop_gala_no: 'गाळा क्र. ०७ (Gala 07)',
        market_yard: 'Pimpri — PCMC Market',
        crop_id: 'pomegranate',
        crop_name: 'डाळिंब (Pomegranate)',
        crates_ordered: 12,
        total_amount: 28800,
        delivery_status: 'Delivered',
        created_at: '2026-10-14 22:30:00',
      },
    ];

    const seedOrderTx = db.transaction((orders) => {
      for (const o of orders) {
        insertOrder.run(
          o.id, o.wholesaler_name, o.shop_gala_no, o.market_yard,
          o.crop_id, o.crop_name, o.crates_ordered, o.total_amount, o.delivery_status, o.created_at
        );
      }
    });
    seedOrderTx(seedOrders);
    console.log('✅ Seeded initial wholesaler orders into SQLite database.');
  }

  // Seed Users if table is empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (
        role, full_name, phone, pin, village, taluka, firm_name, market_yard, gala_number, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const seedUsers = [
      // Demo Farmer
      { role: 'farmer', full_name: 'ज्ञानेश्वर तुकाराम बोराडे', phone: '9822481092', pin: '1234', village: 'नारायणगाव', taluka: 'जुन्नर' },
      // Demo Buyer  
      { role: 'buyer', full_name: 'रमेश्वर ट्रेडिंग कंपनी', phone: '9850001234', pin: '1234', firm_name: 'रमेश्वर ट्रेडिंग कंपनी', market_yard: 'गुलटेकडी पुणे', gala_number: '४२' },
      // Demo Admin
      { role: 'admin', full_name: 'FreshRoute Admin', phone: '9999999999', pin: '1234' },
    ];

    const seedUserTx = db.transaction((users) => {
      for (const u of users) {
        insertUser.run(
          u.role,
          u.full_name,
          u.phone,
          u.pin,
          u.village || '',
          u.taluka || '',
          u.firm_name || '',
          u.market_yard || '',
          u.gala_number || ''
        );
      }
    });
    seedUserTx(seedUsers);
    console.log('✅ Seeded default users into SQLite database.');
  }

  // Link existing seed bookings/orders to demo users if IDs are null
  try {
    const demoFarmer = db.prepare("SELECT id FROM users WHERE role = 'farmer' AND phone = '9822481092'").get();
    if (demoFarmer) {
      db.prepare("UPDATE farmer_bookings SET farmer_id = ? WHERE farmer_id IS NULL AND phone = '9822481092'").run(demoFarmer.id);
    }
    const demoBuyer = db.prepare("SELECT id FROM users WHERE role = 'buyer' AND phone = '9850001234'").get();
    if (demoBuyer) {
      db.prepare("UPDATE wholesaler_orders SET buyer_id = ? WHERE buyer_id IS NULL AND (wholesaler_name LIKE '%रमेश्वर ट्रेडिंग%' OR wholesaler_name LIKE '%Rameshwar%')").run(demoBuyer.id);
    }
  } catch (err) {
    // Non-fatal
  }
}

export default db;
