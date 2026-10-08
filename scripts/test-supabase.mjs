import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iyhgtpemgywwanqqvtpe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5aGd0cGVtZ3l3d2FucXF2dHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0Nzk3NzcsImV4cCI6MjEwNzA1NTc3N30.6Vnu6AA0-x0pOEKcM0a-Kb9DzS4bwGPDi8Uyfr45WHk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkStatus() {
  console.log('--- ESTADO DE CONEXIÓN CON SUPABASE ---');
  console.log('URL:', supabaseUrl);
  
  // 1. Verificar tabla products
  const { data: products, error: pErr } = await supabase.from('products').select('id, name, price, stock_qty').limit(5);
  if (pErr) {
    console.log('❌ Tabla products:', pErr.message);
  } else {
    console.log('✅ Tabla products conectada con éxito! Filas encontradas:', products.length);
    console.log(products);
  }

  // 2. Verificar tabla coupons
  const { data: coupons, error: cErr } = await supabase.from('coupons').select('code, discount_value').limit(3);
  if (cErr) {
    console.log('❌ Tabla coupons:', cErr.message);
  } else {
    console.log('✅ Tabla coupons conectada con éxito! Cupones:', coupons);
  }

  // 3. Verificar buckets de Storage
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  if (bErr) {
    console.log('❌ Storage Buckets:', bErr.message);
  } else {
    console.log('✅ Storage Buckets encontrados:', buckets?.map(b => b.name));
  }
}

checkStatus();
