Feature: Cast Vote

  As a user
  I want to cast my vote to delegate
  So that the delegate can maintain the blockchain

  Background: Account setup
    Given "thor" has a feel account with balance 100 F39 tokens
    Given "thor" register as a delegate

  Scenario: vote for delegate
    Given "odin" has a feel account with balance 100 F39 tokens
    When "odin" cast vote for a delegate "thor"
    Then delegate "thor" should received vote from "odin"

  Scenario: vote for myself
    When "thor" cast my vote for himself
    Then delegate "thor" should received vote from "thor"
