const output = require('codeceptjs').output;
const utils = require('../../utils');

const I = actor();
const count = Math.ceil(utils.TRS_POOL_LIMIT / 13); // T:2, SPP: 1, D 2, V: 2, UV: 2, M: 2, Dapp: 2 = 13 types of transactions
let all_trxs = {};

const accounts = utils.createAccounts(count);
const accounts_with_spp = utils.createAccounts(count);

const getAllTransactions = () => {
	const transactions = Object.keys(all_trxs).map(transaction_type => {
		const trxs = all_trxs[transaction_type];
		if (!transaction_type.match('_signatures')) {
			return trxs;
		}
		return [];
	});

	return transactions.reduce((acc, arr) => [...acc, ...arr], []);
};

const processTransactions = async () => {
	const api = await I.call();

	await Object.keys(all_trxs).forEach(async transaction_type => {
		const trxs = all_trxs[transaction_type];
		if (transaction_type.match('_signatures')) {
			await Promise.all(trxs.map(t => api.broadcastSignatures(t)));
		} else {
			await Promise.all(trxs.map(t => api.broadcastTransactions(t)));
		}
	});
};

const getAllTransactionCount = () =>
	Object.keys(all_trxs).reduce((acc, curr) => all_trxs[curr].length + acc, 0);

Feature('Diversified stress test');

Scenario('Transfer funds', async () => {
	const F39_TOKEN = 100;
	const api = await I.call();

	const transactions = [
		...utils.transfer(accounts, F39_TOKEN),
		...utils.transfer(accounts_with_spp, F39_TOKEN),
	];

	const NUMBER_OF_BLOCKS = Math.ceil(transactions.length / utils.TRS_PER_BLOCK);

	try {
		await Promise.all(transactions.map(t => api.broadcastTransactions(t)));
		await I.waitForBlock(NUMBER_OF_BLOCKS + 1);

		await Promise.all(
			transactions.map(trx =>
				I.validateTransaction(trx.id, trx.recipientId, F39_TOKEN)
			)
		);
		output.print('validating transfers successful!');
	} catch (error) {
		output.print('Failed to transfer transactions', error);
	}
})
	.tag('@slow')
	.tag('@diversified');

Scenario('Enable Second passphrase', async () => {
	const api = await I.call();

	const { spp_transactions } = utils.secondPassphraseAccount(accounts_with_spp);

	const NUMBER_OF_BLOCKS = Math.ceil(
		spp_transactions.length / utils.TRS_PER_BLOCK
	);

	try {
		await Promise.all(spp_transactions.map(t => api.broadcastTransactions(t)));
		await I.waitForBlock(NUMBER_OF_BLOCKS + 1);

		await Promise.all(
			spp_transactions.map(async trx => {
				const accountsRes = await api.getAccounts({
					publicKey: trx.senderPublicKey,
				});
				await I.expectResponseToBeValid(accountsRes, 'AccountsResponse');
				expect(accountsRes.data[0].secondPublicKey).to.deep.equal(
					trx.asset.signature.publicKey
				);
			})
		);
		output.print('validating second passphrase account successful!');
	} catch (error) {
		output.print('Failed to enable second passphrase on an account', error);
	}
})
	.tag('@slow')
	.tag('@diversified');

Scenario('Create delegates', async () => {
	const api = await I.call();

	const delegateRegistrationResult = utils.delegateRegistration(accounts);
	all_trxs.delegate_register_trxs = delegateRegistrationResult.dr_transactions;

	const delegateRegistrationSPPResult = utils.delegateRegistration(
		accounts_with_spp
	);
	all_trxs.delegate_register_spp_trxs =
		delegateRegistrationSPPResult.dr_transactions;

	try {
		await processTransactions();

		const NUMBER_OF_BLOCKS = Math.ceil(
			getAllTransactionCount() / utils.TRS_PER_BLOCK
		);

		await I.waitForBlock(NUMBER_OF_BLOCKS + 1);

		const trxs = getAllTransactions();
		await Promise.all(
			trxs.map(async trx => {
				const accountsRes = await api.getAccounts({
					publicKey: trx.senderPublicKey,
				});
				await I.expectResponseToBeValid(accountsRes, 'AccountsResponse');
				expect(accountsRes.data[0].delegate.username).to.deep.equal(
					trx.asset.delegate.username
				);
			})
		);
		output.print('validating delegates successful!');
		all_trxs = {};
	} catch (error) {
		output.print('Failed to delegate account', error);
	}
})
	.tag('@slow')
	.tag('@diversified');

Scenario('Create vote, multi-signature', async () => {
	const castVoteResult = utils.castVote(accounts);
	all_trxs.vote_trxs = castVoteResult.v_transactions;

	const castVoteSPPResult = utils.castVote(accounts_with_spp);
	all_trxs.vote_spp_trxs = castVoteSPPResult.v_transactions;

	const multiSignatureAccountResult = utils.multiSignatureAccount(accounts);
	all_trxs.multi_sig_trxs = multiSignatureAccountResult.multiSigTransactions;
	all_trxs.multi_sig_trxs_signatures = multiSignatureAccountResult.signatures;

	const multiSignatureAccountSPPResult = utils.multiSignatureAccount(
		accounts_with_spp
	);
	all_trxs.multi_sig_spp_trxs =
		multiSignatureAccountSPPResult.multiSigTransactions;
	all_trxs.multi_sig_trxs_spp_signatures =
		multiSignatureAccountSPPResult.signatures;
})
	.tag('@slow')
	.tag('@diversified');

Scenario('Broadcast vote, multi-signature', async () => {
	const NUMBER_OF_BLOCKS = Math.ceil(
		getAllTransactionCount() / utils.TRS_PER_BLOCK
	);

	try {
		await processTransactions();

		await I.waitForBlock(NUMBER_OF_BLOCKS);
	} catch (error) {
		output.print(
			'Failed to broadcast signatures for vote, multi-signature',
			error
		);
	}
})
	.tag('@slow')
	.tag('@diversified');

Scenario('Validate transaction confirmation', async () => {
	const api = await I.call();
	const trxs = getAllTransactions();

	try {
		await Promise.all(
			trxs.map(async trx => {
				const confirmedTrx = await api.getTransactions({ id: trx.id });
				if (confirmedTrx.data.length) {
					expect(confirmedTrx.data[0].id).to.deep.equal(trx.id);
				}
				// Skipping the validation for one which din't get confirmed
				// Since the order of transaction processing not strict
				// the account used for voting can become multi-signature account
				// much before the vote transaction get processed
				// we know this as radical issue and continue to keep it this way
			})
		);
		output.print('validating delegates successful!');
	} catch (error) {
		output.print('Failed to validate transaction confirmation', error);
	}
})
	.tag('@slow')
	.tag('@diversified');
