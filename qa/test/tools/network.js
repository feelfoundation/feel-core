const output = require('codeceptjs').output;
const fs = require('fs');
const path = require('path');
const { from, config, getIpByDns } = require('../../utils');
const { seedNode } = require('../../fixtures');

const I = actor();
const configPath = () => path.resolve(__dirname, '../../fixtures/config.json');

const splitDelegatesByPeers = (delegates, peers) => {
	if (peers.length === 0) {
		output.print(
			'\n',
			'***********Please run npm run tools:peers:config to generate peer list*************',
			'\n'
		);
		process.exit(1);
	}

	if (peers.length > 101) {
		peers.splice(101);
	}

	const delegateList = peers.map(() => []);

	let counter = 0;
	while (delegates.length) {
		if (counter > delegateList.length - 1) {
			counter = 0;
		} else {
			const delegate = delegates.shift();
			delegateList[counter].push(delegate);
			counter += 1;
		}
	}

	return delegateList;
};

const updateForgingStatus = async ({
	ipAddress,
	delegateList,
	isEnable,
	defaultPassword,
}) => {
	const api = await I.call();

	return delegateList.map(async delegate => {
		const params = {
			forging: isEnable,
			password: defaultPassword,
			publicKey: delegate.publicKey,
		};

		let res;
		try {
			res = await from(api.updateForgingStatus(params, ipAddress));
			expect(res.error).to.be.null;
			expect(res.result.data[0].forging).to.deep.equal(isEnable);
			output.print(
				`Delegate with publicKey: ${
					delegate.publicKey
				}, forging: ${isEnable} on node: ${ipAddress}`
			);
		} catch (err) {
			output.error(res.error);
			output.error(err);
			output.print(
				`Failed to set forging: ${isEnable} for delegate with publicKey: ${
					delegate.publicKey
				}, on node: ${ipAddress}`
			);
		}
	});
};

const enableDisableDelegates = isEnable => {
	const enableOrDisable = isEnable ? 'enable' : 'disable';

	try {
		const {
			peers,
			forging: { defaultPassword, delegates },
		} = config;

		const peerDelegateList = splitDelegatesByPeers(delegates, peers);

		peers.forEach((ipAddress, i) => {
			const delegateList = peerDelegateList[i];

			output.print(
				`${
					delegateList.length
				} delegates ${enableOrDisable}d to on node ===> ${ipAddress}`,
				'\n'
			);

			return updateForgingStatus({
				ipAddress,
				delegateList,
				isEnable,
				defaultPassword,
			});
		});
	} catch (error) {
		output.error(`Failed to ${enableOrDisable} forging due to error: `);
		output.error(error);
		process.exit(1);
	}
};

const checkIfAllPeersConnected = async () => {
	const allPeers = await I.getAllPeers(100, 0);
	// TODO: Remove this once DO API is stable
	const flakyPeers = 8; // Sometimes DO can not start few nodes so keeping flaky peers into consideration.
	const expectPeerCount =
		(process.env.NODES_PER_REGION || 1) * 10 - 1 - flakyPeers;

	output.print(
		`Number of peers connected in network: ${
			allPeers.length
		}, Expected peers: ${expectPeerCount}`
	);

	while (allPeers.length >= expectPeerCount) {
		return true;
	}
	await I.wait(5000);
	return checkIfAllPeersConnected();
};

const getConfigContent = () => {
	const config_path = configPath();
	const configBuffer = fs.readFileSync(config_path);
	return JSON.parse(configBuffer);
};

const updateConfigContent = configContent => {
	const config_path = configPath();
	fs.writeFileSync(config_path, JSON.stringify(configContent));
	output.print(JSON.stringify(configContent.peers, null, '\t'));
	output.print(
		`Updated ${configContent.peers.length} peers to config file: ${config_path}`
	);
};

const mergePeers = (seedAddress, configContentPeers, allPeers) => {
	const peers = allPeers.map(p => p.ip);
	const uniquePeers = new Set([seedAddress, ...configContentPeers, ...peers]);
	return [...uniquePeers].slice(0, 101).filter(p => p);
};

Feature('Network tools');

Scenario('List peers', async () => {
	try {
		const allPeers = await I.getAllPeers(100, 0);
		output.print('Peers config list: ', JSON.stringify(allPeers, null, '\t'));
	} catch (error) {
		output.print('Failed to get peers list: ');
		output.error(error);
		process.exit(1);
	}
}).tag('@peers_list');

Scenario('Add seed node to config', async () => {
	const seedAddress = await getIpByDns(seedNode);
	const configContent = getConfigContent();

	configContent.peers = []; // To avoid duplication first remove everything
	configContent.peers.push(seedAddress);
	updateConfigContent(configContent);
}).tag('@seed_node');

Scenario('Add network peers to config', async () => {
	try {
		const allPeers = await I.getAllPeers(100, 0);
		const configContent = getConfigContent();
		const seedAddress = await getIpByDns(seedNode);
		const uniquePeers = mergePeers(seedAddress, configContent.peers, allPeers);

		configContent.peers = []; // To avoid duplication first remove everything
		configContent.peers.push(...uniquePeers);
		updateConfigContent(configContent);
	} catch (error) {
		output.print('Failed to add peers to config: ');
		output.error(error);
		process.exit(1);
	}
}).tag('@network_nodes');

Scenario('Check if peers are connected', async () => {
	await checkIfAllPeersConnected();
}).tag('@peers_connected');

Scenario('Enable delegates', async () => {
	enableDisableDelegates(true);
}).tag('@delegates_enable');

Scenario('Disable delegates', async () => {
	enableDisableDelegates(false);
}).tag('@delegates_disable');

Scenario('Upgrade node', async () => {
	const configContent = getConfigContent();
	const upgradedNodeHostName = process.env.DROPLET_FQDN;
	const seedAddress = await getIpByDns(upgradedNodeHostName);

	configContent.peers.push(seedAddress);

	if (process.env.NETWORK === 'testnet') {
		configContent.httpPort = 7500;
		configContent.wsPort = 7501;
	} else if (process.env.NETWORK === 'mainnet') {
		configContent.httpPort = 8500;
		configContent.wsPort = 8501;
	}

	updateConfigContent(configContent);
}).tag('@upgrade_node');
