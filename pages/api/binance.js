// Next.js API route to proxy Binance requests and avoid CORS issues
export default async function handler(req, res) {
  let { symbols } = req.query;
  if (!symbols) {
    return res.status(400).json({ error: 'Missing symbols parameter' });
  }
  // If symbols is not a JSON array string, convert it
  try {
    let arr;
    if (typeof symbols === 'string') {
      // Jika string dan bukan array JSON, pastikan tetap array
      arr = symbols.trim().startsWith('[')
        ? JSON.parse(symbols)
        : [symbols];
    } else if (Array.isArray(symbols)) {
      arr = symbols;
    } else {
      arr = [String(symbols)];
    }
    // Batasi maksimal 20 symbols sesuai limit Binance
    arr = arr.slice(0, 20);
    symbols = JSON.stringify(arr);
  } catch (e) {
    // Jika parsing gagal, selalu balas array kosong
    return res.status(200).json([]);
  }
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbols)}`;
  try {
    const response = await fetch(url);
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = [];
    }
    // Jika response error atau bukan array, log detail error
    if (!response.ok || !Array.isArray(data)) {
      return res.status(200).json([]);
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(200).json([]);
  }
}
