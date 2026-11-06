import express from 'express';
import cors from 'cors';
import db, { initDatabase } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize SQLite tables & seeds
initDatabase();

// Format database product row to frontend crop object
function formatProduct(row) {
  return {
    id: row.id,
    name_mr: row.name_mr,
    name_en: row.name_en,
    category: row.category,
    imageUrl: row.image_url,
    emoji: row.emoji || '🥬',
    farmer_rate_per_kg: row.farmer_rate_per_kg,
    wholesaler_rate_per_crate: row.wholesaler_rate_per_crate,
    pricePerKg: row.farmer_rate_per_kg,
    cratePrice: row.wholesaler_rate_per_crate,
    crate_weight_kg: row.crate_weight_kg || 20,
    crateWeightKg: row.crate_weight_kg || 20,
    available_crates: row.available_crates,
    available: row.available_crates,
    local_mandi_price: row.local_mandi_price,
    localMandiPrice: row.local_mandi_price || Math.round(row.farmer_rate_per_kg * 0.85),
    name: {
      mr: row.name_mr,
      en: row.name_en,
    },
    unit: 'kg',
    color: row.color || 'bg-emerald-50 border-emerald-200',
    iconColor: row.icon_color || 'text-emerald-600',
    is_active: Boolean(row.is_active),
    isActive: Boolean(row.is_active),
    updated_at: row.updated_at,
  };
}

// Root Route - Server Status Dashboard
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    res.send(`
      <!DOCTYPE html>
      <html lang="mr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Aapli Mandi — Backend & Database Server</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; margin: 0; line-height: 1.6; }
          .card { max-width: 640px; margin: 2rem auto; background: #1e293b; border-radius: 1rem; padding: 2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 1px solid #334155; }
          h1 { color: #10b981; margin-top: 0; display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; }
          .badge { display: inline-block; background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(16, 185, 129, 0.3); }
          .btn { display: inline-block; background: #16a34a; color: white; padding: 0.75rem 1.5rem; border-radius: 0.75rem; text-decoration: none; font-weight: bold; margin-top: 1rem; font-size: 1rem; }
          .btn:hover { background: #15803d; }
          .endpoints { background: #0f172a; padding: 1rem; border-radius: 0.75rem; margin-top: 1.5rem; border: 1px solid #334155; }
          .endpoint-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #1e293b; font-family: monospace; font-size: 0.9rem; }
          .endpoint-item:last-child { border-bottom: none; }
          .endpoint-item a { color: #38bdf8; text-decoration: none; }
          .endpoint-item a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h1>🌿 आपली मंडी (Aapli Mandi)</h1>
            <span class="badge">● Server Active</span>
          </div>
          <p style="color: #94a3b8; margin: 0.5rem 0 1.5rem 0;">
            Express Backend & SQLite Database Server (<code>aaplimandi.db</code>) is running properly on port 5000.
          </p>

          <div style="background: rgba(22, 163, 74, 0.1); border: 1px solid rgba(22, 163, 74, 0.3); padding: 1rem; border-radius: 0.75rem; margin-bottom: 1rem;">
            <strong style="color: #4ade80;">💡 To view the Aapli Mandi Web Application & Separate Login Screen:</strong>
            <p style="margin: 0.5rem 0 0 0; color: #cbd5e1; font-size: 0.9rem;">
              The React frontend runs at port <strong>3000</strong>. Click either button below to open:
            </p>
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 0.75rem;">
              <a href="http://localhost:3000/login" class="btn" style="background: #ea580c;">
                🔐 Open Role Login Screen (http://localhost:3000/login)
              </a>
              <a href="http://localhost:3000" class="btn" style="background: #16a34a;">
                👉 Open Aapli Mandi Web App (http://localhost:3000)
              </a>
            </div>
          </div>

          <div class="endpoints">
            <strong style="color: #cbd5e1; display: block; margin-bottom: 0.5rem;">Available REST API Endpoints:</strong>
            <div class="endpoint-item">
              <span>GET /api/products</span>
              <a href="/api/products" target="_blank">View JSON ↗</a>
            </div>
            <div class="endpoint-item">
              <span>GET /api/farmer-bookings</span>
              <a href="/api/farmer-bookings" target="_blank">View JSON ↗</a>
            </div>
            <div class="endpoint-item">
              <span>GET /api/wholesaler-orders</span>
              <a href="/api/wholesaler-orders" target="_blank">View JSON ↗</a>
            </div>
            <div class="endpoint-item">
              <span>GET /api/stats</span>
              <a href="/api/stats" target="_blank">View JSON ↗</a>
            </div>
            <div class="endpoint-item">
              <span>GET /api/auth/demo-users</span>
              <a href="/api/auth/demo-users" target="_blank">View JSON ↗</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
  } else {
    res.json({
      status: 'online',
      service: 'Aapli Mandi API Server',
      database: 'connected',
      sqlite_file: 'aaplimandi.db',
      frontend_ui: 'http://localhost:3000',
    });
  }
});

// ==========================================
// AUTHENTICATION API
// ==========================================

// POST /api/auth/register - register a new user
app.post('/api/auth/register', (req, res) => {
  try {
    const userFullName = (req.body.full_name || req.body.name || '').trim();

    const {
      role,
      phone,
      pin,
      village = '',
      taluka = '',
      firm_name = '',
      market_yard = '',
      gala_number = '',
    } = req.body;

    if (!role || !['farmer', 'buyer', 'admin'].includes(role)) {
      return res.status(400).json({ error: "Role must be 'farmer', 'buyer', or 'admin'" });
    }

    if (!userFullName) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    const cleanPhone = String(phone || '').trim();
    if (!/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
    }

    const cleanPin = String(pin || '').trim();
    if (!/^\d{4}$/.test(cleanPin)) {
      return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
    }

    // Check duplicate phone + role
    const existingUser = db.prepare('SELECT id FROM users WHERE phone = ? AND role = ?').get(cleanPhone, role);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this phone number and role already exists' });
    }

    const stmt = db.prepare(`
      INSERT INTO users (
        role, full_name, phone, pin, village, taluka, firm_name, market_yard, gala_number, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const result = stmt.run(
      role,
      userFullName,
      cleanPhone,
      cleanPin,
      (village || '').trim(),
      (taluka || '').trim(),
      (firm_name || '').trim(),
      (market_yard || '').trim(),
      (gala_number || '').trim()
    );

    const newUser = db.prepare(`
      SELECT id, role, full_name, phone, village, taluka, firm_name, market_yard, gala_number, is_active, created_at
      FROM users WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ success: true, user: { ...newUser, name: newUser.full_name } });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// POST /api/auth/login - login user with phone, PIN and role
app.post('/api/auth/login', (req, res) => {
  try {
    const { phone, pin, role } = req.body;

    if (!phone || !role || pin === undefined || pin === null) {
      return res.status(400).json({ error: 'Phone, PIN, and role are required' });
    }

    const cleanPhone = String(phone).trim();
    const cleanPin = String(pin).trim();

    const user = db.prepare('SELECT * FROM users WHERE phone = ? AND role = ?').get(cleanPhone, role);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.pin !== cleanPin) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    if (user.is_active === 0) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const { pin: _pin, ...safeUser } = user;
    res.json({ success: true, user: { ...safeUser, name: safeUser.full_name || safeUser.name } });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// POST /api/auth/send-otp - send OTP to phone (demo mode returns '1234')
app.post('/api/auth/send-otp', (req, res) => {
  try {
    const { phone, role } = req.body;

    const cleanPhone = String(phone || '').trim();
    if (!/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
    }

    // In demo mode, always return OTP '1234'
    res.json({
      success: true,
      otp: '1234',
      message: 'OTP sent (demo mode)',
    });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// POST /api/auth/verify-otp - verify OTP and authenticate user
app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const { phone, role, otp } = req.body;

    if (!phone || !role || !otp) {
      return res.status(400).json({ error: 'Phone, role, and OTP are required' });
    }

    const cleanOtp = String(otp).trim();
    if (cleanOtp !== '1234') {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    const cleanPhone = String(phone).trim();
    const user = db.prepare('SELECT * FROM users WHERE phone = ? AND role = ?').get(cleanPhone, role);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.is_active === 0) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const { pin: _pin, ...safeUser } = user;
    res.json({ success: true, user: { ...safeUser, name: safeUser.full_name || safeUser.name } });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// GET /api/auth/demo-users - get demo credentials for quick-login
app.get('/api/auth/demo-users', (req, res) => {
  try {
    const demoPhones = ['9822481092', '9850001234', '9999999999'];
    const rows = db.prepare(`
      SELECT role, phone, pin, full_name
      FROM users
      WHERE phone IN (?, ?, ?)
      ORDER BY CASE role WHEN 'farmer' THEN 1 WHEN 'buyer' THEN 2 WHEN 'admin' THEN 3 ELSE 4 END
    `).all(...demoPhones);

    if (rows && rows.length > 0) {
      return res.json(rows);
    }

    res.json([
      { role: 'farmer', phone: '9822481092', pin: '1234', full_name: 'ज्ञानेश्वर तुकाराम बोराडे' },
      { role: 'buyer', phone: '9850001234', pin: '1234', full_name: 'रमेश्वर ट्रेडिंग कंपनी' },
      { role: 'admin', phone: '9999999999', pin: '1234', full_name: 'FreshRoute Admin' },
    ]);
  } catch (err) {
    console.error('Error fetching demo users:', err);
    res.status(500).json({ error: 'Failed to fetch demo users' });
  }
});

// ==========================================
// PRODUCTS API
// ==========================================

// GET /api/products - list all products (or active only unless ?all=true)
app.get('/api/products', (req, res) => {
  try {
    const includeAll = req.query.all === 'true';
    const query = includeAll
      ? 'SELECT * FROM products ORDER BY rowid ASC'
      : 'SELECT * FROM products WHERE is_active = 1 ORDER BY rowid ASC';
    const rows = db.prepare(query).all();
    res.json(rows.map(formatProduct));
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/products - create a new product
app.post('/api/products', (req, res) => {
  try {
    const {
      name_mr,
      name_en,
      category = 'भाजीपाला',
      image_url = '',
      emoji = '🥬',
      farmer_rate_per_kg,
      wholesaler_rate_per_crate,
      crate_weight_kg = 20,
      available_crates = 100,
      color = 'bg-emerald-50 border-emerald-200',
      icon_color = 'text-emerald-600',
      is_active = 1,
    } = req.body;

    if (!name_mr || !name_en || farmer_rate_per_kg === undefined || wholesaler_rate_per_crate === undefined) {
      return res.status(400).json({ error: 'Missing required product fields' });
    }

    // Generate unique slug id
    const baseSlug = name_en.toLowerCase().replace(/[^a-z0-9]/g, '') || 'crop';
    let id = baseSlug;
    const exists = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
    if (exists) {
      id = `${baseSlug}_${Math.floor(100 + Math.random() * 900)}`;
    }

    // Compute baseline mandi price
    const local_mandi_price = Math.round(Number(farmer_rate_per_kg) * 0.85);

    const stmt = db.prepare(`
      INSERT INTO products (
        id, name_mr, name_en, category, image_url, emoji,
        farmer_rate_per_kg, wholesaler_rate_per_crate, crate_weight_kg,
        available_crates, local_mandi_price, color, icon_color, is_active, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(
      id,
      name_mr.trim(),
      name_en.trim(),
      category.trim(),
      image_url.trim(),
      emoji.trim() || '🥬',
      Number(farmer_rate_per_kg),
      Number(wholesaler_rate_per_crate),
      Number(crate_weight_kg) || 20,
      Number(available_crates) || 100,
      local_mandi_price,
      color,
      icon_color,
      is_active ? 1 : 0
    );

    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.status(201).json(formatProduct(newProduct));
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: err.message || 'Failed to create product' });
  }
});

// PUT /api/products/:id - update a product
app.put('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      name_mr,
      name_en,
      category,
      image_url,
      emoji,
      farmer_rate_per_kg,
      wholesaler_rate_per_crate,
      crate_weight_kg,
      available_crates,
      is_active,
    } = req.body;

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedFarmerRate = farmer_rate_per_kg !== undefined ? Number(farmer_rate_per_kg) : existing.farmer_rate_per_kg;
    const updatedWholesalerRate = wholesaler_rate_per_crate !== undefined ? Number(wholesaler_rate_per_crate) : existing.wholesaler_rate_per_crate;
    const updatedLocalMandiPrice = Math.round(updatedFarmerRate * 0.85);

    const stmt = db.prepare(`
      UPDATE products SET
        name_mr = COALESCE(?, name_mr),
        name_en = COALESCE(?, name_en),
        category = COALESCE(?, category),
        image_url = COALESCE(?, image_url),
        emoji = COALESCE(?, emoji),
        farmer_rate_per_kg = ?,
        wholesaler_rate_per_crate = ?,
        crate_weight_kg = COALESCE(?, crate_weight_kg),
        available_crates = COALESCE(?, available_crates),
        local_mandi_price = ?,
        is_active = COALESCE(?, is_active),
        updated_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(
      name_mr ?? null,
      name_en ?? null,
      category ?? null,
      image_url ?? null,
      emoji ?? null,
      updatedFarmerRate,
      updatedWholesalerRate,
      crate_weight_kg ?? null,
      available_crates ?? null,
      updatedLocalMandiPrice,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      id
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json(formatProduct(updated));
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// PATCH /api/products/batch-rates - bulk update farmer & wholesaler rates
app.patch('/api/products/batch-rates', (req, res) => {
  try {
    const { updates } = req.body; // array of { id, farmer_rate_per_kg, wholesaler_rate_per_crate }
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'Updates must be an array' });
    }

    const updateStmt = db.prepare(`
      UPDATE products SET
        farmer_rate_per_kg = ?,
        wholesaler_rate_per_crate = ?,
        local_mandi_price = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `);

    const batchTx = db.transaction((list) => {
      for (const item of list) {
        const farmerRate = Number(item.farmer_rate_per_kg);
        const wholesalerRate = Number(item.wholesaler_rate_per_crate);
        const mandiRate = Math.round(farmerRate * 0.85);
        updateStmt.run(farmerRate, wholesalerRate, mandiRate, item.id);
      }
    });

    batchTx(updates);

    const allProducts = db.prepare('SELECT * FROM products ORDER BY rowid ASC').all();
    res.json({ success: true, count: updates.length, products: allProducts.map(formatProduct) });
  } catch (err) {
    console.error('Error bulk updating rates:', err);
    res.status(500).json({ error: 'Failed to update rates' });
  }
});

// PATCH /api/products/:id/toggle - toggle active status
app.patch('/api/products/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const newStatus = existing.is_active ? 0 : 1;
    db.prepare('UPDATE products SET is_active = ?, updated_at = datetime(\'now\') WHERE id = ?').run(newStatus, id);

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json(formatProduct(updated));
  } catch (err) {
    console.error('Error toggling product status:', err);
    res.status(500).json({ error: 'Failed to toggle status' });
  }
});

// DELETE /api/products/:id - delete a product
app.delete('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted', id });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ==========================================
// FARMER BOOKINGS API
// ==========================================

// GET /api/farmer-bookings - list all bookings (optional ?farmer_id=X)
app.get('/api/farmer-bookings', (req, res) => {
  try {
    const { farmer_id } = req.query;
    let rows;
    if (farmer_id !== undefined && farmer_id !== '') {
      rows = db.prepare('SELECT * FROM farmer_bookings WHERE farmer_id = ? ORDER BY created_at DESC').all(farmer_id);
    } else {
      rows = db.prepare('SELECT * FROM farmer_bookings ORDER BY created_at DESC').all();
    }
    res.json(rows);
  } catch (err) {
    console.error('Error fetching farmer bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// POST /api/farmer-bookings - create new booking (optional farmer_id)
app.post('/api/farmer-bookings', (req, res) => {
  try {
    const {
      id,
      farmer_id,
      farmer_name,
      phone = '9822481092',
      village,
      crop_id,
      crop_name,
      crates_count,
      pickup_type,
      total_estimated_amount,
      status = 'Pending',
      tempo_eta = '35 min',
    } = req.body;

    const bookingId = id || `FR-${new Date().toISOString().slice(0, 10)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const parsedFarmerId = farmer_id !== undefined && farmer_id !== null && farmer_id !== ''
      ? Number(farmer_id)
      : null;

    const stmt = db.prepare(`
      INSERT INTO farmer_bookings (
        id, farmer_id, farmer_name, phone, village, crop_id, crop_name,
        crates_count, pickup_type, total_estimated_amount, status, tempo_eta, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(
      bookingId,
      parsedFarmerId,
      farmer_name || 'ज्ञानेश्वर तुकाराम बोराडे',
      phone,
      village || 'जुन्नर',
      crop_id || 'tomato',
      crop_name || 'टोमॅटो',
      Number(crates_count) || 5,
      pickup_type || 'बांधावरून',
      Number(total_estimated_amount) || 0,
      status,
      tempo_eta
    );

    const created = db.prepare('SELECT * FROM farmer_bookings WHERE id = ?').get(bookingId);
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating farmer booking:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// PATCH /api/farmer-bookings/:id/status - update booking status
app.patch('/api/farmer-bookings/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const stmt = db.prepare('UPDATE farmer_bookings SET status = ? WHERE id = ?');
    const result = stmt.run(status, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const updated = db.prepare('SELECT * FROM farmer_bookings WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    console.error('Error updating booking status:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// ==========================================
// WHOLESALER ORDERS API
// ==========================================

// GET /api/wholesaler-orders - list all orders (optional ?buyer_id=X)
app.get('/api/wholesaler-orders', (req, res) => {
  try {
    const { buyer_id } = req.query;
    let rows;
    if (buyer_id !== undefined && buyer_id !== '') {
      rows = db.prepare('SELECT * FROM wholesaler_orders WHERE buyer_id = ? ORDER BY created_at DESC').all(buyer_id);
    } else {
      rows = db.prepare('SELECT * FROM wholesaler_orders ORDER BY created_at DESC').all();
    }
    res.json(rows);
  } catch (err) {
    console.error('Error fetching wholesaler orders:', err);
    res.status(500).json({ error: 'Failed to fetch wholesaler orders' });
  }
});

// POST /api/wholesaler-orders - create new order (optional buyer_id)
app.post('/api/wholesaler-orders', (req, res) => {
  try {
    const {
      id,
      buyer_id,
      wholesaler_name,
      shop_gala_no = 'गाळा क्र. १२',
      market_yard,
      crop_id,
      crop_name,
      crates_ordered,
      total_weight_kg = 0,
      total_amount,
      delivery_status = 'Pending',
    } = req.body;

    const orderId = id || `B2B-FR-${Math.floor(1000 + Math.random() * 9000)}`;

    const parsedBuyerId = buyer_id !== undefined && buyer_id !== null && buyer_id !== ''
      ? Number(buyer_id)
      : null;

    const stmt = db.prepare(`
      INSERT INTO wholesaler_orders (
        id, buyer_id, wholesaler_name, shop_gala_no, market_yard,
        crop_id, crop_name, crates_ordered, total_weight_kg, total_amount, delivery_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(
      orderId,
      parsedBuyerId,
      wholesaler_name || 'व्यापारी खरेदीदार',
      shop_gala_no,
      market_yard || 'Gultekdi — Pune Market Yard',
      crop_id || 'mixed',
      crop_name || 'शेतमाल',
      Number(crates_ordered) || 1,
      Number(total_weight_kg) || 0,
      Number(total_amount) || 0,
      delivery_status
    );

    const created = db.prepare('SELECT * FROM wholesaler_orders WHERE id = ?').get(orderId);
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating wholesaler order:', err);
    res.status(500).json({ error: 'Failed to create wholesaler order' });
  }
});

// PATCH /api/wholesaler-orders/:id/status - update order delivery status
app.patch('/api/wholesaler-orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { delivery_status } = req.body;

    if (!delivery_status) {
      return res.status(400).json({ error: 'Delivery status is required' });
    }

    const stmt = db.prepare('UPDATE wholesaler_orders SET delivery_status = ? WHERE id = ?');
    const result = stmt.run(delivery_status, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updated = db.prepare('SELECT * FROM wholesaler_orders WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    console.error('Error updating order delivery status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ==========================================
// STATS API
// ==========================================
app.get('/api/stats', (req, res) => {
  try {
    const activeProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get().count;
    const farmerBookingsCount = db.prepare('SELECT COUNT(*) as count FROM farmer_bookings').get().count;
    const pendingFarmerBookings = db.prepare("SELECT COUNT(*) as count FROM farmer_bookings WHERE status = 'Pending'").get().count;
    const wholesalerOrdersCount = db.prepare('SELECT COUNT(*) as count FROM wholesaler_orders').get().count;
    const pendingWholesalerOrders = db.prepare("SELECT COUNT(*) as count FROM wholesaler_orders WHERE delivery_status = 'Pending'").get().count;
    const totalFarmerPayout = db.prepare('SELECT SUM(total_estimated_amount) as total FROM farmer_bookings').get().total || 0;
    const totalWholesalerRevenue = db.prepare('SELECT SUM(total_amount) as total FROM wholesaler_orders').get().total || 0;

    res.json({
      activeProducts,
      farmerBookingsCount,
      pendingFarmerBookings,
      wholesalerOrdersCount,
      pendingWholesalerOrders,
      totalFarmerPayout,
      totalWholesalerRevenue,
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Aapli Mandi API Server running on http://localhost:${PORT}`);
});

export default app;
export { app };
