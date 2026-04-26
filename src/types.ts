export interface KlockConfig {
    readonly contractAddress: string;
    readonly contractName: string;
    readonly network: 'mainnet' | 'testnet';
}

export interface RawKlockState {
    readonly currentTick: number;
    readonly lastUpdatedBlock: number;
    readonly isActive: boolean;
}

export interface LiveKlockState extends RawKlockState {
    readonly blocksElapsed: number;
    readonly estimatedDecay: number;
    readonly isStale: boolean;
}
