/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WalletState } from '../types';
import { Wallet, CheckCircle, RefreshCw, Key, ShieldAlert } from 'lucide-react';

interface WalletConnectProps {
  wallet: WalletState;
  onConnect: (provider: 'Phantom' | 'Solflare' | 'Backpack') => void;
  onDisconnect: () => void;
  onAirdrop: () => void;
}

export default function WalletConnect({ wallet, onConnect, onDisconnect, onAirdrop }: WalletConnectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState<'Phantom' | 'Solflare' | 'Backpack' | null>(null);

  useEffect(() => {
    const handleToggleDialog = () => {
      setIsOpen(true);
    };
    window.addEventListener('toggle-wallet-dialog', handleToggleDialog);
    return () => window.removeEventListener('toggle-wallet-dialog', handleToggleDialog);
  }, []);

  const handleSelect = (provider: 'Phantom' | 'Solflare' | 'Backpack') => {
    setIsConnecting(provider);
    setTimeout(() => {
      onConnect(provider);
      setIsConnecting(null);
      setIsOpen(false);
    }, 100);
  };

  return (
    <div className="relative inline-block text-left" id="wallet-connect-wrapper">
      {wallet.connected && wallet.address ? (
        <div className="flex flex-row items-center gap-1.5 bg-white/[0.03] border border-white/10 rounded-xl p-1.5 px-2.5 glow-cyan">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14F195] animate-pulse" />
            <span className="font-mono text-[10px] sm:text-xs text-white/70">
              {wallet.address.slice(0, 4)}...{wallet.address.slice(-4)}
            </span>
            <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-[#9945FF]/20 text-[#9945FF] border border-[#9945FF]/30 uppercase font-mono">
              {wallet.walletName}
            </span>
          </div>

          <div className="h-4 w-px bg-white/10 mx-1 shrink-0" />

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] text-white/40 uppercase font-bold font-mono">Bal:</span>
              <span className="font-mono text-[10px] sm:text-xs font-semibold text-white">{wallet.solBalance.toFixed(1)} SOL</span>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={onAirdrop}
                className="group flex items-center justify-center p-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-brand-cyan transition-all duration-200"
                title="Airdrop 1.5 SOL for testing"
                id="btn-airdrop-sol"
              >
                <RefreshCw className="w-2.5 h-2.5 text-[#14F195] transition-transform group-hover:rotate-180 duration-500" />
                <span className="sr-only">Airdrop</span>
              </button>

              <button
                onClick={onDisconnect}
                className="text-[9px] text-red-400 hover:text-white bg-red-950/20 hover:bg-red-500/20 border border-red-500/15 rounded px-1.5 py-0.5 transition-all font-mono font-medium"
                id="btn-disconnect-wallet"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 bg-gradient-to-r from-brand-purple to-brand-cyan text-white font-black text-[10px] sm:text-xs uppercase tracking-wider rounded-xl px-3 sm:px-5 py-2.5 sm:py-3 shadow-lg shadow-brand-purple/25 hover:brightness-110 active:translate-y-[1px] transition-all duration-200 cursor-pointer"
            id="btn-connect-wallet-dialog"
          >
            <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Connect Wallet</span>
            <span className="inline sm:hidden">Connect</span>
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-[#0b0b0d] border border-white/10 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/15">
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Select Provider</span>
                <span className="text-[8px] bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 px-1.5 py-0.5 rounded font-mono">Devnet Sim</span>
              </div>
              
              <div className="space-y-2">
                {[
                  { name: 'Phantom' as const, img: '👻', color: 'hover:bg-purple-950/20 hover:border-purple-500/30' },
                  { name: 'Solflare' as const, img: '🔥', color: 'hover:bg-orange-950/20 hover:border-orange-500/30' },
                  { name: 'Backpack' as const, img: '🎒', color: 'hover:bg-red-950/20 hover:border-red-500/30' },
                ].map((p) => (
                  <button
                    key={p.name}
                    disabled={isConnecting !== null}
                    onClick={() => handleSelect(p.name)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 text-left transition-all hover:border-white/10 hover:bg-white/5 group disabled:opacity-50"
                    id={`btn-select-provider-${p.name.toLowerCase()}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{p.img}</span>
                      <div>
                        <span className="block font-medium text-white text-xs">{p.name}</span>
                        <span className="text-[9px] text-white/40 font-mono">Simulated Test</span>
                      </div>
                    </div>
                    {isConnecting === p.name ? (
                      <RefreshCw className="w-3.5 h-3.5 text-brand-cyan animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5 text-white/10 group-hover:text-brand-cyan transition-colors" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-3 p-2 bg-black/30 rounded-lg flex items-start gap-2 border border-white/5">
                <ShieldAlert className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <p className="text-[9px] text-white/40 leading-normal">
                  All systems operating strictly in a sandboxed, high-fidelity developer simulation mode. Real crypto assets not required.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
