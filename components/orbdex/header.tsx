"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMemo, useState } from "react"
import { useEffect } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"

const nav = [
  { href: "/perpetual", label: "Perpetual" },
  { href: "/spot", label: "Spot" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/referral", label: "Referral" },
  { href: "/rewards", label: "Rewards" },
]

export function Header({ active }: { active?: string }) {
  const { toast } = require('@/hooks/use-toast')
  const { useIsMobile } = require('@/hooks/use-mobile')
  const isMobile = useIsMobile();
  const [solAddress, setSolAddress] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false);
  // Ensure theme icon only renders on client
  useEffect(() => { setMounted(true); }, []);
  // Cek status wallet saat mount, agar setelah refresh tetap tampil
  useEffect(() => {
    if (window?.solana && window.solana.isPhantom && window.solana.isConnected && window.solana.publicKey) {
      setSolAddress(window.solana.publicKey.toString());
    }
  }, []);

  // Connect Phantom wallet (Solana)
  const connectPhantomWallet = async () => {
    if (window?.solana && window.solana.isPhantom) {
      try {
        // Always prompt for signature/confirmation
        const resp = await window.solana.connect({ onlyIfTrusted: false });
        setSolAddress(resp.publicKey.toString());
        toast({ title: 'Wallet Connected', description: `Solana: ${resp.publicKey.toString()}` });
      } catch (err) {
        toast({ title: 'Wallet Error', description: 'Failed to connect Phantom.' });
      }
    } else {
      toast({ title: 'Wallet Error', description: 'Phantom wallet not found.' });
    }
  }

  const handleConnect = async () => {
    if (solAddress && window?.solana && window.solana.isPhantom) {
      await window.solana.disconnect();
      setSolAddress(null);
      toast({ title: 'Wallet Disconnected', description: 'Phantom wallet disconnected.' });
    } else if (window?.solana && window.solana.isPhantom) {
      try {
        // Di mobile, jangan pakai onlyIfTrusted agar selalu minta persetujuan
        const resp = isMobile
          ? await window.solana.connect()
          : await window.solana.connect({ onlyIfTrusted: false });
        setSolAddress(resp.publicKey.toString());
        toast({ title: 'Wallet Connected', description: `Solana: ${resp.publicKey.toString()}` });
      } catch (err) {
        toast({ title: 'Wallet Error', description: 'Failed to connect Phantom.' });
      }
    } else {
      if (isMobile) {
        // Redirect ke Phantom app dengan app_url agar muncul persetujuan connect
        window.location.href = 'https://phantom.app/ultra-connect?app_url=https://app.ultradex.fun';
      } else {
        toast({ title: 'Wallet Error', description: 'Phantom wallet not found.' });
      }
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80" style={{ background: 'var(--background, #181818)' }} suppressHydrationWarning>
      <div className="flex w-full items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/perpetual" className="block">
            <span className="sr-only">UltraDex</span>
            <img
              src="/images/logo_for_darkmode.png"
              alt="UltraDex"
              className="h-8 w-auto"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm hover:opacity-90 transition-opacity",
                  active === item.href ? "text-primary" : "text-foreground/80",
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="text-sm text-foreground/60">More</div>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://t.me/Ultradexfun_bot" target="_blank" rel="noopener noreferrer" className="mr-2 flex items-center justify-center" style={{ width: 28, height: 28 }}>
            <svg width="16" height="16" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 1L1 11L6 13L8 19L12 15L17 17L21 1Z" stroke="#0088cc" strokeWidth="1.2" fill="none"/>
              <path d="M8 19L9.5 14.5L17 17L12 15" stroke="#0088cc" strokeWidth="1.2" fill="none"/>
            </svg>
          </a>
          <a href="https://x.com/ultradexfun" target="_blank" rel="noopener noreferrer" className="mr-2 flex items-center justify-center" style={{ width: 28, height: 28 }}>
            <svg width="16" height="16" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 19L9.5 11.5L3 3H7.5L11 7.5L14.5 3H19L12.5 11.5L19 19H14.5L11 14.5L7.5 19H3Z" stroke="#fff" strokeWidth="1.2" fill="none"/>
            </svg>
          </a>
          <Button
            variant="default"
            size="sm"
            onClick={handleConnect}
          >
            {solAddress
              ? `Solana: ${solAddress.slice(0, 4)}...${solAddress.slice(-4)}`
              : 'Connect Wallet'}
          </Button>
        </div>
      </div>
    </header>
  )
}
