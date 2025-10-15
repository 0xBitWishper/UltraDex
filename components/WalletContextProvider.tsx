"use client"
import { WalletProvider } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { useMemo } from 'react'
import { SolanaMobileWalletAdapter, createDefaultAddressSelector, createDefaultAuthorizationResultCache, createDefaultWalletNotFoundHandler } from '@solana-mobile/wallet-adapter-mobile';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export default function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolanaMobileWalletAdapter({
      addressSelector: createDefaultAddressSelector(),
      appIdentity: {
        name: 'UltraDex',
        uri: 'https://app.ultradex.fun',
        icon: '/images/logo_for_darkmode.png',
      },
      authorizationResultCache: createDefaultAuthorizationResultCache(),
      cluster: WalletAdapterNetwork.Mainnet,
      onWalletNotFound: createDefaultWalletNotFoundHandler(),
    })
  ], [])
  return (
    <WalletProvider wallets={wallets} autoConnect>
      {children}
    </WalletProvider>
  )
}
