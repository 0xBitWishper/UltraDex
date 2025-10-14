import { Header } from "@/components/orbdex/header"
import { TradingArea } from "@/components/orbdex/trading-area"
import { BottomTabs } from "@/components/orbdex/bottom-tabs"
import { BottomTicker } from "@/components/orbdex/ticker"


export default function Page() {
  return (
    <main className="min-h-screen">
      <Header active="/perpetual" />
      <div className="py-4">
        <TradingArea />
        <BottomTabs />
      </div>
      <BottomTicker />
     
    </main>
  )
}
