"use client"
import useSWR from "swr"

type Ticker = {
  symbol: string
  lastPrice: string
  priceChangePercent: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())
// Fungsi batching untuk fetch semua symbols
export async function fetchBinanceBatch(symbols: string[]): Promise<any[]> {
  const batchSize = 20;
  const batches = [];
  for (let i = 0; i < symbols.length; i += batchSize) {
    batches.push(symbols.slice(i, i + batchSize));
  }
  const results = await Promise.all(
    batches.map(async (batch) => {
      const url = `/api/binance?symbols=${encodeURIComponent(JSON.stringify(batch))}`;
      const res = await fetch(url);
      return res.ok ? await res.json() : [];
    })
  );
  // Gabungkan semua hasil batch menjadi satu array
  return results.flat();
}

// const PAIRS = [
//   // Solana ecosystem tokens requested by user
//   "SOLUSDT",    // SOL (native)
//   "USDTUSDT",   // USDT (Solana)
//   "USDCUSDT",   // USDC (Solana)
//   "BONKUSDT",   // BONK
//   "JUPUSDT",    // JUP (Jupiter)
//   "RAYUSDT",    // RAY (Raydium)
//   "MSOLUSDT",   // mSOL (Marinade Staked SOL)
//   "LDOUSDT",    // LDO (Lido)
//   "WETHUSDT",   // WETH (Wrapped ETH on Solana)
//   "WBTCUSDT",   // WBTC (Wrapped BTC on Solana)
//   "CRVUSDT",    // CRV (Curve DAO, versi SPL)
//   "GRTUSDT",    // GRT (The Graph)
//   "PYTHUSDT",   // PYTH (Pyth Network)
//   "JTOUSDT",    // JTO (Jito Token)
//   "SAROSUSDT",  // SAROS
//   "WIFUSDT",    // WIF (Dogwifhat)
//   "2ZUSDT",     // DoubleZero (2Z)
//   "KMNOUSDT",   // Kamino (KMNO)
//   "MEWUSDT",    // MEW (Cat in a Dogs World)
//   "BOMEUSDT",   // BOME (Book Of Meme)
//   "POPCATUSDT", // POPCAT
//   "GOATUSDT",   // GOAT (Goatseus Maximus)
//   "TRUMPUSDT",  // TRUMP (Official Trump token)
//   "PENGUUSDT",  // PENGU (Pudgy Penguins token)
//   "ZBCNUSDT",   // ZBCN (Zebec Network)
//   "WUSDT",      // W (Wormhole token)
//   "USELESSUSDT",// USELESS (Useless Coin)
//   "SPX6900USDT" // SPX6900
// ]

const PAIRS = [
  "SOLUSDT"
]

export function BottomTicker() {
  const query = encodeURIComponent(JSON.stringify(PAIRS))
  const { data } = useSWR<Ticker[]>(`/api/binance?symbols=${query}`, fetcher, {
    refreshInterval: 10000,
    revalidateOnFocus: false,
  })

  const items = (data || []).map((t) => {
    const pct = Number.parseFloat(t.priceChangePercent)
    const up = pct >= 0
    const color = up ? "var(--chart-2)" : "var(--destructive)"
    return (
      <div key={t.symbol} className="flex items-center gap-2 px-4">
        <span className="text-xs opacity-80">{t.symbol}</span>
        <span className="text-xs" style={{ color }}>
          {Number.parseFloat(t.lastPrice).toLocaleString()}
        </span>
        <span className="text-xs" style={{ color }}>
          {up ? "+" : ""}
          {pct.toFixed(2)}%
        </span>
      </div>
    )
  })

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 w-full border-t bg-background/90">
      <div className="h-[var(--ticker-h)] overflow-hidden">
        <div className="inline-flex h-[var(--ticker-h)] items-center gap-6 px-2">{items}</div>
      </div>
    </div>
  )
}
