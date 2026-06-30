/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActivityLog, DevOffer, WalletState, StakingState } from '../types';
import { Flame, Star, MessageSquare, AlertTriangle, RefreshCw, X, Gift, Check } from 'lucide-react';

interface ActivityFeedProps {
  logs: ActivityLog[];
  activeOffer: DevOffer | null;
  wallet: WalletState;
  staking: StakingState;
  onAcceptOffer: (offerId: string) => void;
  onDeclineOffer: () => void;
  onManualTriggerOffer: () => void; // allow triggering the bubble immediately for testing!
}

export default function ActivityFeed({
  logs,
  activeOffer,
  wallet,
  staking,
  onAcceptOffer,
  onDeclineOffer,
  onManualTriggerOffer,
}: ActivityFeedProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = () => {
    if (!activeOffer) return;
    setIsProcessing(true);
    setTimeout(() => {
      onAcceptOffer(activeOffer.id);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-6 relative overflow-hidden" id="activity-feed-panel">
      {/* Absolute top grid line accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-purple to-brand-cyan" />

      {/* Dynamic Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tighter uppercase italic flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-purple" />
            Activity & Dev Events
          </h2>
          <p className="text-xs text-white/50 mt-1 font-sans">
            Real-time consensus verification stream and interactive events.
          </p>
        </div>

        {/* Demo tools indicator */}
        <button
          onClick={onManualTriggerOffer}
          className="text-[9px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg border border-brand-purple/20 bg-brand-purple/10 text-white/90 hover:bg-brand-purple hover:text-black transition-all flex items-center gap-1 cursor-pointer"
          id="btn-trigger-bubble-test"
          title="Instantly deploy a fresh Dev Karma Bubble for testing"
        >
          <Gift className="w-3.5 h-3.5 animate-bounce" /> Simulate Bubble
        </button>
      </div>

      {/* DEV BUBBLE POPUP COMPONENT */}
      {activeOffer ? (
        <div className="bg-black/60 border border-brand-purple/40 rounded-xl p-5 relative overflow-hidden shadow-[0_0_20px_rgba(153,69,243,0.15)] duration-300" id="dev-bubble-active">
          {/* Bubble background graphic element */}
          <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-r from-brand-cyan/5 to-brand-purple/10 blur-xl animate-pulse" />
          
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-4 w-4 rounded-full bg-brand-cyan animate-ping absolute opacity-45" />
              <span className="p-1 px-1.5 rounded bg-brand-purple/20 text-brand-purple text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Gift className="w-3 h-3 text-brand-purple" /> KARMA BUBBLE EVENT
              </span>
            </div>

            <button 
              onClick={onDeclineOffer}
              className="text-white/40 hover:text-white p-1 rounded transition-colors"
              id="btn-decline-bubble-x"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 space-y-3 font-sans">
            <h3 className="text-sm font-extrabold text-white leading-normal">
              {activeOffer.message}
            </h3>

            <div className="bg-black/30 border border-white/5 p-4 rounded-lg">
              <p className="text-[10px] text-white/50 leading-relaxed font-sans">
                A custom Developer buyout is waiting. If accepted, the smart contract will instantly transfer the SOL prize into your wallet, in exchange for burning your Karma:
              </p>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <div>
                  <span className="block text-[8px] uppercase font-bold text-white/40 font-mono">You Lose</span>
                  <span className="block text-xs font-mono font-bold text-rose-400">
                    -{activeOffer.karmaCost.toLocaleString()} KP
                  </span>
                </div>
                
                <div className="text-right">
                  <span className="block text-[8px] uppercase font-bold text-white/40 font-mono">You Receive</span>
                  <span className="block text-sm font-mono font-bold text-[#14F195] flex items-center justify-end gap-1">
                    +{activeOffer.solOffer.toFixed(3)} SOL
                  </span>
                </div>
              </div>
            </div>

            {!wallet.connected ? (
              <div className="bg-black/40 border border-white/5 p-2 text-center rounded-lg text-[10px] text-white/50 font-sans">
                ⚠️ Connect wallet to resolve this contract proposal.
              </div>
            ) : staking.amountStaked < activeOffer.karmaCost ? (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg p-3 text-xs flex items-center gap-2 font-sans">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>You don&apos;t have enough staked Karma Power to claim this bid. Stake more Karma Power first!</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <button
                  onClick={handleAccept}
                  disabled={isProcessing}
                  className="flex-1 bg-brand-emerald text-black font-extrabold text-[10px] rounded-lg py-2.5 transition-all hover:brightness-110 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider relative overflow-hidden shadow-md shadow-brand-emerald/10"
                  id="btn-accept-bubble-contract"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Transacting...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                      <span>Accept Buyout</span>
                    </>
                  )}
                </button>
                <button
                  onClick={onDeclineOffer}
                  className="bg-white/5 hover:bg-white/10 text-white/80 font-bold text-[10px] border border-white/5 rounded-lg px-4 py-2.5 transition-all cursor-pointer uppercase tracking-wider"
                  id="btn-decline-bubble-action"
                >
                  Dismiss Offer
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* ACTIVITY LOGS FEED */}
      <div className="space-y-3 font-sans">
        <span className="block text-[9px] uppercase font-bold text-white/50 tracking-wider">Devnet Live Activity</span>
        
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1" id="activity-logs-scroller">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className="bg-black/20 border border-white/5 p-3 rounded-lg flex items-start gap-2.5 transition-all hover:bg-white/5"
            >
              <div className="mt-0.5 font-sans">
                {log.type === 'mint' && <span className="p-1 px-1.5 rounded bg-brand-cyan/20 text-brand-cyan text-[8px] font-bold tracking-wider">MINT</span>}
                {log.type === 'stake' && <span className="p-1 px-1.5 rounded bg-[#14F195]/20 text-[#14F195] text-[8px] font-bold tracking-wider">STAKE</span>}
                {log.type === 'unstake' && <span className="p-1 px-1.5 rounded bg-orange-500/20 text-orange-400 text-[8px] font-bold tracking-wider">UNSTK</span>}
                {log.type === 'claim_karma' && <span className="p-1 px-1.5 rounded bg-brand-purple/20 text-brand-purple text-[8px] font-bold tracking-wider">CLAIM</span>}
                {log.type === 'dev_offer_accept' && <span className="p-1 px-1.5 rounded bg-fuchsia-500/20 text-fuchsia-400 text-[8px] font-bold tracking-wider">GIVE UP</span>}
                {log.type === 'dev_offer_decline' && <span className="p-1 px-1.5 rounded bg-white/10 text-white/40 text-[8px] font-bold tracking-wider">DECL</span>}
                {log.type === 'pool_distribution' && <span className="p-1 px-1.5 rounded bg-brand-gold/20 text-brand-gold text-[8px] font-bold tracking-wider">EPOCH</span>}
              </div>

              <div className="flex-1 space-y-0.5 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/80">{log.user}</span>
                  <span className="text-[8px] text-white/30">
                    {new Date(log.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed font-sans">{log.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
