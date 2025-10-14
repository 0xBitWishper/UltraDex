import type React from "react"
import { Space_Grotesk } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import SplashScreen from "../components/SplashScreen"
import { ThemeProvider } from "@/components/theme-provider"
import WalletContextProvider from "@/components/WalletContextProvider"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <head>
  <link rel="icon" href="/images/favicon/favicon.ico" type="image/x-icon" />
      </head>
      <body className={`font-sans ${spaceGrotesk.variable} ${GeistMono.variable} pb-10`}>
        <SplashScreen />
        <WalletContextProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <Suspense fallback={<div>Loading...</div>}>
              {children}
              <div className="fixed bottom-0 left-0 w-full z-50 border-t border-white/10 overflow-hidden" style={{background: '#181818'}}>
                <div className="whitespace-nowrap animate-marquee px-4 py-2 text-sm flex gap-8">
                  <span><span className="text-white font-bold">BONKUSDT 0.0000298</span> <span className="text-green-600">+3.45%</span></span>
                  <span><span className="text-white font-bold">WIFUSDT 3.84</span> <span className="text-green-600">+2.11%</span></span>
                  <span><span className="text-white font-bold">PENGUUSDT 0.0291</span> <span className="text-green-600">+5.42%</span></span>
                  <span><span className="text-white font-bold">TRUMPUSDT 0.812</span> <span className="text-red-600">-1.23%</span></span>
                  <span><span className="text-white font-bold">FARTCOINUSDT 0.0000042</span> <span className="text-green-600">+8.66%</span></span>
                  <span><span className="text-white font-bold">POPCATUSDT 0.0149</span> <span className="text-green-600">+4.02%</span></span>
                  <span><span className="text-white font-bold">MEWUSDT 0.00187</span> <span className="text-green-600">+7.90%</span></span>
                  <span><span className="text-white font-bold">AI16ZUSDT 0.00234</span> <span className="text-red-600">-0.45%</span></span>
                  <span><span className="text-white font-bold">PNUTUSDT 0.00978</span> <span className="text-green-600">+2.15%</span></span>
                  <span><span className="text-white font-bold">BOMEUSDT 0.0187</span> <span className="text-green-600">+6.71%</span></span>
                  <span><span className="text-white font-bold">GIGAUSDT 0.000385</span> <span className="text-red-600">-3.22%</span></span>
                  <span><span className="text-white font-bold">SPX6900USDT 0.00714</span> <span className="text-green-600">+0.88%</span></span>
                  <span><span className="text-white font-bold">WEPEUSDT 0.00451</span> <span className="text-green-600">+3.33%</span></span>
                  <span><span className="text-white font-bold">SNORTUSDT 0.00122</span> <span className="text-red-600">-2.14%</span></span>
                  <span><span className="text-white font-bold">MOODENGUSDT 0.000821</span> <span className="text-green-600">+4.55%</span></span>
                  <span><span className="text-white font-bold">AI4USDT 0.00216</span> <span className="text-green-600">+1.27%</span></span>
                  <span><span className="text-white font-bold">SNORTERUSDT 0.00111</span> <span className="text-green-600">+2.88%</span></span>
                  <span><span className="text-white font-bold">PONKEUSDT 0.00762</span> <span className="text-green-600">+6.31%</span></span>
                  <span><span className="text-white font-bold">USELESSUSDT 0.0000038</span> <span className="text-red-600">-0.82%</span></span>
                  <span><span className="text-white font-bold">SUBBDUSDT 0.00444</span> <span className="text-green-600">+1.79%</span></span>
                  <span><span className="text-white font-bold">BABYDOGEUSDT 0.0000009</span> <span className="text-green-600">+0.63%</span></span>
                  <span><span className="text-white font-bold">MOOUSDT 0.00275</span> <span className="text-green-600">+3.92%</span></span>
                </div>
              </div>
              <Analytics />
            </Suspense>
          </ThemeProvider>
        </WalletContextProvider>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
          }
          .animate-marquee {
            display: flex;
            animation: marquee 90s linear infinite;
            will-change: transform;
          }
        `}</style>
      </body>
    </html>
  )
}
