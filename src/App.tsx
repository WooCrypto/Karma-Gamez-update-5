/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { KarmaButterflyNFT, WalletState, StakingState, PoolDistribution, DevOffer, ActivityLog, RarityType } from './types';
import WalletConnect from './components/WalletConnect';
import ButterflyNFTCard from './components/ButterflyNFTCard';
import KarmaVault from './components/KarmaVault';
import WeeklyKarmaPool from './components/WeeklyKarmaPool';
import ActivityFeed from './components/ActivityFeed';
import KarmaFaucet from './components/KarmaFaucet';
import KarmaPredictions from './components/KarmaPredictions';
import { Sparkles, Coins, PieChart, ShieldCheck, Flame, GitCommit, Heart, Droplet, BrainCircuit, RefreshCw, Layers, HelpCircle, Compass, Milestone, CheckCircle2, BookOpen, Info, Wallet, Zap, Check, Lock } from 'lucide-react';
import { saveUserProfile, loadUserProfile, saveActivityLog, fetchActivityLogs } from './firebase';

export default function App() {
  // --- STATE INITIALIZATION WITH LOCALSTORAGE COOP ---
  const [wallet, setWallet] = useState<WalletState>(() => {
    const saved = localStorage.getItem('kb_wallet_v1');
    return saved ? JSON.parse(saved) : {
      connected: false,
      address: null,
      solBalance: 0,
      walletName: null,
    };
  });

  const [nft, setNft] = useState<KarmaButterflyNFT | null>(() => {
    const saved = localStorage.getItem('kb_nft_v1');
    return saved ? JSON.parse(saved) : null;
  });

  // Staking
  const [staking, setStaking] = useState<StakingState>(() => {
    const saved = localStorage.getItem('kb_staking_v1');
    return saved ? JSON.parse(saved) : {
      amountStaked: 0,
      multiplier: 1.0,
      maxMultiplier: 1.0,
      stakingStartTimestamp: null,
      accumulatingSince: Date.now(),
    };
  });

  // Claimable (un-staked) Karma Power
  const [claimableKarma, setClaimableKarma] = useState<number>(() => {
    const saved = localStorage.getItem('kb_claimable_karma_v1');
    return saved ? parseFloat(saved) : 10000; // start with a small bonus of 10k Karma!
  });

  // Daily grant claim tracker (last claimed UTC millisecond timestamp)
  const [lastClaimedTimestamp, setLastClaimedTimestamp] = useState<number | null>(() => {
    const saved = localStorage.getItem('kb_last_claimed_timestamp_v1');
    return saved ? parseInt(saved) : null;
  });

  // Daily grant claim cooldown (in seconds)
  const [dailyClaimCooldown, setDailyClaimCooldown] = useState<number>(() => {
    const walletSaved = localStorage.getItem('kb_wallet_v1');
    const isConnected = walletSaved ? JSON.parse(walletSaved).connected : false;
    if (!isConnected) return 0;

    const saved = localStorage.getItem('kb_last_claimed_timestamp_v1');
    if (saved) {
      const lastClaim = parseInt(saved);
      const now = new Date();
      const lastClaimDate = new Date(lastClaim);
      const sameUTCDay = 
        now.getUTCFullYear() === lastClaimDate.getUTCFullYear() &&
        now.getUTCMonth() === lastClaimDate.getUTCMonth() &&
        now.getUTCDate() === lastClaimDate.getUTCDate();
      if (sameUTCDay) {
        const tomorrowMidnight = new Date();
        tomorrowMidnight.setUTCHours(24, 0, 0, 0);
        return Math.max(0, Math.floor((tomorrowMidnight.getTime() - Date.now()) / 1000));
      }
    }
    return 0;
  });

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'all' | 'nft' | 'vault' | 'pool' | 'faucet' | 'predictions' | 'faq' | 'about'>('all');

  // Walkthrough post-connection tracking states
  const [hasSimulatedPool, setHasSimulatedPool] = useState<boolean>(() => {
    return localStorage.getItem('kb_has_simulated_pool_v1') === 'true';
  });

  const [hasMadePrediction, setHasMadePrediction] = useState<boolean>(() => {
    return localStorage.getItem('kb_has_made_prediction_v1') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('kb_has_simulated_pool_v1', hasSimulatedPool ? 'true' : 'false');
  }, [hasSimulatedPool]);

  useEffect(() => {
    localStorage.setItem('kb_has_made_prediction_v1', hasMadePrediction ? 'true' : 'false');
  }, [hasMadePrediction]);

  // Handle precise tab switching instantly without jumping the page layout
  const handleTabChange = (tab: 'all' | 'nft' | 'vault' | 'pool' | 'faucet' | 'predictions' | 'faq' | 'about') => {
    setActiveTab(tab);
  };

  // Weekly distribute pool size
  const [poolSize, setPoolSize] = useState<number>(120.0);

  // Active Dev bubble offer
  const [activeOffer, setActiveOffer] = useState<DevOffer | null>(null);

  // Expanded FAQ item index
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Live countdown user timezone clock
  const [localTime, setLocalTime] = useState<string>('');
  const [localTimezone, setLocalTimezone] = useState<string>('');
  const [weeklyPoolCooldown, setWeeklyPoolCooldown] = useState<number>(310920); // standard baseline (seconds till epoch distribution)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setLocalTime(`${hh}:${mm}:${ss}`);
      
      const offsetMinutes = now.getTimezoneOffset();
      const offsetSign = offsetMinutes <= 0 ? '+' : '-';
      const offsetHours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0');
      const offsetMins = String(Math.abs(offsetMinutes) % 60).padStart(2, '0');
      setLocalTimezone(`UTC${offsetSign}${offsetHours}:${offsetMins}`);

      // Compute seconds till Sunday 23:59:59 UTC
      const sundayTarget = new Date();
      const dayOfWeek = now.getUTCDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
      const daysUntilSunday = (7 - dayOfWeek) % 7;
      sundayTarget.setUTCDate(now.getUTCDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
      sundayTarget.setUTCHours(23, 59, 59, 999);
      const diffMs = sundayTarget.getTime() - now.getTime();
      setWeeklyPoolCooldown(Math.max(0, Math.floor(diffMs / 1000)));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Formatter for countdowns
  const formatDuration = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatWeeklyCooldown = (secs: number) => {
    const days = Math.floor(secs / 86400);
    const hours = Math.floor((secs % 86400) / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${days}d : ${hours.toString().padStart(2, '0')}h : ${mins.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`;
  };

  // Auto scanning states
  const [isAutoScanning, setIsAutoScanning] = useState<boolean>(false);
  const [autoScanStep, setAutoScanStep] = useState<string>('');

  // Live stream activity logs
  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    return [
      {
        id: 'init-1',
        type: 'pool_distribution',
        user: 'System Oracle',
        details: 'Weekly pool epoch synchronized. Active rewards ready for distribution validation.',
        timestamp: Date.now() - 3600000 * 2,
      },
      {
        id: 'init-2',
        type: 'mint',
        user: 'H9dk...Lpw3',
        details: 'Crafted a Rare Cosmos Karma Butterfly NFT at block #1938221.',
        timestamp: Date.now() - 1800000,
      },
      {
        id: 'init-3',
        type: 'stake',
        user: 'X9fp...Qsk9',
        details: 'Deposited 450,000 Karma Power into the Staking Vault. Ball shares activated!',
        timestamp: Date.now() - 900000,
      }
    ];
  });

  // --- LOCAL PERSISTENCE SYNC EFFECTS ---
  useEffect(() => {
    localStorage.setItem('kb_wallet_v1', JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem('kb_nft_v1', JSON.stringify(nft));
  }, [nft]);

  useEffect(() => {
    localStorage.setItem('kb_staking_v1', JSON.stringify(staking));
  }, [staking]);

  useEffect(() => {
    localStorage.setItem('kb_claimable_karma_v1', claimableKarma.toString());
  }, [claimableKarma]);

  // Synchronically load existing activity logs from firestore on first mount
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const dbLogs = await fetchActivityLogs(30);
        if (dbLogs && dbLogs.length > 0) {
          setLogs(dbLogs);
        }
      } catch (reason) {
        console.warn('Fallback to standard local initialization logs:', reason);
      }
    };
    fetchLogs();
  }, []);

  // Sync state changes debounced to Firestore database to preserve credentials and balances
  useEffect(() => {
    if (!wallet.connected || !wallet.address) return;

    const syncHandler = setTimeout(async () => {
      try {
        const dailyClaimCooldownEnd = dailyClaimCooldown > 0
          ? Date.now() + dailyClaimCooldown * 1000
          : null;

        await saveUserProfile({
          address: wallet.address,
          solBalance: wallet.solBalance,
          claimableKarma,
          stakedAmount: staking.amountStaked,
          multiplier: staking.multiplier,
          maxMultiplier: staking.maxMultiplier,
          stakingStartTimestamp: staking.stakingStartTimestamp,
          nft,
          dailyClaimCooldownEnd,
          lastClaimedTimestamp,
          updatedAt: Date.now()
        });
      } catch (e) {
        console.error('Firebase synchronizer error:', e);
      }
    }, 2500);

    return () => clearTimeout(syncHandler);
  }, [
    wallet.connected,
    wallet.address,
    wallet.solBalance,
    claimableKarma,
    staking.amountStaked,
    staking.multiplier,
    staking.maxMultiplier,
    staking.stakingStartTimestamp,
    nft,
    dailyClaimCooldown,
    lastClaimedTimestamp
  ]);

  // Save log helper with Firestore persistency
  const addAndSaveLog = async (newLog: ActivityLog) => {
    setLogs((prev) => [newLog, ...prev.slice(0, 25)]);
    try {
      await saveActivityLog(newLog);
    } catch (e) {
      console.error('Log sync error:', e);
    }
  };

  const syncProfileDirectly = async (
    address: string,
    solBalance: number,
    clKarma: number,
    stk: StakingState,
    currentNft: KarmaButterflyNFT | null,
    cooldownSecs: number,
    claimedTs: number | null
  ) => {
    try {
      const dailyClaimCooldownEnd = cooldownSecs > 0
        ? Date.now() + cooldownSecs * 1000
        : null;

      await saveUserProfile({
        address,
        solBalance,
        claimableKarma: clKarma,
        stakedAmount: stk.amountStaked,
        multiplier: stk.multiplier,
        maxMultiplier: stk.maxMultiplier,
        stakingStartTimestamp: stk.stakingStartTimestamp,
        nft: currentNft,
        dailyClaimCooldownEnd,
        lastClaimedTimestamp: claimedTs,
        updatedAt: Date.now()
      });
      console.log('Synchronous Firestore state successfully stored for', address);
    } catch (e) {
      console.error('Failed to run direct database store:', e);
    }
  };

  // --- REWARD POOL ALGEBRA (TRANSPARENCY FORMULA) ---
  const calculatePoolDistribution = (total: number): PoolDistribution => {
    return {
      totalSol: total,
      topPlayersAmt: total * 0.60,
      stakersAmt: total * 0.25,
      treasuryAmt: total * 0.10,
      devFundAmt: total * 0.05,
    };
  };

  const poolDistribution = calculatePoolDistribution(poolSize);

  // --- INTERVAL TICKERS: TRICKLE & COOLDOWNS & STATE BOOSTS ---
  useEffect(() => {
    const mainInterval = setInterval(() => {
      // 1. Daily Claim Cooldown
      if (wallet.connected) {
        setDailyClaimCooldown(() => {
          if (!lastClaimedTimestamp) return 0;
          
          const now = new Date();
          const lastClaimDate = new Date(lastClaimedTimestamp);
          
          // Check if same UTC calendar day (year, month, day)
          const sameUTCDay = 
            now.getUTCFullYear() === lastClaimDate.getUTCFullYear() &&
            now.getUTCMonth() === lastClaimDate.getUTCMonth() &&
            now.getUTCDate() === lastClaimDate.getUTCDate();
            
          if (sameUTCDay) {
            // Already claimed today. Seconds until tomorrow 00:00:00 UTC:
            const tomorrowMidnight = new Date();
            tomorrowMidnight.setUTCHours(24, 0, 0, 0);
            return Math.max(0, Math.floor((tomorrowMidnight.getTime() - Date.now()) / 1000));
          }
          return 0;
        });
      } else {
        // Disconnected: countdown timer does NOT work
        setDailyClaimCooldown(0);
      }

      // 2. Passive Karma Trickle (starts accumulating once wallet is connected!)
      if (wallet.connected) {
        setClaimableKarma((prev) => prev + 1);
      }

      // 3. Staking Multiplier Boost over time (simulated time duration growth)
      if (staking.amountStaked > 0 && nft) {
        setStaking((prev) => {
          // Increment multiplier subtly by +0.0001 per second to show live feedback in the viewport
          const nextMult = Math.min(prev.multiplier + 0.0001, nft.multiplier * 2.0);
          return {
            ...prev,
            multiplier: nextMult,
          };
        });
      }
    }, 1000);

    return () => clearInterval(mainInterval);
  }, [wallet.connected, nft, staking.amountStaked, lastClaimedTimestamp]);

  // --- PERIODIC BACKGROUND ACTIVITIES & OCCASIONAL DEV OFFERS ---
  useEffect(() => {
    const activityInterval = setInterval(() => {
      // Randomly append simulated dynamic actions by other players
      const usersList = [
        'Z9id...Klp4', 'Ph7a...Vnx8', '8Fuk...Qw2a', 'sol9...9x1a', 'K9fp...Nvm2', '7fdS...Kpw9'
      ];
      const randomUser = usersList[Math.floor(Math.random() * usersList.length)];
      
      const events: Array<{ type: ActivityLog['type']; details: string }> = [
        { type: 'mint', details: `Minted a newly formatted Karma Butterfly NFT for 0.25 SOL.` },
        { type: 'stake', details: `Deposited ${(Math.floor(Math.random() * 8) + 1) * 50000} Karma Power. Staking multiplier boosting.` },
        { type: 'claim_karma', details: `Collected free daily claims representing 100,000 Karma Power shares.` },
        { type: 'pool_distribution', details: `Redistributed active marketplace taxes back into the current weekly pool.` }
      ];

      const chosenEvent = events[Math.floor(Math.random() * events.length)];
      
      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        type: chosenEvent.type,
        user: randomUser,
        details: chosenEvent.details,
        timestamp: Date.now(),
      };

      setLogs((prev) => [newLog, ...prev.slice(0, 15)]);

      // Auto-trigger a Dev Bubble offer at 15% probability if none exists
      if (!activeOffer && Math.random() < 0.15) {
        triggerNewBubbleOffer();
      }

    }, 15000); // execute feed checks every 15s

    return () => clearInterval(activityInterval);
  }, [activeOffer]);

  // --- TRIGGER BUBBLE HELPER ---
  const triggerNewBubbleOffer = () => {
    const bidsList = [
      {
        message: 'Dev seeks immediate validator liquidity bootstrap!',
        sol: 0.125,
        karma: 25000,
      },
      {
        message: 'Secondary market priority buyback is active!',
        sol: 0.22,
        karma: 35000,
      },
      {
        message: 'Defi Yield Optimizer contract wants temporary Karma burn!',
        sol: 0.085,
        karma: 15000,
      },
      {
        message: 'Dev needs Karma Power payload to top off validator node!',
        sol: 0.35,
        karma: 50000,
      },
    ];

    const bid = bidsList[Math.floor(Math.random() * bidsList.length)];

    const newOffer: DevOffer = {
      id: `offer-${Date.now()}`,
      solOffer: bid.sol,
      karmaCost: bid.karma,
      message: bid.message,
      expiresInSeconds: 300,
    };

    setActiveOffer(newOffer);
  };

  // --- ACTIONS HANDLERS ---

  // 1. Connect Simulated Wallet
  const handleConnectWallet = async (provider: 'Phantom' | 'Solflare' | 'Backpack') => {
    let stableAddress = 'Phan6TomSoLanaPr0v1d3r11111111111111111';
    if (provider === 'Solflare') stableAddress = 'SoL2F1ar3SoLanaPr0v1d3r22222222222222222';
    if (provider === 'Backpack') stableAddress = 'Back4PackSoLanaPr0v1d3r33333333333333333';

    setWallet({
      connected: true,
      address: stableAddress,
      solBalance: 2.50, // default sandbox starting sol
      walletName: provider,
    });

    const connectLog: ActivityLog = {
      id: `conn-${Date.now()}`,
      type: 'claim_karma',
      user: provider,
      details: `${provider} signature established. Launching real-time Metaplex & Firestore synchronizer...`,
      timestamp: Date.now(),
    };
    addAndSaveLog(connectLog);

    setIsAutoScanning(true);
    setAutoScanStep('Querying Firebase Firestore database for existing user records...');

    setTimeout(async () => {
      try {
        const existing = await loadUserProfile(stableAddress);
        if (existing) {
          setAutoScanStep('Existing credentials found! Synchronizing balances & staking vault rates...');
          
          setTimeout(() => {
            setClaimableKarma(existing.claimableKarma);
            setWallet(prev => ({
              ...prev,
              solBalance: existing.solBalance
            }));
            setStaking({
              amountStaked: existing.stakedAmount,
              multiplier: existing.multiplier,
              maxMultiplier: existing.maxMultiplier,
              stakingStartTimestamp: existing.stakingStartTimestamp,
              accumulatingSince: Date.now()
            });
            setNft(existing.nft);

            const loadedTimestamp = existing.lastClaimedTimestamp || (existing.dailyClaimCooldownEnd ? existing.dailyClaimCooldownEnd - 24 * 3600 * 1000 : null);
            setLastClaimedTimestamp(loadedTimestamp);
            if (loadedTimestamp) {
              localStorage.setItem('kb_last_claimed_timestamp_v1', loadedTimestamp.toString());
            } else {
              localStorage.removeItem('kb_last_claimed_timestamp_v1');
            }

            if (loadedTimestamp) {
              const now = new Date();
              const lastClaimDate = new Date(loadedTimestamp);
              const sameUTCDay = 
                now.getUTCFullYear() === lastClaimDate.getUTCFullYear() &&
                now.getUTCMonth() === lastClaimDate.getUTCMonth() &&
                now.getUTCDate() === lastClaimDate.getUTCDate();
              if (sameUTCDay) {
                const tomorrowMidnight = new Date();
                tomorrowMidnight.setUTCHours(24, 0, 0, 0);
                setDailyClaimCooldown(Math.max(0, Math.floor((tomorrowMidnight.getTime() - Date.now()) / 1000)));
              } else {
                setDailyClaimCooldown(0);
              }
            } else {
              setDailyClaimCooldown(0);
            }

            const restoreLog: ActivityLog = {
              id: `restore-${Date.now()}`,
              type: 'claim_karma',
              user: provider,
              details: `Account synchronized! Restored ${existing.claimableKarma.toLocaleString()} KP and ${existing.stakedAmount.toLocaleString()} KP staked from Firestore.`,
              timestamp: Date.now(),
            };
            addAndSaveLog(restoreLog);

            setIsAutoScanning(false);
            setAutoScanStep('');
          }, 200);
          return;
        }
      } catch (err) {
        console.warn('Profile search missed, proceeding to initial clean ledger setup:', err);
      }

      // NO profile exists yet: Run normal ledger scanner sequence to mint initial Genesis Butterfly NFT
      setAutoScanStep('First-time user detected. Scanning standard Solana Metaplex indexes for default butterflies...');

      setTimeout(() => {
        setAutoScanStep('Found Unallocated Genesis Butterfly core candidate. Generating signatures...');

        setTimeout(() => {
          setIsAutoScanning(false);
          setAutoScanStep('');

          const firstWord = ['Aether', 'Vibrant', 'Spectral', 'Celestial', 'Prism', 'Matrix'];
          const secondWord = ['Whisper', 'Chrysalis', 'Horizon', 'Fractal', 'Prism', 'Helix'];
          const customName = `Genesis ${firstWord[Math.floor(Math.random() * firstWord.length)]} ${secondWord[Math.floor(Math.random() * secondWord.length)]}`;
          
          const randomRarityNum = Math.random();
          let rarity: RarityType = 'Rare';
          let multiplier = 1.7;
          let color = 'text-emerald-400';

          if (randomRarityNum > 0.8) {
            rarity = 'Legendary';
            multiplier = 3.5;
            color = 'text-amber-400';
          } else if (randomRarityNum > 0.5) {
            rarity = 'Epic';
            multiplier = 2.4;
            color = 'text-purple-400';
          }

          const newNft: KarmaButterflyNFT = {
            id: `KBF-${Math.floor(1000 + Math.random() * 9000)}`,
            name: customName,
            rarity,
            wingsStyle: 'Cosmic',
            multiplier,
            color,
            imageHue: Math.floor(Math.random() * 360),
            wingsFlapSpeed: '0.8s',
            mintTimestamp: Date.now(),
          };

          setNft(newNft);
          const initialStaking = {
            amountStaked: 0,
            multiplier,
            maxMultiplier: multiplier * 2,
            stakingStartTimestamp: null,
            accumulatingSince: Date.now()
          };
          setStaking(initialStaking);

          // Synchronously record user in Firestore database ledger
          syncProfileDirectly(
            stableAddress,
            2.50,
            claimableKarma,
            initialStaking,
            newNft,
            dailyClaimCooldown,
            lastClaimedTimestamp
          );

          const autoScanLog: ActivityLog = {
            id: `autoscan-success-${Date.now()}`,
            type: 'mint',
            user: 'Scanner',
            details: `Deep Scanner detected unminted core. Created & assigned ${customName} (${rarity}) to secure staking multiplier (+${multiplier}x).`,
            timestamp: Date.now(),
          };
          addAndSaveLog(autoScanLog);
        }, 300);
      }, 250);
    }, 200);
  };

  // 2. Disconnect Wallet
  const handleDisconnectWallet = () => {
    setWallet({
      connected: false,
      address: null,
      solBalance: 0,
      walletName: null,
    });
    setLastClaimedTimestamp(null);
    setDailyClaimCooldown(0);
    localStorage.removeItem('kb_last_claimed_timestamp_v1');
    localStorage.removeItem('kb_daily_cooldown_v1');
  };

  // 3. Airdrop demo SOL
  const handleAirdropSol = () => {
    setWallet((prev) => ({
      ...prev,
      solBalance: prev.solBalance + 1.5,
    }));
  };

  const handleAirdropSolCustom = (amount: number) => {
    setWallet((prev) => ({
      ...prev,
      solBalance: prev.solBalance + amount,
    }));
     const log: ActivityLog = {
      id: `airdrop-custom-${Date.now()}`,
      type: 'claim_karma',
      user: wallet.address ? `${wallet.address.slice(0, 6)}...` : 'Faucet',
      details: `Claimed +${amount.toFixed(1)} SOL from Sandbox Faucet to fuel NFT and staking contract operations.`,
      timestamp: Date.now(),
    };
    addAndSaveLog(log);
  };

  // 4. Mimic Mint Butterly NFT
  const handleMintNFT = (archetypeStyle: string) => {
    if (!wallet.connected) return;
    
    // Choose rarity randomly with sensible distribution, making legendary/cosmic highly satisfying to roll
    const rand = Math.random();
    let rarity: RarityType = 'Common';
    let multiplier = 1.2;

    if (rand > 0.95) {
      rarity = 'Cosmic';
      multiplier = 5.0;
    } else if (rand > 0.82) {
      rarity = 'Legendary';
      multiplier = 3.5;
    } else if (rand > 0.60) {
      rarity = 'Epic';
      multiplier = 2.4;
    } else if (rand > 0.30) {
      rarity = 'Rare';
      multiplier = 1.7;
    }

    const firstWord = ['Vibrant', 'Aether', 'Golden', 'Galactic', 'Cybernetic', 'Ancient'];
    const secondWord = ['Whisper', 'Chrysalis', 'Horizon', 'Fractal', 'Prism', 'Helix'];
    const customName = `${firstWord[Math.floor(Math.random() * firstWord.length)]} ${secondWord[Math.floor(Math.random() * secondWord.length)]}`;

    const newNft: KarmaButterflyNFT = {
      id: `KBF-${Math.floor(1000 + Math.random() * 9000)}`,
      name: customName,
      rarity,
      wingsStyle: archetypeStyle as any,
      multiplier,
      color: rarity === 'Cosmic' ? 'text-indigo-400' : rarity === 'Legendary' ? 'text-amber-400' : rarity === 'Epic' ? 'text-purple-400' : rarity === 'Rare' ? 'text-emerald-400' : 'text-neutral-400',
      imageHue: Math.floor(Math.random() * 360),
      wingsFlapSpeed: rarity === 'Cosmic' ? '0.4s' : rarity === 'Legendary' ? '0.6s' : rarity === 'Epic' ? '0.8s' : '1s',
      mintTimestamp: Date.now(),
    };

    setNft(newNft);
    setWallet((prev) => ({ ...prev, solBalance: Math.max(0, prev.solBalance - 0.25) }));
    
    // Auto-update base staking state multiplier to leverage the new NFT boost
    setStaking((prev) => ({
      ...prev,
      multiplier,
      maxMultiplier: multiplier * 2,
    }));

    // Record Log
    const newLog: ActivityLog = {
      id: `mint-log-${Date.now()}`,
      type: 'mint',
      user: wallet.address ? `${wallet.address.slice(0, 6)}...` : 'User',
      details: `Minted ${customName} (${rarity}) using selected archetype! Claim weights adjusted to +${multiplier}x.`,
      timestamp: Date.now(),
    };
    addAndSaveLog(newLog);
  };

  // 5. Daily 100,000 Free Karma Power Grant
  const handleClaimFreeDaily = () => {
    if (!wallet.connected) return;
    setClaimableKarma((prev) => prev + 100000);
    
    const nowTimestamp = Date.now();
    localStorage.setItem('kb_last_claimed_timestamp_v1', nowTimestamp.toString());
    setLastClaimedTimestamp(nowTimestamp);

    // Calculate immediate cooldown until tomorrow's 00:00:00 UTC
    const tomorrowMidnight = new Date();
    tomorrowMidnight.setUTCHours(24, 0, 0, 0);
    const initialCooldown = Math.max(0, Math.floor((tomorrowMidnight.getTime() - nowTimestamp) / 1000));
    setDailyClaimCooldown(initialCooldown);

    const log: ActivityLog = {
      id: `claim-${Date.now()}`,
      type: 'claim_karma',
      user: wallet.address ? `${wallet.address.slice(0, 6)}...` : 'User',
      details: 'Claimed free daily grant representing 100,000 Karma Power.',
      timestamp: Date.now(),
    };
    addAndSaveLog(log);
  };

  // 6. Stake Karma Power
  const handleStakeKarma = (amount: number) => {
    const nextClaimable = Math.max(0, claimableKarma - amount);
    setClaimableKarma(nextClaimable);

    setStaking((prev) => {
      const isFirstStake = prev.amountStaked === 0;
      const nextStaking = {
        ...prev,
        amountStaked: prev.amountStaked + amount,
        stakingStartTimestamp: isFirstStake ? Date.now() : prev.stakingStartTimestamp,
        multiplier: prev.multiplier === 1.0 && nft ? nft.multiplier : prev.multiplier,
      };

      // Directly update profile data inside the Firebase database
      if (wallet.connected && wallet.address) {
        syncProfileDirectly(
          wallet.address,
          wallet.solBalance,
          nextClaimable,
          nextStaking,
          nft,
          dailyClaimCooldown,
          lastClaimedTimestamp
        );
      }

      return nextStaking;
    });

    const log: ActivityLog = {
      id: `navigate-stake-${Date.now()}`,
      type: 'stake',
      user: wallet.address ? `${wallet.address.slice(0, 6)}...` : 'User',
      details: `Deposited ${amount.toLocaleString()} Karma Power into the Vault. Amplified glowing ball activated!`,
      timestamp: Date.now(),
    };
    addAndSaveLog(log);
  };

  // 7. Unstake Karma Power (Early decay reset)
  const handleUnstakeKarma = () => {
    const principal = staking.amountStaked;
    const nextClaimable = claimableKarma + principal;
    setClaimableKarma(nextClaimable);

    const nextStaking = {
      amountStaked: 0,
      multiplier: nft ? nft.multiplier : 1.0, // Instantly decays early bonus back to baseline
      maxMultiplier: nft ? nft.multiplier * 2 : 1.0,
      stakingStartTimestamp: null,
      accumulatingSince: Date.now(),
    };
    setStaking(nextStaking);

    // Directly update profile data inside the Firebase database
    if (wallet.connected && wallet.address) {
      syncProfileDirectly(
        wallet.address,
        wallet.solBalance,
        nextClaimable,
        nextStaking,
        nft,
        dailyClaimCooldown,
        lastClaimedTimestamp
      );
    }

    const log: ActivityLog = {
      id: `unstake-${Date.now()}`,
      type: 'unstake',
      user: wallet.address ? `${wallet.address.slice(0, 6)}...` : 'User',
      details: `Withdrew principal ${principal.toLocaleString()} Karma Power. Active staking multiplier decayed to baseline.`,
      timestamp: Date.now(),
    };
    addAndSaveLog(log);
  };

  // 8. Accept Dev Offer buy back
  const handleAcceptDevOffer = (offerId: string) => {
    if (!activeOffer || !wallet.connected) return;
    
    // Burn the requested Karma from Staked pool
    setStaking((prev) => ({
      ...prev,
      amountStaked: Math.max(0, prev.amountStaked - activeOffer.karmaCost),
    }));

    // Transfer SOL to wallet balance
    setWallet((prev) => ({
      ...prev,
      solBalance: prev.solBalance + activeOffer.solOffer,
    }));

    const log: ActivityLog = {
      id: `buyout-acc-${Date.now()}`,
      type: 'dev_offer_accept',
      user: wallet.address ? `${wallet.address.slice(0, 6)}...` : 'User',
      details: `Accepted Dev Buyout. Gained +${activeOffer.solOffer.toFixed(3)} SOL, burned ${activeOffer.karmaCost.toLocaleString()} Karma Power.`,
      timestamp: Date.now(),
    };
    addAndSaveLog(log);

    setActiveOffer(null);
  };

  // 9. Decline Dev Offer buy back
  const handleDeclineDevOffer = () => {
    if (!activeOffer) return;
    const log: ActivityLog = {
      id: `buyout-dec-${Date.now()}`,
      type: 'dev_offer_decline',
      user: wallet.address ? `${wallet.address.slice(0, 6)}...` : 'User',
      details: 'Declined Dev buyback offer. Prioritized long-term locking vector.',
      timestamp: Date.now(),
    };
    addAndSaveLog(log);

    setActiveOffer(null);
  };

  // 10. Simulate Weekly pool distribution
  const handleSimulateWeeklyDistribution = () => {
    if (!wallet.connected) return;
    
    // Simulate player rewards based on current pool
    const playerPower = staking.amountStaked;
    const playerMulti = staking.multiplier;
    const playerWeight = playerPower * playerMulti;
    const globalFakeWeight = 7500000;

    let rewardSol = 0;
    if (playerWeight > 0) {
      const share = playerWeight / (globalFakeWeight + playerWeight);
      rewardSol = share * poolDistribution.stakersAmt;
    } else {
      rewardSol = 0.045; // default minimum simulated claim
    }

    setWallet((prev) => ({
      ...prev,
      solBalance: prev.solBalance + rewardSol,
    }));

    const log: ActivityLog = {
      id: `epoch-dist-${Date.now()}`,
      type: 'pool_distribution',
      user: 'Weekly Epoch',
      details: `Epoch completed. Distributed ${poolSize.toFixed(1)} SOL total. Player claimed ${rewardSol.toFixed(5)} SOL.`,
      timestamp: Date.now(),
    };
    addAndSaveLog(log);
    setHasSimulatedPool(true);
  };

  return (
    <div className="min-h-screen space-grid bg-[#0a0a0c] text-white flex flex-col font-sans antialiased relative pb-20 selection:bg-brand-cyan selection:text-black" id="karma-app-root">
      
      {/* GLOBAL HUD GLOW AFFECTS */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-cyan/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-purple/5 rounded-full blur-[140px] pointer-events-none" />

      {/* COMPACT NAVIGATION HEADER */}
      <nav className="sticky top-0 z-40 bg-black/85 backdrop-blur-md border-b border-white/5 px-4 md:px-6 py-3 shadow-lg shadow-black/45">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center justify-between gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <div className="rounded-xl bg-gradient-to-tr from-brand-cyan via-brand-emerald to-brand-purple p-0.5 shadow-md shadow-brand-cyan/10 w-9 h-9 shrink-0">
                <div className="w-full h-full bg-[#030303] rounded-[10px] flex items-center justify-center">
                  <Flame className="text-brand-cyan animate-pulse fill-brand-cyan/20 w-4 h-4" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 md:gap-1.5 leading-none flex-wrap">
                  <span className="font-black tracking-tighter uppercase italic text-white text-xs sm:text-sm whitespace-nowrap">
                    Karma Games
                  </span>
                  <span className="text-[6px] sm:text-[8px] bg-[#14F195]/20 text-[#14F195] font-bold px-1.5 py-0.5 rounded border border-[#14F195]/30 uppercase font-mono whitespace-nowrap">Done by Karma AI</span>
                </div>
                <span className="hidden sm:block text-[9px] text-white/40 mt-1 font-sans">DeFi Gamified Governance & High Transparency Pool</span>
              </div>
            </div>

            {/* Mobile Wallet Element (side-by-side with logo row) */}
            <div className="block md:hidden scale-90 origin-right shrink-0">
              <WalletConnect
                wallet={wallet}
                onConnect={handleConnectWallet}
                onDisconnect={handleDisconnectWallet}
                onAirdrop={handleAirdropSol}
              />
            </div>
          </div>

          {/* NAVIGATION TABS with mobile horizontal scrolling */}
          <div className="relative w-full md:w-auto flex-1 md:flex-initial">
            {/* Mobile-only scroll indicator */}
            <div className="flex md:hidden items-center justify-between px-1 mb-1.5 text-[8px] text-brand-cyan/80 font-mono tracking-widest uppercase leading-none">
              <span>Interactive Menu</span>
              <span className="flex items-center gap-1 text-[#14F195] bg-[#14F195]/10 px-1.5 py-0.5 rounded animate-pulse">
                <span>Scroll Left/Right</span>
                <span className="font-sans text-[10px] font-bold">↔</span>
              </span>
            </div>

            <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex flex-nowrap md:flex-wrap items-center gap-1 bg-white/[0.02] border border-white/5 rounded-xl p-1 font-sans w-max md:w-auto">
                <button
                  onClick={() => handleTabChange('all')}
                  className={`px-3 py-1.5 text-[10px] md:text-xs uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer flex-shrink-0 ${
                    activeTab === 'all'
                      ? 'bg-white/10 text-white'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleTabChange('nft')}
                  className={`px-3 py-1.5 text-[10px] md:text-xs uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer flex-shrink-0 ${
                    activeTab === 'nft'
                      ? 'bg-white/10 text-brand-cyan'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🦋 Wallet NFT
                </button>
                <button
                  onClick={() => handleTabChange('vault')}
                  className={`px-3 py-1.5 text-[10px] md:text-xs uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer flex-shrink-0 relative ${
                    activeTab === 'vault'
                      ? 'bg-white/10 text-[#14F195]'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🔒 No-Cost Staking
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14F195] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#14F195]"></span>
                  </span>
                </button>
                <button
                  onClick={() => handleTabChange('pool')}
                  className={`px-3 py-1.5 text-[10px] md:text-xs uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer flex-shrink-0 ${
                    activeTab === 'pool'
                      ? 'bg-white/10 text-brand-purple'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  📊 Weekly Pool
                </button>
                <button
                  onClick={() => handleTabChange('faucet')}
                  className={`px-3 py-1.5 text-[10px] md:text-xs uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer flex-shrink-0 ${
                    activeTab === 'faucet'
                      ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/10'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🚰 Karma Faucet
                </button>
                <button
                  onClick={() => handleTabChange('predictions')}
                  className={`px-3 py-1.5 text-[10px] md:text-xs uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer flex-shrink-0 ${
                    activeTab === 'predictions'
                      ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/10'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                  id="btn-explore-predictions-tab"
                >
                  🔮 Karma Predictions
                </button>
                <button
                  onClick={() => handleTabChange('faq')}
                  className={`px-3 py-1.5 text-[10px] md:text-xs uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer flex-shrink-0 ${
                    activeTab === 'faq'
                      ? 'bg-brand-emerald/20 text-[#14F195] border border-brand-emerald/10'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  📖 FAQ &amp; Vision
                </button>
                <button
                  onClick={() => handleTabChange('about')}
                  className={`px-3 py-1.5 text-[10px] md:text-xs uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer flex-shrink-0 ${
                    activeTab === 'about'
                      ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/10'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🦋 About Movement
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Wallet Element */}
          <div className="hidden md:flex items-center gap-3">
            <WalletConnect
              wallet={wallet}
              onConnect={handleConnectWallet}
              onDisconnect={handleDisconnectWallet}
              onAirdrop={handleAirdropSol}
            />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-8 w-full space-y-8 flex-grow">
        
        {/* AUTOMATED BLOCKCHAIN HOLDINGS SCANNER PANEL */}
        {isAutoScanning && (
          <div className="bg-black/80 border border-brand-cyan/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(20,241,149,0.08)] relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Ambient neon laser slide effect */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-cyan to-transparent animate-pulse" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-brand-cyan animate-ping shrink-0" />
                  <span className="text-[10px] uppercase font-black tracking-wider text-brand-cyan font-mono">AUTOMATED BLOCK DEEP METAPLEX SCANNER CURRENTLY ACTIVE</span>
                </div>
                <h3 className="text-lg font-black text-white italic tracking-tight uppercase">Scanning Active Wallet Addresses</h3>
                <p className="text-xs text-white/50 font-mono leading-relaxed" id="auto-scan-message-readout">
                  ⚡ STATUS: <span className="text-brand-cyan font-bold">{autoScanStep}</span>
                </p>
              </div>

              <div className="w-full md:w-64 space-y-2">
                <div className="flex justify-between text-[10px] font-mono text-white/40">
                  <span>Ledger Handshake</span>
                  <span className="text-brand-cyan animate-pulse">Scanning...</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple rounded-full animate-pulse" style={{ width: '100%', animationDuration: '0.8s' }} />
                </div>
              </div>
            </div>
          </div>
        )}



        {/* DUAL TIMEZONE & ORACLE LIVE COUNTDOWNS HUD (ALWAYS VISIBLE) */}
        <div className="bg-[#0f0f13] border border-brand-cyan/10 rounded-2xl p-5 md:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative overflow-hidden animate-in fade-in duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="hidden sm:flex absolute top-2 right-2 md:top-3 md:right-3 items-center gap-1.5 opacity-80 z-10">
            {wallet.connected ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-mono tracking-widest text-[#14F195] uppercase font-bold">Cloud Live Sync Connected</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/50 animate-pulse" />
                <span className="text-[9px] font-mono tracking-widest text-amber-400 uppercase font-bold">Waiting for Wallet Connection...</span>
              </>
            )}
          </div>

          {/* Local Time HUD */}
          <div className="space-y-1 pr-4 sm:border-r border-white/5">
            <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono block font-bold">Local Device Clock</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-brand-cyan tracking-tight font-mono">{localTime || '00:00:00'}</span>
              <span className="text-[10px] font-bold text-white/40 font-mono">{localTimezone || 'UTC'}</span>
            </div>
            <p className="text-[10px] text-white/30 leading-tight font-sans">Matched cryptographically to user system timezone offset.</p>
          </div>

          {/* Passive Karma Accrual */}
          <div className="space-y-1 pr-4 md:border-r border-white/5">
            <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono block font-bold">Passive Accrual Pulse</span>
            {wallet.connected ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-[#14F195] tracking-tight font-mono">+1 KP</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan font-mono animate-pulse">Every 1s</span>
                </div>
                <p className="text-[10px] text-white/30 leading-tight font-sans">Increments automatically via idle RPC client pool.</p>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-white/20 tracking-tight font-mono">0 KP/s</span>
                </div>
                <p className="text-[10px] text-amber-400/70 leading-tight font-sans">Connect wallet to activate real-time passive token accumulation.</p>
              </div>
            )}
          </div>

          {/* Cooldown to Daily Grant */}
          <div className="space-y-1 pr-4 sm:border-r border-white/5">
            <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono block font-bold">Daily Grant Cooldown</span>
            <div>
              {!wallet.connected ? (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white/30 flex items-center gap-1 font-mono uppercase tracking-tight">
                    ⏳ Wallet Disconnected
                  </span>
                  <p className="text-[10px] text-white/30 leading-tight font-sans">Required to unlocked free +100k KP claims.</p>
                </div>
              ) : dailyClaimCooldown > 0 ? (
                <div className="space-y-0.5">
                  <span className="text-xl font-black text-amber-400 tracking-tight font-mono">
                    {formatDuration(dailyClaimCooldown)}
                  </span>
                  <span className="block text-[8px] text-amber-400/60 font-bold uppercase tracking-widest font-mono">⏳ Security Lockout</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-xs font-black text-emerald-400 flex items-center gap-1 tracking-tight">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" /> Ready to Claim
                  </span>
                  <button 
                    onClick={handleClaimFreeDaily}
                    className="text-[9px] font-mono tracking-widest font-black uppercase text-black bg-gradient-to-r from-brand-cyan to-[#14F195] px-2.5 py-1 rounded hover:brightness-115 transition-all cursor-pointer"
                  >
                    CLAIM +100k KP
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Pool Countdown */}
          <div className="space-y-1">
            <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono block font-bold">Weekly Pool Epoch</span>
            <div className="space-y-0.5">
              <span className="text-xl font-black text-brand-purple tracking-tight font-mono">
                {formatWeeklyCooldown(weeklyPoolCooldown)}
              </span>
              <p className="text-[10px] text-white/30 leading-tight block font-sans">Yield algorithm executes tax payback distribution.</p>
            </div>
          </div>
        </div>

        {/* NO-COST STAKING SELLING POINT PROMOTION BANNER */}
        <div className="bg-gradient-to-r from-[#14F195]/10 via-brand-cyan/10 to-brand-purple/10 border border-[#14F195]/20 rounded-2xl p-5 md:p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5 shadow-lg shadow-[#14F195]/5 mb-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#14F195]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="bg-[#14F195]/20 text-[#14F195] text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono border border-[#14F195]/30">
                🎉 100% No-Cost Staking
              </span>
              <span className="text-white/40 text-[10px]">•</span>
              <span className="text-brand-cyan text-[10px] font-mono font-bold uppercase tracking-wider">Zero Token Deposit Required</span>
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Earn rewards without upfront capital: Show Up, Claim &amp; Stake!
            </h3>
            <p className="text-[11px] text-white/60 leading-relaxed max-w-2xl">
              While you connect your wallet just like you will when we are production-ready, you never have to make any token deposits or spend real cryptocurrency. Just claim free Karma Power (KP) from our sandbox faucet, and start staking instantly to earn community distribution weights. Perfect, fun, and completely free of cost!
            </p>
          </div>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              if (!wallet.connected) {
                window.dispatchEvent(new CustomEvent('toggle-wallet-dialog'));
              }
              handleTabChange('vault');
            }}
            className="w-full md:w-auto bg-[#14F195] hover:bg-[#14F195]/90 text-black px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shadow-md shadow-[#14F195]/20"
          >
            🔒 Earn Without Initial Capital
          </button>
        </div>

        {/* ECOSYSTEM STEP-BY-STEP WALKTHROUGH (DYNAMIC post-connection/pre-connection tracker) */}
        <div className="bg-[#0c0c11]/95 border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-2xl">
          {/* Ambient glowing halos */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-cyan/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-purple/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-white/5 pb-6 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-[9px] font-mono font-black tracking-widest uppercase">
                  Ecosystem Companion Guide
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14F195] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#14F195]"></span>
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase italic flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-cyan animate-pulse" />
                {wallet.connected ? 'Your Next Ecosystem Operations' : 'How to Operate the Karma Butterfly Protocol'}
              </h2>
              <p className="text-xs text-white/50 max-w-3xl leading-relaxed">
                {wallet.connected 
                  ? 'Fantastic, your wallet is synced! Fulfill the remaining onboarding objectives below to fully experience our high-transparency sandbox mechanics.'
                  : 'Welcome to the sandbox! To experience gamified DeFi coordination, follow this step-by-step walkthrough. All mock transactions are securely synchronized on your private Firestore ledger.'}
              </p>
            </div>

            {/* Walkthrough completion rate */}
            {wallet.connected && (
              <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 min-w-[160px] text-center font-mono relative shrink-0">
                <span className="text-[8px] uppercase font-bold text-white/40 block mb-1 font-sans">Walkthrough Progress</span>
                <span className="text-lg text-brand-cyan font-black">
                  {(() => {
                    let done = 0;
                    if (dailyClaimCooldown > 0 || lastClaimedTimestamp !== null) done++;
                    if (nft) done++;
                    if (staking.amountStaked > 0) done++;
                    if (hasSimulatedPool || hasMadePrediction) done++;
                    return `${done} / 4 Tasks`;
                  })()}
                </span>
                <div className="h-1.5 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple transition-all duration-500 rounded-full" 
                    style={{ 
                      width: `${(() => {
                        let done = 0;
                        if (dailyClaimCooldown > 0 || lastClaimedTimestamp !== null) done++;
                        if (nft) done++;
                        if (staking.amountStaked > 0) done++;
                        if (hasSimulatedPool || hasMadePrediction) done++;
                        return (done / 4) * 100;
                      })()}%` 
                    }} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Guide Steps Cards */}
          {!wallet.connected ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {/* Step 1: Link Wallet */}
              <div className="bg-white/[0.02] border border-brand-cyan/20 rounded-xl p-5 space-y-3 relative flex flex-col justify-between hover:border-brand-cyan/40 transition-all">
                <div className="space-y-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan flex items-center justify-center text-xs font-black font-mono">
                    01
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-brand-cyan" /> Link Simulated Wallet
                  </h3>
                  <p className="text-[11px] text-white/40 leading-relaxed font-sans">
                    Choose Solflare, Phantom, or Backpack. Live Firebase synchronization instantly restores your saved balances, stakings, and metrics from previous sessions.
                  </p>
                </div>
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('toggle-wallet-dialog'));
                  }}
                  className="w-full bg-[#14F195] hover:bg-[#14F195]/90 text-black font-sans font-black text-[11px] uppercase tracking-wider py-3 rounded-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-[#14F195]/20"
                >
                  Connect Wallet
                </button>
              </div>

              {/* Step 2: Mint Genesis Butterfly */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-3 relative flex flex-col justify-between opacity-70">
                <div className="space-y-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/40 flex items-center justify-center text-xs font-black font-mono">
                    02
                  </div>
                  <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">
                    Mint Genesis Butterfly NFT
                  </h3>
                  <p className="text-[11px] text-white/40 leading-relaxed font-sans">
                    Unlock the core controller. If a security key is not found, select our interactive mint option. You will obtain a custom-named Butterfly with custom rarity and weight multipliers!
                  </p>
                </div>
                <span className="text-[9px] uppercase font-bold text-white/30 text-center block bg-white/5 py-2 rounded-lg border border-white/5">
                  Waiting for Wallet...
                </span>
              </div>

              {/* Step 3: Claim & Stake */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-3 relative flex flex-col justify-between opacity-70">
                <div className="space-y-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/40 flex items-center justify-center text-xs font-black font-mono">
                    03
                  </div>
                  <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">
                    Claim KP Power &amp; Stake
                  </h3>
                  <p className="text-[11px] text-white/40 leading-relaxed font-sans">
                    Fulfill daily tasks for an automatic 100k KP grant, stack locking weights inside the Staking Vault, handle dev buybacks, or simulate weekly epoch SOL splits.
                  </p>
                </div>
                <span className="text-[9px] uppercase font-bold text-white/30 text-center block bg-white/5 py-2 rounded-lg border border-white/5">
                  Waiting for Wallet...
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {/* Connected Step 1: Claim Free Daily KP */}
              {(() => {
                const isClaimed = dailyClaimCooldown > 0 || lastClaimedTimestamp !== null;
                return (
                  <div className={`rounded-xl p-5 space-y-3 flex flex-col justify-between transition-all border ${
                    isClaimed 
                      ? 'bg-emerald-500/[0.02] border-emerald-500/20 hover:border-emerald-500/30' 
                      : 'bg-white/[0.02] border-brand-cyan/20 hover:border-brand-cyan/40'
                  }`}>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black font-mono ${
                          isClaimed ? 'bg-emerald-500/10 text-[#14F195]' : 'bg-brand-cyan/10 text-brand-cyan'
                        }`}>
                          01
                        </span>
                        {isClaimed && <span className="text-[9px] uppercase font-mono font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">Claimed</span>}
                      </div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Coins className={`w-3.5 h-3.5 ${isClaimed ? 'text-emerald-400' : 'text-brand-cyan'}`} /> Claim Daily Grant
                      </h3>
                      <p className="text-[11px] text-white/40 leading-relaxed font-sans">
                        Collect your daily 100,000 Karma Power (KP) grant to load up your wallet balances for staking.
                      </p>
                    </div>
                    {isClaimed ? (
                      <div className="flex items-center justify-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 py-2 rounded-lg text-[9px] font-mono uppercase tracking-wider font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span>+100,000 KP Secured</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleClaimFreeDaily}
                        className="w-full bg-gradient-to-r from-brand-cyan to-brand-emerald hover:brightness-110 text-black font-mono font-black text-[10px] uppercase tracking-wider py-2 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1"
                      >
                        <Zap className="w-3 h-3 fill-current" />
                        <span>Claim +100k KP</span>
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* Connected Step 2: Acquire/Verify Butterfly NFT */}
              {(() => {
                const hasNFT = nft !== null;
                return (
                  <div className={`rounded-xl p-5 space-y-3 flex flex-col justify-between transition-all border ${
                    hasNFT 
                      ? 'bg-emerald-500/[0.02] border-emerald-500/20 hover:border-emerald-500/30' 
                      : 'bg-white/[0.02] border-brand-purple/20 hover:border-brand-purple/40'
                  }`}>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black font-mono ${
                          hasNFT ? 'bg-emerald-500/10 text-[#14F195]' : 'bg-brand-purple/10 text-brand-purple'
                        }`}>
                          02
                        </span>
                        {hasNFT && <span className="text-[9px] uppercase font-mono font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">Verified</span>}
                      </div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className={`w-3.5 h-3.5 ${hasNFT ? 'text-emerald-400' : 'text-brand-purple'}`} /> Acquire Butterfly
                      </h3>
                      <p className="text-[11px] text-white/40 leading-relaxed font-sans">
                        Verify or mint a custom Karma Butterfly NFT. This acts as your direct staking multiplier key.
                      </p>
                    </div>
                    {hasNFT ? (
                      <div className="flex flex-col items-center gap-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 py-1.5 rounded-lg text-center font-mono text-[9px] uppercase tracking-wider font-bold">
                        <div className="flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate max-w-[120px]">{nft.name}</span>
                        </div>
                        <span className="text-emerald-400/70 text-[8px] font-normal">Active Multiplier: {nft.multiplier}x</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleTabChange('nft')}
                        className="w-full bg-brand-purple hover:brightness-110 text-white font-mono font-black text-[10px] uppercase tracking-wider py-2 rounded-lg cursor-pointer transition-all"
                      >
                        Mint Butterfly
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* Connected Step 3: Stake in Vault */}
              {(() => {
                const isStaking = staking.amountStaked > 0;
                return (
                  <div className={`rounded-xl p-5 space-y-3 flex flex-col justify-between transition-all border ${
                    isStaking 
                      ? 'bg-emerald-500/[0.02] border-emerald-500/20 hover:border-emerald-500/30' 
                      : 'bg-white/[0.02] border-brand-emerald/20 hover:border-brand-emerald/40'
                  }`}>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black font-mono ${
                          isStaking ? 'bg-emerald-500/10 text-[#14F195]' : 'bg-brand-emerald/10 text-[#14F195]'
                        }`}>
                          03
                        </span>
                        {isStaking && <span className="text-[9px] uppercase font-mono font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">Staked</span>}
                      </div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className={`w-3.5 h-3.5 ${isStaking ? 'text-emerald-400' : 'text-[#14F195]'}`} /> Staking Vault
                      </h3>
                      <p className="text-[11px] text-white/40 leading-relaxed font-sans">
                        Deposit and lock your Karma Power inside the Staking Vault to begin accumulating rewards.
                      </p>
                    </div>
                    {isStaking ? (
                      <div className="flex flex-col items-center gap-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 py-1.5 rounded-lg text-center font-mono text-[9px] uppercase tracking-wider font-bold">
                        <div className="flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>{staking.amountStaked.toLocaleString()} KP</span>
                        </div>
                        <span className="text-emerald-400/70 text-[8px] font-normal">Vault Rate: {staking.multiplier.toFixed(4)}x</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleTabChange('vault')}
                        className="w-full bg-[#14F195] hover:brightness-110 text-black font-mono font-black text-[10px] uppercase tracking-wider py-2 rounded-lg cursor-pointer transition-all"
                      >
                        Go to Vault
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* Connected Step 4: Predictions & Simulation */}
              {(() => {
                const isPredicted = hasMadePrediction;
                const isSimulated = hasSimulatedPool;
                const isAllDone = isPredicted && isSimulated;
                return (
                  <div className={`rounded-xl p-5 space-y-3 flex flex-col justify-between transition-all border ${
                    isAllDone 
                      ? 'bg-emerald-500/[0.02] border-emerald-500/20 hover:border-emerald-500/30' 
                      : 'bg-white/[0.02] border-brand-gold/20 hover:border-brand-gold/40'
                  }`}>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black font-mono ${
                          isAllDone ? 'bg-emerald-500/10 text-[#14F195]' : 'bg-brand-gold/10 text-brand-gold'
                        }`}>
                          04
                        </span>
                        {isAllDone && <span className="text-[9px] uppercase font-mono font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">All Done</span>}
                      </div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Compass className={`w-3.5 h-3.5 ${isAllDone ? 'text-emerald-400' : 'text-brand-gold'}`} /> Predictions &amp; Pool
                      </h3>
                      <p className="text-[11px] text-white/40 leading-relaxed font-sans">
                        Predict ethical outcomes in the lobby and execute a mock weekly pool distribution.
                      </p>
                      
                      {/* Individual sub-checkmarks for Step 4 */}
                      <div className="space-y-1 pt-1 text-[10px] font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[7px] ${isPredicted ? 'bg-emerald-500/20 text-[#14F195] border border-emerald-500/30' : 'bg-white/5 text-white/20 border border-white/5'}`}>
                            {isPredicted ? '✓' : '•'}
                          </span>
                          <span className={isPredicted ? 'text-emerald-400/80 font-semibold' : 'text-white/30'}>Submit Philosophy Choice</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[7px] ${isSimulated ? 'bg-emerald-500/20 text-[#14F195] border border-emerald-500/30' : 'bg-white/5 text-white/20 border border-white/5'}`}>
                            {isSimulated ? '✓' : '•'}
                          </span>
                          <span className={isSimulated ? 'text-emerald-400/80 font-semibold' : 'text-white/30'}>Simulate Weekly Pool Epoch</span>
                        </div>
                      </div>
                    </div>
                    
                    {!isAllDone && (
                      <div className="flex gap-1.5">
                        {!isPredicted && (
                          <button
                            onClick={() => handleTabChange('predictions')}
                            className="flex-1 bg-brand-purple/20 hover:bg-brand-purple/35 text-white border border-brand-purple/30 font-mono font-black text-[9px] uppercase tracking-wider py-2 rounded-lg cursor-pointer transition-all text-center"
                          >
                            Predict
                          </button>
                        )}
                        {!isSimulated && (
                          <button
                            onClick={() => {
                              handleTabChange('all');
                              setTimeout(() => {
                                const poolSection = document.getElementById('btn-simulate-weekly-distribution');
                                if (poolSection) {
                                  poolSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                              }, 250);
                            }}
                            className="flex-1 bg-brand-gold/20 hover:bg-brand-gold/35 text-brand-gold border border-brand-gold/30 font-mono font-black text-[9px] uppercase tracking-wider py-2 rounded-lg cursor-pointer transition-all text-center"
                          >
                            Simulate
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* SCROLL TARGET FOR PRECISE TAB NAVIGATION */}
        <div id="active-tab-content-anchor" className="scroll-mt-[135px] md:scroll-mt-[85px]" />

        {/* CONDITIONALLY RENDER CONTENT CHUNKS BASED ON ACTIVE TAB */}
        {wallet.connected ? (
          <>
            {activeTab === 'all' && (
          <div className="space-y-8 animate-in fade-in duration-300 font-sans">
            {/* UPPER DASHBOARD: Active Key NFT holder & Vault */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* LEFT COMPONENT: NFT Core Holder verification */}
              <div className="lg:col-span-5 h-full">
                <ButterflyNFTCard
                  nft={nft}
                  wallet={wallet}
                  onMint={handleMintNFT}
                  onUnlinkNFT={() => setNft(null)}
                  onConnectWallet={() => {
                    window.dispatchEvent(new CustomEvent('toggle-wallet-dialog'));
                  }}
                />
              </div>

              {/* RIGHT COMPONENT: Staking Power Vault */}
              <div className="lg:col-span-7 h-full">
                <KarmaVault
                  wallet={wallet}
                  nft={nft}
                  staking={staking}
                  onStake={handleStakeKarma}
                  onUnstake={handleUnstakeKarma}
                  claimableKarma={claimableKarma}
                  onClaimKarmaTrickle={() => setClaimableKarma((prev) => prev + 500)} // quick testing claims
                  onClaimDailyFree={handleClaimFreeDaily}
                  dailyClaimCooldown={dailyClaimCooldown}
                  isAutoScanning={isAutoScanning}
                />
              </div>
            </div>

            {/* LOWER SECTION: Weekly pool breakdown & Event stream */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* WEELKY POOL DATA VISUALIZATION: TRANSPARENCY FIRST */}
              <div className="lg:col-span-8 h-full">
                <WeeklyKarmaPool
                  distribution={poolDistribution}
                  wallet={wallet}
                  staking={staking}
                  onSetPoolSize={setPoolSize}
                  onSimulateDistribution={handleSimulateWeeklyDistribution}
                />
              </div>

              {/* ACTIVE FEED & DEV OFFER PORTAL */}
              <div className="lg:col-span-4 h-full">
                <ActivityFeed
                  logs={logs}
                  activeOffer={activeOffer}
                  wallet={wallet}
                  staking={staking}
                  onAcceptOffer={handleAcceptDevOffer}
                  onDeclineOffer={handleDeclineDevOffer}
                  onManualTriggerOffer={triggerNewBubbleOffer}
                />
              </div>
            </div>
          </div>
        )}

        {/* STANDALONE NFT MINTER TAB */}
        {activeTab === 'nft' && (
          <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-200">
            <ButterflyNFTCard
              nft={nft}
              wallet={wallet}
              onMint={handleMintNFT}
              onUnlinkNFT={() => setNft(null)}
              onConnectWallet={() => {
                window.dispatchEvent(new CustomEvent('toggle-wallet-dialog'));
              }}
            />
          </div>
        )}

        {/* STANDALONE STAKING VAULT TAB */}
        {activeTab === 'vault' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200 animate-duration-200">
            <KarmaVault
              wallet={wallet}
              nft={nft}
              staking={staking}
              onStake={handleStakeKarma}
              onUnstake={handleUnstakeKarma}
              claimableKarma={claimableKarma}
              onClaimKarmaTrickle={() => setClaimableKarma((prev) => prev + 500)} // quick testing claims
              onClaimDailyFree={handleClaimFreeDaily}
              dailyClaimCooldown={dailyClaimCooldown}
              isAutoScanning={isAutoScanning}
            />
            {/* Also show mini NFT status context if locker is active */}
            {!nft && (
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 text-center font-sans">
                <span className="text-xs text-white/50 block mb-3">Don&apos;t have a Karma Butterfly NFT yet to start staking?</span>
                <button
                  onClick={() => handleTabChange('nft')}
                  className="bg-brand-cyan text-black px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer"
                >
                  Verify Wallet NFT
                </button>
              </div>
            )}
          </div>
        )}

        {/* STANDALONE WEEKLY POOL TAB */}
        {activeTab === 'pool' && (
          <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-200 animate-duration-200">
            <WeeklyKarmaPool
              distribution={poolDistribution}
              wallet={wallet}
              staking={staking}
              onSetPoolSize={setPoolSize}
              onSimulateDistribution={handleSimulateWeeklyDistribution}
            />
          </div>
        )}

        {/* STANDALONE FAUCET TAB */}
        {activeTab === 'faucet' && (
          <div className="max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-200 animate-duration-200">
            <KarmaFaucet
              wallet={wallet}
              nft={nft}
              claimableKarma={claimableKarma}
              onClaimKarmaDaily={(amount) => {
                setClaimableKarma((prev) => prev + amount);
                const log: ActivityLog = {
                  id: `faucet-claim-${Date.now()}`,
                  type: 'claim_karma',
                  user: wallet.address ? `${wallet.address.slice(0, 6)}...` : 'User',
                  details: `Verified social proof & key signatures. Drip claimed +${amount.toLocaleString()} KP from Controlled Rewards Faucet!`,
                  timestamp: Date.now(),
                };
                setLogs((prev) => [log, ...prev]);
              }}
            />
          </div>
        )}

        {/* STANDALONE PREDICTIONS TAB */}
        {activeTab === 'predictions' && (
          <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-200 animate-duration-200 animate-fade-in animate-duration-300">
            <KarmaPredictions
              wallet={wallet}
              onEarnKarma={(amount) => {
                setClaimableKarma((prev) => prev + amount);
                const log: ActivityLog = {
                  id: `predictions-earned-${Date.now()}`,
                  type: 'claim_karma',
                  user: wallet.address ? `${wallet.address.slice(0, 6)}...` : 'User',
                  details: `Analyzed decentralized outcomes inside predictions lobby. Claimed +${amount.toLocaleString()} KP!`,
                  timestamp: Date.now(),
                };
                setLogs((prev) => [log, ...prev]);
                setHasMadePrediction(true);
              }}
            />
          </div>
        )}
          </>
        ) : (
          /* DISCONNECTED STATE FOR ACTIVE INTERACTIVE TABS */
          (activeTab === 'all' || activeTab === 'nft' || activeTab === 'vault' || activeTab === 'pool' || activeTab === 'faucet' || activeTab === 'predictions') && (
            <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
              {/* THE KARMA GAMES PARTY PROMO CARD */}
              <div className="bg-gradient-to-r from-[#14F195]/15 via-brand-cyan/10 to-brand-purple/15 border border-[#14F195]/20 rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-[#14F195]/5 animate-pulse-once">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#14F195]/5 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-2 text-center md:text-left font-sans">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="bg-[#14F195]/20 text-[#14F195] text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider font-mono border border-[#14F195]/30">
                      🎉 100% No-Cost Staking
                    </span>
                    <span className="text-white/40 text-xs">•</span>
                    <span className="text-brand-cyan text-[10px] font-mono font-bold uppercase tracking-wider">Zero Token Deposit Required</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider italic">
                    Earn rewards without upfront capital: Show Up, Claim &amp; Stake!
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed max-w-2xl">
                    While you connect your wallet just like you will when we are production-ready, you never have to make any token deposits or spend real cryptocurrency. Just claim free Karma Power (KP) from our sandbox faucet, and start staking instantly to earn community distribution weights. Perfect, fun, and completely free of cost!
                  </p>
                </div>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    window.dispatchEvent(new CustomEvent('toggle-wallet-dialog'));
                  }}
                  className="w-full md:w-auto bg-[#14F195] hover:bg-[#14F195]/90 text-black px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shadow-lg shadow-[#14F195]/20 shrink-0 font-sans"
                  id="btn-promo-connect"
                >
                  🔒 Connect Wallet &amp; Earn Rewards
                </button>
              </div>

              {/* DETAILED MOVEMENT SPEC SHEET */}
              <div className="bg-[#0c0c0c]/80 border border-white/5 rounded-xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-brand-cyan" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">The Vilora Labs Partnership</h3>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed font-sans font-normal">
                  By pairing advanced system simulation nodes (designed by the developers at **ViloraLabs.xyz**) with creative gaming logic, we ensure that every community vote, staking weight action, and faucet request is logged instantly. We have eliminated the boring, slow, and expensive aspects of traditional cryptocurrency networks to let you experience the absolute best parts of web decentralization today. 
                </p>
                <div className="flex flex-wrap items-center gap-4 text-[10px] text-white/30 border-t border-white/5 pt-4 font-mono">
                  <span>Developer Sandbox Protocol v2.5</span>
                  <span>•</span>
                  <span>Active Integration: Karma AI</span>
                  <span>•</span>
                  <span>Partnership: <a href="https://viloralabs.xyz" target="_blank" rel="noopener noreferrer" className="text-brand-cyan hover:underline hover:brightness-110">ViloraLabs.xyz</a></span>
                </div>
              </div>
            </div>
          )
        )}

        {/* STANDALONE FAQ, ABOUT & ROADMAP TAB */}
        {activeTab === 'faq' && (
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-300">
            {/* INTRO SPECS CONTAINER */}
            <div className="bg-gradient-to-r from-brand-cyan/10 via-[#14F195]/5 to-brand-purple/10 border border-white/5 rounded-2xl p-6 sm:p-8 relative overflow-hidden font-sans">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/5 rounded-full blur-[80px] pointer-events-none" />
              <div className="max-w-2xl space-y-4">
                <span className="text-[10px] bg-brand-cyan/20 text-brand-cyan font-bold px-2 py-0.5 rounded-full border border-brand-cyan/30 uppercase tracking-widest font-mono">
                  Ecosystem Hub
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase italic leading-none">
                  FAQ, Vision &amp; Roadmap
                </h2>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-sans">
                  Welcome to the decentralization blueprint. This interactive dashboard bridges developer staging simulations with upcoming real world community mint events. Discover our core pillars, review accomplishments, and follow our development track below.
                </p>
              </div>
            </div>

            {/* SECTION: WHY PLAY KARMA GAMES? */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-cyan animate-pulse" />
                <h3 className="text-sm font-black uppercase text-white tracking-widest font-mono">
                  Why Play Karma Games?
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0c0c0c]/80 border border-white/5 rounded-xl p-5 space-y-2.5 hover:border-brand-cyan/35 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 flex items-center justify-center text-brand-cyan">
                    <Coins className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Gamified DeFi Utility &amp; Power
                  </h4>
                  <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                    Traditional DeFi rewards can feel passive and unengaging. Karma Games transforms liquidity and staking models into an active playground. Accumulate Karma Power (KP)—the core utility engine—to direct pools, boost variables, and impact simulated block states.
                  </p>
                </div>

                <div className="bg-[#0c0c0c]/80 border border-white/5 rounded-xl p-5 space-y-2.5 hover:border-brand-emerald/35 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#14F195]/10 flex items-center justify-center text-[#14F195]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Zero-Risk Developer Mirror
                  </h4>
                  <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                    Testing blockchain mechanics is often slow and capital-intensive. With our decentralized Solana Devnet Mirror simulator, you get real-time block feedback (~400ms speed) and high-fidelity local state calculations. You connect your wallet just like you will in production, with zero token deposits or real cryptocurrency required to participate.
                  </p>
                </div>

                <div className="bg-[#0c0c0c]/80 border border-white/5 rounded-xl p-5 space-y-2.5 hover:border-brand-purple/35 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Frictionless Staking Multipliers
                  </h4>
                  <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                    Merge physical scarcity with digital utility. Own, verify, or simulate the mint of legendary Karma Butterflies to unlock permanent weight boosts inside the escrow Staking Vault. Your multiplier elevates every claim, prediction, and weekly distribution share.
                  </p>
                </div>

                <div className="bg-[#0c0c0c]/80 border border-white/5 rounded-xl p-5 space-y-2.5 hover:border-[#14F195]/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center text-[#14F195]">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Decentralized Pool splits
                  </h4>
                  <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                    Experience state-of-the-art gamified voting loops. Direct weekly treasury pool splits dynamically via user votes, configure faucet parameters, and execute prediction matrices in our interactive predictive lobby.
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION: ACCOMPLISHMENTS & LIGHT ROADMAP */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Milestone className="w-5 h-5 text-brand-purple" />
                <h3 className="text-sm font-black uppercase text-white tracking-widest font-mono">
                  Core Roadmap &amp; Progress
                </h3>
              </div>
              <div className="bg-[#0c0c0c]/90 border border-white/5 rounded-xl p-5 sm:p-6 space-y-6">
                <div>
                  <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-mono mb-4">Milestone Progress Timeline</h4>
                  <div className="space-y-5 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
                    {/* Item 1: Accomplished */}
                    <div className="flex items-start gap-4 relative">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 border-2 border-brand-emerald text-brand-emerald flex items-center justify-center text-xs z-10 flex-shrink-0">
                        ✓
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Phase 1: Architecture &amp; Web Platform</span>
                          <span className="text-[8px] bg-emerald-500/20 text-brand-emerald font-bold px-1.5 py-0.5 rounded font-mono uppercase">Done</span>
                        </div>
                        <p className="text-[11px] text-white/45 leading-relaxed font-sans">
                          Constructed premium high-fidelity sandbox dashboard, active developer server-state sync, predictions lobby, staking vault matrices, and local transaction logging systems. Fully active!
                        </p>
                      </div>
                    </div>

                    {/* Item 2: Accomplished */}
                    <div className="flex items-start gap-4 relative">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 border-2 border-brand-emerald text-brand-emerald flex items-center justify-center text-xs z-10 flex-shrink-0 font-bold">
                        ✓
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Phase 2: Community Synergy &amp; Foundations</span>
                          <span className="text-[8px] bg-emerald-500/20 text-brand-emerald font-bold px-1.5 py-0.5 rounded font-mono uppercase">Done</span>
                        </div>
                        <p className="text-[11px] text-white/45 leading-relaxed font-sans">
                          Successfully completed website deployment and initiated strategic alignment, assembling a vibrant digital hub populated with brilliant builders, developers, and visionary blockchain advocates.
                        </p>
                      </div>
                    </div>

                    {/* Item 3: In Progress */}
                    <div className="flex items-start gap-4 relative">
                      <div className="w-6 h-6 rounded-full bg-brand-cyan/20 border-2 border-brand-cyan text-brand-cyan flex items-center justify-center text-xs z-10 flex-shrink-0 animate-pulse font-bold">
                        ●
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Phase 3: Deep Alpha Sandbox Testing</span>
                          <span className="text-[8px] bg-brand-cyan/20 text-brand-cyan font-bold px-1.5 py-0.5 rounded font-mono uppercase">In Progress</span>
                        </div>
                        <p className="text-[11px] text-white/45 leading-relaxed font-sans">
                          Actively gathering diagnostic data from user staking patterns. Fine-tuning Solana devnet mirror speeds and multiplier configurations for extreme balance accuracy.
                        </p>
                      </div>
                    </div>

                    {/* Item 4: Future / Deployment */}
                    <div className="flex items-start gap-4 relative">
                      <div className="w-6 h-6 rounded-full bg-white/5 border-2 border-white/20 text-white/40 flex items-center justify-center text-xs z-10 flex-shrink-0 font-mono">
                        04
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Phase 4: Token Activation &amp; Live Mints</span>
                          <span className="text-[8px] bg-white/5 text-white/40 font-bold px-1.5 py-0.5 rounded font-mono uppercase">Upcoming</span>
                        </div>
                        <p className="text-[11px] text-white/40 leading-relaxed font-sans">
                          We will transition to fully live protocol nodes simultaneously with the release of the official Butterfly Mint sequence. The codebase has been meticulously engineered for minimal execution friction, ready to power-on and translate sandbox profiles into real distributed rewards instantly.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION: ACCORDION INTERACTIVE FAQ */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#14F195]" />
                <h3 className="text-sm font-black uppercase text-white tracking-widest font-mono">
                  Frequently Asked Questions
                </h3>
              </div>

              <div className="space-y-2.5 font-sans">
                {[
                  {
                    q: "What is Karma Power (KP)?",
                    a: "Karma Power (KP) is the fundamental utility and governance weight inside Karma Games. Formally styled as KP, it tracks community validations and acts as lock weight variables within the staking vault. Every task validation, pool simulation, and prediction outcome awards KP directly to active accounts."
                  },
                  {
                    q: "Do I need to deposit Solana tokens or pay to participate?",
                    a: "No! While you will connect your wallet to showcase your profile exactly as you will when the platform is fully production-ready, zero token deposits are required. All features and sandbox interactions run securely on our Solana Devnet Mirror, meaning you can test staking, claim faucets, and vote with absolutely zero financial cost."
                  },
                  {
                    q: "How does the Staking Vault multiplier system work?",
                    a: "Staking lets you lock simulated KP inside our escrow vault. Holding a validated Genesis Butterfly NFT adds a permanent multiplier to your profile's staking rewards weight. For example, a Legendary Butterfly yields massive multipliers, expanding your reward slice during holiday computations."
                  },
                  {
                    q: "What happens during the weekly epoch pool splits?",
                    a: "Each week, the treasury's target distribution pool splits (simulating true SOL rewards) are automatically distributed among all staking vault participants based on their respective KP stake-weight * multiplier allocations. Users can simulate distributions immediately with our developer control options."
                  },
                  {
                    q: "Where is the Karma Games protocol located?",
                    a: "The team and developer ecosystem are based locally at our foster community hubs, collaborating closely with top technical networks to build future DeFi utility models."
                  }
                ].map((item, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div 
                      key={index} 
                      className="bg-[#0c0c0c]/80 border border-white/5 rounded-xl overflow-hidden transition-all duration-250"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.01] transition-all"
                      >
                        <span className="text-xs font-bold text-white uppercase tracking-wide">
                          {item.q}
                        </span>
                        <span className={`text-[12px] font-mono font-bold select-none transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-cyan' : 'text-white/30'}`}>
                          ▼
                        </span>
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-80 border-t border-white/5 p-5' : 'max-h-0'}`}>
                        <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 5TH GRADE LEVEL EXPLANATORY ABOUT TAB */}
        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-300 font-sans">
            {/* INTRO HERO GRID */}
            <div className="bg-gradient-to-br from-brand-cyan/15 via-[#14F195]/5 to-brand-purple/15 border border-white/5 rounded-2xl p-6 sm:p-10 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-80 h-80 bg-brand-cyan/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="max-w-3xl space-y-6">
                <span className="text-[9px] sm:text-[10px] bg-brand-cyan/20 text-brand-cyan font-bold px-2.5 py-1 rounded-full border border-brand-cyan/30 uppercase tracking-widest font-mono">
                  Simple Concept • Made for Everyone
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase italic leading-tight">
                  What is Karma Games?<br />
                  <span className="text-brand-cyan">The Movement Explained Simpler!</span>
                </h2>
                <p className="text-sm text-white/70 leading-relaxed">
                  Have you ever wondered how video games would look if the players owned a piece of the game? Let&apos;s talk about what makes this project special, written in simple everyday language!
                </p>
              </div>
            </div>

            {/* THE THREE CORE PILLARS AT 5TH GRADE LEVEL */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <BookOpen className="w-5 h-5 text-brand-cyan" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white font-mono">
                  The Basics Explained
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pillar 1 */}
                <div className="bg-[#0c0c0c]/90 border border-white/5 rounded-xl p-6 space-y-4 hover:border-brand-cyan/30 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-brand-cyan/15 text-brand-cyan flex items-center justify-center font-bold font-mono text-sm shadow-md">
                    🎮
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    What is Karma Games?
                  </h4>
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    Imagine a digital playground where playing actually keeps making the park bigger and cleaner! Instead of just playing a game where companies take all the fun, **Karma Games** lets players work together, vote on rules, and earn points called **Karma Power (KP)** for being helpful! It is a game we build and enjoy together as a community.
                  </p>
                </div>

                {/* Pillar 2 */}
                <div className="bg-[#0c0c0c]/90 border border-white/5 rounded-xl p-6 space-y-4 hover:border-brand-emerald/30 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-[#14F195]/15 text-[#14F195] flex items-center justify-center font-bold font-mono text-sm shadow-md">
                    🦋
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    What are Karma Butterflies?
                  </h4>
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    Think of these as super shiny, ultra-rare digital pets or magical toy keys! owning or simulating a **Karma Butterfly** turns on a multiplier for your profile. Your magical butterfly gives your account super-strength, multiplying your score weight and letting you claim extra points from the community prize vault!
                  </p>
                </div>

                {/* Pillar 3 */}
                <div className="bg-[#0c0c0c]/90 border border-white/5 rounded-xl p-6 space-y-4 hover:border-brand-purple/30 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-brand-purple/15 text-brand-purple flex items-center justify-center font-bold font-mono text-sm shadow-md">
                    🚀
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    The Movement
                  </h4>
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    Right now, huge corporations own the internet and make all the rules. Karma AI and the developers at <a href="https://viloralabs.xyz" target="_blank" rel="noopener noreferrer" className="text-brand-cyan underline hover:brightness-110">ViloraLabs.xyz</a> are leading a friendly revolution! We believe the players should hold the controller. This is an exciting movement to build games that are transparent, fair, and controlled by human hearts instead of greed!
                  </p>
                </div>
              </div>
            </div>

            {/* DETAILED MOVEMENT SPEC SHEET */}
            <div className="bg-[#0c0c0c]/80 border border-white/5 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-brand-cyan" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">The Vilora Labs Partnership</h3>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                By pairing advanced system simulation nodes (designed by the developers at **ViloraLabs.xyz**) with creative gaming logic, we ensure that every community vote, staking weight action, and faucet request is logged instantly. We have eliminated the boring, slow, and expensive aspects of traditional cryptocurrency networks to let you experience the absolute best parts of web decentralization today. 
              </p>
              <div className="flex flex-wrap items-center gap-4 text-[10px] text-white/30 border-t border-white/5 pt-4 font-mono">
                <span>Developer Sandbox Protocol v2.5</span>
                <span>•</span>
                <span>Active Integration: Karma AI</span>
                <span>•</span>
                <span>Partnership: <a href="https://viloralabs.xyz" target="_blank" rel="noopener noreferrer" className="text-brand-cyan hover:underline hover:brightness-110">ViloraLabs.xyz</a></span>
              </div>
            </div>
          </div>
        )}

        {/* INTERMEDIATE CONGENIAL EVENT BLOCK FOR TESTING */}
        {wallet.connected && (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center animate-in fade-in duration-300 mt-10">
            <div className="lg:col-span-2 space-y-1 font-sans">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-purple animate-ping" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Developer Sandbox Console</h3>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                Interact directly with test triggers to experience custom game events! Increase the pool size, drop simulated daily grants, trigger dev contract buyout bubbles, and claim direct SOL transfers.
              </p>
            </div>

            <div className="flex flex-wrap lg:justify-end gap-2 shrink-0">
              <button
                onClick={() => setClaimableKarma((prev) => prev + 15000)}
                className="px-3.5 py-2 text-[10px] uppercase tracking-wider font-bold bg-black/40 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all cursor-pointer"
                id="btn-add-sim-karma"
              >
                +15,000 KP
              </button>
              <button
                onClick={triggerNewBubbleOffer}
                disabled={activeOffer !== null}
                className="px-3.5 py-2 text-[10px] uppercase tracking-wider font-bold bg-brand-purple/10 text-brand-purple border border-brand-purple/20 rounded-lg hover:bg-brand-purple hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                id="btn-cheat-trigger-bubble"
              >
                Trigger Karma Bubble
              </button>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER TRANSPARENCY DECLARATION */}
      <footer className="mt-16 border-t border-white/5 py-10 text-xs text-white/30 font-sans">
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          {/* Top Row: Links and Location */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] border-b border-white/[0.03] pb-6">
            <div className="flex flex-wrap items-center gap-6 justify-center">
              <a
                href="https://karmabutterfly.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-[#14F195] transition-colors font-bold uppercase tracking-wider"
              >
                karmabutterfly.xyz
              </a>
              <a
                href="https://karmascore.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-brand-purple transition-colors font-bold uppercase tracking-wider"
              >
                karmascore.xyz
              </a>
            </div>
            <div className="text-center md:text-right">
              <span className="block text-[8px] text-white/30 uppercase tracking-widest font-mono">Location</span>
              <span className="font-semibold text-white/70">Based at foster community</span>
            </div>
          </div>

          {/* Middle Row: Protocol Verification */}
          <div className="flex flex-col items-center gap-2 pt-2 text-center">
            <div className="flex items-center gap-1.5 text-white/50 justify-center">
              <ShieldCheck className="w-4 h-4 text-brand-emerald" />
              <span className="font-bold text-[10px] uppercase tracking-wider">Decentralized High-Trust Sandbox Protocol</span>
            </div>
            <p className="max-w-xl mx-auto leading-relaxed text-[10px] text-white/40">
              This program acts as a secure, high-fidelity developer simulator of the Karma Butterfly economy. No real blockchain keys, wallets, or cryptocurrency are spent or lost. All logic runs locally to maximize staging execution speed.
            </p>
          </div>

          {/* Bottom Row: Specs & Attribution */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-white/30 border-t border-white/[0.03] pt-6 font-mono">
            <div className="flex items-center gap-1.5 justify-center">
              <span>Powered by Solana Devnet Mirror</span>
              <span>•</span>
              <span>Est. Block Time ~400ms</span>
            </div>
            <div className="text-center md:text-right font-sans text-[11px] text-white/50">
              A product built by <span className="font-semibold text-white/80">karma ai</span> &amp; <span className="font-semibold text-white/80">Vilora labs</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
