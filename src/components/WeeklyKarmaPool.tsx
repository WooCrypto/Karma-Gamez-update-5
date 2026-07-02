/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PoolDistribution, WalletState, StakingState } from '../types';
import { Info, Calculator, ShieldCheck, PieChart, Users, Building, Terminal, ExternalLink } from 'lucide-react';

interface WeeklyKarmaPoolProps {
  distribution: PoolDistribution;
  wallet: WalletState;
  staking: StakingState;
  onSetPoolSize: (newSize: number) => void;
  onSimulateDistribution: () => void;
}

export default function WeeklyKarmaPool({
  distribution,
  wallet,
  staking,
  onSetPoolSize,
  onSimulateDistribution,
}: WeeklyKarmaPoolProps) {
  const [calculatorPower, setCalculatorPower] = useState<string>(staking.amountStaked > 0 ? staking.amountStaked.toString() : '50000');
  const [calculatorMulti, setCalculatorMulti] = useState<string>(staking.multiplier > 0 ? staking.multiplier.toString() : '1.5');
  const [showPayoutSuccess, setShowPayoutSuccess] = useState(false);
  const [lastPaidOutAmt, setLastPaidOutAmt] = useState<number>(0);

  // Real-time synchronization of state from active stakings
  React.useEffect(() => {
    if (staking.amountStaked > 0) {
      setCalculatorPower(staking.amountStaked.toString());
    } else {
      setCalculatorPower('50000');
    }
    if (staking.multiplier > 0) {
      setCalculatorMulti(staking.multiplier.toString());
    } else {
      setCalculatorMulti('1.5');
    }
  }, [staking.amountStaked, staking.multiplier]);

  // Custom user pool size configuration
  const [customPoolInput, setCustomPoolInput] = useState<string>(distribution.totalSol.toString());

  // Interactive reward share calculator
  // Assume a simulated total pool weight of 10,000,000 staked Karma Shares
  const SIMULATED_GLOBAL_WEIGHT = 7500000; 

  const calculateEstimate = () => {
    const power = parseFloat(calculatorPower) || 0;
    const multi = parseFloat(calculatorMulti) || 1;
    const playerWeight = power * multi;
    
    // Player's slice of the 25% stakers amount
    const playerSharePercent = playerWeight / (SIMULATED_GLOBAL_WEIGHT + playerWeight);
    const estimatedSol = playerSharePercent * distribution.stakersAmt;

    return {
      weight: playerWeight,
      share: playerSharePercent * 100,
      sol: estimatedSol,
    };
  };

  const estimate = calculateEstimate();

  const handleUpdatePool = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customPoolInput);
    if (!isNaN(parsed) && parsed >= 0) {
      onSetPoolSize(parsed);
    }
  };

  const handleTriggerPayout = () => {
    if (!wallet.connected) return;
    
    // Simulate playing distribution
    // Calculate player's actual portion from stakers pool if staked
    const playerPower = staking.amountStaked;
    const playerMulti = staking.multiplier;
    const playerWeight = playerPower * playerMulti;
    
    let earnedSol = 0;
    if (playerWeight > 0) {
      const share = playerWeight / (SIMULATED_GLOBAL_WEIGHT + playerWeight);
      earnedSol = share * distribution.stakersAmt;
    } else {
      // Just a mock amount for demo purposes if they aren't staked or just want to see it work
      earnedSol = 0.045;
    }

    if (earnedSol === 0) earnedSol = 0.045; // friendly fallback so they see the balance update

    setLastPaidOutAmt(earnedSol);
    onSimulateDistribution();
    setShowPayoutSuccess(true);
    setTimeout(() => {
      setShowPayoutSuccess(false);
    }, 5000);
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-8" id="weekly-karma-pool-panel">
      
      {/* SECTION 1: Pool Size and Distribution Graphic */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#9945FF] bg-[#9945FF]/10 px-2.5 py-0.5 rounded-md border border-[#9945FF]/20">
                Weekly Active Epoch
              </span>
              <span className="text-[9px] text-white/40 font-mono">ID: 4099-SOL</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic mt-1.5" id="weekly-karma-pool-heading">
              Weekly Karma Pool
            </h2>
            <p className="text-xs text-white/50 mt-1 max-w-xl">
              All collected SOL goes into one visible pool, split into cryptographic allocation buckets. Transparency drives community trust.
            </p>
          </div>

          {/* Adjust pool size form for simulation */}
          <form onSubmit={handleUpdatePool} className="flex gap-2 w-full lg:w-auto shrink-0 bg-black/40 p-1.5 rounded-xl border border-white/5">
            <span className="text-[10px] font-bold font-mono text-white/40 self-center pl-2 pr-1">POOL:</span>
            <input
              type="number"
              value={customPoolInput}
              onChange={(e) => setCustomPoolInput(e.target.value)}
              className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-xs text-right text-white font-mono font-bold w-20 focus:outline-none focus:border-brand-cyan"
              id="input-setup-pool"
            />
            <button
              type="submit"
              className="bg-white/10 hover:bg-white/15 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              id="btn-update-pool-size"
            >
              Set SOL
            </button>
          </form>
        </div>

        {/* Big visual number representation */}
        <div className="bg-black/40 rounded-xl p-6 border border-white/5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,241,149,0.04),transparent_60%)]" />
          
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Estimated Pool Value</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white tracking-tighter leading-none text-glow font-mono" id="pool-balance-display">
                {distribution.totalSol.toFixed(1)}
              </span>
              <span className="text-lg font-black bg-gradient-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent italic uppercase tracking-tighter">SOL</span>
            </div>
            <p className="text-[10px] text-white/40 font-mono mt-1">
              ≈ ${(distribution.totalSol * 184.5).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD <span className="text-white/20">(1 SOL = $184.50)</span>
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {wallet.connected ? (
              <div className="flex flex-col gap-2 w-full md:w-auto items-stretch md:items-end">
                <button
                  onClick={handleTriggerPayout}
                  className="w-full md:w-auto relative group bg-gradient-to-r from-brand-purple to-brand-cyan hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider px-6 py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(153,69,255,0.2)] flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                  id="btn-simulate-weekly-distribution"
                >
                  Distribute Pool Staking Rewards
                </button>
                <div className="text-[10px] text-white/50 text-center md:text-right font-sans">
                  {staking.amountStaked > 0 ? (
                    <span>
                      My Active Weight: <strong className="text-brand-cyan">{(staking.amountStaked * staking.multiplier).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong> KP • Share: <strong className="text-brand-cyan">{(((staking.amountStaked * staking.multiplier) / (7500000 + (staking.amountStaked * staking.multiplier))) * 100).toFixed(4)}%</strong> • Claimable: <strong className="text-[#14F195]">{(((staking.amountStaked * staking.multiplier) / (7500000 + (staking.amountStaked * staking.multiplier))) * distribution.stakersAmt).toFixed(5)} SOL</strong>
                    </span>
                  ) : (
                    <span className="text-amber-400">
                      ⚠️ 0 KP Staked. Deposit into the Staking Vault to begin claiming weekly SOL rewards.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('toggle-wallet-dialog'))}
                className="w-full text-left bg-[#14F195]/5 hover:bg-[#14F195]/10 border border-dashed border-[#14F195]/20 hover:border-[#14F195]/40 text-white/80 hover:text-white rounded-xl p-4 text-[11px] font-sans transition-all flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <span className="text-[#14F195]">🔒</span>
                  <span>Connect Wallet to unlock active simulated SOL claim distributions.</span>
                </span>
                <span className="text-[10px] bg-[#14F195] hover:bg-[#14F195]/90 text-black font-black px-3 py-1.5 rounded-lg border border-[#14F195]/30 uppercase font-mono transition-all group-hover:scale-[1.03]">
                  Connect Wallet
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Payout Success Modal Alert */}
        {showPayoutSuccess && (
          <div className="bg-[#14F195]/10 border border-[#14F195]/20 rounded-xl p-4 flex items-center justify-between gap-4 animate-in fade-in duration-300" id="alert-payout-success">
            <div className="flex items-start gap-3">
              <span className="p-1 px-1.5 rounded-md bg-[#14F195]/10 text-[#14F195] border border-[#14F195]/20 text-xs font-bold">✓</span>
              <div>
                <span className="block text-xs font-bold text-white uppercase tracking-wider">Reward Stream Distributed!</span>
                <p className="text-[10px] text-white/50 leading-relaxed mt-0.5">
                  Decentralized validation check complete. Your simulated slice representing <strong>{lastPaidOutAmt.toFixed(5)} SOL</strong> has been transferred into your active wallet balance!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Segmented Trust Breakdown Graph */}
        <div className="space-y-3">
          <span className="block text-[10px] uppercase font-bold text-white/40 tracking-wider">Interactive Distribution Breakdown</span>
          
          {/* Segment Bar Chart */}
          <div className="h-4 rounded-full bg-black/40 flex overflow-hidden border border-white/5 p-0.5">
            <div 
              style={{ width: '60%' }} 
              className="bg-brand-purple h-full rounded-l-full transition-all cursor-help"
              title={`Top Karma Players (60%): ${distribution.topPlayersAmt.toFixed(2)} SOL`}
            />
            <div 
              style={{ width: '25%' }} 
              className="bg-brand-cyan h-full transition-all cursor-help"
              title={`Karma Vault Stakers (25%): ${distribution.stakersAmt.toFixed(2)} SOL`}
            />
            <div 
              style={{ width: '10%' }} 
              className="bg-orange-500 h-full transition-all cursor-help"
              title={`Community Treasury (10%): ${distribution.treasuryAmt.toFixed(2)} SOL`}
            />
            <div 
              style={{ width: '5%' }} 
              className="bg-rose-500 h-full rounded-r-full transition-all cursor-help"
              title={`Dev/Infrastructure Fund (5%): ${distribution.devFundAmt.toFixed(2)} SOL`}
            />
          </div>

          {/* Legend Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="bg-black/20 border border-white/5 p-3.5 rounded-xl flex items-start gap-2.5 font-sans">
              <span className="w-2 h-2 rounded-full bg-[#9945FF] mt-1.5 shrink-0 animate-pulse" />
              <div>
                <span className="block text-[10px] font-bold text-white uppercase tracking-wider">Top Players (60%)</span>
                <span className="block text-md font-mono font-bold text-white mt-0.5">{distribution.topPlayersAmt.toFixed(2)} SOL</span>
                <span className="text-[9px] text-white/40 leading-normal block mt-1">Paid to active scoreboard drivers using Karma levels.</span>
              </div>
            </div>

            <div className="bg-black/20 border border-white/5 p-3.5 rounded-xl flex items-start gap-2.5 font-sans">
              <span className="w-2 h-2 rounded-full bg-[#14F195] mt-1.5 shrink-0 animate-pulse" />
              <div>
                <span className="block text-[10px] font-bold text-white uppercase tracking-wider">Stakers (25%)</span>
                <span className="block text-md font-mono font-bold text-white mt-0.5">{distribution.stakersAmt.toFixed(2)} SOL</span>
                <span className="text-[9px] text-white/40 leading-normal block mt-1">Proportionally divided among all active Vault Stakers.</span>
              </div>
            </div>

            <div className="bg-black/20 border border-white/5 p-3.5 rounded-xl flex items-start gap-2.5 font-sans">
              <span className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 shrink-0 animate-pulse" />
              <div>
                <span className="block text-[10px] font-bold text-white uppercase tracking-wider">DAO Treasury (10%)</span>
                <span className="block text-md font-mono font-bold text-white mt-0.5">{distribution.treasuryAmt.toFixed(2)} SOL</span>
                <span className="text-[9px] text-white/40 leading-normal block mt-1">Locked in community governance for liquidity bootstrapping.</span>
              </div>
            </div>

            <div className="bg-black/20 border border-white/5 p-3.5 rounded-xl flex items-start gap-2.5 font-sans">
              <span className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <div>
                <span className="block text-[10px] font-bold text-white uppercase tracking-wider">Dev Fund (5%)</span>
                <span className="block text-md font-mono font-bold text-white mt-0.5">{distribution.devFundAmt.toFixed(2)} SOL</span>
                <span className="text-[9px] text-white/40 leading-normal block mt-1">Engineering, validator hosting, and core infrastructure.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Where does SOL come from? */}
      <div className="border-t border-white/10 pt-8">
        <div>
          <h3 className="text-base font-bold text-white tracking-tighter uppercase italic flex items-center gap-2">
            <Building className="w-4 h-4 text-brand-purple" />
            Where is SOL Harvested? (Rewards Engine)
          </h3>
          <p className="text-[11px] text-white/50 mt-1 font-sans">
            We avoid arbitrary emissions. All yields distributed in the Weekly Karma Pool are generated strictly from on-chain utility mechanics:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 font-sans">
          <div className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-purple">01. NFT Crafting & Entry Fees</span>
            <p className="text-[10px] text-white/50 leading-relaxed">
              Mints and upgrades incur micro Solana transaction fees. 70% of these entry fees are routed directly into the active pool to expand user distribution.
            </p>
          </div>

          <div className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-cyan">02. Marketplace Royalties</span>
            <p className="text-[10px] text-white/50 leading-relaxed">
              Whenever Karma Butterfly NFTs are traded across secondary bazaars, a pre-enforced 4% royalty fee is taxed; half of which feeds the staker pool treasury.
            </p>
          </div>

          <div className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-gold">03. Staking & MEV Yield</span>
            <p className="text-[10px] text-white/50 leading-relaxed">
              Treasury funds are allocated to validators (e.g. JitoSOL, Marinade Finance), redirecting real MEV and staking rewards natively back into our player distributions.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Live Calculator */}
      <div className="bg-black/40 rounded-xl p-5 md:p-6 border border-white/5 flex flex-col lg:flex-row gap-6">
        <div className="space-y-4 lg:w-1/2">
          <h3 className="text-base font-bold text-white tracking-tighter uppercase italic flex items-center gap-2">
            <Calculator className="w-4 h-4 text-brand-cyan" />
            Estimate Your Staking Rewards
          </h3>
          <p className="text-[11px] text-white/50 leading-relaxed font-sans">
            Specify a test stake size and active multiplier to see your estimated real-time direct slice of the 25% Staker pool in SOL!
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2 font-mono">
            <div>
              <label className="block text-[8px] uppercase font-bold text-white/40 tracking-wider mb-1.5 font-sans">Karma Staked</label>
              <input
                type="number"
                value={calculatorPower}
                onChange={(e) => setCalculatorPower(e.target.value)}
                className="w-full bg-black/20 border border-white/10 text-white text-xs rounded-lg p-3 focus:outline-none focus:border-brand-cyan font-bold"
                placeholder="e.g. 50000"
                id="input-calc-power"
              />
            </div>
            <div>
              <label className="block text-[8px] uppercase font-bold text-white/40 tracking-wider mb-1.5 font-sans">NFT Multiplier</label>
              <input
                type="number"
                step="0.1"
                value={calculatorMulti}
                onChange={(e) => setCalculatorMulti(e.target.value)}
                className="w-full bg-black/20 border border-white/10 text-white text-xs rounded-lg p-3 focus:outline-none focus:border-brand-cyan font-bold"
                placeholder="e.g. 1.5"
                id="input-calc-multiplier"
              />
            </div>
          </div>
        </div>

        {/* Result pane */}
        <div className="bg-black/50 border border-white/5 rounded-xl p-5 lg:w-1/2 flex flex-col justify-between relative overflow-hidden font-mono">
          <div className="absolute top-0 right-0 p-3 text-white/20 text-[8px] font-bold uppercase font-sans">Result Panel</div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="border-r border-white/10">
              <span className="block text-[8px] uppercase text-white/40 font-bold font-sans">Your Weight</span>
              <span className="block text-md font-bold text-white mt-1">
                {estimate.weight.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="border-r border-white/10 pl-2">
              <span className="block text-[8px] uppercase text-white/40 font-bold font-sans">Pool Share</span>
              <span className="block text-md font-bold text-brand-cyan mt-1">
                {estimate.share.toFixed(4)}%
              </span>
            </div>
            <div className="pl-2">
              <span className="block text-[8px] uppercase text-white/40 font-bold font-sans">SOL Reward</span>
              <span className="block text-md font-bold text-[#14F195] mt-1">
                {estimate.sol.toFixed(4)} SOL
              </span>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-black/20 border border-white/5 rounded-lg font-sans">
            <div className="flex gap-2">
              <Info className="w-3.5 h-3.5 text-white/40 shrink-0 mt-0.5" />
              <p className="text-[10px] text-white/50 leading-relaxed">
                Formula: <code className="font-mono text-[9px] text-[#14F195]">Weight = Power * Multiplier</code>. Your share divides this weight into the global staker pool weight of {SIMULATED_GLOBAL_WEIGHT.toLocaleString()} Karma.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
