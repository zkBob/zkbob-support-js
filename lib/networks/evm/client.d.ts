import { TxFee } from '../../networks/transaction';
import { Client } from '../../networks/client';
import HDWalletProvider from '@truffle/hdwallet-provider';
import { Config } from '../../index';
export declare class EthereumClient extends Client {
    private provider?;
    private web3;
    private token;
    private minter;
    private pool;
    private dd;
    private ddContractAddresses;
    private tokenDecimals;
    gasMultiplier: number;
    constructor(provider: HDWalletProvider, config?: Config);
    haltClient(): void;
    private contractCallRetry;
    private commonRpcRetry;
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
    estimateTxFee(txObject?: any): Promise<TxFee>;
    private getNativeNonce;
    private signAndSendTx;
    sendTransaction(to: string, amount: bigint, data: string): Promise<string>;
    transfer(to: string, amount: bigint): Promise<string>;
    transferToken(tokenAddress: string, to: string, amount: bigint): Promise<string>;
    approve(tokenAddress: string, spender: string, amount: bigint): Promise<string>;
    increaseAllowance(tokenAddress: string, spender: string, additionalAmount: bigint): Promise<string>;
    mint(minterAddress: string, amount: bigint): Promise<string>;
    sign(data: string): Promise<string>;
    signTypedData(data: object): Promise<string>;
    getDirectDepositContract(poolAddress: string): Promise<string>;
    directDeposit(poolAddress: string, amount: bigint, zkAddress: string): Promise<string>;
}
