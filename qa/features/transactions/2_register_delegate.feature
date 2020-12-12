Feature: Register as a delegate

  As a user/miner/maintainer/investor
  I want to forge blocks and maintain blockchain
  So that the blockchain is reliable, secure and maintainable

  Scenario: Register user account as delegate
    Given "thor" has a feel account with balance 100 F39 tokens
    When "thor" register as a delegate
    Then "thor" has a account registered as delegate
