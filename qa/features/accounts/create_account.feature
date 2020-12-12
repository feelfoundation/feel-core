
Feature: Create Feel Account

  In order to use F39 token
  As a user
  I want to create feel account

  Scenario: Create account
    When I create a feel account
    And transfer 100F39 to account from genesis account
    Then feel account should be created with balance 100F39
