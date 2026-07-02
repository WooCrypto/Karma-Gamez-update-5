/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StakingState, WalletState, KarmaButterflyNFT } from '../types';
import { Flame, ShieldCheck, HelpCircle, ArrowUpRight, ArrowDownLeft, Zap, Sparkles, Coins, RefreshCw } from 'lucide-react';

interface KarmaVaultProps {
  wallet: WalletState;
  nft: KarmaButterflyNFT | null;
  staking: StakingState;
  onStake: (amount: number) => void;
  onUnstake: () => void;
  claimableKarma: number;
  onClaimKarmaTrickle: () => void;
  onClaimDailyFree: () => void;
  dailyClaimCooldown: number; // seconds remaining
  isAutoScanning?: boolean;
}

export default function KarmaVault({
  wallet,
  nft,
  staking,
  onStake,
  onUnstake,
  claimableKarma,
  onClaimKarmaTrickle,
  onClaimDailyFree,
  dailyClaimCooldown,
  isAutoScanning = false,
}: KarmaVaultProps) {
  const [stakeInput, setStakeInput] = useState<string>('');
  const [showUnstakeWarning, setShowUnstakeWarning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Parse custom staking input
  const handleStakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const amount = parseFloat(stakeInput);
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Please enter a valid positive numbers of Karma Power');
      return;
    }
    if (claimableKarma < amount) {
      setErrorMessage(`Insufficient free Karma. You have ${claimableKarma.toLocaleString()} Karma Power available.`);
      return;
    }
    onStake(amount);
    setStakeInput('');
  };

  // Format countdown
  const formatCooldown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate the scale and styling of the custom glowing Karma Ball
  const getKarmaBallScale = () => {
    if (staking.amountStaked <= 0) return 0.5;
    // Logarithmic scale so high numbers don't expand off-screen, up to 1.3 max
    const calculated = 0.5 + Math.log10(1 + staking.amountStaked / 1000) * 0.15;
    return Math.min(calculated, 1.4);
  };

  const getKarmaBallPulseSpeed = () => {
    if (staking.amountStaked <= 0) return '8s';
    // Faster pulsing with higher multiplier
    const speed = Math.max(1, 6 - (staking.multiplier * 0.8));
    return `${speed}s`;
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 lg:p-8 flex flex-col justify-between h-full relative overflow-hidden" id="karma-vault-panel">
      {/* Absolute top grid line accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-cyan to-brand-purple" />

      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic flex items-center gap-2">
              <Coins className="w-5 h-5 text-brand-cyan" /> Staking Vault
            </h2>
            <p className="text-xs text-white/50 mt-1 font-sans">
              Lock your Karma Power to generate the glorious Karma Ball.
            </p>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-xl px-3.5 py-1 text-right font-mono self-stretch sm:self-auto flex sm:flex-col justify-between items-center sm:items-end">
            <span className="text-[8px] uppercase font-bold text-white/40 tracking-wider font-sans">Available KP Balance</span>
            <span className="block text-xs text-brand-emerald font-extrabold" id="total-karma-power-display">
              {claimableKarma.toLocaleString(undefined, { maximumFractionDigits: 0 })} KP
            </span>
          </div>
        </div>

        {/* REWARD FUEL INFO BANNER */}
        <div className="mt-4 bg-gradient-to-r from-brand-cyan/10 via-brand-purple/5 to-black/20 border border-brand-cyan/20 rounded-xl px-4 py-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 rounded-full blur-xl pointer-events-none" />
          <p className="text-xs text-white/95 leading-relaxed font-sans flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5 animate-pulse" />
            <span>
              <strong className="text-[#14F195] uppercase font-mono text-[10px] tracking-wider block mb-1">
                ✨ Reward Pool Backing &amp; Fuel Layer
              </strong>
              This staking rewards vault is fully powered and continuously fueled by our high-frequency <strong className="text-brand-cyan">DeFi AI Trading</strong> &amp; algorithmic <strong className="text-brand-gold">Gold Trading</strong> systems. It operates with 100% on-chain transparency, allocating trading yield directly to amplify the distribution rewards pool.
            </span>
          </p>
        </div>

        {/* Daily Free Claim Panel & Trickle Indicator */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 font-sans">
          {/* Daily 100,000 Free Claim */}
          <div className="bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col justify-between" id="daily-claim-box">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-black text-brand-purple tracking-wider">Free Daily Grant</span>
                <span className="block text-sm font-extrabold text-white mt-1">+100,000 KP</span>
              </div>
              <Sparkles className="w-5 h-5 text-brand-purple animate-pulse" />
            </div>
            
            <div className="mt-3">
              {!wallet.connected ? (
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('toggle-wallet-dialog'));
                  }}
                  className="w-full text-center bg-white/5 border border-dashed border-white/20 hover:bg-white/10 text-white/75 rounded-lg py-2 px-3 text-xs font-bold transition-all cursor-pointer"
                  id="btn-daily-claim-unconnected"
                >
                  Connect Wallet to Claim
                </button>
              ) : dailyClaimCooldown > 0 ? (
                <button
                  disabled
                  className="w-full text-center bg-black/40 border border-white/5 text-white/30 rounded-lg py-2 px-3 text-xs font-mono font-bold"
                  id="btn-daily-claim-cooldown"
                >
                  Cooldown: {formatCooldown(dailyClaimCooldown)}
                </button>
              ) : (
                <button
                  onClick={onClaimDailyFree}
                  className="w-full text-center bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg py-2 px-3 text-xs font-bold transition-all cursor-pointer"
                  id="btn-daily-claim-ready"
                >
                  Claim 100,000 KP Now
                </button>
              )}
            </div>
          </div>

          {/* Connected trickle generator */}
          <div className="bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col justify-between" id="karma-trickle-box">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-black text-brand-cyan tracking-wider">Passive Generator</span>
                <span className="block text-sm font-extrabold text-white mt-1">Trickle Stream Active</span>
              </div>
              <span className="inline-flex h-2 w-2 rounded-full bg-[#14F195] animate-ping mt-1.5" />
            </div>

            <p className="text-[10px] text-white/40 leading-normal mt-1.5 font-sans">
              Karma accumulates at 1 point per second while connected. Claim to vault anytime!
            </p>
          </div>
        </div>

        {/* Dynamic Interactive "Karma Ball" Graphic Staging */}
        <div className="my-6 py-6 flex flex-col items-center justify-center bg-black/20 rounded-xl border border-white/5 relative min-h-[220px]" id="karma-ball-view">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,241,149,0.03),transparent_75%)]" />

          {/* Staking State Indicator */}
          {!wallet.connected ? (
            <div className="flex flex-col items-center text-center p-4" id="view-stakes-login-required">
              <div className="w-12 h-12 rounded-full bg-black/40 border border-white/5 flex items-center justify-center text-white/30 mb-2">
                <ShieldCheck className="w-5 h-5 text-brand-cyan" />
              </div>
              <span className="text-xs font-bold text-white/75 font-sans">Wallet Not Connected</span>
              <p className="text-[10px] text-white/45 mt-1 max-w-xs font-sans leading-relaxed">
                Connect your wallet to participate in the non-custodial staking protocol and view your live results.
              </p>
            </div>
          ) : staking.amountStaked > 0 ? (
            <div className="relative flex items-center justify-center">
              {/* Outer halo waves */}
              <div
                className="absolute rounded-full border border-brand-emerald/20 animate-ping"
                style={{
                  width: `${140 * getKarmaBallScale()}px`,
                  height: `${140 * getKarmaBallScale()}px`,
                  animationDuration: '3s',
                }}
              />
              <div
                className="absolute rounded-full border border-brand-cyan/10 animate-ping"
                style={{
                  width: `${195 * getKarmaBallScale()}px`,
                  height: `${195 * getKarmaBallScale()}px`,
                  animationDuration: '5s',
                  animationDelay: '1s',
                }}
              />

              {/* Glowing Dynamic Core of the Karma Ball */}
              <div
                className="rounded-full bg-gradient-to-tr from-brand-cyan via-brand-emerald to-brand-purple relative flex flex-col items-center justify-center text-center p-4 shadow-[0_0_30px_rgba(20,241,149,0.25)] transition-all duration-700"
                style={{
                  width: `${100 * getKarmaBallScale()}px`,
                  height: `${100 * getKarmaBallScale()}px`,
                  transform: `scale(${getKarmaBallScale()})`,
                  animation: `pulse-glow ${getKarmaBallPulseSpeed()} cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                }}
                id="karma-ball-core"
              >
                {/* Internal liquid wave layout */}
                <div className="absolute inset-1 rounded-full bg-neutral-950 flex flex-col items-center justify-center p-2 border border-white/5">
                  <Flame className="w-5 h-5 text-brand-emerald animate-pulse" />
                  <span className="block font-mono text-[9px] text-white/40 font-bold uppercase mt-1 tracking-wider">STAKED</span>
                  <span className="text-xs font-black text-white leading-none mt-0.5 font-mono">
                    {(staking.amountStaked / 1000).toFixed(0)}K KP
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-black/40 border border-white/5 flex items-center justify-center text-white/30 mb-2">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white/75 font-sans">Vault Currently Dormant</span>
              <p className="text-[10px] text-white/45 mt-1 max-w-xs font-sans leading-relaxed">
                Once you stake Karma Power, a fluorescent Karma Ball will ignite, multiplying your slice of the SOL pool.
              </p>
            </div>
          )}

          {/* Multiplier readout below sphere */}
          {wallet.connected && staking.amountStaked > 0 && (
            <div className="mt-4 flex items-center gap-4 text-xs font-mono bg-black/40 border border-white/5 px-4 py-2 rounded-lg">
              <div className="text-center border-r border-white/10 pr-4">
                <span className="block text-[8px] uppercase text-white/40 font-bold font-sans">Active Multiplier</span>
                <span className="text-xs font-extrabold text-brand-emerald mt-0.5 block flex items-center justify-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-brand-emerald text-brand-emerald" />
                  {staking.multiplier.toFixed(2)}x
                </span>
              </div>
              <div className="text-center">
                <span className="block text-[8px] uppercase text-white/40 font-bold font-sans font-sans">Time Bonus Yield</span>
                <span className="text-xs font-extrabold text-white mt-1 block">
                  +{((staking.multiplier - (nft ? nft.multiplier : 1.0)) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inputs and Controls */}
      <div className="space-y-4 font-sans">
        {wallet.connected && !isAutoScanning ? (
          <div>
            {/* Staking Input Panel */}
            <form onSubmit={handleStakeSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-white/40 tracking-wider font-sans">
                  Amount of KP to Lock
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Enter Karma Power to stake"
                    value={stakeInput}
                    onChange={(e) => setStakeInput(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 font-mono text-sm rounded-xl py-3.5 pl-4 pr-16 focus:outline-none focus:border-brand-emerald text-white placeholder-white/35 font-medium animate-pulse-once"
                    id="input-stake-karma-power"
                  />
                  <div className="absolute right-2 top-2">
                    <button
                      type="button"
                      onClick={() => setStakeInput(claimableKarma.toString())}
                      className="bg-brand-emerald/10 border border-brand-emerald/30 hover:bg-brand-emerald/20 text-[10px] font-extrabold text-brand-emerald rounded-lg px-3 py-1.5 transition-all"
                      id="btn-stake-max"
                    >
                      MAX
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Percent Presets */}
              <div className="grid grid-cols-3 gap-2">
                {[0.25, 0.50, 1.0].map((pct) => {
                  const amt = Math.floor(claimableKarma * pct);
                  const label = pct === 1.0 ? '100% (MAX)' : `${pct * 100}%`;
                  return (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setStakeInput(amt.toString())}
                      className="bg-black/30 border border-white/5 hover:border-brand-emerald/20 text-[10px] font-bold text-white/60 hover:text-brand-emerald py-2 rounded-lg transition-all"
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Live Preview Calcs */}
              {parseFloat(stakeInput) > 0 && (
                <div className="bg-brand-emerald/5 border border-brand-emerald/10 rounded-xl p-3 text-[11px] space-y-1 font-sans">
                  <div className="flex justify-between text-white/60">
                    <span>Staking Amount:</span>
                    <strong className="text-white font-mono">{(parseFloat(stakeInput) || 0).toLocaleString()} KP</strong>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>New Staking Weight:</span>
                    <strong className="text-brand-cyan font-mono">
                      {((staking.amountStaked + (parseFloat(stakeInput) || 0)) * staking.multiplier).toLocaleString(undefined, { maximumFractionDigits: 0 })} KP
                    </strong>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Estimated Pool Share:</span>
                    <strong className="text-[#14F195] font-mono">
                      {(((staking.amountStaked + (parseFloat(stakeInput) || 0)) * staking.multiplier) / (7500000 + ((staking.amountStaked + (parseFloat(stakeInput) || 0)) * staking.multiplier)) * 100).toFixed(4)}%
                    </strong>
                  </div>
                </div>
              )}

              {/* Bold Primary Stake CTA */}
              <button
                type="submit"
                className="w-full relative group bg-gradient-to-r from-brand-emerald to-brand-cyan hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(20,241,149,0.25)] flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                id="btn-stake-submit"
              >
                <Zap className="w-4 h-4 fill-current text-black" />
                <span>Stake Karma Power Now</span>
              </button>

              {errorMessage && (
                <p className="text-rose-400 font-medium text-[10px] pl-1 leading-none">{errorMessage}</p>
              )}
            </form>

            {/* Unstaker Button and Warning Dialog */}
            {staking.amountStaked > 0 && (
              <div className="pt-2">
                {!showUnstakeWarning ? (
                  <button
                    onClick={() => setShowUnstakeWarning(true)}
                    className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/20 rounded-lg py-2 transition-all cursor-pointer"
                    id="btn-unstake-trigger"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" /> Unstake Karma Power
                  </button>
                ) : (
                  <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-4 space-y-3" id="unstake-warning-modal">
                    <p className="text-[11px] text-rose-300 leading-relaxed font-sans">
                      ⚠️ <strong>WARNING: Multiplier Reset!</strong> You withdraw 100% of your principal {staking.amountStaked.toLocaleString()} Karma Power, but your active {staking.multiplier.toFixed(2)}x time bonus factor will collapse back to base. Unstake?
                    </p>
                    <div className="flex gap-2 font-sans text-xs">
                      <button
                        onClick={() => {
                          onUnstake();
                          setShowUnstakeWarning(false);
                        }}
                        className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg py-2 transition-all cursor-pointer"
                        id="btn-confirm-unstake"
                      >
                        Unstake All
                      </button>
                      <button
                        onClick={() => setShowUnstakeWarning(false)}
                        className="flex-1 bg-black/40 hover:bg-white/10 text-white/80 font-bold border border-white/5 rounded-lg py-2 transition-all cursor-pointer"
                        id="btn-cancel-unstake"
                      >
                        Keep Staking
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : isAutoScanning ? (
          <div className="bg-black/45 p-6 border border-brand-cyan/20 rounded-xl text-center space-y-3 relative overflow-hidden animate-pulse" id="vault-autoscan-loader">
            <RefreshCw className="w-6 h-6 text-brand-cyan mx-auto animate-spin" />
            <span className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider block">Wallet Scan in Progress</span>
            <p className="text-[10px] text-white/50 max-w-xs mx-auto leading-relaxed font-sans">
              Scanning RPC registers for associated Karma Butterfly NFTs. Multipliers are being cryptographically verified... Staking options will synchronize instantly!
            </p>
          </div>
        ) : (
          <div className="bg-black/30 p-4 border border-white/5 rounded-xl text-center" id="vault-locked-disconnected-msg">
            <HelpCircle className="w-5 h-5 text-brand-purple mx-auto mb-2 animate-bounce" />
            <span className="text-xs font-bold text-white/70">Wallet Disconnected</span>
            <p className="text-[10px] text-white/40 mt-1 font-sans leading-relaxed">
              Please connect your wallet using the top bar to initialize and access the non-custodial Staking Vault options.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-[8px] uppercase tracking-wider font-mono text-white/30 border-t border-white/5 pt-3">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-brand-emerald" />
            Non-custodial
          </span>
          <span>Zero Penalty Protocol</span>
        </div>
      </div>
    </div>
  );
}
