import { Header } from "@/components/orbdex/header"
import { BottomTicker } from "@/components/orbdex/ticker"

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header active="/spot" />
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-10 gap-4">
        <div className="w-full max-w-xl text-center">
          <h1 className="text-balance text-2xl md:text-3xl font-semibold mb-2">Spot Trading</h1>
          <p className="opacity-70 mb-4">Coming soon. Use Perpetual page for the full trading experience.</p>
          <div className="rounded border p-6 bg-background text-muted-foreground font-bold text-lg md:text-2xl">Spot: Coming Soon / On Building</div>
        </div>
      </section>
      <BottomTicker />
    </main>
  )
}
