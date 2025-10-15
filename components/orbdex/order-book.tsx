"use client"
import { useEffect, useRef, useState, useMemo } from "react"

const SYMBOLS = ["PENGUUSDT"
];

type Row = { price: number; size: number; total: number }
type Trade = { price: number; qty: number; side: "buy" | "sell"; time: number }

const VISIBLE_ROWS = 17

function parseLevels(levels: [string, string][], count: number, reverse = false): Row[] {
  const arr = levels
    .map(([p, q]) => ({ price: Number.parseFloat(p), size: Number.parseFloat(q) }))
    .filter((x) => x.size > 0)
    .sort((a, b) => (reverse ? b.price - a.price : a.price - b.price))
    .slice(-count)
  // accumulate totals from best price outward
  let running = 0
  return arr
    .map((r) => {
      running += r.size
      return { ...r, total: running }
    })
    .reverse() // best at top
}

function DepthChart({ asks, bids }: { asks: { price: number; size: number }[]; bids: { price: number; size: number }[] }) {
  // Responsive size: fill parent
  const width = 400, height = 200;
  // Find mid price (last price or average of best bid/ask)
  const bestBid = bids[0]?.price ?? 0;
  const bestAsk = asks[0]?.price ?? 0;
  const midPrice = bestBid && bestAsk ? (bestBid + bestAsk) / 2 : bestBid || bestAsk;

  // Prepare cumulative data for chart
  const getPoints = (data: { price: number; size: number }[], reverse = false) => {
    let cum = 0;
    return data.map((d, i) => {
      cum += d.size;
      return { price: d.price, y: cum };
    });
  };
  // Sort asks ascending, bids descending
  const sortedAsks = [...asks].sort((a, b) => a.price - b.price);
  const sortedBids = [...bids].sort((a, b) => b.price - a.price);
  // Take 15 points each for visual balance
  const askPoints = getPoints(sortedAsks.slice(0, 15));
  const bidPoints = getPoints(sortedBids.slice(0, 15));
  const maxY = Math.max(
    ...askPoints.map(p => p.y),
    ...bidPoints.map(p => p.y),
    1
  );
  // X scale: asks from mid to right, bids from mid to left
  const midX = width / 2;
  // For asks: lowest price at bottom right, highest at top right
  const scaleXAsk = (i: number, arr: any[]) => midX + (i / (arr.length - 1 || 1)) * midX;
  // For bids: lowest price at bottom left, highest at top left
  const scaleXBid = (i: number, arr: any[]) => midX - ((arr.length - 1 - i) / (arr.length - 1 || 1)) * midX;
  // Y scale: lowest total at bottom, highest at top
  const scaleY = (y: number) => height - (y / maxY) * height;
  // Area path for asks (right, downward)
  const askArea = askPoints.length > 0
    ? `M${scaleXAsk(0, askPoints)},${height} ` +
      askPoints.map((p, i) => `${i === 0 ? '' : 'L'}${scaleXAsk(i, askPoints)},${scaleY(p.y)}`).join(' ') +
      ` L${scaleXAsk(askPoints.length - 1, askPoints)},${height} Z`
    : '';
  // Area path for bids (left, upward)
  const bidArea = bidPoints.length > 0
    ? `M${scaleXBid(0, bidPoints)},${height} ` +
      bidPoints.map((p, i) => `${i === 0 ? '' : 'L'}${scaleXBid(i, bidPoints)},${scaleY(p.y)}`).join(' ') +
      ` L${scaleXBid(bidPoints.length - 1, bidPoints)},${height} Z`
    : '';
  // Line path for asks (right, downward)
  const askLine = askPoints.length > 0
    ? askPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${scaleXAsk(i, askPoints)},${scaleY(p.y)}`).join(' ')
    : '';
  // Line path for bids (left, upward)
  const bidLine = bidPoints.length > 0
    ? bidPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${scaleXBid(i, bidPoints)},${scaleY(p.y)}`).join(' ')
    : '';
  // Mid price marker
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full h-full min-h-[120px]"
      style={{ display: 'block' }}
    >
      {/* Ask area: pink/red */}
      {askArea && <path d={askArea} fill="#e94f7a" fillOpacity={0.18} stroke="none" />}
      {/* Bid area: cyan/teal */}
      {bidArea && <path d={bidArea} fill="#00c9a7" fillOpacity={0.18} stroke="none" />}
      {/* Ask line: pink/red */}
      {askLine && <path d={askLine} fill="none" stroke="#e94f7a" strokeWidth={2} />}
      {/* Bid line: cyan/teal */}
      {bidLine && <path d={bidLine} fill="none" stroke="#00c9a7" strokeWidth={2} />}
      {/* Mid price marker */}
      <circle cx={midX} cy={height} r={5} fill="#fff" />
    </svg>
  );
}

export function OrderBook() {
  const [symbol, setSymbol] = useState<string>("btcusdt")
  const [bids, setBids] = useState<Row[]>([])
  const [asks, setAsks] = useState<Row[]>([])
  const [activeTab, setActiveTab] = useState<"orderbook" | "trades" | "depth">(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('orderbookTab') as "orderbook" | "trades" | "depth") || "orderbook";
    }
    return "orderbook";
  });
  const [trades, setTrades] = useState<Trade[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // Animate dummy orderbook for all pairs
    let interval: NodeJS.Timeout;
    const genDummy = () => {
      const basePrice = 0.02450 + Math.random() * 0.00010;
      const bids = Array.from({ length: VISIBLE_ROWS }, (_, i) => ({
        price: +(basePrice - 0.00001 * i).toFixed(5),
        size: 1000 + Math.floor(Math.random() * 10000),
        total: 0
      }))
      let runningBid = 0;
      bids.forEach(b => { runningBid += b.size; b.total = runningBid })
      const asks = Array.from({ length: VISIBLE_ROWS }, (_, i) => ({
        price: +(basePrice + 0.00001 * (i + 1)).toFixed(5),
        size: 1000 + Math.floor(Math.random() * 10000),
        total: 0
      }))
      let runningAsk = 0;
      asks.forEach(a => { runningAsk += a.size; a.total = runningAsk })
      setBids(bids)
      setAsks(asks)
    }
    genDummy()
    interval = setInterval(genDummy, 500)
    return () => clearInterval(interval)
  }, [symbol])

  useEffect(() => {
    const s = symbol.toLowerCase()
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${s}@depth@100ms`)
    wsRef.current = ws
    let lastBids: [string, string][] = []
    let lastAsks: [string, string][] = []
    ws.onmessage = (ev) => {
      const d = JSON.parse(ev.data)
      if (d.b) lastBids = d.b as [string, string][]
      if (d.a) lastAsks = d.a as [string, string][]
      setBids(parseLevels(lastBids, VISIBLE_ROWS, true))
      setAsks(parseLevels(lastAsks, VISIBLE_ROWS, false))
    }
    return () => {
      ws.close()
    }
  }, [symbol])

  useEffect(() => {
    const s = symbol.toLowerCase()
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${s}@trade`)
    ws.onmessage = (ev) => {
      const d = JSON.parse(ev.data)
      const price = Number.parseFloat(d.p)
      const qty = Number.parseFloat(d.q)
      const side: "buy" | "sell" = d.m ? "sell" : "buy" // maker is sell
      setTrades((prev) => {
        const next = [{ price, qty, side, time: d.T as number }, ...prev]
        return next.slice(0, VISIBLE_ROWS)
      })
    }
    return () => ws.close()
  }, [symbol])

  const asksFixed = useMemo(() => {
    if (symbol === "PENGUUSDT") {
      // Always fill to VISIBLE_ROWS with dummy data if needed
      const base = asks.slice(0, VISIBLE_ROWS)
      const pad = Math.max(0, VISIBLE_ROWS - base.length)
      const lastPrice = base.length > 0 ? base[base.length - 1].price : 0.02467
      const filled = [...base]
      for (let i = 0; i < pad; i++) {
        filled.push({ price: lastPrice + 0.00001 * (i + 1), size: 1000 + i * 100, total: (filled[filled.length - 1]?.total || 0) + 1000 + i * 100 })
      }
      return filled
    }
    const base = asks.slice(0, VISIBLE_ROWS)
    const pad = Math.max(0, VISIBLE_ROWS - base.length)
    return [...base, ...Array.from({ length: pad }, () => ({ price: Number.NaN, size: Number.NaN, total: 0 }))]
  }, [asks, symbol])

  const bidsFixed = useMemo(() => {
    if (symbol === "PENGUUSDT") {
      // Always fill to VISIBLE_ROWS with dummy data if needed
      const base = bids.slice(0, VISIBLE_ROWS)
      const pad = Math.max(0, VISIBLE_ROWS - base.length)
      const lastPrice = base.length > 0 ? base[base.length - 1].price : 0.02434
      const filled = [...base]
      for (let i = 0; i < pad; i++) {
        filled.push({ price: lastPrice - 0.00001 * (i + 1), size: 1000 + i * 100, total: (filled[filled.length - 1]?.total || 0) + 1000 + i * 100 })
      }
      return filled
    }
    const base = bids.slice(0, VISIBLE_ROWS)
    const pad = Math.max(0, VISIBLE_ROWS - base.length)
    return [...base, ...Array.from({ length: pad }, () => ({ price: Number.NaN, size: Number.NaN, total: 0 }))]
  }, [bids, symbol])

  // Depth data: aggregate by price range
  const depthData = useMemo(() => {
    // Group bids and asks by price bucket (e.g. round to nearest 0.5)
    const bucketSize = 0.5
    const group = (rows: Row[]) => {
      const map = new Map<number, { price: number; size: number }>()
      rows.forEach(r => {
        if (!Number.isNaN(r.price)) {
          const bucket = Math.round(r.price / bucketSize) * bucketSize
          map.set(bucket, { price: bucket, size: (map.get(bucket)?.size || 0) + r.size })
        }
      })
      return Array.from(map.values()).sort((a, b) => b.price - a.price)
    }
    return {
      bids: group(bids),
      asks: group(asks)
    }
  }, [bids, asks])

  const priceColor = (side: "bid" | "ask") => (side === "bid" ? "var(--chart-2)" : "var(--destructive)")

  const maxAskTotal = useMemo(() => Math.max(1, ...asks.map((r) => r.total)), [asks])
  const maxBidTotal = useMemo(() => Math.max(1, ...bids.map((r) => r.total)), [bids])

  return (
    <div className="grid h-full min-h-[320px] min-w-0 grid-rows-[auto_1fr_auto] overflow-hidden font-sans leading-tight text-[8px] sm:text-[9px] md:text-[10px] bg-white dark:bg-[#0F0F0F] border border-zinc-200 dark:border-zinc-800 rounded-sm p-2">
      {/* Symbol Selector */}
      <div className="flex items-center justify-between mb-2">
        <select
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          className="px-2 py-1 rounded bg-[#232323] text-white text-xs font-semibold"
        >
          {["btcusdt", ...SYMBOLS].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div className="flex gap-1 bg-[#232323] rounded overflow-hidden p-1">
          {['Order book', 'Trades', 'Depth'].map((t) => {
            const tabKey = t.toLowerCase().replace(' ', '') as 'orderbook' | 'trades' | 'depth'
            const isActive = activeTab === tabKey
            return (
              <button
                key={t}
                className={`px-3 py-1 text-[10px] font-semibold rounded transition-all duration-150 ${isActive ? 'bg-[#181818] text-white' : 'bg-transparent text-gray-400'}`}
                style={{ zIndex: 10, pointerEvents: 'auto' }}
                onClick={() => {
                  setActiveTab(tabKey);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('orderbookTab', tabKey);
                  }
                }}
              >
                {t}
              </button>
            )
          })}
        </div>
      </div>

      {activeTab === "orderbook" ? (
        <div className="grid grid-cols-2 gap-0 border-b">
          <div className="grid grid-rows-[auto_1fr]">
            <div className="grid grid-cols-3 px-3 py-2 opacity-60 min-w-0 whitespace-nowrap">
              <div className="truncate">Price (USDT)</div>
              <div className="text-right truncate">Size (USDT)</div>
              <div className="text-right truncate">Total</div>
            </div>
            <div
              className="grid h-full px-3 min-w-0"
              style={{ gridTemplateRows: `repeat(${VISIBLE_ROWS}, minmax(0, 1fr))` }}
            >
              {asksFixed.map((r, idx) => {
                const isEmpty = Number.isNaN(r.price)
                const widthPct = isEmpty ? 0 : Math.min(95, (r.total / maxAskTotal) * 95)
                return (
                  <div key={`a-${idx}`} className="relative grid grid-cols-3 items-center min-w-0">
                    <div
                      className="tabular-nums font-sans truncate min-w-0 whitespace-nowrap"
                      style={{ color: priceColor("ask"), opacity: isEmpty ? 0.4 : 1 }}
                    >
                      {isEmpty ? "-" : r.price.toLocaleString()}
                    </div>
                    <div className="text-right opacity-80 tabular-nums truncate min-w-0 whitespace-nowrap"
                      style={{ background: !isEmpty ? `rgba(233, 79, 122, ${Math.min(0.7, r.size / 20000)})` : undefined, transition: 'background 0.3s' }}>
                      {isEmpty ? "-" : r.size.toLocaleString()}
                    </div>
                    <div className="text-right opacity-60 tabular-nums truncate min-w-0 whitespace-nowrap">
                      {isEmpty ? "-" : r.total.toLocaleString()}
                    </div>
                    <div
                      className="pointer-events-none absolute inset-y-0 right-0 z-[-1] bg-[color:var(--destructive)]/10"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-rows-[auto_1fr] border-l">
            <div className="grid grid-cols-3 px-3 py-2 opacity-60 min-w-0 whitespace-nowrap">
              <div className="truncate">Price (USDT)</div>
              <div className="text-right truncate">Size (USDT)</div>
              <div className="text-right truncate">Total</div>
            </div>
            <div
              className="grid h-full px-3 min-w-0"
              style={{ gridTemplateRows: `repeat(${VISIBLE_ROWS}, minmax(0, 1fr))` }}
            >
              {bidsFixed.map((r, idx) => {
                const isEmpty = Number.isNaN(r.price)
                const widthPct = isEmpty ? 0 : Math.min(95, (r.total / maxBidTotal) * 95)
                return (
                  <div key={`b-${idx}`} className="relative grid grid-cols-3 items-center min-w-0">
                    <div
                      className="tabular-nums font-sans truncate min-w-0 whitespace-nowrap"
                      style={{ color: priceColor("bid"), opacity: isEmpty ? 0.4 : 1 }}
                    >
                      {isEmpty ? "-" : r.price.toLocaleString()}
                    </div>
                    <div className="text-right opacity-80 tabular-nums truncate min-w-0 whitespace-nowrap"
                      style={{ background: !isEmpty ? `rgba(0, 201, 167, ${Math.min(0.7, r.size / 20000)})` : undefined, transition: 'background 0.3s' }}>
                      {isEmpty ? "-" : r.size.toLocaleString()}
                    </div>
                    <div className="text-right opacity-60 tabular-nums truncate min-w-0 whitespace-nowrap">
                      {isEmpty ? "-" : r.total.toLocaleString()}
                    </div>
                    <div
                      className="pointer-events-none absolute inset-y-0 right-0 z-[-1] bg-[color:var(--chart-2)]/10"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : activeTab === "trades" ? (
        // Trades tab
        <div className="grid grid-rows-[auto_1fr] border-b">
          <div className="grid grid-cols-3 px-3 py-2 opacity-60 min-w-0 whitespace-nowrap">
            <div className="truncate">Time</div>
            <div className="text-right truncate">Price</div>
            <div className="text-right truncate">Qty</div>
          </div>
          <div
            className="grid h-full px-3 min-w-0"
            style={{ gridTemplateRows: `repeat(${VISIBLE_ROWS}, minmax(0, 1fr))` }}
          >
            {trades.length === 0 ? (
              <div className="col-span-3 text-center text-gray-400 py-4">No trades data available.</div>
            ) : (
              Array.from({ length: VISIBLE_ROWS }).map((_, i) => {
                const t = trades[i]
                const isEmpty = !t
                const color = isEmpty
                  ? "var(--muted-foreground)"
                  : t.side === "buy"
                    ? "var(--chart-2)"
                    : "var(--destructive)"
                return (
                  <div key={i} className="grid grid-cols-3 items-center min-w-0">
                    <div className="opacity-60 truncate min-w-0 whitespace-nowrap">
                      {isEmpty ? "-" : new Date(t.time).toLocaleTimeString([], { hour12: false })}
                    </div>
                    <div
                      className="text-right tabular-nums font-sans truncate min-w-0 whitespace-nowrap"
                      style={{ color }}
                    >
                      {isEmpty ? "-" : t.price.toLocaleString()}
                    </div>
                    <div className="text-right opacity-80 tabular-nums truncate min-w-0 whitespace-nowrap"
                      style={{ background: !isEmpty ? (t.side === "buy" ? `rgba(0, 201, 167, 0.5)` : `rgba(233, 79, 122, 0.5)`) : undefined, transition: 'background 0.3s' }}
                    >
                      {isEmpty ? "-" : t.qty.toLocaleString()}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      ) : (
        // Depth tab
        <div className="flex flex-col h-full border-b">
          <div className="flex-1 flex items-center justify-center py-2" style={{ minHeight: '50%', maxHeight: '50%' }}>
            <DepthChart asks={depthData.asks} bids={depthData.bids} />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-0 border-t" style={{ minHeight: '50%', maxHeight: '50%' }}>
            <div className="grid grid-rows-[auto_1fr]">
              <div className="grid grid-cols-3 px-3 py-2 opacity-60 min-w-0 whitespace-nowrap">
                <div className="truncate">Price (USDT)</div>
                <div className="text-right truncate">Size (USDT)</div>
                <div className="text-right truncate">Total</div>
              </div>
              <div className="grid h-full px-3 min-w-0">
                {asksFixed.slice(0, 13).map((r, idx) => {
                  const isEmpty = Number.isNaN(r.price)
                  return (
                    <div key={`a-${idx}`} className="grid grid-cols-3 items-center min-w-0">
                      <div className="tabular-nums font-sans truncate min-w-0 whitespace-nowrap" style={{ color: priceColor("ask"), opacity: isEmpty ? 0.4 : 1 }}>
                        {isEmpty ? "-" : r.price.toLocaleString()}
                      </div>
                      <div className="text-right opacity-80 tabular-nums truncate min-w-0 whitespace-nowrap"
                        style={{ background: !isEmpty ? `rgba(233, 79, 122, ${Math.min(0.7, r.size / 20000)})` : undefined, transition: 'background 0.3s' }}>
                        {isEmpty ? "-" : r.size.toLocaleString()}
                      </div>
                      <div className="text-right opacity-60 tabular-nums truncate min-w-0 whitespace-nowrap">
                        {isEmpty ? "-" : r.total.toLocaleString()}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="grid grid-rows-[auto_1fr] border-l">
              <div className="grid grid-cols-3 px-3 py-2 opacity-60 min-w-0 whitespace-nowrap">
                <div className="truncate">Price (USDT)</div>
                <div className="text-right truncate">Size (USDT)</div>
                <div className="text-right truncate">Total</div>
              </div>
              <div className="grid h-full px-3 min-w-0">
                {bidsFixed.slice(0, 13).map((r, idx) => {
                  const isEmpty = Number.isNaN(r.price)
                  return (
                    <div key={`b-${idx}`} className="grid grid-cols-3 items-center min-w-0">
                      <div className="tabular-nums font-sans truncate min-w-0 whitespace-nowrap" style={{ color: priceColor("bid"), opacity: isEmpty ? 0.4 : 1 }}>
                        {isEmpty ? "-" : r.price.toLocaleString()}
                      </div>
                      <div className="text-right opacity-80 tabular-nums truncate min-w-0 whitespace-nowrap"
                        style={{ background: !isEmpty ? `rgba(0, 201, 167, ${Math.min(0.7, r.size / 20000)})` : undefined, transition: 'background 0.3s' }}>
                        {isEmpty ? "-" : r.size.toLocaleString()}
                      </div>
                      <div className="text-right opacity-60 tabular-nums truncate min-w-0 whitespace-nowrap">
                        {isEmpty ? "-" : r.total.toLocaleString()}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between px-3 py-2 text-xs">
        <div>Last Price</div>
        <div className="tabular-nums font-sans" style={{ color: "var(--chart-2)" }}>
          {bids[0]?.price?.toLocaleString() || "--"}
        </div>
      </div>
    </div>
  )
}
