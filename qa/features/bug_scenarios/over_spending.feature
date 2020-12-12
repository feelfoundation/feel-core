
Feature: Over spend from account

  I want to spend more F39 than what I have in my account

  Scenario: Transfer Transaction Scenario One
    Given I have account "A, B, X, Y, Z"
    Then I transfer 1F39 to account "A" from genesis account
    Then I transfer 1F39 to account "B" from genesis account
    Then I wait for transactions "A, B" to get confirmed in blockchain
    Then I wait for "1" blocks to make sure consicutive transactions included in one block
    Then I transfer "0.7"F39 from account "A" to "X"
    Then I transfer "0.6"F39 from account "B" to "Y"
    Then I transfer "0.3"F39 from account "A" to "B"
    Then I transfer "0.5"F39 from account "B" to "Z"
    Then I expect transfer "0.7"F39 from "A" to "X" should succeeded
    Then I expect transfer "0.6"F39 from "B" to "Y" should succeeded
    Then I expect transfer "0.3"F39 from "A" to "B" should fail
    Then I expect transfer "0.5"F39 from "B" to "Z" should fail

  Scenario: Transfer Transaction Scenario Two
    Given I have account "C, D, E, F"
    Then I transfer 1F39 to account "C" from genesis account
    Then I transfer 1F39 to account "D" from genesis account
    Then I wait for transactions "C, D" to get confirmed in blockchain
    Then I wait for "1" blocks to make sure consicutive transactions included in one block
    Then I transfer "0.6"F39 from account "C" to "E"
    Then I transfer "0.4"F39 from account "C" to "F"
    Then I transfer "0.3"F39 from account "D" to "C"
    Then I expect transfer "0.6"F39 from "C" to "E" should succeeded
    Then I expect transfer "0.4"F39 from "C" to "F" should fail
    Then I expect transfer "0.3"F39 from "D" to "C" should succeeded

  Scenario: Transfer and register second signature in one block
    Given I have account "SPP"
    Then I transfer 6F39 to account "SPP" from genesis account
    Then I wait for transactions "SPP" to get confirmed in blockchain
    Then I wait for "1" blocks to make sure consicutive transactions included in one block
    Then I transfer "0.01"F39 from second signature account "SPP" to "SPP"
    Then I register second passphrase on account "SPP"
    Then I expect transfer "0.01"F39 from "SPP" to "SPP" should succeeded
