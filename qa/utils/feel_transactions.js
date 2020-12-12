const elements = require('feel-elements');
const crypto = require('crypto');
const { GENESIS_ACCOUNT } = require('../fixtures');

const {
	transaction,
	passphrase: { Mnemonic },
	cryptography,
} = elements;
const { utils, constants } = transaction;

// amount converted from feel to fellows
const TO_FELLOWS = amount => utils.convertF39ToFellows(amount.toString());

// amount converted from fellows to feel
const TO_FEEL = amount => utils.convertFellowsToF39(amount.toString());

const dappMultiAccountName = () => `dapp-multi${new Date().getTime()}`;

const generateMnemonic = () => Mnemonic.generateMnemonic();

const getKeys = passphrase => cryptography.getKeys(passphrase);

const getAddressFromPublicKey = publicKey =>
	cryptography.getAddressFromPublicKey(publicKey);

const defaultFilter = ['passphrase', 'secondPassphrase'];
const filterByKey = (obj, filters) =>
	Object.keys(obj)
		.filter(k => filters.includes(k))
		.map(k => Object.assign({}, { [k]: obj[k] }))
		.reduce((res, o) => Object.assign(res, o), {});
const createAccounts = count =>
	new Array(count).fill(0).map(() => {
		const passphrase = Mnemonic.generateMnemonic();
		const { publicKey } = cryptography.getKeys(passphrase);
		const address = cryptography.getAddressFromPublicKey(publicKey);

		return {
			passphrase,
			publicKey,
			address,
		};
	});

const transfer = (accounts, amount) =>
	accounts.map(a => {
		const acount = Object.assign({}, a);
		acount.recipientId = a.address;
		acount.amount = TO_FELLOWS(amount);
		acount.passphrase = GENESIS_ACCOUNT.password;

		return transaction.transfer(acount);
	});

const secondPassphraseAccount = accounts => {
	const secondPassAccounts = accounts.map(a => {
		a.secondPassphrase = generateMnemonic();
		return a;
	});

	const spp_transactions = secondPassAccounts.map(a =>
		transaction.registerSecondPassphrase({
			...filterByKey(a, defaultFilter),
		})
	);
	return { secondPassAccounts, spp_transactions };
};

const delegateRegistration = accounts => {
	const delegateAccounts = accounts.map(a => {
		a.username = crypto.randomBytes(5).toString('hex');
		return a;
	});
	const dr_transactions = delegateAccounts.map(a =>
		transaction.registerDelegate({
			...filterByKey(a, [...defaultFilter, 'username']),
		})
	);
	return { delegateAccounts, dr_transactions };
};

const castVote = accounts => {
	const count = accounts.length;
	const votedAccounts = accounts.map((a, i) => {
		a.votes = [accounts[(i + 1) % count].publicKey]; // Pick random account to vote
		return a;
	});
	const v_transactions = votedAccounts.map(a =>
		transaction.castVotes({
			...filterByKey(a, [...defaultFilter, 'votes']),
		})
	);
	return { votedAccounts, v_transactions };
};

const castUnVote = accounts => {
	const count = accounts.length;
	const unVotedAccounts = accounts.map((a, i) => {
		a.unvotes = [accounts[(i + 1) % count].publicKey]; // Pick random account to vote
		return a;
	});
	const uv_transactions = unVotedAccounts.map(a =>
		transaction.castVotes({
			...filterByKey(a, [...defaultFilter, 'unvotes']),
		})
	);
	return { unVotedAccounts, uv_transactions };
};

const createMultiSignatureParams = (account, keysgroup) => ({
	lifetime: constants.MULTISIGNATURE_MIN_LIFETIME,
	minimum: constants.MULTISIGNATURE_MIN_KEYSGROUP,
	...account,
	keysgroup,
});

const multiSignatureAccount = accounts => {
	const count = accounts.length;
	const signatures = [];

	const multiSigTransactions = accounts.map((a, i) => {
		const signer = accounts[(i + 1) % count];
		const keysgroup = [signer.publicKey];
		const params = createMultiSignatureParams(
			filterByKey(a, defaultFilter),
			keysgroup
		);

		const multiSigTransaction = transaction.registerMultisignature(params);

		signatures.push({
			transactionId: multiSigTransaction.id,
			publicKey: signer.publicKey,
			signature: utils.multiSignTransaction(
				multiSigTransaction,
				signer.passphrase
			),
		});

		return multiSigTransaction;
	});
	return { multiSigTransactions, signatures };
};

const createDappOptions = () => {
	const dAppName = crypto.randomBytes(5).toString('hex');
	const options = {
		name: dAppName,
		category: 1,
		description: `dApp for ${dAppName}`,
		tags: '2',
		type: 0,
		link: `https://github.com/blocksafe/SDK-notice/dapp-multi-${dAppName}/master.zip`,
		icon: `http://www.blocksafefoundation.com/dapp-multi-${dAppName}/header.jpg`,
	};

	return options;
};

const dappRegistration = accounts =>
	accounts.map(a => {
		const options = createDappOptions();

		return elements.transaction.createDapp({
			...filterByKey(a, defaultFilter),
			options,
		});
	});

module.exports = {
	TO_FELLOWS,
	TO_FEEL,
	dappMultiAccountName,
	generateMnemonic,
	getKeys,
	getAddressFromPublicKey,
	createAccounts,
	filterByKey,
	transfer,
	secondPassphraseAccount,
	delegateRegistration,
	castVote,
	castUnVote,
	multiSignatureAccount,
	dappRegistration,
};
