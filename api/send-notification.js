export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { itemsList, total, customerInfo } = req.body;
  const BOT_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.VITE_TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    // Si no está configurado, no rompemos la compra, simplemente retornamos éxito (pero no envía)
    return res.status(200).json({ success: false, message: 'Notificaciones Telegram no configuradas.' });
  }

  const message = `🔔 *NUEVA VENTA EN OLMO* 🔔\n\n🛍️ *Pedido:*\n${itemsList}\n\n💰 *Total:* $${total.toLocaleString()}\n💳 *Estado:* Registrado en sistema.`;

  try {
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    
    const data = await response.json();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Telegram API Error:', error);
    res.status(500).json({ error: 'Error enviando notificación' });
  }
}
