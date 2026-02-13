
import { supabase } from '../src/supabaseClient.js';

async function createTables() {
    console.log('Creating tables...');

    // 1. Create 'products' table
    const { error: productsError } = await supabase.rpc('create_products_table');
    // Note: Standard Supabase client cannot create tables directly via API unless using a specific SQL function or the Dashboard.
    // However, for this task, I will provide the SQL code for the user to run in the Supabase Dashboard SQL Editor, 
    // as it is the most reliable way to set up the schema properly without Admin API keys (which are not available).

    console.log('To set up the database, please run the following SQL in the Supabase SQL Editor:');
    console.log(`
    -- Create 'products' table
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT,
      price NUMERIC NOT NULL,
      image TEXT,
      category TEXT,
      variants JSONB, -- Stores { "S": 10, "M": 5 }
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create 'sales' table
    CREATE TABLE IF NOT EXISTS sales (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      items JSONB, -- Stores array of items sold
      total NUMERIC NOT NULL,
      customer_info JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Enable RLS (Row Level Security)
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

    -- Create Policies (Public Read, Anon Write for demo purposes - In production, lock down)
    CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
    CREATE POLICY "Anon Update Products" ON products FOR UPDATE USING (true); -- Ideally authenticated
    CREATE POLICY "Anon Insert Sales" ON sales FOR INSERT WITH CHECK (true);
  `);
}

createTables();
