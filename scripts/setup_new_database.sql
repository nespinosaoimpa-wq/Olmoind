-- SQL Setup para Inicializar el nuevo proyecto de Supabase para Olmoind
-- Proyecto: Olmo.indumentaria (kebwlbdganoxvcposcgg)
-- Ejecuta este script completo en el "SQL Editor" de tu Dashboard de Supabase.

-- 1. Crear tabla 'products'
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image TEXT,                               -- URL de la imagen principal (legacy)
    images JSONB DEFAULT '[]'::jsonb,         -- Array de URLs de imágenes
    category TEXT,
    variants JSONB DEFAULT '{"XS":0,"S":0,"M":0,"L":0,"XL":0,"XXL":0}'::jsonb, -- Stock por talle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla 'sales'
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    items JSONB DEFAULT '[]'::jsonb,          -- Lista de productos vendidos
    total NUMERIC NOT NULL,
    status TEXT DEFAULT 'Pendiente',          -- Estado del pedido (Pendiente, Enviado, Entregado, Cancelado)
    customer_info JSONB DEFAULT '{}'::jsonb,  -- Datos del cliente
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear tabla 'settings'
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuraciones estéticas y de contacto por defecto
INSERT INTO settings (key, value) VALUES 
('contact', '{"whatsapp": "543434559599", "email": "olmoshowroom@gmail.com", "address": "Cervantes 35 local A", "instagram": "olmo.ind"}'::jsonb),
('hero', '{"title": "OLMO", "subtitle": "INDUMENTARIA", "cta": "Ver Colección", "bgColor": ""}'::jsonb),
('banners', '[]'::jsonb),
('categories', '["Remeras", "Pantalones", "Sudaderas", "Accesorios"]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 4. Habilitar RLS (Row Level Security) para mayor seguridad
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas de acceso completo para Anon y Authenticated (Evita errores de permisos 42501)
DROP POLICY IF EXISTS "Permitir todo en products" ON products;
CREATE POLICY "Permitir todo en products" ON products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo en sales" ON sales;
CREATE POLICY "Permitir todo en sales" ON sales FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo en settings" ON settings;
CREATE POLICY "Permitir todo en settings" ON settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
