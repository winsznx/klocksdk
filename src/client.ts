import { StacksMainnet, StacksTestnet } from '@stacks/network';
import {
    makeContractCall,
    broadcastTransaction,
    callReadOnlyFunction,
    cvToJSON,
    AnchorMode
} from '@stacks/transactions';
import type { KlockConfig, RawKlockState, LiveKlockState } from './types.js';

export class KlockClient {
    public readonly config: Readonly<KlockConfig>;
    public readonly network: StacksMainnet | StacksTestnet;

    constructor(config: KlockConfig) {
        this.config = config;
        this.network = config.network === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
    }

    /**
     * Fetches the raw state of the Klock contract.
     */
    public async getRawState(): Promise<RawKlockState> {
        const response = await callReadOnlyFunction({
            contractAddress: this.config.contractAddress,
            contractName: this.config.contractName,
            functionName: 'get-state',
            functionArgs: [],
            network: this.network,
            senderAddress: this.config.contractAddress,
        });

        const data = cvToJSON(response).value;

        return {
            currentTick: Number(data['current-tick']?.value || 0),
            lastUpdatedBlock: Number(data['last-updated-block']?.value || 0),
            isActive: data['is-active']?.value === true,
        };
    }

    /**
     * Fetches the raw state and computes "Live" metrics based on current block height.
     */
    public async getLiveState(): Promise<LiveKlockState> {
        const rawState = await this.getRawState();
        
        const infoResponse = await fetch(this.network.coreApiUrl + '/v2/info');
        const info = await infoResponse.json();
        const currentBlockHeight = info.stacks_tip_height;

        const blocksElapsed = Math.max(0, currentBlockHeight - rawState.lastUpdatedBlock);
        const estimatedDecay = blocksElapsed * 1;

        return {
            ...rawState,
            blocksElapsed,
            estimatedDecay,
            isStale: blocksElapsed > 144,
        };
    }

    /**
     * Submits a tick action to the contract.
     * @param privateKey The private key of the sender
     */
    public async submitTick(privateKey: string): Promise<string> {
        const txOptions = {
            contractAddress: this.config.contractAddress,
            contractName: this.config.contractName,
            functionName: 'tick',
            functionArgs: [],
            senderKey: privateKey,
            validateWithAbi: true,
            anchorMode: AnchorMode.Any,
            network: this.network,
        };

        const transaction = await makeContractCall(txOptions);
        const broadcastResponse = await broadcastTransaction(transaction, this.network);
        
        if ('error' in broadcastResponse) {
            throw new Error('Broadcast failed: ' + broadcastResponse.error + ' - ' + broadcastResponse.reason);
        }

        return broadcastResponse.txid;
    }
}
