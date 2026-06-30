/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WalletState } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Zap, 
  Coins, 
  BrainCircuit, 
  Sparkles, 
  AlertCircle,
  BookOpen,
  ChevronRight,
  Flame,
  RotateCcw,
  Compass
} from 'lucide-react';

interface PhilosophyScenario {
  id: string;
  category: 'intent' | 'retribution' | 'charity' | 'integrity' | 'detachment';
  title: string;
  scenario: string;
  optionA: string;
  optionB: string;
  philosophicalVerdict: 'A' | 'B';
  verdictExplanation: string;
  quote: string;
  pointsReward: number;
}

interface KarmaPredictionsProps {
  wallet: WalletState;
  onEarnKarma: (amount: number) => void;
}

export default function KarmaPredictions({ wallet, onEarnKarma }: KarmaPredictionsProps) {
  // Deeply drafted Eastern and Karma Philosophy Scenarios
  const [scenarios] = useState<PhilosophyScenario[]>([
    {
      id: 'kpdoc-1',
      category: 'intent',
      title: 'The Well of Intention',
      scenario: 'You find a bag of lost travel coins. Returning it anonymously brings no public praise, but taking it allows you to complete the construction of your local community water well. Which action maintains highest pure-soul baseline?',
      optionA: 'Return the coins secretly. Karmic merit is built purely on untarnished intent, never on opportunistic theft.',
      optionB: 'Take and spend on the well. Utilitarian outcomes purify the minor transgression of private theft.',
      philosophicalVerdict: 'A',
      verdictExplanation: 'Karmic philosophy states that "intent" is the seed of the actual fruit. Good results built on deceit or taking what is not given sow weeds of compromise in the subconscious, creating personal debt that must be paid in future cycles.',
      quote: '"Mind precedes all mental states. Mind is their chief; they are mind-made. If one speaks or acts with a pure mind, happiness follows." — Dhammapada 1',
      pointsReward: 200,
    },
    {
      id: 'kpdoc-2',
      category: 'retribution',
      title: 'The Mirror of Adversity',
      scenario: 'A competitor has launched malicious gossip against your spiritual center in the city square. You have proof that can instantly humiliate them, or you can remain completely silent and let public records speak for themselves. What halts the kinetic circle?',
      optionA: 'Dismantle them publicly. Active exposure enforces sudden cosmic retribution and protects seekers from deception.',
      optionB: 'Remain silent and focus on service. Silence denies food to the fire of conflict, dissolving the cyclic karmic knot.',
      philosophicalVerdict: 'B',
      verdictExplanation: 'Returning a venomous blow merely shifts the seed of anger down the timeline, binding you deeper to the antagonist. Absorbing the energy and answering with selfless silence breaks the causal links, setting you free from their web of retribution.',
      quote: '"An eye for an eye makes the whole world blind. In the midst of darkness, light persists." — Mahatma Gandhi',
      pointsReward: 250,
    },
    {
      id: 'kpdoc-3',
      category: 'charity',
      title: 'The Paradox of Unconditional Giving',
      scenario: 'An impoverished citizen begs for coins. You reasonably expect they will use them to buy intoxicating, harmful spirits instead of nourishing food. Do you offer the raw money?',
      optionA: 'Offer the coin anyway. True charity demands complete detachment from what the receiver chooses to do with the gift.',
      optionB: 'Refuse the coin, but buy them warm bread. True spiritual charity guides beings towards growth, avoiding enabling habits.',
      philosophicalVerdict: 'A',
      verdictExplanation: 'While providing food is physically helpful, karma teaches that pure giving must be completely detached from control or patronizing judgment. Giving with constraints creates heavy attachment and egoic hierarchy. Let the act of offering be complete in its own beauty.',
      quote: '"Let your giving be like the sun: it pours forth its light on all. Do not ask who is worthy of the rays." — Rig Veda',
      pointsReward: 200,
    },
    {
      id: 'kpdoc-4',
      category: 'integrity',
      title: 'The Ghost Contract Arbitrage',
      scenario: 'An outdated smart contract accidentally routes tiny slivers of unclaimed gas dust to your wallet. No single retail user is losing money, and you have the power to siphon it off permanently. Do you trigger the drain?',
      optionA: 'Leave it untouched. Hidden collection of unallocated resources still creates a deep energetic debt on your subtle body.',
      optionB: 'Take the dust and donate to a sanctuary. Redirecting passive digital entropy towards living things purifies the action.',
      philosophicalVerdict: 'A',
      verdictExplanation: 'Integrity is what we do when no one is watching. Unearned energy in any form—whether unclaimed dust, forgotten items, or unintended routes—remains a foreign weight on your personal balance sheet. Stepping over it keeps your vessel clear.',
      quote: '"Truthfulness and unpossessiveness keep the spiritual channels completely unobstructed." — Patanjali Yoga Sutras',
      pointsReward: 300,
    },
    {
      id: 'kpdoc-5',
      category: 'detachment',
      title: 'The Master’s Praise',
      scenario: 'You build a beautiful forest school. Your beloved master publicly praises your assistant for its creation, attributing none of the architectural genius to you. How do you integrate the scenario?',
      optionA: 'Gently correct the master in private so your assistant doesn\'t live a lie, maintaining transparent truth.',
      optionB: 'Keep absolute peace. Be joyful for your assistant’s blessing and release all personal identification with the achievement.',
      philosophicalVerdict: 'B',
      verdictExplanation: 'True mastery over karma requires complete relinquishment of the fruits of action. Seeking recognition (even privately for "transparent truth") reveals deep lingering attachments to the ego\'s image. Silence frees your work to remain pure cosmic service.',
      quote: '"You have a right to perform your prescribed duty, but you are not entitled to the fruits of action." — Bhagavad Gita 2.47',
      pointsReward: 350,
    },
  ]);

  // Active question index tracking
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const saved = localStorage.getItem('kb_pred_current_idx');
    return saved ? parseInt(saved) : 0;
  });

  // Track if user made selection for the CURRENT scenario (null, 'A', or 'B')
  const [currentSelection, setCurrentSelection] = useState<'A' | 'B' | null>(() => {
    const saved = localStorage.getItem('kb_pred_current_sel');
    return saved ? (saved as 'A' | 'B' | null) : null;
  });

  // Points state
  const [points, setPoints] = useState<number>(() => {
    const saved = localStorage.getItem('kb_predictions_points_v2');
    return saved ? parseInt(saved) : 0;
  });

  // Log of answers for the session to prevent double scoring
  const [sessionScored, setSessionScored] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem('kb_pred_scored_v2');
    return saved ? JSON.parse(saved) : {};
  });

  const [showConvertSuccess, setShowConvertSuccess] = useState<boolean>(false);
  const [convertedKp, setConvertedKp] = useState<number>(0);

  // Score multiplier per point
  const CONVERSION_RATE = 200; // 1 prediction point = 200 Karma Power (KP)

  // Submitting choice handles point score immediately
  const handleSelectChoice = (choice: 'A' | 'B') => {
    if (!wallet.connected || currentSelection !== null || currentIndex >= scenarios.length) return;

    setCurrentSelection(choice);
    localStorage.setItem('kb_pred_current_sel', choice);

    const activeScenario = scenarios[currentIndex];
    const isCorrect = choice === activeScenario.philosophicalVerdict;

    if (!sessionScored[currentIndex]) {
      let pointsAwarded = 0;
      if (isCorrect) {
        pointsAwarded = activeScenario.pointsReward;
        const nextPoints = points + pointsAwarded;
        setPoints(nextPoints);
        localStorage.setItem('kb_predictions_points_v2', nextPoints.toString());
      }

      const updatedScored = {
        ...sessionScored,
        [currentIndex]: true,
      };
      setSessionScored(updatedScored);
      localStorage.setItem('kb_pred_scored_v2', JSON.stringify(updatedScored));
    }
  };

  // Step to the next scenario question
  const handleNextQuestion = () => {
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    setCurrentSelection(null);
    localStorage.setItem('kb_pred_current_idx', nextIdx.toString());
    localStorage.removeItem('kb_pred_current_sel');
  };

  // Convert points to claimable Karma Power (on parent wallet)
  const handleConvertPointsToKp = () => {
    if (points <= 0) return;

    const kpEarned = points * CONVERSION_RATE;
    onEarnKarma(kpEarned);
    setConvertedKp(kpEarned);
    setShowConvertSuccess(true);
    
    // Clear point values
    setPoints(0);
    localStorage.setItem('kb_predictions_points_v2', '0');
  };

  // Game/Round Reset
  const handleRestartPredictions = () => {
    setCurrentIndex(0);
    setCurrentSelection(null);
    setSessionScored({});
    localStorage.setItem('kb_pred_current_idx', '0');
    localStorage.removeItem('kb_pred_current_sel');
    localStorage.setItem('kb_pred_scored_v2', '{}');
  };

  const activeScenario = scenarios[currentIndex];
  const isFinished = currentIndex >= scenarios.length;

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 lg:p-8 flex flex-col justify-between h-full relative overflow-hidden" id="karma-predictions-dashboard">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-purple animate-pulse" />
      <div className="absolute -left-20 -top-20 w-44 h-44 bg-brand-purple/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Upper Header layout */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-brand-purple/20 text-brand-purple text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                Karmic Intellect Game
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-ping" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic mt-1.5 flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-brand-purple animate-pulse" />
              Karmic Predictions
            </h2>
            <p className="text-xs text-white/50 mt-1 font-sans leading-normal">
              Instead of gambling, test your understanding of pure <strong>Karma Philosophy</strong>. Choose the highest ethical and cosmic choice. Correct choices claim reward points—incorrect choices result in zero loss.
            </p>
          </div>

          {/* Points Board */}
          <div className="bg-gradient-to-br from-black/60 to-neutral-900 border border-brand-purple/20 rounded-xl p-4 text-center font-mono self-start md:self-center min-w-[170px] relative overflow-hidden">
            <span className="text-[8px] uppercase font-bold text-white/40 tracking-wider font-sans block mb-1">Accumulated Points</span>
            <span className="text-xl text-[#14F195] font-black tracking-tight block">
              {points.toLocaleString()} PTS
            </span>
            <span className="text-[9px] text-[#14F195]/60 mt-0.5 block font-sans">
              = {(points * CONVERSION_RATE).toLocaleString()} KP claimable
            </span>

            {points > 0 && wallet.connected && (
              <button
                type="button"
                onClick={handleConvertPointsToKp}
                className="mt-2.5 w-full bg-brand-purple hover:brightness-110 text-white font-black text-[9px] uppercase tracking-wider py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer font-sans"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Claim as KP</span>
              </button>
            )}
          </div>
        </div>

        {/* Claim Reward Confirmation Notice */}
        {showConvertSuccess && (
          <div className="bg-[#14F195]/10 border border-[#14F195]/20 rounded-2xl p-4 flex items-center justify-between gap-3 mb-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-brand-cyan shrink-0 animate-spin-slow" />
              <p className="text-xs text-white/80 font-sans leading-relaxed">
                Successfully converted prediction points to <strong className="text-[#14F195]">+{convertedKp.toLocaleString()} Karma Power</strong>. Deposit this power into your Staking Vault to build active pool weights!
              </p>
            </div>
            <button 
              onClick={() => setShowConvertSuccess(false)}
              className="text-[10px] text-white/40 hover:text-white underline font-sans cursor-pointer whitespace-nowrap"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* MAIN GAME INTERFACING CONTAINER */}
        {!wallet.connected ? (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl p-8 text-xs flex flex-col items-center text-center gap-3 font-sans my-4">
            <AlertCircle className="w-8 h-8 text-brand-gold animate-bounce" />
            <div>
              <span className="font-extrabold text-sm block text-white mb-1 uppercase tracking-wider">Sanctuary Locked</span>
              <p className="text-white/50 max-w-md">
                Please connect your Solana Wallet in the upper command bar to submit alignment predictions and participate in this game.
              </p>
            </div>
          </div>
        ) : isFinished ? (
          /* CONGRATULATIONS / TALLY SUMMARY */
          <div className="bg-black/30 border border-white/10 rounded-2xl p-6 lg:p-8 text-center space-y-6 animate-fade-in animate-duration-300">
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 bg-brand-purple/20 border border-brand-purple/30 rounded-full flex items-center justify-center text-2xl mx-auto mb-2 animate-bounce">
                🌸
              </div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Karmic Round Complete!</h3>
              <p className="text-xs text-white/50 leading-relaxed font-sans">
                You have journeyed through the primary dualities of intention, retribution, and charity. Your subtle energy has been cataloged.
              </p>
            </div>

            <div className="max-w-sm mx-auto bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-2">
              <div className="flex justify-between items-center text-xs text-white/60">
                <span>Completed Scenarios:</span>
                <span className="font-bold text-white uppercase font-mono">{scenarios.length} / {scenarios.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-white/60">
                <span>Reward Points Stacked:</span>
                <span className="font-bold text-[#14F195] font-mono">{points} PTS</span>
              </div>
              <div className="flex justify-between items-center text-xs text-white/60">
                <span>Earned Karma Power:</span>
                <span className="font-black text-brand-cyan font-mono">+{(points * CONVERSION_RATE).toLocaleString()} KP</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              {points > 0 ? (
                <button
                  type="button"
                  onClick={handleConvertPointsToKp}
                  className="w-full sm:flex-1 bg-gradient-to-r from-brand-purple to-brand-cyan hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(153,69,255,0.3)] flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                >
                  <Zap className="w-4 h-4 text-black fill-current" />
                  <span>Claim { (points * CONVERSION_RATE).toLocaleString() } KP</span>
                </button>
              ) : (
                <div className="text-xs text-[#14F195] font-bold border border-[#14F195]/30 bg-[#14F195]/10 px-4 py-2.5 rounded-xl font-sans">
                  💎 All points successfully converted to KP!
                </div>
              )}

              <button
                type="button"
                onClick={handleRestartPredictions}
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/15 px-6 py-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Play Again</span>
              </button>
            </div>
          </div>
        ) : (
          /* SINGLE QUESTION ACTIVE WORKFLOW */
          <div className="bg-black/30 border border-white/5 rounded-2xl p-6 lg:p-8 space-y-6 animate-fade-in animate-duration-300">
            
            {/* Round counter bar */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-cyan" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-sans">
                  Scenario {currentIndex + 1} of {scenarios.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
                <span className="text-[9px] font-extrabold text-brand-gold uppercase tracking-wider font-sans">
                  Category: {activeScenario.category}
                </span>
              </div>
            </div>

            {/* Scenario dilemma text card */}
            <div className="space-y-3">
              <h3 className="text-lg font-black text-white uppercase italic tracking-tight font-sans">
                {activeScenario.title}
              </h3>
              <p className="text-xs md:text-sm text-white/70 leading-relaxed font-sans bg-black/40 border border-white/5 p-4 rounded-2xl relative">
                <span className="absolute -left-1 -top-1 w-2 h-2 bg-brand-purple rounded-full" />
                {activeScenario.scenario}
              </p>
            </div>

            {/* Answer Options list (Lock once answered) */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                disabled={currentSelection !== null}
                onClick={() => handleSelectChoice('A')}
                className={`w-full text-left p-4 rounded-2xl border text-xs leading-normal transition-all flex items-start justify-between font-sans ${
                  currentSelection === 'A'
                    ? activeScenario.philosophicalVerdict === 'A'
                      ? 'bg-[#14F195]/10 border-[#14F195] text-[#14F195] font-bold'
                      : 'bg-rose-500/10 border-rose-500 text-rose-400 font-bold'
                    : currentSelection !== null && activeScenario.philosophicalVerdict === 'A'
                      ? 'bg-[#14F195]/5 border-[#14F195]/30 text-[#14F195]/80'
                      : 'bg-black/40 border-white/5 hover:border-white/10 hover:bg-black/60 text-white/60 hover:text-white cursor-pointer'
                }`}
              >
                <div className="flex gap-3">
                  <span className="font-mono font-bold shrink-0 opacity-40">A.</span>
                  <span>{activeScenario.optionA}</span>
                </div>
                {currentSelection !== null && activeScenario.philosophicalVerdict === 'A' && (
                  <CheckCircle2 className="w-5 h-5 text-[#14F195] shrink-0 ml-3" />
                )}
                {currentSelection === 'A' && activeScenario.philosophicalVerdict !== 'A' && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 ml-3" />
                )}
              </button>

              <button
                type="button"
                disabled={currentSelection !== null}
                onClick={() => handleSelectChoice('B')}
                className={`w-full text-left p-4 rounded-2xl border text-xs leading-normal transition-all flex items-start justify-between font-sans ${
                  currentSelection === 'B'
                    ? activeScenario.philosophicalVerdict === 'B'
                      ? 'bg-[#14F195]/10 border-[#14F195] text-[#14F195] font-bold'
                      : 'bg-rose-500/10 border-rose-500 text-rose-400 font-bold'
                    : currentSelection !== null && activeScenario.philosophicalVerdict === 'B'
                      ? 'bg-[#14F195]/5 border-[#14F195]/30 text-[#14F195]/80'
                      : 'bg-black/40 border-white/5 hover:border-white/10 hover:bg-black/60 text-white/60 hover:text-white cursor-pointer'
                }`}
              >
                <div className="flex gap-3">
                  <span className="font-mono font-bold shrink-0 opacity-40">B.</span>
                  <span>{activeScenario.optionB}</span>
                </div>
                {currentSelection !== null && activeScenario.philosophicalVerdict === 'B' && (
                  <CheckCircle2 className="w-5 h-5 text-[#14F195] shrink-0 ml-3" />
                )}
                {currentSelection === 'B' && activeScenario.philosophicalVerdict !== 'B' && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 ml-3" />
                )}
              </button>
            </div>

            {/* VERDICT FEEDBACK CARD (Visible once they submit answers) */}
            {currentSelection !== null && (
              <div className="p-5 rounded-2xl border border-white/10 bg-gradient-to-r from-neutral-950/80 to-transparent space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide">
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                    currentSelection === activeScenario.philosophicalVerdict
                      ? 'bg-[#14F195]/10 text-[#14F195] border border-[#14F195]/20'
                      : 'bg-white/5 text-white/50 border border-white/5'
                  }`}>
                    {currentSelection === activeScenario.philosophicalVerdict ? '✓ Wisdom Match' : '✦ Alt Choice (No Loss)'}
                  </span>

                  <span className="text-[#14F195] font-mono">
                    {currentSelection === activeScenario.philosophicalVerdict ? `+${activeScenario.pointsReward} PTS` : '+0 PTS'}
                  </span>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold text-white/40 uppercase tracking-widest font-sans">
                    The Karmic Lesson
                  </h4>
                  <p className="text-xs text-white/80 leading-relaxed font-sans">
                    {activeScenario.verdictExplanation}
                  </p>
                  
                  <blockquote className="text-[11px] italic font-serif text-brand-cyan/70 border-l-2 border-brand-cyan/40 pl-3.5 py-1 leading-relaxed">
                    {activeScenario.quote}
                  </blockquote>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="bg-white text-black hover:bg-neutral-200 text-xs font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer font-sans"
                  >
                    <span>{currentIndex === scenarios.length - 1 ? 'Finish Evaluation' : 'Next Scenario'}</span>
                    <ChevronRight className="w-4 h-4 text-black" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DEV COMMANDS SUBFOOTER */}
      {wallet.connected && !isFinished && (
        <div className="mt-8 pt-5 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-purple" />
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">Sandbox Simulation Engine</span>
            </div>
            <p className="text-[10px] text-white/30 mt-0.5">
              Reset your progress at any time to re-evaluate karma dilemmas or clear active positions.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRestartPredictions}
            className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-brand-purple animate-spin-slow" />
            <span>Reset Prediction Round</span>
          </button>
        </div>
      )}
    </div>
  );
}
