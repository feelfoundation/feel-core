const {
	TO_FELLOWS,
	getFixtureUser,
	from,
	TRS_PER_BLOCK,
} = require('../../utils');

const I = actor();

Given('I have list of clients', async () => {
	const api = await I.call();
	const inValidAddresses = api.peers.filter(
		address => typeof address !== 'string'
	);

	expect(inValidAddresses).to.be.an('array').that.is.empty;
});

Given('The delegates are enabled to forge', async () => {
	await I.checkIfDelegatesAreForging();
});

Given('The network is moving', async () => {
	await I.checkIfNetworkIsMoving();
});

Given('{int} feel accounts exists with minimum balance', async count => {
	const amount = 0.1;
	const transfers = [];

	const randomAccounts = new Array(count).fill(0).map(() => I.createAccount());

	randomAccounts.forEach(async account => {
		const trx = await I.transfer({
			recipientId: account.address,
			amount: TO_FELLOWS(amount),
		});
		transfers.push(trx);
	});

	const NUMBER_OF_BLOCKS = Math.ceil(count / TRS_PER_BLOCK);
	await I.waitForBlock(NUMBER_OF_BLOCKS);

	transfers.forEach(async ({ id, recipientId }) =>
		I.validateTransaction(id, recipientId, amount)
	);
});

Given(
	'{string} has a feel account with balance {int} F39 tokens',
	async (userName, balance) => {
		const { address } = getFixtureUser('username', userName);
		await I.haveAccountWithBalance(address, balance);
	}
);

Given('{string} has a account with second signature', async userName => {
	const { address, passphrase, secondPassphrase } = getFixtureUser(
		'username',
		userName
	);
	await I.haveAccountWithSecondSignature(address, passphrase, secondPassphrase);
});

Given('{string} has a account registered as delegate', async userName => {
	const { username, address, passphrase } = getFixtureUser(
		'username',
		userName
	);
	await I.haveAccountRegisteredAsDelegate({
		username,
		address,
		passphrase,
	});
});

Given(
	'{string} creates a multisignature account with {string}, {string}',
	async (user1, user2, user3) => {
		const { passphrase, address } = getFixtureUser('username', user1);
		const signer1 = getFixtureUser('username', user2);
		const signer2 = getFixtureUser('username', user3);
		const contracts = [signer1, signer2];
		const params = {
			lifetime: 1,
			minimum: 2,
			passphrase,
		};

		const isExists = await I.checkIfMultisigAccountExists(address, contracts);
		if (!isExists) {
			await from(I.registerMultisignature(contracts, params));
		}
	}
);
