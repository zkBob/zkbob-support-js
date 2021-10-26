import { TransactionData, Proof, Params, SnarkProof, UserAccount, VK } from 'libzeropool-rs-wasm-bundler';
import Web3 from 'web3';
import { HexStringReader, HexStringWriter } from '../../utils';
import { CONSTANTS } from './utils';

// Sizes in bytes
const MEMO_META_SIZE: number = 8; // fee (u64)
const MEMO_META_WITHDRAW_SIZE: number = 8 + 8 + 20; // fee (u64) + amount + address (u160)

export enum TxType {
  Deposit = '00',
  Transfer = '01',
  Withdraw = '02',
}

export function txTypeToString(txType: TxType): string {
  switch (txType) {
    case TxType.Deposit: return 'deposit';
    case TxType.Transfer: return 'transfer';
    case TxType.Withdraw: return 'withdraw';
  }
}

export class EthPrivateTransaction {
  /** Hex encoded smart contract method id */
  public selector: string;
  public nullifier: bigint;
  public outCommit: bigint;
  public transferIndex: bigint;
  public energyAmount: bigint;
  public tokenAmount: bigint;
  public transactProof: bigint[];
  public rootAfter: bigint;
  public treeProof: bigint[];
  public txType: TxType;
  public memo: string;

  static fromData(
    txData: TransactionData,
    txType: TxType,
    acc: UserAccount,
    snarkParams: { transferParams: Params; treeParams: Params; transferVk?: VK; treeVk?: VK; },
    web3: Web3
  ): EthPrivateTransaction {
    const tx = new EthPrivateTransaction();

    const nextIndex = acc.nextTreeIndex() as bigint;
    let curIndex = nextIndex - BigInt(CONSTANTS.OUT + 1);
    if (curIndex < BigInt(0)) {
      curIndex = BigInt(0);
    }

    const prevCommitmentIndex = curIndex / BigInt(2 ** CONSTANTS.OUTLOG);
    const nextCommitmentIndex = acc.nextTreeIndex() as bigint / BigInt(2 ** CONSTANTS.OUTLOG);

    const proofFilled = acc.getCommitmentMerkleProof(prevCommitmentIndex);
    const proofFree = acc.getCommitmentMerkleProof(nextCommitmentIndex);

    const prevLeaf = acc.getMerkleNode(CONSTANTS.OUTLOG, prevCommitmentIndex);
    const rootBefore = acc.getRoot();
    const rootAfter = acc.getMerkleRootAfterCommitment(nextCommitmentIndex, txData.commitment_root);

    const txProof = Proof.tx(snarkParams.transferParams, txData.public, txData.secret);
    const treeProof = Proof.tree(snarkParams.treeParams, {
      root_before: rootBefore,
      root_after: rootAfter,
      leaf: txData.commitment_root,
    }, {
      proof_filled: proofFilled,
      proof_free: proofFree,
      prev_leaf: prevLeaf,
    });

    const txValid = Proof.verify(snarkParams.transferVk!, txProof.inputs, txProof.proof);
    // if (!txValid) {
    //   throw new Error('invalid tx proof');
    // }

    const treeValid = Proof.verify(snarkParams.treeVk!, treeProof.inputs, treeProof.proof);
    // if (!treeValid) {
    //   throw new Error('invalid tree proof');
    // }

    console.log('Validation:', txValid, treeValid);

    tx.selector = web3.eth.abi.encodeFunctionSignature('transact()').slice(2);
    tx.nullifier = BigInt(txData.public.nullifier);
    tx.outCommit = BigInt(txData.public.out_commit);

    tx.transferIndex = BigInt(txData.parsed_delta.index);
    tx.energyAmount = BigInt(txData.parsed_delta.e);
    tx.tokenAmount = BigInt(txData.parsed_delta.v);

    tx.transactProof = flattenSnarkProof(txProof.proof);
    tx.rootAfter = BigInt(rootAfter);
    tx.treeProof = flattenSnarkProof(treeProof.proof);
    tx.txType = txType;

    tx.memo = txData.memo;

    return tx;
  }

  get ciphertext(): string {
    if (this.txType === TxType.Withdraw) {
      return this.memo.slice(MEMO_META_WITHDRAW_SIZE * 2);
    }

    return this.memo.slice(MEMO_META_SIZE * 2);
  }

  /**
   * Returns encoded transaction ready to use as data for the smart contract.
   */
  encode(): string {
    const writer = new HexStringWriter();

    writer.writeHex(this.selector);
    writer.writeBigInt(this.nullifier, 32);
    writer.writeBigInt(this.outCommit, 32);
    writer.writeBigInt(this.transferIndex, 6);
    writer.writeBigInt(this.energyAmount, 8);
    writer.writeBigInt(this.tokenAmount, 8);
    writer.writeBigIntArray(this.transactProof, 32);
    writer.writeBigInt(this.rootAfter, 32);
    writer.writeBigIntArray(this.treeProof, 32);
    writer.writeHex(this.txType.toString());
    writer.writeNumber(this.memo.length / 2, 2);
    writer.writeHex(this.memo);

    return writer.toString();
  }

  static decode(data: string): EthPrivateTransaction {
    let tx = new EthPrivateTransaction();
    let reader = new HexStringReader(data);

    tx.selector = reader.readHex(4);
    tx.nullifier = reader.readBigInt(32);
    tx.outCommit = reader.readBigInt(32);
    tx.transferIndex = reader.readBigInt(6);
    tx.energyAmount = reader.readBigInt(8);
    tx.tokenAmount = reader.readBigInt(8);
    tx.transactProof = reader.readBigIntArray(8, 32);
    tx.rootAfter = reader.readBigInt(32);
    tx.treeProof = reader.readBigIntArray(8, 32);
    tx.txType = reader.readHex(1) as TxType;
    const memoSize = reader.readNumber(2);
    tx.memo = reader.readHex(memoSize);

    return tx;
  }
}

export function flattenSnarkProof(p: SnarkProof): bigint[] {
  return [p.a, p.b.flat(), p.c].flat().map(n => {
    return BigInt(n);
  });
}
