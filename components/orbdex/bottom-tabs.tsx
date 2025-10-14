"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"

const TABS = [
  "Positions",
  "Open orders",
  "Order history",
  "Trade history",
  "Transaction history",
  "Deposits & withdrawals",
  "Assets",
] as const
type Tab = (typeof TABS)[number]

export function BottomTabs() {
  const [tab, setTab] = useState<Tab>("Positions")
  return (
    <div className="border-t">
      <div className="w-full">
        <div className="flex flex-wrap gap-4 px-4 py-2 text-sm">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn("opacity-70 hover:opacity-100", tab === t && "text-primary")}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="px-4 pb-4">
          <div className="rounded border p-4 text-sm opacity-70">No data in {tab}.</div>
        </div>
      </div>
    </div>
  )
}
