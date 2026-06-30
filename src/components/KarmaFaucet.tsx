/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WalletState, KarmaButterflyNFT } from '../types';
import { 
  Droplet, 
  Coins, 
  RefreshCw, 
  CheckCircle2, 
  Terminal, 
  AlertCircle, 
  Sparkles, 
  Twitter, 
  ShieldCheck, 
  Flame, 
  Key, 
  Calendar, 
  Lock, 
  Zap,
  Info
} from 'lucide-react';

interface KarmaFaucetProps {
  wallet: WalletState;
  nft: KarmaButterflyNFT | null;
  claimableKarma: number;
  onClaimKarmaDaily: (amount: number) => void;
}

export default function KarmaFaucet({ wallet, nft, claimableKarma, onClaimKarmaDaily }: KarmaFaucetProps) {
  // Streak state (Days 1 to 5)
  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('kb_faucet_streak');
    return saved ? parseInt(saved) : 1;
  });

  const [lastClaimTimestamp, setLastClaimTimestamp] = useState<number | null>(() => {
    const saved = localStorage.getItem('kb_faucet_last_claim');
    return saved ? parseInt(saved) : null;
  });

  // Action steps checks
  const [didTweet, setDidTweet] = useState<boolean>(false);
  
  // Verification states
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verified, setVerified] = useState<boolean>(false);
  const [activeConsoleLog, setActiveConsoleLog] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  
  // Success states
  const [showClaimSuccess, setShowClaimSuccess] = useState<boolean>(false);
  const [claimedAmount, setClaimedAmount] = useState<number>(0);

  // Time remaining tracking
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Constants
  const BASE_DRIP = 30000;
  
  // Calculate reward based on streak tier
  const getRewardForStreak = (tier: number) => {
    switch (tier) {
      case 1: return BASE_DRIP;       // 30,000
      case 2: return BASE_DRIP * 1.5; // 45,000
      case 3: return BASE_DRIP * 2.2; // 66,000
      case 4: return BASE_DRIP * 3.0; // 90,000
      case 5:
      default: return BASE_DRIP * 4.0; // 120,000 (CAP Max Yield Daily!)
    }
  };

  const currentDripPot = getRewardForStreak(streak);

  // Check cooldowned state and streak decays
  useEffect(() => {
    const updateCooldownsAndStreak = () => {
      if (!lastClaimTimestamp) {
        setCooldownRemaining(0);
        return;
      }

      const diffMs = Date.now() - lastClaimTimestamp;
      const hourPassed = diffMs / (3600 * 1000);
      
      // Cooldown is 24 hours (86400 seconds)
      const claimWindowSeconds = 24 * 3600;
      const passedSeconds = Math.floor(diffMs / 1000);
      const remaining = Math.max(0, claimWindowSeconds - passedSeconds);
      setCooldownRemaining(remaining);

      // If more than 48 hours passed, streak decays/resets to Day 1
      if (hourPassed >= 48) {
        setStreak(1);
        localStorage.setItem('kb_faucet_streak', '1');
      }
    };

    updateCooldownsAndStreak();
    const interval = setInterval(updateCooldownsAndStreak, 1000);
    return () => clearInterval(interval);
  }, [lastClaimTimestamp]);

  // Social action: simulated twitter creed launch
  const handleTweetCreed = () => {
    if (!wallet.connected) return;
    
    // Open a real pre-filled Twitter / X Intent window with the custom creeds
    const text = `To lift, to lock, and to look forward. I pledge this Karma Creed: wings unfold where weight is bold! 🦋 Built using AI Studio Build and @Solana sandbox contracts #KarmaCreed`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');

    // Simulate completion
    setDidTweet(true);
  };

  // Skip step tool for immediate proof checking
  const handleFastTweetProof = () => {
    setDidTweet(true);
  };

  // Oracle system verification
  const handleTriggerVerification = () => {
    if (!wallet.connected) return;
    if (!didTweet || !nft) return; // verification requires both proofs completed
    if (cooldownRemaining > 0) return;

    setIsVerifying(true);
    setLogs([]);
    
    const verificationLogs = [
      'Establishing cross-chain RPC consensus channel...',
      'Validating social proof sequence on Twitter/X Decentratized Indexer...',
      'Social proof check: MATCHED [Signature matched: OK]',
      'Inspecting wallet address holding balances...',
      `Metaplex holdings metadata verify: [Found Token: ${nft.name}]`,
      `Cryptographic cryptographic signature approved! Multiplier locked at ${nft.multiplier.toFixed(1)}x`,
      'Generating Zero-Knowledge consensus proof payload...',
      'Broadcasting grant permission signature to Staking Faucet smart contract...'
    ];

    let currentIdx = 0;
    const processLogs = () => {
      if (currentIdx < verificationLogs.length) {
        const nextLog = verificationLogs[currentIdx];
        setActiveConsoleLog(nextLog);
        setLogs((prev) => [...prev, `[ORACLE] ${nextLog}`]);
        currentIdx++;
        setTimeout(processLogs, 350);
      } else {
        // Complete verification
        setIsVerifying(false);
        setVerified(true);
      }
    };

    processLogs();
  };

  // Perform faucet release
  const handleExecuteDrip = () => {
    if (!verified || cooldownRemaining > 0) return;
    
    // Update streak logic
    let nextStreak = streak;
    if (lastClaimTimestamp) {
      const hoursSince = (Date.now() - lastClaimTimestamp) / (3600 * 1000);
      if (hoursSince >= 24 && hoursSince < 48) {
        nextStreak = Math.min(streak + 1, 5);
      } else if (hoursSince >= 48) {
        nextStreak = 1;
      }
    } else {
      // First ever claim
      nextStreak = 1;
    }

    setStreak(nextStreak);
    localStorage.setItem('kb_faucet_streak', nextStreak.toString());

    // Record claim timestamp
    const nowTimestamp = Date.now();
    setLastClaimTimestamp(nowTimestamp);
    localStorage.setItem('kb_faucet_last_claim', nowTimestamp.toString());

    // Trigger state change in parent app
    onClaimKarmaDaily(currentDripPot);
    setClaimedAmount(currentDripPot);
    setShowClaimSuccess(true);
    
    // Reset proof trackers for next daily cycle
    setDidTweet(false);
    setVerified(false);
  };

  // DEVELOPER TOOL: Simulate 24 hours pass
  const handleDevTimeSkip = () => {
    if (!lastClaimTimestamp) {
      // If never claimed, set one fake claim 25 hours ago so they can instantly claim Day 2
      const fakeClaimTime = Date.now() - 25 * 3600 * 1000;
      setLastClaimTimestamp(fakeClaimTime);
      localStorage.setItem('kb_faucet_last_claim', fakeClaimTime.toString());
      setStreak(1);
      localStorage.setItem('kb_faucet_streak', '1');
    } else {
      // Push the last claim metadata exactly 25 hours into the past so they can instantly claim now
      const currentFakeTime = lastClaimTimestamp - 25 * 3600 * 1000;
      setLastClaimTimestamp(currentFakeTime);
      localStorage.setItem('kb_faucet_last_claim', currentFakeTime.toString());
    }
    setVerified(false);
    setDidTweet(false);
  };

  // Formatted cooldown countdown
  const formatCooldown = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 lg:p-8 flex flex-col justify-between h-full relative overflow-hidden" id="karma-faucet-panel">
      {/* Visual background accents */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-cyan animate-pulse" />
      <div className="absolute -right-20 -top-20 w-44 h-44 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-brand-cyan/20 text-brand-cyan text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                Controlled Rewards
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-ping" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic mt-1.5 flex items-center gap-2">
              <Droplet className="w-6 h-6 text-brand-cyan animate-pulse" />
              Karma Faucet
            </h2>
            <p className="text-xs text-white/50 mt-1 font-sans">
              Maintain a continuous daily check-in streak to amplify your claim weight and unlock greater Karma Power (KP) drips.
            </p>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-right font-mono self-start md:self-center">
            <span className="text-[8px] uppercase font-bold text-white/40 tracking-wider font-sans block">My Claimable KP</span>
            <span className="text-sm text-brand-cyan font-extrabold" id="faucet-user-bal">
              {claimableKarma.toLocaleString()} KP
            </span>
          </div>
        </div>

        {/* STREAK GRAPHICS TIMEOUT INDICATOR */}
        <div className="bg-black/30 border border-white/5 rounded-2xl p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-gold" />
              <span className="text-xs font-bold text-white uppercase tracking-tight font-sans">Streak Amplification Progress</span>
            </div>
            <div className="flex items-center gap-1.5 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-[10px] font-bold px-2 py-1 rounded-lg">
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-current animate-pulse" />
              <span>Day {streak} Active / Tier {streak}</span>
            </div>
          </div>

          {/* Interactive Bento Nodes for Days 1 - 5 */}
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((dayNum) => {
              const dAmt = getRewardForStreak(dayNum);
              const isActive = streak === dayNum;
              const isPast = streak > dayNum;
              
              return (
                <div 
                  key={dayNum}
                  className={`relative p-3 rounded-xl border text-center transition-all ${
                    isActive 
                      ? 'bg-gradient-to-b from-brand-cyan/15 to-transparent border-brand-cyan text-white shadow-lg shadow-brand-cyan/5'
                      : isPast
                        ? 'bg-[#14F195]/5 border-[#14F195]/20 text-[#14F195]'
                        : 'bg-black/40 border-white/5 text-white/40'
                  }`}
                >
                  <span className="block text-[9px] uppercase tracking-wider font-bold mb-1 font-sans">
                    Day {dayNum}{dayNum === 5 && '+'}
                  </span>
                  <span className="block text-xs font-extrabold font-mono tracking-tighter">
                    {(dAmt / 1000).toFixed(0)}K
                  </span>
                  <span className="text-[8px] block opacity-60">KP</span>

                  {isPast && (
                    <div className="absolute top-1 right-1">
                      <span className="block w-2-2 text-[9px] text-[#14F195]">✓</span>
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-cyan rounded-full animate-ping" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row justify-between text-[11px] text-white/50 leading-relaxed font-sans pt-1">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#14F195]" />
              <span>Drip amplifies daily: <strong>30k ➔ 45k ➔ 66k ➔ 90k ➔ 120k KP</strong>. Resets if inactive &gt; 48h.</span>
            </span>
            {cooldownRemaining > 0 && (
              <span className="text-amber-400 font-bold font-mono shrink-0">
                ⏳ Claim Locked for {formatCooldown(cooldownRemaining)}
              </span>
            )}
          </div>
        </div>

        {/* FAUCET WORKFLOW SEQUENCE */}
        {!wallet.connected ? (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl p-6 text-xs flex flex-col items-center text-center gap-3 font-sans">
            <AlertCircle className="w-8 h-8 text-brand-gold animate-bounce" />
            <div>
              <span className="font-extrabold text-sm block text-white mb-1 uppercase tracking-wider">Authentication Required</span>
              <p className="text-white/50 max-w-md">
                Connect your sandbox Solana wallet in the upper command bar to prove ownership of active state registers and begin claim verification!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* PROOF STEP 1: SOCIAL PROOF */}
              <div className="bg-black/30 border border-white/5 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-brand-purple tracking-widest font-sans">Step 1: Social Proof</span>
                    {didTweet ? (
                      <span className="bg-[#14F195]/20 text-[#14F195] text-[9px] font-bold px-2 py-0.5 rounded-lg border border-[#14F195]/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED
                      </span>
                    ) : (
                      <span className="bg-rose-500/15 text-rose-400 text-[9px] font-bold px-2 py-0.5 rounded-lg border border-rose-500/20">
                        PENDING
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-white text-sm mt-3 uppercase italic font-sans">Broadcast Karma Creed</h3>
                  <p className="text-[11px] text-white/50 leading-relaxed mt-1.5 font-sans">
                    Faucets protect community distribution limits by requiring social alignment. Broadcast the encrypted creed on Twitter / X to authorize liquidity access.
                  </p>

                  <div className="bg-black/50 border border-white/10 rounded-xl p-3 text-[10px] italic text-white/40 leading-relaxed mt-3 relative font-sans">
                    <span className="font-mono text-white/50 block font-bold not-italic mb-0.5">Creed Payload:</span>
                    &ldquo;Wings unfold where weight is bold. I pledge lock consensus &amp; community weights.&rdquo;
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleTweetCreed}
                    className="flex-1 bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white font-extrabold text-[11px] uppercase tracking-wide py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                    id="btn-tweet-karma-creed"
                  >
                    <Twitter className="w-4 h-4 fill-current" />
                    <span>Tweet Creed</span>
                  </button>
                  
                  {!didTweet && (
                    <button
                      type="button"
                      onClick={handleFastTweetProof}
                      className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-[10px] px-3 rounded-xl transition-all"
                      title="Quick bypass without leaving tab"
                    >
                      Bypass
                    </button>
                  )}
                </div>
              </div>

              {/* PROOF STEP 2: CRYPTOGRAPHIC KEYPROOF */}
              <div className="bg-black/30 border border-white/5 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-brand-cyan tracking-widest font-sans">Step 2: Key Proof</span>
                    {nft ? (
                      <span className="bg-[#14F195]/20 text-[#14F195] text-[9px] font-bold px-2 py-0.5 rounded-lg border border-[#14F195]/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED
                      </span>
                    ) : (
                      <span className="bg-rose-500/15 text-rose-400 text-[9px] font-bold px-2 py-0.5 rounded-lg border border-rose-500/20">
                        MISSING KEY
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-white text-sm mt-3 uppercase italic font-sans">NFT Holding Validation</h3>
                  <p className="text-[11px] text-white/50 leading-relaxed mt-1.5 font-sans">
                    The Smart Contract enforces cryptographic scarcity. Only verified holders of an active <strong>Karma Butterfly NFT Token</strong> can trigger the rewards loop drip.
                  </p>

                  {nft ? (
                    <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl p-3 mt-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-brand-cyan/30 flex items-center justify-center text-lg">
                        🦋
                      </div>
                      <div className="font-mono text-[10px]">
                        <span className="block text-white font-bold">{nft.name}</span>
                        <span className="block text-brand-cyan uppercase text-[8px] tracking-wider">Claim Boost: +{nft.multiplier.toFixed(1)}x Loaded</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#FF9900]/10 border border-[#FF9900]/20 text-[#FF9900]/80 rounded-xl p-3.5 mt-4 text-[10px] leading-normal font-sans">
                      ⚠️ <strong>No active key found.</strong> Scan wallet addresses in the <em>Wallet NFT</em> tab to register or obtain an active token!
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!!nft}
                  onClick={() => {
                    const el = document.getElementById('btn-explore-nft-tab');
                    if (el) el.click();
                  }}
                  className={`w-full font-bold text-[11px] uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    nft 
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-not-allowed'
                      : 'bg-white/10 text-white border border-white/10 hover:bg-white/15 cursor-pointer font-sans'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{nft ? 'Holding Authenticated' : 'Acquire Verified Key'}</span>
                </button>
              </div>

            </div>

            {/* VERIFICATION ORACLE CONSOLE */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleTriggerVerification}
                  disabled={isVerifying || !didTweet || !nft || cooldownRemaining > 0 || verified}
                  className={`flex-1 font-sans text-xs uppercase tracking-widest font-black py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    verified
                      ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400'
                      : !didTweet || !nft || cooldownRemaining > 0
                        ? 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                        : 'bg-gradient-to-r from-brand-purple to-brand-cyan hover:brightness-110 text-black shadow-lg shadow-brand-cyan/10 cursor-pointer'
                  }`}
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synchronizing Decentratized Proofs...</span>
                    </>
                  ) : verified ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Zero-Knowledge Proof Verified</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Execute Oracle Verifier</span>
                    </>
                  )}
                </button>

                {verified && cooldownRemaining === 0 && (
                  <button
                    type="button"
                    onClick={handleExecuteDrip}
                    className="bg-gradient-to-r from-[#14F195] to-emerald-400 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(20,241,149,0.3)] flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                    id="btn-claim-drip-faucet"
                  >
                    <Zap className="w-4 h-4 text-black fill-current" />
                    <span>Drip {currentDripPot.toLocaleString()} KP</span>
                  </button>
                )}
              </div>

              {/* Dynamic Console Output Panel */}
              {(isVerifying || verified || logs.length > 0) && (
                <div className="bg-neutral-950/80 border border-white/10 rounded-xl p-4 font-mono text-[11px] text-white/70 space-y-2 relative">
                  <div className="absolute top-2.5 right-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                    <span className="text-[9px] uppercase tracking-wider text-white/30">Consensus Stream</span>
                  </div>

                  <div className="h-28 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
                    {logs.map((log, i) => (
                      <div key={i} className="leading-relaxed">
                        <span className="text-brand-cyan font-bold">&gt;</span> {log}
                      </div>
                    ))}
                    {isVerifying && (
                      <div className="text-brand-purple flex items-center gap-1.5 font-bold">
                        <span className="animate-pulse">&gt; {activeConsoleLog}</span>
                        <span className="w-1.5 h-3 bg-brand-purple animate-ping shrink-0" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUCCESS REVEAL POPUP */}
              {showClaimSuccess && (
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-5 flex items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="p-3 bg-[#14F195]/20 rounded-xl text-2xl text-[#14F195]">
                    🎉
                  </div>
                  <div className="flex-1 font-sans">
                    <h4 className="text-sm font-extrabold text-[#14F195] uppercase tracking-tight">Daily Leak Drip Released!</h4>
                    <p className="text-[11px] text-white/60 leading-normal mt-0.5">
                      <strong>+{claimedAmount.toLocaleString()} KP</strong> has been securely transferred to your unstaked balance. Lock this power now in the Staking Vault to accumulate higher claim weights before the upcoming epoch deadline!
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowClaimSuccess(false)}
                    className="text-xs text-white/40 hover:text-white underline cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* DEVELOPER TESTING CENTER HUD */}
      {wallet.connected && (
        <div className="mt-8 pt-5 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#14F195]" />
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">Sandbox Sandbox Controls</span>
            </div>
            <p className="text-[10px] text-white/30 mt-0.5">
              Force simulation actions to test streak increases and cooldown resets without waiting 24 real hours.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDevTimeSkip}
            className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-brand-cyan animate-spin-slow" />
            <span>⚡ Fast-Forward 24h</span>
          </button>
        </div>
      )}
    </div>
  );
}
