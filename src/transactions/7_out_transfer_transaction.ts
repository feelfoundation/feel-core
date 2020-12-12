/*
 * Copyright © 2019 Feel Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Feel Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
import BigNum from '@feelhq/bignum';
import {
	BaseTransaction,
	convertToAssetError,
	StateStore,
	StateStorePrepare,
	TransactionError,
	TransactionJSON,
	utils,
} from '@feelhq/feel-transactions';
import { MAX_TRANSACTION_AMOUNT, OUT_TRANSFER_FEE } from './constants';

const { verifyAmountBalance, validator } = utils;
const TRANSACTION_DAPP_REGISTERATION_TYPE = 5;

export interface OutTransferAsset {
	readonly outTransfer: {
		readonly dappId: string;
		readonly transactionId: string;
	};
}

export const outTransferAssetFormatSchema = {
	type: 'object',
	required: ['outTransfer'],
	properties: {
		outTransfer: {
			type: 'object',
			required: ['dappId', 'transactionId'],
			properties: {
				dappId: {
					type: 'string',
					format: 'id',
				},
				transactionId: {
					type: 'string',
					format: 'id',
				},
			},
		},
	},
};

export class OutTransferTransaction extends BaseTransaction {
	public readonly asset: OutTransferAsset;
	public readonly containsUniqueData: boolean;
	public static TYPE = 7;
	public static FEE = OUT_TRANSFER_FEE.toString();

	public constructor(rawTransaction: unknown) {
		super(rawTransaction);
		const tx = (typeof rawTransaction === 'object' && rawTransaction !== null
			? rawTransaction
			: {}) as Partial<TransactionJSON>;

		this.asset = (tx.asset || { outTransfer: {} }) as OutTransferAsset;
		this.containsUniqueData = true;
	}

	public async prepare(store: StateStorePrepare): Promise<void> {
		await store.account.cache([
			{
				address: this.senderId,
			},
			{ address: this.recipientId },
		]);

		await store.transaction.cache([
			{
				id: this.asset.outTransfer.dappId,
			},
			{ id: this.asset.outTransfer.transactionId },
		]);
	}

	protected assetToBytes(): Buffer {
		const { dappId, transactionId } = this.asset.outTransfer;
		const outAppIdBuffer = Buffer.from(dappId, 'utf8');
		const outTransactionIdBuffer = Buffer.from(transactionId, 'utf8');

		return Buffer.concat([outAppIdBuffer, outTransactionIdBuffer]);
	}

	public assetToJSON(): object {
		return this.asset;
	}

	protected verifyAgainstTransactions(
		transactions: ReadonlyArray<TransactionJSON>
	): ReadonlyArray<TransactionError> {
		const sameTypeTransactions = transactions.filter(
			tx =>
				tx.type === OutTransferTransaction.TYPE &&
				'outTransfer' in tx.asset &&
				this.asset.outTransfer.transactionId ===
					(tx.asset as OutTransferAsset).outTransfer.transactionId
		);

		return sameTypeTransactions.length > 0
			? [
					new TransactionError(
						'Out Transfer cannot refer to the same transactionId',
						this.id,
						'.asset.outTransfer.transactionId'
					),
			  ]
			: [];
	}

	protected validateAsset(): ReadonlyArray<TransactionError> {
		validator.validate(outTransferAssetFormatSchema, this.asset);
		const errors = convertToAssetError(
			this.id,
			validator.errors
		) as TransactionError[];

		// Amount has to be greater than 0
		if (this.amount.lte(0)) {
			errors.push(
				new TransactionError(
					'Amount must be greater than zero for outTransfer transaction',
					this.id,
					'.amount',
					this.amount.toString()
				)
			);
		}

		if (this.recipientId === '') {
			errors.push(
				new TransactionError(
					'RecipientId must be set for outTransfer transaction',
					this.id,
					'.recipientId',
					this.recipientId
				)
			);
		}

		return errors;
	}

	protected applyAsset(store: StateStore): ReadonlyArray<TransactionError> {
		const errors: TransactionError[] = [];
		const dappRegistrationTransaction = store.transaction.get(
			this.asset.outTransfer.dappId
		);

		if (
			!dappRegistrationTransaction ||
			dappRegistrationTransaction.type !== TRANSACTION_DAPP_REGISTERATION_TYPE
		) {
			errors.push(
				new TransactionError(
					`Application not found: ${this.asset.outTransfer.dappId}`,
					this.id,
					'.asset.outTransfer.dappId'
				)
			);
		}

		const sender = store.account.get(this.senderId);

		const balanceError = verifyAmountBalance(
			this.id,
			sender,
			this.amount,
			this.fee
		);
		if (balanceError) {
			errors.push(balanceError);
		}

		const updatedBalance = new BigNum(sender.balance).sub(this.amount);

		const updatedSender = { ...sender, balance: updatedBalance.toString() };
		store.account.set(updatedSender.address, updatedSender);

		const recipient = store.account.getOrDefault(this.recipientId);

		const updatedRecipientBalance = new BigNum(recipient.balance).add(
			this.amount
		);

		if (updatedRecipientBalance.gt(MAX_TRANSACTION_AMOUNT)) {
			errors.push(new TransactionError('Invalid amount', this.id, '.amount'));
		}

		const updatedRecipient = {
			...recipient,
			balance: updatedRecipientBalance.toString(),
		};

		store.account.set(updatedRecipient.address, updatedRecipient);

		return errors;
	}

	public undoAsset(store: StateStore): ReadonlyArray<TransactionError> {
		const errors: TransactionError[] = [];
		const sender = store.account.get(this.senderId);
		const updatedBalance = new BigNum(sender.balance).add(this.amount);

		if (updatedBalance.gt(MAX_TRANSACTION_AMOUNT)) {
			errors.push(
				new TransactionError(
					'Invalid amount',
					this.id,
					'.amount',
					this.amount.toString()
				)
			);
		}

		const updatedSender = { ...sender, balance: updatedBalance.toString() };
		store.account.set(updatedSender.address, updatedSender);

		const recipient = store.account.getOrDefault(this.recipientId);

		const updatedRecipientBalance = new BigNum(recipient.balance).sub(
			this.amount
		);

		if (updatedRecipientBalance.lt(0)) {
			errors.push(
				new TransactionError(
					`Account does not have enough F39: ${recipient.address}, balance: ${
						recipient.balance
					}`,
					this.id,
					updatedRecipientBalance.toString()
				)
			);
		}

		const updatedRecipient = {
			...recipient,
			balance: updatedRecipientBalance.toString(),
		};

		store.account.set(updatedRecipient.address, updatedRecipient);

		return errors;
	}

	// tslint:disable:next-line: prefer-function-over-method no-any
	protected assetFromSync(raw: any): object | undefined {
		if (!raw.ot_dappId) {
			return undefined;
		}
		const outTransfer = {
			dappId: raw.ot_dappId,
			transactionId: raw.ot_outTransactionId,
		};
	
		return { outTransfer };
	}
}
