# Feel Core QA
[![Build Status](https://jenkins.feel.surf/job/feel-qa/job/feel-core-qa/job/master/badge/icon)](https://jenkins.feel.surf/job/feel-qa/job/feel-core-qa/job/master/)

Quality Assurance of Feel Network.

The quality assurance ensures if the release candidates are

- **Functional**

  - Features supported by Feel Protocol such as accounts, delegates, voting, multisignature and dapp creation

- **Efficient**

  - Stress test are performed against the network with every transaction type ensures the network is stable and reliable under heavy load, it also determines the throughput consistency.

- **Improved**

  - Newly introduced features for a particular release to be covered with new feature scenarios.

This document details how to install Feel Core QA from source.
If you have satisfied the requirements from the Pre-Installation section, you can jump directly to the next section [Installation Steps](#installation).

## Index

* [Pre-Installation](#pre-installation)
  * [Git](#git)
  * [Node.JS](#nodejs)
* [Installation](#installation)
* [Managing-Feel-Core-QA](#managing-feel-core-qa)
  * [Single-Node](#single-node)
    * [Add-peers-to-config-Single-Node](#add-peers-to-config-single-node)
  * [Network-Mode](#network-mode)
    * [Add-peers-to-config-Network-Mode](#add-peers-to-config-network-mode)
  * [Enable-delegates](#enable-delegates)
  * [Running-Feel-Core-Protocol-Features-Tests](#running-feel-core-protocol-features-tests)
  * [Running-Generic-Stress-Test](#running-generic-stress-test)
  * [Running-Diversified-Stress-Test](#running-diversified-stress-test)
  * [Running-Reports](#running-reports)

## Pre-Installation

The next section details the prerequisites to install Feel Core QA from source.

### System Install

### [Git](https://github.com/git/git)

Used for cloning and updating Feel Core QA

* Ubuntu:

```
sudo apt-get install -y git
```

* MacOS 10.12-10.13 (Sierra/High Sierra):

```
brew install git
```

### [Node.js](https://nodejs.org/)

Node.js serves as the underlying engine for code execution.

Install System wide via package manager:

* Ubuntu:

```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
```

* MacOS 10.12-10.13 (Sierra/High Sierra):

```
brew install node@10.14.1
```

## Installation

Clone the Feel Core repository using Git and initialize the modules.

```
git clone https://github.com/feelfoundation/feel-core.git
git checkout master
cd feel-core/qa
npm i
```

## Managing-Feel-Core-QA

### Single-Node
To run tests against single node setup [Feel Core](https://feel.surf/documentation/feel-core/setup/source), once you have the Feel Core up and running.

#### Add-peers-to-config-Single-Node
In order to run network test in single node add peer to [config](fixtures/config.json)

If Feel Core is running on localhost `127.0.0.1` then add the ip to peers section like below or if it is running inside docker or any other ip please include the same in peers section.

Example:
```
"peers": ["127.0.0.1"]
```

### Network-Mode
To run tests against network mode, start multiple [Feel Core](https://feel.surf/documentation/feel-core/setup/source) and configure peers list in  [Feel Core Default Config](https://github.com/feelfoundation/feel/blob/e81cb2af687b2e3a4f3bd8e159d44c4750e42166/config/default/config.json#L62) for peer discovery, once you have the Feel Core Network up and running.

#### Add-peers-to-config-Network-Mode
In order to run network test in Network mode add all the peers to [config](fixtures/config.json)

Example:
```
"peers": ["102.248.2.33", "101.248.1.21"]
```

### Enable-delegates
Once the peers config is updated in (Single/Network Mode) Enable delegates for forging

`Note: If the IP address is external, ensure the address is accessible for api to enable forging`
```
npm run tools:delegates:enable
```

### Running-Feel-Core-Protocol-Features-Tests
```
npm run features
```

### Running-Generic-Stress-Test
`Note: Transaction pool limit is 1000 so STRESS_COUNT is limited to 1000.`
```
STRESS_COUNT=1000 npm run stress:generic
```

### Running-Diversified-Stress-Test
```
npm run stress:diversified
```

### Running-Reports
```
npm run report
```
