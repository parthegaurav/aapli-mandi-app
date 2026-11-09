import { createClient } from '@supabase/supabase-js';
import { crops as defaultCrops } from '../data/crops.js';

// Environment credentials for Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://fznhwygyksepegnvudue.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6bmh3eWd5a3NlcGVnbnZ1ZHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5NDY1OTgsImV4cCI6MjEwOTUyMjU5OH0.df6R8fQFkoKsbIYj6Qy0KvcQC69P0G6yTmZZh0guBkI';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('your-supabase')
);

// Instantiate Supabase client safely
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
      },
    })
  : null;

// ============================================================
// FORMATTERS & MAPPERS
// ============================================================

export function formatCropRow(row) {
  if (!row) return null;
  const nameEnLower = String(row.name_en || '').toLowerCase();

  const defaultMatch = defaultCrops.find(
    (c) =>
      c.id === String(row.id) ||
      nameEnLower.includes(c.id.toLowerCase()) ||
      (c.name?.en && nameEnLower.includes(c.name.en.toLowerCase()))
  );

  const emoji =
    row.emoji ||
    defaultMatch?.emoji ||
    (nameEnLower.includes('tomato')
      ? '🍅'
      : nameEnLower.includes('onion')
      ? '🧅'
      : nameEnLower.includes('chilli')
      ? '🌶️'
      : nameEnLower.includes('okra') || nameEnLower.includes('bhendi')
      ? '🥒'
      : nameEnLower.includes('pomegranate')
      ? '🫐'
      : nameEnLower.includes('spinach') || nameEnLower.includes('palak')
      ? '🥬'
      : '🥬');

  const color = row.color || defaultMatch?.color || 'bg-emerald-50 border-emerald-200';
  const iconColor = row.icon_color || defaultMatch?.iconColor || 'text-emerald-600';

  const farmerRate = Number(row.farmer_rate_per_kg ?? row.pricePerKg ?? defaultMatch?.pricePerKg ?? 30);
  const wholesalerRate = Number(
    row.wholesaler_rate_per_crate ?? row.cratePrice ?? defaultMatch?.cratePrice ?? 600
  );
  const crateWeight = Number(row.crate_weight_kg ?? defaultMatch?.crateWeightKg ?? 20);

  return {
    id: row.id,
    name_mr: row.name_mr || defaultMatch?.name?.mr || 'शेतमाल',
    name_en: row.name_en || defaultMatch?.name?.en || 'Produce',
    category: row.category || 'भाजीपाला',
    imageUrl: row.image_url || row.imageUrl || '',
    emoji,
    farmer_rate_per_kg: farmerRate,
    wholesaler_rate_per_crate: wholesalerRate,
    pricePerKg: farmerRate,
    cratePrice: wholesalerRate,
    crate_weight_kg: crateWeight,
    crateWeightKg: crateWeight,
    available_crates: row.available_crates ?? (defaultMatch?.available || 100),
    available: row.available_crates ?? (defaultMatch?.available || 100),
    local_mandi_price: row.local_mandi_price || Math.round(farmerRate * 0.85),
    localMandiPrice: row.local_mandi_price || Math.round(farmerRate * 0.85),
    name: {
      mr: row.name_mr || defaultMatch?.name?.mr || 'शेतमाल',
      en: row.name_en || defaultMatch?.name?.en || 'Produce',
    },
    unit: 'kg',
    color,
    iconColor,
    is_active: row.is_active !== undefined ? Boolean(row.is_active) : true,
    isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
    updated_at: row.updated_at || new Date().toISOString(),
  };
}

export function formatFarmerBookingRow(row) {
  if (!row) return null;
  const id = row.receipt_no || row.id || `FR-${Date.now()}`;
  return {
    id,
    db_id: row.id,
    receipt_no: row.receipt_no || id,
    farmer_id: row.farmer_id || row.id,
    farmer_name: row.farmer_name || 'शेतकरी',
    farmerName: row.farmer_name || 'शेतकरी',
    phone: row.phone || '9822481092',
    village: row.village_taluka || row.village || 'जुन्नर',
    pickupLocation: row.village_taluka || row.village || 'जुन्नर',
    crop_id: row.product_id || row.crop_id || 'tomato',
    crop_name: row.crop_name_snapshot || row.crop_name || 'टोमॅटो',
    crates_count: Number(row.crates_count) || 5,
    quantity: Number(row.crates_count) || 5,
    rate_per_kg: Number(row.locked_rate_per_kg ?? row.rate_per_kg) || 22,
    ratePerKg: Number(row.locked_rate_per_kg ?? row.rate_per_kg) || 22,
    pickup_type: row.pickup_type || 'थेट बांधावरून (Farm Gate)',
    total_estimated_amount: Number(row.estimated_payout ?? row.total_estimated_amount) || 0,
    estimatedPayout: Number(row.estimated_payout ?? row.total_estimated_amount) || 0,
    status: row.status || 'नोंदणी झाली (Pending Pickup)',
    tempo_eta: row.tempo_eta || '35 min',
    created_at: row.created_at || new Date().toISOString(),
  };
}

export function formatWholesalerOrderRow(row) {
  if (!row) return null;
  const id = row.id || `B2B-FR-${Date.now()}`;
  const totalAmount = Number(row.total_order_amount ?? row.total_amount) || 0;
  const cratesCount = Number(row.crates_ordered) || 1;
  const totalWeight = Number(row.total_weight_kg) || cratesCount * 20;

  return {
    id,
    db_id: row.id,
    buyer_id: row.buyer_id || row.id,
    wholesaler_name: row.wholesaler_name || 'व्यापारी खरेदीदार',
    shop_gala_no: row.gala_shop_no || row.shop_gala_no || 'गाळा क्र. ४२',
    market_yard: row.market_yard || 'गुलटेकडी — पुणे मार्केट यार्ड',
    phone: row.phone || '9850001234',
    crop_id: row.product_id || row.crop_id || 'mixed',
    crop_name: row.crop_name_snapshot || row.crop_name || 'शेतमाल',
    crates_ordered: cratesCount,
    total_weight_kg: totalWeight,
    total_amount: totalAmount,
    delivery_slot: row.delivery_slot || 'पहाटे ४:०० ते ६:०० (Early Morning Express)',
    delivery_status: row.order_status || row.delivery_status || 'ऑर्डर कन्फर्म (Confirmed)',
    order_status: row.order_status || row.delivery_status || 'ऑर्डर कन्फर्म (Confirmed)',
    created_at: row.created_at || new Date().toISOString(),
  };
}

// Helper to update local products cache
function updateLocalProductsCache(cropId, updates) {
  try {
    const cached = localStorage.getItem('aapliMandi_products_cache');
    if (cached) {
      const list = JSON.parse(cached);
      const updated = list.map((c) =>
        String(c.id) === String(cropId) ? { ...c, ...updates } : c
      );
      localStorage.setItem('aapliMandi_products_cache', JSON.stringify(updated));
    }
  } catch {}
}

// ============================================================
// 1. PRODUCTS API (SUPABASE + CACHE FALLBACK)
// ============================================================

export async function fetchProducts({ includeAll = true } = {}) {
  // Try Supabase direct query
  if (supabase) {
    try {
      let query = supabase.from('products').select('*');
      if (!includeAll) {
        query = query.eq('is_active', true);
      }
      query = query.order('id', { ascending: true });
      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        const formatted = data.map(formatCropRow);
        try {
          localStorage.setItem('aapliMandi_products_cache', JSON.stringify(formatted));
        } catch {}
        return formatted;
      }
      if (error) {
        console.warn('Supabase fetch products error, using fallback:', error.message);
      }
    } catch (err) {
      console.warn('Supabase fetch products failed, using fallback:', err);
    }
  }

  // Fallback 1: localStorage cache
  try {
    const cached = localStorage.getItem('aapliMandi_products_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  // Fallback 2: Default static crops
  return defaultCrops.map(formatCropRow);
}

export async function saveSingleProductRate(cropId, { farmer_rate_per_kg, wholesaler_rate_per_crate }) {
  const farmerRate = Number(farmer_rate_per_kg);
  const wholesalerRate = Number(wholesaler_rate_per_crate);

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          farmer_rate_per_kg: farmerRate,
          wholesaler_rate_per_crate: wholesalerRate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cropId)
        .select();

      if (!error && data) {
        updateLocalProductsCache(cropId, {
          farmer_rate_per_kg: farmerRate,
          wholesaler_rate_per_crate: wholesalerRate,
          pricePerKg: farmerRate,
          cratePrice: wholesalerRate,
        });
        return { success: true, data: data[0] };
      }
      if (error) console.warn('Supabase update single rate error:', error.message);
    } catch (err) {
      console.warn('Supabase update single rate failed:', err);
    }
  }

  // Fallback cache update
  updateLocalProductsCache(cropId, {
    farmer_rate_per_kg: farmerRate,
    wholesaler_rate_per_crate: wholesalerRate,
    pricePerKg: farmerRate,
    cratePrice: wholesalerRate,
  });
  return { success: true };
}

export async function batchUpdateProductRates(updates) {
  if (supabase && Array.isArray(updates)) {
    try {
      const promises = updates.map((item) =>
        supabase
          .from('products')
          .update({
            farmer_rate_per_kg: Number(item.farmer_rate_per_kg),
            wholesaler_rate_per_crate: Number(item.wholesaler_rate_per_crate),
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id)
      );
      await Promise.all(promises);
    } catch (err) {
      console.warn('Supabase batch rate update error:', err);
    }
  }

  // Always update local cache
  for (const item of updates) {
    updateLocalProductsCache(item.id, {
      farmer_rate_per_kg: Number(item.farmer_rate_per_kg),
      wholesaler_rate_per_crate: Number(item.wholesaler_rate_per_crate),
      pricePerKg: Number(item.farmer_rate_per_kg),
      cratePrice: Number(item.wholesaler_rate_per_crate),
    });
  }

  return { success: true, count: updates.length };
}

export async function toggleProductActive(cropId, currentActive) {
  const newActive = !currentActive;
  if (supabase) {
    try {
      await supabase
        .from('products')
        .update({ is_active: newActive, updated_at: new Date().toISOString() })
        .eq('id', cropId);
    } catch (err) {
      console.warn('Supabase toggle error:', err);
    }
  }
  updateLocalProductsCache(cropId, { is_active: newActive, isActive: newActive });
  return { success: true, is_active: newActive };
}

export async function deleteProduct(cropId) {
  if (supabase) {
    try {
      await supabase.from('products').delete().eq('id', cropId);
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }
  try {
    const cached = localStorage.getItem('aapliMandi_products_cache');
    if (cached) {
      const list = JSON.parse(cached).filter((c) => String(c.id) !== String(cropId));
      localStorage.setItem('aapliMandi_products_cache', JSON.stringify(list));
    }
  } catch {}
  return { success: true };
}

export async function addProduct(newProduct) {
  const farmerRate = Number(newProduct.farmer_rate_per_kg);
  const wholesalerRate = Number(newProduct.wholesaler_rate_per_crate);
  const crateWeight = Number(newProduct.crate_weight_kg) || 20;
  const availableCrates = Number(newProduct.available_crates) || 100;

  let createdProduct = null;
  if (supabase) {
    try {
      const payload = {
        name_mr: newProduct.name_mr.trim(),
        name_en: newProduct.name_en.trim(),
        category: (newProduct.category || 'भाजीपाला').trim(),
        farmer_rate_per_kg: farmerRate,
        wholesaler_rate_per_crate: wholesalerRate,
        crate_weight_kg: crateWeight,
        available_crates: availableCrates,
        is_active: newProduct.is_active !== undefined ? Boolean(newProduct.is_active) : true,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from('products').insert(payload).select();
      if (!error && data?.[0]) {
        createdProduct = formatCropRow(data[0]);
      }
    } catch (err) {
      console.warn('Supabase add product error:', err);
    }
  }

  if (!createdProduct) {
    const fallbackId = `crop_${Date.now()}`;
    createdProduct = formatCropRow({
      id: fallbackId,
      ...newProduct,
      farmer_rate_per_kg: farmerRate,
      wholesaler_rate_per_crate: wholesalerRate,
      crate_weight_kg: crateWeight,
      available_crates: availableCrates,
    });
  }

  try {
    const cached = localStorage.getItem('aapliMandi_products_cache');
    const list = cached ? JSON.parse(cached) : [];
    list.push(createdProduct);
    localStorage.setItem('aapliMandi_products_cache', JSON.stringify(list));
  } catch {}

  return createdProduct;
}

// ============================================================
// 2. FARMER BOOKINGS API (SUPABASE + LOCAL STORAGE)
// ============================================================

export async function fetchFarmerBookings({ phone, farmerName } = {}) {
  let bookings = [];

  if (supabase) {
    try {
      let query = supabase.from('farmer_bookings').select('*').order('created_at', { ascending: false });
      if (phone) {
        query = query.eq('phone', String(phone).trim());
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        bookings = data.map(formatFarmerBookingRow);
      } else if (error) {
        console.warn('Supabase fetch farmer_bookings error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase fetch farmer_bookings failed:', err);
    }
  }

  // Merge with local fallback
  try {
    const local = JSON.parse(localStorage.getItem('aapliMandi_farmer_bookings') || '[]');
    const existingIds = new Set(bookings.map((b) => String(b.id)));
    for (const item of local) {
      if (!existingIds.has(String(item.id))) {
        if (!phone || String(item.phone) === String(phone)) {
          bookings.push(item);
        }
      }
    }
  } catch {}

  return bookings;
}

export async function createFarmerBooking(bookingData) {
  const receiptNo = bookingData.id || `FR-${Math.floor(10000 + Math.random() * 90000)}`;
  const rateKg = Number(bookingData.ratePerKg ?? bookingData.locked_rate_per_kg ?? 22);
  const payout = Number(bookingData.total_estimated_amount ?? bookingData.estimated_payout ?? 0);
  const cratesCount = Number(bookingData.crates_count) || 5;

  const payload = {
    receipt_no: receiptNo,
    farmer_name: bookingData.farmer_name || bookingData.farmerName || 'ज्ञानेश्वर तुकाराम बोराडे',
    phone: String(bookingData.phone || '9822481092').trim(),
    village_taluka: bookingData.village || bookingData.pickupLocation || 'जुन्नर',
    crop_name_snapshot: bookingData.crop_name || bookingData.cropName || 'टोमॅटो',
    crates_count: cratesCount,
    locked_rate_per_kg: rateKg,
    estimated_payout: payout,
    pickup_type: bookingData.pickup_type || 'थेट बांधावरून (Farm Gate)',
    status: bookingData.status || 'नोंदणी झाली (Pending Pickup)',
  };

  let savedRow = null;
  if (supabase) {
    try {
      const { data, error } = await supabase.from('farmer_bookings').insert(payload).select();
      if (!error && data?.[0]) {
        savedRow = formatFarmerBookingRow(data[0]);
      } else if (error) {
        console.warn('Supabase insert farmer_booking error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase insert farmer_booking failed:', err);
    }
  }

  if (!savedRow) {
    savedRow = formatFarmerBookingRow({
      id: receiptNo,
      ...payload,
      created_at: new Date().toISOString(),
    });
  }

  // Cache in localStorage
  try {
    const local = JSON.parse(localStorage.getItem('aapliMandi_farmer_bookings') || '[]');
    local.unshift(savedRow);
    localStorage.setItem('aapliMandi_farmer_bookings', JSON.stringify(local.slice(0, 50)));
  } catch {}

  return savedRow;
}

export async function updateFarmerBookingStatus(bookingId, newStatus) {
  if (supabase) {
    try {
      const isNum = Number.isInteger(Number(bookingId));
      let query = supabase.from('farmer_bookings').update({ status: newStatus });
      if (isNum) {
        query = query.eq('id', Number(bookingId));
      } else {
        query = query.eq('receipt_no', bookingId);
      }
      await query;
    } catch (err) {
      console.warn('Supabase update farmer booking status error:', err);
    }
  }

  // Update local
  try {
    const local = JSON.parse(localStorage.getItem('aapliMandi_farmer_bookings') || '[]');
    const updated = local.map((b) =>
      b.id === bookingId || b.receipt_no === bookingId ? { ...b, status: newStatus } : b
    );
    localStorage.setItem('aapliMandi_farmer_bookings', JSON.stringify(updated));
  } catch {}

  return { success: true };
}

// ============================================================
// 3. WHOLESALER ORDERS API (SUPABASE + LOCAL STORAGE)
// ============================================================

export async function fetchWholesalerOrders({ phone, wholesalerName } = {}) {
  let orders = [];

  if (supabase) {
    try {
      let query = supabase.from('wholesaler_orders').select('*').order('created_at', { ascending: false });
      if (phone) {
        query = query.eq('phone', String(phone).trim());
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        orders = data.map(formatWholesalerOrderRow);
      } else if (error) {
        console.warn('Supabase fetch wholesaler_orders error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase fetch wholesaler_orders failed:', err);
    }
  }

  // Merge with local fallback
  try {
    const local = JSON.parse(localStorage.getItem('aapliMandi_wholesaler_orders') || '[]');
    const existingIds = new Set(orders.map((o) => String(o.id)));
    for (const item of local) {
      if (!existingIds.has(String(item.id))) {
        if (!phone || String(item.phone) === String(phone)) {
          orders.push(item);
        }
      }
    }
  } catch {}

  return orders;
}

export async function createWholesalerOrder(orderData) {
  const orderId = orderData.id || `B2B-FR-${Math.floor(1000 + Math.random() * 9000)}`;
  const totalAmount = Number(orderData.total_amount ?? orderData.total_order_amount ?? 0);
  const cratesCount = Number(orderData.crates_ordered) || 1;
  const totalWeight = Number(orderData.total_weight_kg) || cratesCount * 20;

  const payload = {
    wholesaler_name: orderData.wholesaler_name || 'व्यापारी खरेदीदार',
    gala_shop_no: orderData.shop_gala_no || orderData.gala_shop_no || 'गाळा क्र. ४२',
    market_yard: orderData.market_yard || 'गुलटेकडी — पुणे मार्केट यार्ड',
    phone: String(orderData.phone || '9850001234').trim(),
    crop_name_snapshot: orderData.crop_name || 'शेतमाल',
    crates_ordered: cratesCount,
    total_order_amount: totalAmount,
    delivery_slot: orderData.delivery_slot || 'पहाटे ४:०० ते ६:०० (Early Morning Express)',
    order_status: orderData.delivery_status || orderData.order_status || 'ऑर्डर कन्फर्म (Confirmed)',
  };

  let savedRow = null;
  if (supabase) {
    try {
      const { data, error } = await supabase.from('wholesaler_orders').insert(payload).select();
      if (!error && data?.[0]) {
        savedRow = formatWholesalerOrderRow(data[0]);
      } else if (error) {
        console.warn('Supabase insert wholesaler_order error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase insert wholesaler_order failed:', err);
    }
  }

  if (!savedRow) {
    savedRow = formatWholesalerOrderRow({
      id: orderId,
      ...payload,
      total_weight_kg: totalWeight,
      created_at: new Date().toISOString(),
    });
  }

  // Cache in localStorage
  try {
    const local = JSON.parse(localStorage.getItem('aapliMandi_wholesaler_orders') || '[]');
    local.unshift(savedRow);
    localStorage.setItem('aapliMandi_wholesaler_orders', JSON.stringify(local.slice(0, 50)));
  } catch {}

  return savedRow;
}

export async function updateWholesalerOrderStatus(orderId, newStatus) {
  if (supabase) {
    try {
      const isNum = Number.isInteger(Number(orderId));
      let query = supabase.from('wholesaler_orders').update({ order_status: newStatus });
      if (isNum) {
        query = query.eq('id', Number(orderId));
      } else {
        query = query.eq('id', orderId);
      }
      await query;
    } catch (err) {
      console.warn('Supabase update wholesaler order status error:', err);
    }
  }

  // Update local
  try {
    const local = JSON.parse(localStorage.getItem('aapliMandi_wholesaler_orders') || '[]');
    const updated = local.map((o) =>
      o.id === orderId ? { ...o, delivery_status: newStatus, order_status: newStatus } : o
    );
    localStorage.setItem('aapliMandi_wholesaler_orders', JSON.stringify(updated));
  } catch {}

  return { success: true };
}

// ============================================================
// 4. STATS API
// ============================================================

export async function fetchStats() {
  try {
    const [products, farmerBookings, wholesalerOrders] = await Promise.all([
      fetchProducts({ includeAll: true }),
      fetchFarmerBookings(),
      fetchWholesalerOrders(),
    ]);

    const activeProducts = products.filter((p) => p.is_active || p.isActive).length;
    const farmerBookingsCount = farmerBookings.length;
    const pendingFarmerBookings = farmerBookings.filter((b) =>
      (b.status || '').toLowerCase().includes('pending') || (b.status || '').includes('नोंदणी')
    ).length;

    const wholesalerOrdersCount = wholesalerOrders.length;
    const pendingWholesalerOrders = wholesalerOrders.filter((o) =>
      (o.delivery_status || o.order_status || '').toLowerCase().includes('pending') ||
      (o.delivery_status || o.order_status || '').toLowerCase().includes('received') ||
      (o.delivery_status || o.order_status || '').includes('स्वीकारली')
    ).length;

    const totalFarmerPayout = farmerBookings.reduce(
      (sum, b) => sum + (Number(b.total_estimated_amount || b.estimated_payout) || 0),
      0
    );
    const totalWholesalerRevenue = wholesalerOrders.reduce(
      (sum, o) => sum + (Number(o.total_amount || o.total_order_amount) || 0),
      0
    );

    return {
      activeProducts,
      farmerBookingsCount,
      pendingFarmerBookings,
      wholesalerOrdersCount,
      pendingWholesalerOrders,
      totalFarmerPayout,
      totalWholesalerRevenue,
    };
  } catch (err) {
    console.warn('Failed to calculate stats:', err);
    return {
      activeProducts: 6,
      farmerBookingsCount: 0,
      pendingFarmerBookings: 0,
      wholesalerOrdersCount: 0,
      pendingWholesalerOrders: 0,
      totalFarmerPayout: 0,
      totalWholesalerRevenue: 0,
    };
  }
}
