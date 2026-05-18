import { MercadoPagoConfig, Preference } from 'mercadopago';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { items } = req.body;
  
  // Usamos process.env porque Vercel Serverless Functions lee las variables de entorno de Node
  const ACCESS_TOKEN = process.env.VITE_MP_ACCESS_TOKEN;

  if (!ACCESS_TOKEN) {
    return res.status(500).json({ error: 'Falta vincular el token de Mercado Pago en Vercel.' });
  }

  // Inicializa Mercado Pago con tu Access Token
  const client = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });
  const preference = new Preference(client);

  try {
    const response = await preference.create({
      body: {
        items: items.map(item => ({
          title: item.name + ' - Talle ' + item.size,
          quantity: Number(item.quantity),
          unit_price: Number(item.price),
          currency_id: 'ARS', // Pesos Argentinos
        })),
        back_urls: {
          success: 'https://olmoind.vercel.app',
          failure: 'https://olmoind.vercel.app',
          pending: 'https://olmoind.vercel.app'
        },
        auto_return: 'approved',
      }
    });

    // Retorna el link de pago seguro
    res.status(200).json({ init_point: response.init_point });
  } catch (error) {
    console.error('Mercado Pago Error:', error);
    res.status(500).json({ error: 'Error interno al crear la preferencia de pago.' });
  }
}
