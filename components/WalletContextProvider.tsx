"use client"
import { WalletProvider } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { useMemo } from 'react'

export default function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [])
  return (
    <WalletProvider wallets={wallets} autoConnect>
      {children}
    </WalletProvider>
  )
}
