// Next.js API route to proxy Binance requests and avoid CORS issues
export default async function handler(req, res) {
  const { symbols } = req.query;
  if (!symbols) {
    return res.status(400).json({ error: 'Missing symbols parameter' });
  }
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbols)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch from Binance' });
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
