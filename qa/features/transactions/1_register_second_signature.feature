Feature: Register Second Signature on account

  As a user I want to secure my account with second signature

  Scenario: Register second signature
    Given "loki" has a feel account with balance 100 F39 tokens
    Given "loki" has a account with second signature

  Scenario: Transfer token to another account with second signature enabled
    When "loki" wants to transfer 1F39 to "thor"
    Then "thor" should receive 1F39 from "loki"

  Scenario: Transfer token to self with second signature enabled
    When "loki" transfers 1F39 token to himself
    Then "loki" should receive 1F39 in his account
