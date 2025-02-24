import { Client } from "../client";
import { Config } from '../../index';
import { TxFee } from "../transaction";
export declare class TronClient extends Client {
    protected rpcUrl: string;
    protected tronWeb: any;
    protected address: string;
    private tokenContracts;
    private poolContracts;
    private ddContracts;
    private minterContracts;
    private chainId;
    private energyFee;
    private tokenSymbols;
    private tokenDecimals;
    private ddContractAddresses;
    private supportedMethods;
    constructor(rpc: string, privateKey: string, config: Config);
    haltClient(): void;
    private contractCallRetry;
    private commonRpcRetry;
    protected getTokenContract(tokenAddress: string): Promise<any>;
    protected getPoolContract(poolAddress: string): Promise<any>;
    protected getDdContract(ddQueueAddress: string): Promise<any>;
    protected getMinterContract(minterAddress: string): Promise<any>;
    private isMethodSupportedByContract;
    getChainId(): Promise<number>;
    getBlockNumber(): Promise<number>;
    getTokenName(tokenAddress: string): Promise<string>;
    decimals(tokenAddress: string): Promise<number>;
    baseUnit(): string;
    toBaseUnit(humanAmount: string): bigint;
    fromBaseUnit(baseAmount: bigint): string;
    toBaseTokenUnit(tokenAddress: string, humanAmount: string): Promise<bigint>;
    fromBaseTokenUnit(tokenAddress: string, baseAmount: bigint): Promise<string>;
    validateAddress(address: string): boolean;
    getAddress(): Promise<string>;
    getBalance(): Promise<bigint>;
    getTokenBalance(tokenAddress: string): Promise<bigint>;
    getTokenNonce(tokenAddress: string): Promise<number>;
    allowance(tokenAddress: string, spender: string): Promise<bigint>;
    estimateTxFee(): Promise<TxFee>;
    sendTransaction(to: string, amount: bigint, data: string, selector: string): Promise<string>;
    transfer(to: string, amount: bigint): Promise<string>;
    transferToken(tokenAddress: string, to: string, amount: bigint): Promise<string>;
    approve(tokenAddress: string, spender: string, amount: bigint): Promise<string>;
    increaseAllowance(tokenAddress: string, spender: string, additionalAmount: bigint): Promise<string>;
    mint(minterAddress: string, amount: bigint): Promise<string>;
    sign(data: string): Promise<string>;
    signTypedData(data: any): Promise<string>;
    getDirectDepositContract(poolAddress: string): Promise<string>;
    directDeposit(poolAddress: string, amount: bigint, zkAddress: string): Promise<string>;
    private truncateHexPrefix;
    private addHexPrefix;
    private fetchChainIdFrom;
    private getEnergyCost;
    private getAccountEnergy;
    private verifyAndSendTx;
}
