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
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const { Application } = require('feel-sdk')
const originalConfig = require('../../fixtures/config_1.6.json');
const genesisBlock = require('../../../config/devnet/genesis_block.json');

const dirPath = __dirname;
const rootPath = path.dirname(path.resolve(__filename, '../../../'));

// TODO: Enable again after the issue https://github.com/FeelHQ/feel/issues/3171
// eslint-disable-next-line mocha/no-skipped-tests
describe('scripts/update_config', () => {
	const updatedConfigPath = `${dirPath}/updated_config.json`;
	let spawnedScript;
	let updatedConfig;

	before(async () => {
		spawnedScript = spawnSync(
			'node',
			[
				'./scripts/update_config.js',
				'--network',
				'testnet',
				'--output',
				updatedConfigPath,
				originalConfig,
				'1.6.0',
			],
			{ cwd: rootPath }
		);
		updatedConfig = fs.readFileSync(`${dirPath}/updated_config.json`);
	});

	after(async () => {
		fs.unlinkSync(updatedConfigPath);
	});

	it('should run update_config with no errors', async () => {
		expect(spawnedScript.stderr.toString()).to.be.empty;
	});

	it('should be able to instanciate application', async () => {
			expect(() => new Application(genesisBlock, updatedConfig)).not.to.throw;
	});
});
