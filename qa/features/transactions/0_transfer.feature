Feature: Transfer F39

  As a user I want to transfer amount(F39) from my account to other users

  Scenario: Transfer token to another account
    Given "thor" has a feel account with balance 100 F39 tokens
    Then "thor" should be able to send 1F39 tokens to "loki"

  Scenario: Transfer token to self
    Given "thor" has a feel account with balance 100 F39 tokens
    Then "thor" should be able to send 1F39 tokens to himself
