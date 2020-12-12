const { getFixtureUser, from, TO_FELLOWS } = require('../../utils');

const I = actor();
let response;

When(
	'{string} wants to transfer {int}F39 to {string}',
	async (sender, amount, recepient) => {
		const user1 = getFixtureUser('username', sender);
		const user2 = getFixtureUser('username', recepient);

		response = await from(
			I.transfer({
				recipientId: user2.address,
				amount: TO_FELLOWS(amount),
				passphrase: user1.passphrase,
				secondPassphrase: user1.secondPassphrase,
			})
		);
		expect(response.error).to.be.null;
	}
);

Then(
	'{string} should receive {int}F39 from {string}',
	async (recepient, amount, sender) => {
		const user1 = getFixtureUser('username', sender);
		const user2 = getFixtureUser('username', recepient);
		const { id } = response.result;

		await I.validateTransaction(id, user2.address, amount, user1.address);
	}
);

When('{string} transfers {int}F39 token to himself', async (sender, amount) => {
	const { address, passphrase, secondPassphrase } = getFixtureUser(
		'username',
		sender
	);

	response = await from(
		I.transfer({
			recipientId: address,
			amount: TO_FELLOWS(amount),
			passphrase,
			secondPassphrase,
		})
	);
	expect(response.error).to.be.null;
});

Then(
	'{string} should receive {int}F39 in his account',
	async (sender, amount) => {
		const { address } = getFixtureUser('username', sender);
		const { id } = response.result;

		await I.validateTransaction(id, address, amount, address);
	}
);
