/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RarityType = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Cosmic';

export interface KarmaButterflyNFT {
  id: string;
  name: string;
  rarity: RarityType;
  wingsStyle: 'Prism' | 'Matrix' | 'Cosmic' | 'Solar' | 'Abyss';
  multiplier: number; // e.g. 1.2, 1.8, 2.5, 3.5, 5.0
  color: string; // Tailwind glow class/hex representation
  imageHue: number; // Degree rotation for aesthetic variation
  wingsFlapSpeed: string; // animation speed e.g., '1s', '0.5s', etc.
  mintTimestamp: number;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  solBalance: number;
  walletName: 'Phantom' | 'Solflare' | 'Backpack' | null;
}

export interface StakingState {
  amountStaked: number; // Karma Power staked
  multiplier: number; // Current multiplier that scales based on time
  maxMultiplier: number; // Multiplier capped based on NFT and time
  stakingStartTimestamp: number | null;
  accumulatingSince: number;
}

export interface PoolDistribution {
  totalSol: number;
  topPlayersAmt: number; // 60%
  stakersAmt: number;     // 25%
  treasuryAmt: number;    // 10%
  devFundAmt: number;     // 5%
}

export interface DevOffer {
  id: string;
  solOffer: number;
  karmaCost: number;
  message: string;
  expiresInSeconds: number;
}

export interface ActivityLog {
  id: string;
  type: 'mint' | 'stake' | 'unstake' | 'claim_karma' | 'dev_offer_accept' | 'dev_offer_decline' | 'pool_distribution';
  user: string;
  details: string;
  timestamp: number;
}
