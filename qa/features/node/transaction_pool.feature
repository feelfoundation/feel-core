
Feature: Node transaction pool

	By specifying the state of the transaction, I get a list of transactions in ready queue.
	As a user I should be able to search for specific transactions by providing the appropriate parameters.

	Scenario: Unprocessed, Unconfirmed transactions
		Given "thor" has a feel account with balance 100 F39 tokens
		When "thor" send 1 F39 token to 15 random accounts
		Then I should get list of transactions in "ready" queue

	Scenario: Unsigned transactions
		Given "heimdall" has a feel account with balance 100 F39 tokens
		And "heimdall" creates a multisignature account with "thor", "odin"
		When "heimdall" sends 1 F39 token to a random account
		Then I should get list of transactions in "ready" queue
		When "thor" and "odin" sends the required signature
		Then multisignature transaction should get confirmed
