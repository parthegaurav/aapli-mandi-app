import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'aaplimandi.db');

const db = new Database(dbPath);

console.log('\n============================================================');
console.log('🌿 AAPLI MANDI — LOCAL SQLITE DATABASE INSPECTOR');
console.log(`📁 File: ${dbPath}`);
console.log('============================================================\n');

console.log('📦 1. PRODUCTS TABLE (शेतीमाल व आजचे भाव):');
const products = db.prepare('SELECT id, name_mr, name_en, category, farmer_rate_per_kg, wholesaler_rate_per_crate, available_crates, is_active FROM products').all();
console.table(products);

console.log('\n👨‍🌾 2. FARMER BOOKINGS (शेतकरी पिकअप नोंदी):');
const bookings = db.prepare('SELECT id, farmer_id, farmer_name, village, crop_name, crates_count, total_estimated_amount, status FROM farmer_bookings').all();
console.table(bookings);

console.log('\n🏪 3. WHOLESALER ORDERS (व्यापारी मार्केट यार्ड ऑर्डर्स):');
const orders = db.prepare('SELECT id, buyer_id, wholesaler_name, market_yard, crop_name, crates_ordered, total_amount, delivery_status FROM wholesaler_orders').all();
console.table(orders);

console.log('\n👤 4. USERS (नोंदणीकृत वापरकर्ते):');
try {
  const users = db.prepare('SELECT id, role, full_name, phone, pin, village, firm_name, market_yard, is_active FROM users').all();
  console.table(users);
} catch (e) {
  console.log('Users table not initialized yet.');
}

console.log('\n✅ Database connection closed.\n');
db.close();

