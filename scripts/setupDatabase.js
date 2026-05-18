
import { supabase } from '../src/supabaseClient.js';

async function createTables() {
    console.log('=== OLMO INDUMENTARIA — DATABASE SETUP ===');
    console.log('Corré el siguiente SQL en el Supabase Dashboard > SQL Editor:\n');

    console.log(`
-- ══════════════════════════════════════════════════
-- TABLAS BASE (ya existentes, se crean si no están)
-- ══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image TEXT,
  images TEXT[],
  category TEXT,
  variants JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  items JSONB,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'Pendiente',
  -- Campos de cliente (guardados al finalizar compra)
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  customer_city TEXT,
  customer_province TEXT,
  customer_zip TEXT,
  payment_method TEXT,
  shipping_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════
-- TABLAS NUEVAS — MÓDULOS ENTERPRISE
-- ══════════════════════════════════════════════════

-- Descuentos y promociones
CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'percentage' | 'fixed' | 'transfer' | 'quantity'
  value NUMERIC NOT NULL,
  min_quantity INT DEFAULT 1,
  applies_to TEXT DEFAULT 'all',
  category TEXT,
  product_id UUID,
  code TEXT UNIQUE,
  active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Métodos de envío
CREATE TABLE IF NOT EXISTS shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'pickup' | 'local' | 'national'
  price NUMERIC DEFAULT 0,
  free_above NUMERIC,
  estimated_days TEXT DEFAULT '3-7 días hábiles',
  active BOOLEAN DEFAULT true,
  zones TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════════════════

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público (para demo/producción básica)
DO $$ BEGIN
  -- products
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='products' AND policyname='Public Read Products') THEN
    CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='products' AND policyname='Anon Update Products') THEN
    CREATE POLICY "Anon Update Products" ON products FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='products' AND policyname='Anon Insert Products') THEN
    CREATE POLICY "Anon Insert Products" ON products FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='products' AND policyname='Anon Delete Products') THEN
    CREATE POLICY "Anon Delete Products" ON products FOR DELETE USING (true);
  END IF;

  -- sales
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sales' AND policyname='Anon Insert Sales') THEN
    CREATE POLICY "Anon Insert Sales" ON sales FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sales' AND policyname='Public Read Sales') THEN
    CREATE POLICY "Public Read Sales" ON sales FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sales' AND policyname='Anon Update Sales') THEN
    CREATE POLICY "Anon Update Sales" ON sales FOR UPDATE USING (true);
  END IF;

  -- discounts
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='discounts' AND policyname='Public Read Discounts') THEN
    CREATE POLICY "Public Read Discounts" ON discounts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='discounts' AND policyname='Anon Manage Discounts') THEN
    CREATE POLICY "Anon Manage Discounts" ON discounts FOR ALL USING (true);
  END IF;

  -- shipping_methods
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='shipping_methods' AND policyname='Public Read Shipping') THEN
    CREATE POLICY "Public Read Shipping" ON shipping_methods FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='shipping_methods' AND policyname='Anon Manage Shipping') THEN
    CREATE POLICY "Anon Manage Shipping" ON shipping_methods FOR ALL USING (true);
  END IF;

END $$;

-- Columna images en products (si no existe)
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[];

-- Columnas de cliente en sales (si no existen)
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_city TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS shipping_method TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pendiente';
ALTER TABLE sales ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'Central';

-- ══════════════════════════════════════════════════
-- DATOS DE EJEMPLO PARA ENVÍOS (opcionales)
-- ══════════════════════════════════════════════════
INSERT INTO shipping_methods (name, type, price, estimated_days, active)
VALUES 
  ('Retiro en local', 'pickup', 0, 'Inmediato', true),
  ('Envío a domicilio (Santa Fe)', 'local', 800, '1-2 días hábiles', true),
  ('Correo Argentino', 'national', 3500, '3-7 días hábiles', true)
ON CONFLICT DO NOTHING;
    `);

    console.log('\n✅ Copiá todo el SQL de arriba y pegalo en: Supabase > SQL Editor > New Query > Run');
}

createTables();


