
type TP_SL_ModalProps = {
  onClose: () => void;
  market: {
    symbol: string;
    label: string;
    price: string;
    entryPrice?: string;
    markPrice?: string;
    liqPrice?: string;
    size?: string;
  };
};

function TP_SL_Modal({ onClose, market }: TP_SL_ModalProps) {
  const [localTab, setLocalTab] = useState<'entire' | 'partial'>('entire');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background: 'rgba(30,30,30,0.10)', backdropFilter: 'blur(8px)'}}>
      <div className="bg-[#181818] dark:bg-[#232323] rounded-xl p-0 w-[400px] border border-[#232323] flex flex-col" style={{background: 'rgba(30,30,30,0.7)', boxShadow: 'none', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.18)'}}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#232323]">
          <span className="font-semibold text-white text-sm">TP/SL for Position</span>
          <button className="text-gray-400 hover:text-white" onClick={onClose}>&#10005;</button>
        </div>
        <div className="flex px-5 pt-3 gap-2">
          <button className={`px-3 py-1 rounded font-medium text-xs ${localTab === 'entire' ? 'text-white bg-[#232323]' : 'text-gray-400'}`} onClick={() => setLocalTab('entire')}>Entire Position</button>
          <button className={`px-3 py-1 rounded font-medium text-xs ${localTab === 'partial' ? 'text-white bg-[#232323]' : 'text-gray-400'}`} onClick={() => setLocalTab('partial')}>Partial Position</button>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-5 py-3 text-xs text-white">
          <div>Market:</div><div className="text-right">{market.label}</div>
          <div>Size:</div><div className="text-right text-green-400">{market.size || '--'}</div>
          <div>Entry Price:</div><div className="text-right">{market.entryPrice || market.price}</div>
          <div>Mark Price:</div><div className="text-right">{market.markPrice || market.price}</div>
          <div>Liq. Price:</div><div className="text-right">{market.liqPrice || '--'}</div>
        </div>
        {localTab === 'partial' && (
          <div className="px-5 pb-2">
            <label className="text-xs text-white mb-1">Amount</label>
            <div className="flex gap-2 mb-2">
              <input type="number" className="w-full px-2 py-1 rounded bg-[#232323] border border-[#232323] text-xs text-white" placeholder="0.0000 ETH" />
            </div>
            <input type="range" min={0} max={100} className="w-full mb-2" />
          </div>
        )}
        <div className="px-5 pt-2 pb-1">
          <div className="font-semibold text-xs text-white mb-2">Take Profit</div>
          <div className="flex gap-2 mb-2">
            <input type="number" className="w-1/2 px-2 py-1 rounded bg-[#232323] border border-[#232323] text-xs text-white" placeholder="TP Price" />
            <select className="w-1/4 px-2 py-1 rounded bg-[#232323] border border-[#232323] text-xs text-white">
              <option>Gain</option>
              <option>Loss</option>
            </select>
            <input type="number" className="w-1/4 px-2 py-1 rounded bg-[#232323] border border-[#232323] text-xs text-white" placeholder="0.00 %" />
          </div>
          <input type="range" min={0} max={100} className="w-full mb-2" />
          <label className="flex items-center gap-2 text-xs text-white mb-1">
            <input type="checkbox" /> Limit
          </label>
          <div className="text-xs text-gray-400 mb-2">Estimated PnL <span className="float-right">N/A</span></div>
        </div>
        <div className="px-5 pt-2 pb-1">
          <div className="font-semibold text-xs text-white mb-2">Stop Loss</div>
          <div className="flex gap-2 mb-2">
            <input type="number" className="w-1/2 px-2 py-1 rounded bg-[#232323] border border-[#232323] text-xs text-white" placeholder="SL Price" />
            <select className="w-1/4 px-2 py-1 rounded bg-[#232323] border border-[#232323] text-xs text-white">
              <option>Loss</option>
              <option>Gain</option>
            </select>
            <input type="number" className="w-1/4 px-2 py-1 rounded bg-[#232323] border border-[#232323] text-xs text-white" placeholder="0.00 %" />
          </div>
          <input type="range" min={0} max={100} className="w-full mb-2" />
          <label className="flex items-center gap-2 text-xs text-white mb-1">
            <input type="checkbox" /> Limit
          </label>
          <div className="text-xs text-gray-400 mb-2">Estimated PnL <span className="float-right">N/A</span></div>
        </div>
        <div className="px-5 py-3">
          <button className="w-full py-2 rounded bg-[#232323] text-white font-semibold hover:bg-[#181818]">Submit</button>
        </div>
      </div>
    </div>
  );
}

type OrderFormProps = {
  symbol: string;
  market: {
    symbol: string;
    label: string;
    price: string;
    entryPrice?: string;
    markPrice?: string;
    liqPrice?: string;
    size?: string;
  };
};

const OrderForm: React.FC<OrderFormProps> = ({ symbol, market }) => {
  const [showConnectPopup, setShowConnectPopup] = useState(false);
  // ...existing code...
  const [showTPSL, setShowTPSL] = useState(false);
  const [tab, setTab] = useState<'market' | 'limit' | 'advance'>('market');
  const [showLeverage, setShowLeverage] = useState(false);
  const [leverage, setLeverage] = useState(5);
  // Set maxLeverage dinamis sesuai market
  const highLeverageSymbols = ["WIFUSDT", "PENGUUSDT", "TRUMPUSDT", "SOLUSDT"];
  const maxLeverage = highLeverageSymbols.includes(symbol) ? 1500 : 50;
  const [size, setSize] = useState(0);
  const [tp, setTP] = useState(false);
  const [reduceOnly, setReduceOnly] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [solAddress, setSolAddress] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState<string>("-");
  const isWalletConnected = !!solAddress;

  // Fetch Solana address from Phantom (window.solana)
  useEffect(() => {
    if (window?.solana && window.solana.isPhantom) {
      window.solana.on('connect', () => {
        setSolAddress(window.solana.publicKey?.toString() || null);
      });
      if (window.solana.isConnected && window.solana.publicKey) {
        setSolAddress(window.solana.publicKey.toString());
      }
    }
  }, []);

  // Fetch Solana balance
  useEffect(() => {
    async function fetchBalance() {
      if (solAddress) {
        try {
          const resp = await fetch("https://api.mainnet-beta.solana.com", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "getBalance",
              params: [solAddress]
            })
          });
          const data = await resp.json();
          if (data.result && data.result.value !== undefined) {
            setSolBalance((data.result.value / 1e9).toFixed(4));
          } else {
            setSolBalance("-");
          }
        } catch {
          setSolBalance("-");
        }
      } else {
        setSolBalance("-");
      }
    }
    fetchBalance();
  }, [solAddress]);

  return (
    <div className="w-full bg-[#181818] dark:bg-[#0F0F0F] rounded border border-[#232323] p-2 md:p-3 flex flex-col gap-2 text-[8px] sm:text-[9px] md:text-[10px] text-white">
      <style>{`
        @keyframes glow {
          0% { box-shadow: 0 0 0 4px #00ffb3, 0 0 16px 2px #00ffb3; }
          100% { box-shadow: 0 0 0 8px #00ffb3, 0 0 32px 8px #00ffb3; }
        }
      `}</style>
      {showConnectPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background: 'rgba(30,30,30,0.10)', backdropFilter: 'blur(8px)'}}>
          <div className="bg-[#181818] dark:bg-[#232323] rounded-lg p-6 w-[320px] border border-[#232323] flex flex-col items-center" style={{background: 'rgba(30,30,30,0.7)', boxShadow: 'none', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.18)'}}>
            <div className="text-lg font-bold mb-2 text-white">You must connect wallet</div>
            <button className="px-4 py-2 rounded bg-[#232323] text-white font-semibold hover:bg-[#181818] mt-2" onClick={() => setShowConnectPopup(false)}>Close</button>
          </div>
        </div>
      )}
      {/* Tabs: Market, Limit, Advance */}
      <div className="flex items-center justify-between mb-0">
        <div className="flex gap-1 bg-[#232323] rounded overflow-hidden p-1 h-[32px]">
          {['Market', 'Limit', 'Advance'].map((t) => {
            const tabKey = t.toLowerCase();
            const isActive = tab === tabKey;
            return (
              <button
                key={t}
                className={`px-3 py-1 text-[10px] font-semibold rounded transition-all duration-150 h-full ${isActive ? 'bg-[#181818] text-white' : 'bg-transparent text-gray-400'}`}
                onClick={() => setTab(tabKey as 'market' | 'limit' | 'advance')}
              >
                {t}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white font-bold">{leverage}X</span>
          <button
            className="w-6 h-6 flex items-center justify-center rounded bg-[#232323] hover:bg-[#181818] border border-[#232323] text-gray-400"
            title="Setting Leverage"
            onClick={() => setShowLeverage(true)}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 13.333a3.333 3.333 0 1 0 0-6.666 3.333 3.333 0 0 0 0 6.666Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17.5 10a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      {/* Leverage Modal */}
      {showLeverage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background: 'rgba(30,30,30,0.10)', backdropFilter: 'blur(8px)'}}>
          <div className="bg-[#181818] dark:bg-[#232323] rounded-lg p-6 w-[320px] border border-[#232323] flex flex-col items-center" style={{background: 'rgba(30,30,30,0.7)', boxShadow: 'none', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.18)'}}>
            <div className="text-lg font-bold mb-2 text-white">Adjust Leverage</div>
            <input
              type="range"
              min={1}
              max={maxLeverage}
              value={leverage}
              onChange={e => setLeverage(Number(e.target.value))}
              className="w-full mb-4"
            />
            <div className="text-white mb-4">Leverage: <span className="font-bold">{leverage}X</span></div>
            <button
              className="px-4 py-2 rounded bg-[#232323] text-white font-semibold hover:bg-[#181818]"
              onClick={() => setShowLeverage(false)}
            >
              Save
            </button>
          </div>
        </div>
      )}
      {/* Tab Content */}
      <div className="min-h-[220px]">
        {tab === 'market' && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs"><span>Avbl</span><span>0.00 USDT</span></div>
            <label className="text-xs font-semibold">Size</label>
            <input type="number" value={size} onChange={e => setSize(Number(e.target.value))} className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-[#232323] border border-gray-200 dark:border-[#232323] text-sm text-gray-900 dark:text-white" placeholder="0.0" disabled={!isWalletConnected} onClick={() => { if (!isWalletConnected) setShowConnectPopup(true); }} />
            <div className="flex flex-col gap-2 text-xs">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={tp} onChange={e => { setTP(e.target.checked); if (e.target.checked) setShowTPSL(true); }} disabled={!isWalletConnected} onClick={() => { if (!isWalletConnected) setShowConnectPopup(true); }} /> TP/SL
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={reduceOnly} onChange={e => setReduceOnly(e.target.checked)} disabled={!isWalletConnected} onClick={() => { if (!isWalletConnected) setShowConnectPopup(true); }} /> Reduce-Only
              </label>
            </div>
            {showTPSL && (
              <TP_SL_Modal 
                onClose={() => setShowTPSL(false)} 
                market={market}
              />
            )}
            <button 
              className={`w-full py-2 rounded font-semibold transition-all duration-300 border ${solAddress ? 'bg-[#232323] text-white hover:bg-[#181818] border-transparent' : 'bg-transparent text-white border-[#00ffb3]'}`}
              onClick={() => {
                if (!solAddress) {
                  if (window?.solana?.connect) {
                    window.solana.connect().catch(() => {});
                  }
                  return;
                }
                setShowWaitlist(true);
              }}
            >
              {solAddress ? 'Place Order' : 'Connect Wallet'}
            </button>
      {/* Waitlist Modal */}
      {showWaitlist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background: 'rgba(30,30,30,0.10)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s'}}>
          <div className="bg-[#181818] dark:bg-[#232323] rounded-lg p-6 w-[340px] border border-[#232323] flex flex-col items-center relative animate-popup" style={{background: 'rgba(30,30,30,0.7)', boxShadow: 'none', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.18)'}}>
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl" onClick={() => setShowWaitlist(false)}>&#10005;</button>
            <div className="w-16 h-16 mb-4 flex items-center justify-center">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="32" fill="#0088cc"/><path d="M47 19L27.5 39.5L19 31" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">System Under Building</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">Join our waitlist for early access and stay updated. Be the first to know when we launch!</p>
            <a href="https://x.com/i/communities/1978036884443173163" target="_blank" rel="noopener noreferrer" className="w-full">
              <button className="w-full py-2 rounded-lg bg-[#1A1A1A] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#1DA1F2] transition-all duration-200 shadow-none border border-[#1A1A1A]" style={{boxShadow: 'none'}}>
                <span className="flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 19L9.5 11.5L3 3H7.5L11 7.5L14.5 3H19L12.5 11.5L19 19H14.5L11 14.5L7.5 19H3Z" stroke="#fff" strokeWidth="1.5" fill="none"/>
                  </svg>
                </span>
                <span className="font-semibold">Join X Community</span>
              </button>
            </a>
          </div>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes popup {
              0% { transform: scale(0.8); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            .animate-fadeIn { animation: fadeIn 0.3s; }
            .animate-popup { animation: popup 0.3s; }
          `}</style>
        </div>
      )}
            <div className="flex flex-col gap-1 text-xs mt-2">
              <div className="flex justify-between"><span>Margin</span><span>0.00 USDT</span></div>
              <div className="flex justify-between"><span>Est. liq. price</span><span>--</span></div>
              <div className="flex justify-between"><span>Fee</span><span>Taker / Maker --</span></div>
            </div>
          </div>
        )}
        {tab === 'limit' && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs"><span>Limit Order</span><span>0.00 USDT</span></div>
            <label className="text-xs font-semibold">Limit Price</label>
            <input type="number" className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-[#232323] border border-gray-200 dark:border-[#232323] text-sm text-gray-900 dark:text-white" placeholder="Limit price" disabled={!isWalletConnected} onClick={() => { if (!isWalletConnected) setShowConnectPopup(true); }} />
            <label className="text-xs font-semibold">Size</label>
            <input type="number" className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-[#232323] border border-gray-200 dark:border-[#232323] text-sm text-gray-900 dark:text-white" placeholder="Size" disabled={!isWalletConnected} onClick={() => { if (!isWalletConnected) setShowConnectPopup(true); }} />
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={tp} onChange={e => { setTP(e.target.checked); if (e.target.checked) setShowTPSL(true); }} disabled={!isWalletConnected} onClick={() => { if (!isWalletConnected) setShowConnectPopup(true); }} /> TP/SL
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={reduceOnly} onChange={e => setReduceOnly(e.target.checked)} disabled={!isWalletConnected} onClick={() => { if (!isWalletConnected) setShowConnectPopup(true); }} /> Reduce-Only
            </label>
            {showTPSL && (
              <TP_SL_Modal 
                onClose={() => setShowTPSL(false)} 
                market={market}
              />
            )}
            <button 
              className={`w-full py-2 rounded font-semibold transition-all duration-300 border ${solAddress ? 'bg-[#232323] text-white hover:bg-[#181818] border-transparent' : 'bg-transparent text-white border-[#00ffb3]'}`}
              onClick={() => {
                if (!solAddress) {
                  if (window?.solana?.connect) {
                    window.solana.connect().catch(() => {});
                  }
                  return;
                }
                setShowWaitlist(true);
              }}
            >
              {solAddress ? 'Place Order' : 'Connect Wallet'}
            </button>
          </div>
        )}
        {tab === 'advance' && (
          <div className="flex flex-col items-center justify-center gap-2 h-[180px]">
            <span className="text-lg font-bold text-gray-400">Coming Soon</span>
          </div>
        )}
      </div>
      {/* Card Account */}
      <div className="mt-4 p-3 rounded bg-gray-50 dark:bg-[#232323] border border-gray-200 dark:border-[#232323]">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-xs">Account</span>
          <div className="flex gap-2">
            <button className="px-2 py-1 rounded bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#232323] text-xs font-semibold text-gray-900 dark:text-white">Deposit</button>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex justify-between"><span>Solana Address</span><span>{solAddress ? solAddress.slice(0, 4) + '...' + solAddress.slice(-4) : '--'}</span></div>
          <div className="flex justify-between"><span>SOL Balance</span><span>{solBalance} SOL</span></div>
          <div className="flex justify-between"><span>Account Equity</span><span>--</span></div>
          <div className="flex justify-between"><span>Spot total value</span><span>--</span></div>
          <div className="flex justify-between"><span>Perp total value</span><span>--</span></div>
          <div className="flex justify-between"><span>Perp Unrealized PNL</span><span>--</span></div>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
import React, { useState, useEffect } from "react";
