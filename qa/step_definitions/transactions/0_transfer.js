const { getFixtureUser, TO_FELLOWS } = require('../../utils');

const I = actor();

Then(
	'{string} should be able to send {int}F39 tokens to {string}',
	async (user1, amount, user2) => {
		const sender = getFixtureUser('username', user1);
		const recipient = getFixtureUser('username', user2);

		const transfer = await I.transfer({
			recipientId: recipient.address,
			amount: TO_FELLOWS(amount),
			passphrase: sender.passphrase,
		});
		await I.validateTransaction(
			transfer.id,
			recipient.address,
			amount,
			sender.address
		);
	}
);

Then(
	'{string} should be able to send {int}F39 tokens to himself',
	async (user, amount) => {
		const { address, passphrase } = getFixtureUser('username', user);

		const transfer = await I.transfer({
			recipientId: address,
			amount: TO_FELLOWS(amount),
			passphrase,
		});
		await I.validateTransaction(transfer.id, address, amount, address);
	}
);
