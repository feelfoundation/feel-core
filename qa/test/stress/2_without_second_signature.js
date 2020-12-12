const output = require('codeceptjs').output;
const crypto = require('crypto');
const {
	TO_FELLOWS,
	createAccounts,
	TRS_TYPE,
	TRS_PER_BLOCK,
} = require('../../utils');

const I = actor();
const contractsByAddress = {};
const STRESS_COUNT = parseInt(process.env.STRESS_COUNT) || 25;
const NUMBER_OF_BLOCKS = Math.ceil(STRESS_COUNT / TRS_PER_BLOCK);
const EXTRA_LIMIT = Math.ceil(NUMBER_OF_BLOCKS + NUMBER_OF_BLOCKS * 0.15);

const accounts = createAccounts(STRESS_COUNT);

Feature('Generic stress test without second signature');

Scenario('Transfer funds', async () => {
	output.print(
		`==========Running Stress Test, Transaction Type: ${
			TRS_TYPE.TRANSFER
		}==========`
	);

	const F39_TOKEN = 100;
	const transferTrx = accounts.map(a => ({
		recipientId: a.address,
		amount: TO_FELLOWS(F39_TOKEN),
	}));

	try {
		const transferTransactions = await I.transferToMultipleAccounts(
			transferTrx
		);

		await I.waitForBlock(NUMBER_OF_BLOCKS + 1);

		await Promise.all(
			transferTransactions.map(trx =>
				I.validateTransaction(trx.id, trx.recipientId, F39_TOKEN)
			)
		);
	} catch (error) {
		output.print('Error while processing transfer fund transaction', error);
	}
})
	.tag('@slow')
	.tag('@generic_wss_t')
	.tag('@stress_wss');

Scenario('Delegate Registration', async () => {
	output.print(
		`==========Running Stress Test, Transaction Type: ${
			TRS_TYPE.DELEGATE_REGISTRATION
		}==========`
	);

	try {
		await Promise.all(
			accounts.map(async a => {
				a.username = crypto.randomBytes(9).toString('hex');

				await I.registerAsDelegate(
					{
						username: a.username,
						passphrase: a.passphrase,
					},
					0
				);
			})
		);

		await I.waitForBlock(NUMBER_OF_BLOCKS + 1);

		await Promise.all(
			accounts.map(async a => {
				const api = await I.call();

				const account = await api.getDelegates({ publicKey: a.publicKey });
				expect(account.data[0].username).to.deep.equal(a.username);
			})
		);
	} catch (error) {
		output.print('Error while processing delegate registration', error);
	}
})
	.tag('@slow')
	.tag('@generic_wss_dr')
	.tag('@stress_wss');

Scenario('Cast vote', async () => {
	output.print(
		`==========Running Stress Test, Transaction Type: ${
			TRS_TYPE.VOTE
		}==========`
	);

	try {
		await Promise.all(
			accounts.map(a =>
				I.castVotes(
					{
						votes: [a.publicKey],
						passphrase: a.passphrase,
					},
					0
				)
			)
		);

		await I.waitForBlock(NUMBER_OF_BLOCKS + 1);

		await Promise.all(
			accounts.map(async a => {
				const api = await I.call();

				const account = await api.getVoters({ publicKey: a.publicKey });
				expect(
					account.data.voters.some(v => v.address === a.address)
				).to.deep.equal(true);
			})
		);
	} catch (error) {
		output.print('Error while processing cast vote transaction', error);
	}
})
	.tag('@slow')
	.tag('@generic_wss_cv')
	.tag('@stress_wss');

Scenario('Register Multi-signature account', async () => {
	output.print(
		`==========Running Stress Test, Transaction Type: ${
			TRS_TYPE.MULTI_SIGNATURE
		}==========`
	);

	try {
		await Promise.all(
			accounts.map(async (a, index) => {
				const { passphrase, address } = a;
				const signer1 = accounts[(index + 1) % accounts.length];
				const signer2 = accounts[(index + 2) % accounts.length];
				const contracts = [signer1, signer2];
				const params = {
					lifetime: 1,
					minimum: 2,
					passphrase,
				};
				contractsByAddress[address] = contracts;

				await I.registerMultisignature(contracts, params, 0);
			})
		);

		await I.waitForBlock(EXTRA_LIMIT);

		await Promise.all(
			accounts.map(async a => {
				const api = await I.call();

				const account = await api.getMultisignatureGroups(a.address);
				await I.expectMultisigAccountToHaveContracts(
					account,
					contractsByAddress[a.address]
				);
			})
		);
	} catch (error) {
		output.print(
			'Error while processing register multi-signature account transaction',
			error
		);
	}
})
	.tag('@slow')
	.tag('@generic_wss_ms')
	.tag('@stress_wss');
