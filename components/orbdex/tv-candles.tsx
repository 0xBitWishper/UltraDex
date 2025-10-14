"use client"
import { useEffect, useMemo, useRef } from "react"
import useSWR from "swr"
import type { ISeriesApi, UTCTimestamp, IChartApi } from "lightweight-charts"

type Interval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d"
const INTERVAL_LABELS: { label: string; value: Interval }[] = [
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "1H", value: "1h" },
  { label: "4H", value: "4h" },
  { label: "1D", value: "1d" },
]

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function useKlines(symbol: string, interval: Interval) {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=500`
  return useSWR<any[]>(url, fetcher, { revalidateOnFocus: false })
}

export function TvCandles({
  symbol = "BTCUSDT",
  interval = "1m",
  onChangeInterval,
}: {
  symbol?: string
  interval?: Interval
  onChangeInterval?: (i: Interval) => void
}) {
  const { data } = useKlines(symbol, interval)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const chartColors = useMemo(
    () => ({
      bg: "#111315",
      text: "#e5e7eb",
      grid: "rgba(255,255,255,0.06)",
      up: "#2dd4bf", // teal-ish like reference
      down: "#ef4444",
      volNeutral: "rgba(120,120,120,0.6)",
    }),
    [],
  )

  useEffect(() => {
    if (!containerRef.current) return

    let ro: ResizeObserver | null = null

    import("lightweight-charts")
      .then((mod) => {
        const L: any = (mod as any)?.createChart ? mod : ((mod as any)?.default ?? mod)
        const { createChart, ColorType } = L

        if (!containerRef.current) return

        const chart = createChart(containerRef.current, {
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
          rightPriceScale: { borderVisible: false },
          timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
          crosshair: { mode: 1 },
          layout: {
            textColor: chartColors.text,
            background: { type: ColorType.Solid, color: chartColors.bg },
          },
          grid: {
            horzLines: { color: chartColors.grid },
            vertLines: { color: chartColors.grid },
          },
        })

        if (typeof (chart as any)?.addCandlestickSeries !== "function") {
          console.log("[v0] Chart API missing addCandlestickSeries. Keys:", Object.keys(chart as any))
          return
        }

        const candle = chart.addCandlestickSeries({
          upColor: chartColors.up,
          downColor: chartColors.down,
          borderUpColor: chartColors.up,
          borderDownColor: chartColors.down,
          wickUpColor: chartColors.up,
          wickDownColor: chartColors.down,
        })

        const volume = chart.addHistogramSeries({
          priceFormat: { type: "volume" },
          priceScaleId: "",
          color: chartColors.volNeutral,
          lineWidth: 1,
        })
        chart.priceScale("").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })

        chartRef.current = chart
        seriesRef.current = candle
        volumeRef.current = volume

        const onResize = () => {
          if (!containerRef.current || !chartRef.current) return
          chartRef.current.applyOptions({
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
          })
        }
        ro = new ResizeObserver(onResize)
        ro.observe(containerRef.current)
      })
      .catch((err) => {
        console.log("[v0] Failed to import lightweight-charts:", err?.message || err)
      })

    return () => {
      ro?.disconnect()
      wsRef.current?.close()
      chartRef.current?.remove?.()
      chartRef.current = null
      seriesRef.current = null
      volumeRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartColors])

  useEffect(() => {
    if (!data || !seriesRef.current || !volumeRef.current) return
    const candles = data.map((k) => ({
      time: (k[0] / 1000) as UTCTimestamp,
      open: Number.parseFloat(k[1]),
      high: Number.parseFloat(k[2]),
      low: Number.parseFloat(k[3]),
      close: Number.parseFloat(k[4]),
    }))
    const volumes = data.map((k) => ({
      time: (k[0] / 1000) as UTCTimestamp,
      value: Number.parseFloat(k[5]),
      color: Number.parseFloat(k[4]) >= Number.parseFloat(k[1]) ? chartColors.up : chartColors.down,
    }))
    seriesRef.current.setData(candles)
    volumeRef.current.setData(volumes)
  }, [data, chartColors])

  useEffect(() => {
    // subscribe realtime
    wsRef.current?.close()
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`)
    wsRef.current = ws
    ws.onmessage = (ev) => {
      if (!seriesRef.current || !volumeRef.current) return
      const msg = JSON.parse(ev.data)
      if (!msg.k) return
      const k = msg.k
      const bar = {
        time: Math.floor(k.t / 1000) as UTCTimestamp,
        open: Number.parseFloat(k.o),
        high: Number.parseFloat(k.h),
        low: Number.parseFloat(k.l),
        close: Number.parseFloat(k.c),
      }
      seriesRef.current.update(bar)
      volumeRef.current.update({
        time: Math.floor(k.t / 1000) as UTCTimestamp,
        value: Number.parseFloat(k.v),
        color: Number.parseFloat(k.c) >= Number.parseFloat(k.o) ? chartColors.up : chartColors.down,
      })
    }
    return () => {
      ws.close()
    }
  }, [symbol, interval, chartColors])

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-2 border-b px-3 py-2 text-sm">
        {INTERVAL_LABELS.map((t) => (
          <button
            key={t.value}
            onClick={() => onChangeInterval?.(t.value)}
            className="rounded px-2 py-1 opacity-80 hover:opacity-100"
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto text-sm opacity-70">Last Price • Index • Mark</div>
      </div>
      <div ref={containerRef} className="min-h-[380px] flex-1" />
    </div>
  )
}
