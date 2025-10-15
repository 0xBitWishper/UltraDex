"use client"

import { useEffect, useRef, useState } from "react"
import { OrderBook } from "./order-book"
import { BottomTabs } from "./bottom-tabs"
import OrderForm from "./order-form";
import { TvCandles } from "./tv-candles"

type Interval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d"

export function TradingArea() {
  const [interval, setInterval] = useState<Interval>("1m")
  const [symbol, setSymbol] = useState("PENGUUSDC")
  const [open, setOpen] = useState(false)
  const marketList = [
    { symbol: "BONKUSDT",  label: "BONK",  leverage: "100x", price: "$0.0000298", change: "+3.45%",  funding: "0.0100%",  volume: "$482,763,112.38",  oi: "$78,114,992.40",  icon: "🐶" },
  { symbol: "WIFUSDT",   label: "WIF",   leverage: "1500x", price: "$3.8400",    change: "+2.11%",  funding: "-0.0200%", volume: "$621,334,901.03",  oi: "$110,562,774.55", icon: "🧢" },
  { symbol: "PENGUUSDC", label: "PENGU", leverage: "1500x", price: "$0.02450",   change: "-2.15%",  funding: "0.0150%",  volume: "$8,442,210.77",   oi: "$2,118,009.12",  icon: "🐧" },
  { symbol: "TRUMPUSDT", label: "TRUMP", leverage: "1500x",  price: "$0.8120",    change: "-1.23%",  funding: "0.0080%",  volume: "$154,770,334.61",  oi: "$44,902,118.33",  icon: "🇺🇸" },
  { symbol: "SOLUSDT",   label: "SOL",   leverage: "1500x",  price: "$21.840",    change: "+1.23%",  funding: "0.0100%",  volume: "$1,234,567,890.12", oi: "$123,456,789.01",  icon: "🪐" },
  { symbol: "POPCATUSDT",label: "POPCAT", leverage: "100x", price: "$0.01490",   change: "+4.02%",  funding: "0.0090%",  volume: "$73,551,209.33",   oi: "$21,445,880.55",  icon: "🐱" },
  { symbol: "MEWUSDT",   label: "MEW",   leverage: "100x", price: "$0.00187",   change: "+7.90%",  funding: "0.0110%",  volume: "$41,003,551.66",   oi: "$12,991,440.20",  icon: "🐈" },
  { symbol: "AI16ZUSDT", label: "AI16Z", leverage: "75x",  price: "$0.00234",   change: "-0.45%",  funding: "-0.0050%", volume: "$28,449,772.05",   oi: "$9,118,330.11",   icon: "🤖" },
  { symbol: "PNUTUSDT",  label: "PNUT",  leverage: "50x",  price: "$0.00978",   change: "+2.15%",  funding: "0.0060%",  volume: "$17,660,998.24",   oi: "$5,771,223.80",   icon: "🥜" },
  { symbol: "BOMEUSDT",  label: "BOME",  leverage: "125x", price: "$0.01870",   change: "+6.71%",  funding: "0.0130%",  volume: "$265,330,144.29",  oi: "$66,220,910.42",  icon: "📕" },
  { symbol: "GIGAUSDT",  label: "GIGA",  leverage: "50x",  price: "$0.000385",  change: "-3.22%",  funding: "0.0070%",  volume: "$8,442,100.09",    oi: "$2,113,774.90",   icon: "💪" },
  { symbol: "SPX6900USDT",label: "SPX6900", leverage: "50x", price: "$0.00714", change: "+0.88%",  funding: "0.0040%",  volume: "$5,771,203.77",    oi: "$1,904,445.66",   icon: "📈" },
  { symbol: "WEPEUSDT",  label: "WEPE",  leverage: "75x",  price: "$0.00451",   change: "+3.33%",  funding: "0.0060%",  volume: "$13,992,114.22",   oi: "$3,774,090.20",   icon: "🐸" },
  { symbol: "SNORTUSDT", label: "SNORT", leverage: "50x",  price: "$0.00122",   change: "-2.14%",  funding: "-0.0040%", volume: "$4,551,998.10",    oi: "$1,220,887.45",   icon: "🐗" },
  { symbol: "MOODENGUSDT",label: "MOODENG", leverage: "50x", price: "$0.000821", change: "+4.55%", funding: "0.0050%",  volume: "$6,331,774.03",    oi: "$1,774,331.22",   icon: "🐮" },
  { symbol: "AI4USDT",   label: "AI4",   leverage: "75x",  price: "$0.00216",   change: "+1.27%",  funding: "0.0030%",  volume: "$9,114,220.40",    oi: "$2,008,441.55",   icon: "🧠" },
  { symbol: "SNORTERUSDT",label: "SNORTER", leverage: "50x", price: "$0.00111", change: "+2.88%",  funding: "0.0060%",  volume: "$3,220,998.44",    oi: "$1,004,551.09",   icon: "🐗" },
  { symbol: "PONKEUSDT", label: "PONKE", leverage: "100x", price: "$0.00762",   change: "+6.31%",  funding: "0.0120%",  volume: "$22,909,114.77",   oi: "$6,225,441.88",   icon: "🦍" },
  { symbol: "USELESSUSDT",label: "USELESS", leverage: "25x", price: "$0.0000038", change: "-0.82%", funding: "0.0010%",  volume: "$1,114,220.03",    oi: "$322,008.55",     icon: "🗑️" },
  { symbol: "SUBBDUSDT", label: "SUBBD", leverage: "25x",  price: "$0.00444",   change: "+1.79%",  funding: "0.0020%",  volume: "$2,551,773.42",    oi: "$811,224.33",     icon: "🧩" },
  { symbol: "BABYDOGEUSDT",label: "BABYDOGE", leverage: "25x", price: "$0.00000090", change: "+0.63%", funding: "0.0010%", volume: "$1,992,004.11", oi: "$410,773.22", icon: "🐶" },
  { symbol: "MOOUSDT",   label: "MOO",   leverage: "50x",  price: "$0.00275",   change: "+3.92%",  funding: "0.0060%",  volume: "$4,771,220.90",    oi: "$1,118,331.47",   icon: "🐄" }
  ]

  // force re-render every 500ms to keep OrderBook moving
  const [tick, setTick] = useState(0)
  const intervalRef = useRef<number | null>(null)
  useEffect(() => {
    intervalRef.current = window.setInterval(() => setTick(tick => tick + 1), 500)
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <>
      <div className="w-full px-4 md:px-10 mb-[3px]">
    <div className="flex flex-wrap items-center gap-2 md:gap-6 bg-background border rounded px-2 md:px-4 py-2 text-[11px] md:text-sm overflow-x-auto">
          {/* Tombol market + modal popup */}
          <>
            <button
              className="px-3 py-1 rounded font-bold text-[11px] md:text-xs transition border border-[#232323] bg-[#181818] text-white"
              type="button"
              onClick={() => setOpen(true)}
            >
              {symbol}
            </button>
            {open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
                {/* Modal */}
                <div className="relative bg-[#181818] border border-[#232323] rounded-xl w-full max-w-[95vw] sm:max-w-[700px] p-4 shadow-2xl mx-2 flex flex-col">
                  {/* Close button */}
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-white text-lg font-bold rounded-full bg-[#232323] px-2 py-1"
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                  {/* Header filter */}
                  <div className="mb-4 flex items-center">
                    <input className="bg-[#232323] text-white rounded px-3 py-2 text-xs w-full border border-[#232323]" placeholder="Search Markets" />
                  </div>
                  {/* Tabel market */}
                  <div className="overflow-x-auto rounded-lg border border-[#232323] bg-[#181818] max-h-[60vh]">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-[#232323] text-gray-400 bg-[#181818]">
                          <th className="py-2 px-2 font-semibold">Market</th>
                          <th className="py-2 px-2 font-semibold">Last Price</th>
                          <th className="py-2 px-2 font-semibold">24h</th>
                          <th className="py-2 px-2 font-semibold">8hr Funding</th>
                          <th className="py-2 px-2 font-semibold">Volume</th>
                          <th className="py-2 px-2 font-semibold">Open Interest</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marketList.map((m) => (
                          <tr
                            key={m.symbol}
                            className={`border-b border-[#232323] cursor-pointer hover:bg-[#232323] ${symbol === m.symbol ? 'bg-[#232323]' : ''}`}
                            onClick={() => { setSymbol(m.symbol); setOpen(false); }}
                          >
                            <td className="py-2 px-2 font-bold text-white">
                              {m.label} <span className="ml-1 text-xs text-gray-400">{m.leverage}</span>
                            </td>
                            <td className="py-2 px-2 text-white">{m.price}</td>
                            <td className={`py-2 px-2 font-bold ${m.change.startsWith("-") ? "text-red-500" : "text-green-500"}`}>{m.change}</td>
                            <td className="py-2 px-2 text-white">{m.funding}</td>
                            <td className="py-2 px-2 text-white">{m.volume}</td>
                            <td className="py-2 px-2 text-white">{m.oi}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
       
          <span className="text-muted-foreground whitespace-nowrap text-[11px] md:text-sm">Mark Price <span className="text-white font-bold">$0.02450</span></span>
          <span className="text-muted-foreground whitespace-nowrap text-[11px] md:text-sm">24h Change <span className="text-red-500 font-bold">-2.15% ▼</span></span>
          <span className="text-muted-foreground whitespace-nowrap text-[11px] md:text-sm">24h Volume <span className="text-white font-bold">$8,442,210.77</span></span>
          <span className="text-muted-foreground whitespace-nowrap text-[11px] md:text-sm">Open Interest <span className="text-white font-bold">$2,118,009.12</span></span>
          <span className="text-muted-foreground whitespace-nowrap text-[11px] md:text-sm">8hr Funding <span className="text-white font-bold">0.0150%</span></span>
          <span className="text-muted-foreground whitespace-nowrap text-[11px] md:text-sm">Next Funding <span className="text-white font-bold">23:57</span></span>
        </div>
      </div>
      <div className="grid w-full max-w-full overflow-x-hidden box-border gap-[1px] md:gap-[1px] px-4 md:px-10 pb-[var(--ticker-h)] pt-2 grid-cols-1 md:[grid-template-columns:60%_20%_20%] items-stretch">
        <section className="rounded border min-w-0 h-full box-border" style={{ position: 'relative', minHeight: 420, background: '#0F0F0F', borderRadius: 8, overflow: 'hidden' }}>
          {/* TradingView chart, symbol dinamis sesuai market yang dipilih */}
          <iframe
            title={`TradingView ${symbol} 15m`}
            src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_${symbol}_15m&symbol=BINANCE:${symbol}&interval=15&theme=dark&style=1&toolbarbg=0F0F0F`}
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            style={{ display: 'block', border: 'none', borderRadius: 8, width: '100%', height: '100%', background: '#0F0F0F' }}
          />
        </section>
        <aside className="rounded border min-h-[320px] overflow-hidden min-w-0 h-full box-border text-[10px] sm:text-[10px] md:text-[11px] lg:text-[12px] leading-tight [font-variant-numeric:tabular-nums]">
          <OrderBook symbol={symbol} key={tick} />
        </aside>
        <aside className="rounded border min-w-0 overflow-hidden h-full box-border">
          <OrderForm 
            symbol={symbol}
            market={marketList.find(m => m.symbol === symbol) || { symbol, label: symbol, price: '--' }}
          />
        </aside>
      </div>
    </>
  )
}
