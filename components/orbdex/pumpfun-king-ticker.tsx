import useSWR from "swr"

// Endpoint untuk koin King of the Hill dari Pump.fun
const PUMPFUN_KING_URL = "https://frontend-api-v3.pump.fun/api/coins/king-of-the-hill"

export type PumpFunKingCoin = {
  mint: string
  name: string
  symbol: string
  imageUri?: string
  marketCap?: number
  price?: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function PumpfunKingTicker() {
  const { data } = useSWR<PumpFunKingCoin[]>(PUMPFUN_KING_URL, fetcher, {
    refreshInterval: 10000,
    revalidateOnFocus: false,
  })

  if (!data) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 w-full border-t bg-background/90">
      <div className="h-[var(--ticker-h)] overflow-hidden">
        <div className="inline-flex h-[var(--ticker-h)] items-center gap-6 px-2">
          {data.map((coin) => (
            <div key={coin.mint} className="flex items-center gap-2 px-4">
              {coin.imageUri && (
                <img src={coin.imageUri} alt={coin.symbol} className="w-4 h-4 rounded-full" />
              )}
              <span className="text-xs font-bold opacity-80">{coin.symbol || coin.name}</span>
              {coin.price && (
                <span className="text-xs">${coin.price.toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
              )}
              {coin.marketCap && (
                <span className="text-xs opacity-70">MCap: ${coin.marketCap.toLocaleString()}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
