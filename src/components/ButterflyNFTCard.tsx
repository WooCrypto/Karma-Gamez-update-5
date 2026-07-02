/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KarmaButterflyNFT, RarityType, WalletState } from '../types';
import { Wallet, Sparkles, AlertCircle, RefreshCw, Flame, ArrowRight, Star, Search, ShieldCheck, Key } from 'lucide-react';

interface ButterflyNFTCardProps {
  nft: KarmaButterflyNFT | null;
  wallet: WalletState;
  onMint: (selectedArchetype: string) => void;
  onConnectWallet: () => void;
  onUnlinkNFT?: () => void;
}

export default function ButterflyNFTCard({ nft, wallet, onMint, onConnectWallet, onUnlinkNFT }: ButterflyNFTCardProps) {
  const [selectedStyle, setSelectedStyle] = useState<'Prism' | 'Matrix' | 'Cosmic' | 'Solar' | 'Abyss'>('Cosmic');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [showReveal, setShowReveal] = useState(false);

  const handleScanWallet = () => {
    if (!wallet.connected) return;
    setIsScanning(true);
    setScanStep('Querying Solana blockchain RPC...');

    setTimeout(() => {
      setScanStep('Establishing handshake with Metaplex metadata accounts...');

      setTimeout(() => {
        setScanStep('Verifying token standards & cryptographic signatures...');

        setTimeout(() => {
          const styles = ['Cosmic', 'Solar', 'Prism', 'Matrix', 'Abyss'];
          const randomStyle = styles[Math.floor(Math.random() * styles.length)];
          onMint(randomStyle);
          setIsScanning(false);
          setScanStep('');
          setShowReveal(true);
          setTimeout(() => setShowReveal(false), 3000);
        }, 250);
      }, 250);
    }, 250);
  };

  // Helper to resolve rarity-specific styles
  const getRarityBadge = (rarity: RarityType) => {
    switch (rarity) {
      case 'Cosmic':
        return { bg: 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400', glow: 'glow-cyan', text: 'Cosmic 🌌' };
      case 'Legendary':
        return { bg: 'bg-amber-500/10 border-amber-500/40 text-amber-400', glow: 'glow-gold', text: 'Legendary 👑' };
      case 'Epic':
        return { bg: 'bg-purple-500/10 border-purple-500/40 text-purple-400', glow: 'glow-purple', text: 'Epic 🔮' };
      case 'Rare':
        return { bg: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400', glow: 'glow-cyan', text: 'Rare 💎' };
      default:
        return { bg: 'bg-neutral-500/10 border-neutral-500/30 text-neutral-400', glow: '', text: 'Common ☑️' };
    }
  };

  // Render the exquisite dynamic animated vector butterfly
  const renderButterflySvg = (style: string, hueRotate: number, rarity: RarityType, glowColor: string) => {
    const wingsGradientId = `wingsGrad-${style}`;
    const bodyGradientId = `bodyGrad-${style}`;

    // Colors adjusted by wing archetype
    const getGradColors = () => {
      switch (style) {
        case 'Matrix':
          return { start: '#10B981', end: '#047857', accent: '#34D399' };
        case 'Solar':
          return { start: '#F59E0B', end: '#DC2626', accent: '#FBBF24' };
        case 'Abyss':
          return { start: '#3B82F6', end: '#1E1B4B', accent: '#60A5FA' };
        case 'Prism':
          return { start: '#EC4899', end: '#8B5CF6', accent: '#F472B6' };
        default: // Cosmic
          return { start: '#8B5CF6', end: '#3B82F6', accent: '#A78BFA' };
      }
    };

    const gradient = getGradColors();

    return (
      <svg
        viewBox="0 0 200 200"
        className="w-48 h-48 drop-shadow-[0_0_15px_rgba(0,242,254,0.3)] select-none transition-transform duration-300 hover:scale-105"
        style={{ filter: `hue-rotate(${hueRotate}deg)` }}
        id="butterfly-vector-element"
      >
        <defs>
          <linearGradient id={wingsGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradient.start} />
            <stop offset="70%" stopColor={gradient.end} />
            <stop offset="100%" stopColor={gradient.accent} />
          </linearGradient>
          <linearGradient id={bodyGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="50%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
          {/* Subtle wing pattern */}
          <pattern id="wingPattern" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 0 10 L 10 0 M 0 0 L 10 10" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Ambient background particles behind butterfly */}
        <g stroke="none" fill="rgba(255, 255, 255, 0.4)">
          <circle cx="50" cy="50" r="1.5" className="animate-pulse" />
          <circle cx="150" cy="140" r="1" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
          <circle cx="160" cy="60" r="2" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
          <circle cx="40" cy="150" r="1" className="animate-pulse" style={{ animationDelay: '1.2s' }} />
        </g>

        {/* Left Wing Group with Flap Animation */}
        <g className="flap-left-anim">
          {/* Top Wing */}
          <path
            d="M 100 100 C 70 40, 20 50, 40 90 C 50 110, 80 110, 100 105 Z"
            fill={`url(#${wingsGradientId})`}
            opacity="0.95"
            stroke={gradient.accent}
            strokeWidth="1.5"
          />
          {/* Detailed Wing Inlays & Patterns */}
          <path
            d="M 90 95 C 75 60, 45 65, 50 85"
            fill="none"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          {/* Bottom Wing */}
          <path
            d="M 100 105 C 80 120, 50 150, 60 160 C 75 170, 90 140, 100 110 Z"
            fill={`url(#${wingsGradientId})`}
            opacity="0.8"
            stroke={gradient.accent}
            strokeWidth="1"
          />
        </g>

        {/* Right Wing Group with Flap Animation */}
        <g className="flap-right-anim">
          {/* Top Wing */}
          <path
            d="M 100 100 C 130 40, 180 50, 160 90 C 150 110, 120 110, 100 105 Z"
            fill={`url(#${wingsGradientId})`}
            opacity="0.95"
            stroke={gradient.accent}
            strokeWidth="1.5"
          />
          {/* Detailed Wing Inlays & Patterns */}
          <path
            d="M 110 95 C 125 60, 155 65, 150 85"
            fill="none"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          {/* Bottom Wing */}
          <path
            d="M 100 105 C 120 120, 150 150, 140 160 C 125 170, 110 140, 100 110 Z"
            fill={`url(#${wingsGradientId})`}
            opacity="0.8"
            stroke={gradient.accent}
            strokeWidth="1"
          />
        </g>

        {/* Butterfly Core Antennae */}
        <path d="M 95 85 Q 90 60 78 54" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 105 85 Q 110 60 122 54" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="78" cy="54" r="2.5" fill="#fff" />
        <circle cx="122" cy="54" r="2.5" fill="#fff" />

        {/* Butterfly Body Column */}
        <path
          d="M 100 78 C 103 78, 105 85, 105 110 C 105 130, 102 145, 100 145 C 98 145, 95 130, 95 110 C 95 85, 97 78, 100 78 Z"
          fill={`url(#${bodyGradientId})`}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1"
        />

        {/* Glowing Hearts/Specs on the core body */}
        <g fill="#fff">
          <circle cx="100" cy="90" r="1.5" className="animate-ping" style={{ animationDuration: '2s' }} />
          <circle cx="100" cy="100" r="1" />
          <circle cx="100" cy="115" r="1.2" />
        </g>
      </svg>
    );
  };

  const selectedRarity = getRarityBadge(nft ? nft.rarity : 'Common');

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-full relative overflow-hidden" id="butterfly-nft-card-container">
      {/* Decorative light strip on top card */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-purple to-brand-cyan" />

      {nft ? (
        // STATE 1: Player possesses a valid NFT
        <div className="flex flex-col h-full justify-between" id="nft-active-view">
          {/* Celebrating reveal overlay */}
          {showReveal && (
            <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center text-center p-6 z-40 animate-fade-in animate-duration-300">
              <div className="relative mb-3">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-brand-purple to-brand-cyan blur-lg animate-pulse" />
                <div className="relative bg-neutral-900 rounded-full p-4 p-x5 border border-brand-purple/20">
                  <Star className="w-12 h-12 text-brand-cyan animate-spin" style={{ animationDuration: '6s' }} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-1 uppercase italic tracking-tighter">NFT KEY DETECTED!</h2>
              <p className="text-xs text-white/50 max-w-xs">{nft.name} has been extracted from your connected wallet addresses!</p>
              <div className="mt-3 text-xs bg-[#14F195]/20 text-[#14F195] border border-[#14F195]/30 px-3 py-1.5 rounded-xl font-mono">
                Claim multiplier locked in: +{nft.multiplier.toFixed(1)}x
              </div>
            </div>
          )}

          {/* Header info */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white/40 text-[10px] tracking-wider uppercase font-sans">Verified Wallet Token</h3>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic mt-1">{nft.name}</h2>
              <p className="text-[10px] text-white/30 font-mono mt-0.5">ID: {nft.id}</p>
            </div>
            <div className={`px-2.5 py-1 rounded-lg border font-bold text-[10px] font-mono uppercase ${selectedRarity.bg} ${selectedRarity.glow}`}>
              {selectedRarity.text}
            </div>
          </div>

          {/* Main Visual Staging */}
          <div className="my-6 py-4 flex items-center justify-center relative">
            {/* Visual halo glow */}
            <div className={`absolute w-32 h-32 rounded-full blur-2xl opacity-20 ${selectedRarity.glow === 'glow-cyan' ? 'bg-brand-cyan' : selectedRarity.glow === 'glow-gold' ? 'bg-brand-gold' : selectedRarity.glow === 'glow-purple' ? 'bg-brand-purple' : 'bg-neutral-600'}`} />
            
            {renderButterflySvg(nft.wingsStyle, nft.imageHue, nft.rarity, selectedRarity.glow)}
          </div>

          {/* Stats section */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                <span className="block text-[10px] text-white/40 uppercase tracking-wider font-sans">Wings Aspect</span>
                <span className="text-sm font-semibold text-white mt-1 block font-mono">{nft.wingsStyle} Core</span>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                <span className="block text-[10px] text-white/40 uppercase tracking-wider font-sans">Claim Boost</span>
                <span className="text-sm font-black text-brand-cyan mt-1 block flex items-center gap-1 font-mono">
                  <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                  {nft.multiplier.toFixed(1)}x
                </span>
              </div>
            </div>

            <div className="bg-[#14F195]/5 border border-[#14F195]/20 rounded-xl p-3 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#14F195] mt-0.5 shrink-0" />
              <div>
                <span className="block text-[10px] font-bold text-[#14F195] uppercase tracking-wide font-sans">Dynamic Ownership Verified</span>
                <p className="text-[10px] text-white/50 leading-relaxed mt-0.5 font-sans">
                  Ownership verified. Staking vaults can now accept your Karma Power deposits and register active pool share distributions.
                </p>
              </div>
            </div>

            {onUnlinkNFT && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onUnlinkNFT}
                  className="text-[10px] text-white/30 hover:text-rose-400 underline transition-all bg-transparent border-none cursor-pointer font-sans"
                >
                  Unlink NFT from Sandbox Wallet
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        // STATE 2: Wallet is connected but player DOES NOT possess an NFT, OR disconnected
        <div className="flex flex-col h-full justify-between" id="nft-verify-view">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tighter uppercase italic flex items-center gap-2">
              <Search className="w-5 h-5 text-brand-cyan animate-pulse" />
              Decentralized NFT Verifier
            </h2>
            <p className="text-xs text-white/50 leading-normal mt-1.5 font-sans">
              Decentralized staking contracts and transparency mechanics check if a verified <strong>Karma Butterfly NFT</strong> key exists inside your active wallet.
            </p>
          </div>

          <div className="my-6 p-5 bg-black/40 border border-white/5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-white font-sans">
              <Key className="w-4 h-4 text-brand-gold animate-bounce" />
              <span>Sandbox Search Log</span>
            </div>

            {isScanning ? (
              <div className="space-y-3 font-mono text-[11px] py-2">
                <div className="flex items-center gap-2 text-brand-cyan">
                  <RefreshCw className="w-4 h-4 animate-spin text-brand-cyan" />
                  <span>{scanStep}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-brand-cyan h-full rounded-full animate-pulse" style={{ width: '100%', animationDuration: '1.2s' }} />
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-white/50 font-sans leading-relaxed space-y-2">
                <p>
                  No active cryptographically bound signature has been registered yet. Scan your current connected wallet indexes to check for present tokens.
                </p>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-[10px] italic">
                  🔍 Dev Tip: In this development sandbox environment, scanning will automatically simulate discovering a randomized Rare, Epic, Legendary, or Cosmic signature on the blockchain!
                </div>
              </div>
            )}
          </div>

          <div>
            {!wallet.connected ? (
              <div className="bg-black/40 rounded-xl p-3.5 border border-white/10 flex flex-col items-center text-center">
                <AlertCircle className="w-5 h-5 text-brand-cyan mb-1.5" />
                <span className="text-xs font-bold text-white/80 font-sans">Wallet Connection Required</span>
                <p className="text-[10px] text-white/40 mt-1 max-w-xs mb-3 font-sans leading-normal">
                  Please connect your Solana wallet to run the cross-chain Metaplex state machine verification.
                </p>
                <button
                  type="button"
                  onClick={onConnectWallet}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-bold bg-white text-black rounded-lg py-2.5 px-4 transition-all hover:bg-neutral-200 cursor-pointer font-sans"
                  id="btn-trigger-connect-on-nft"
                >
                  <Wallet className="w-3.5 h-3.5" /> Connect Wallet
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleScanWallet}
                  disabled={isScanning}
                  className="w-full flex items-center justify-center gap-2 text-xs font-extrabold uppercase bg-brand-cyan hover:brightness-110 text-black rounded-xl py-3.5 px-6 transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)] cursor-pointer font-sans"
                  id="btn-verify-wallet-nft"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying Cryptographic Ledger...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Scan Connected Wallet for NFT</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
