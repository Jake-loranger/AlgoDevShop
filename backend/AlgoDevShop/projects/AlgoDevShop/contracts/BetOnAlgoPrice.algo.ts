import { Contract } from '@algorandfoundation/tealscript';

// Enum for bet condition (Over/Under)
enum BetCondition {
  Over = "Over",
  Under = "Under",
}

export class BetOnAlgoPrice extends Contract {

  /** Global state keys for the contract */
  price = GlobalStateKey<uint64>(); // Target price of ALGO
  targetDate = GlobalStateKey<uint64>(); // Target date (timestamp)
  condition = GlobalStateKey<string>(); // Bet condition (Over/Under)
  betAmount = GlobalStateKey<uint64>(); // Bet amount in Algos
  settled = GlobalStateKey<boolean>(); // If the bet has been settled

  /** 
   * Create the application 
   * 
   * @param price The target price of ALGO
   * @param date The target date (timestamp)
   * @param condition The condition (Over or Under)
   * @param amount The amount to bet (in ALGO)
   */
  createApplication(price: uint64, date: uint64, condition: BetCondition, amount: uint64): void {
    this.price.value = price;
    this.targetDate.value = date;
    this.condition.value = condition;
    this.betAmount.value = amount;
    this.settled.value = false;  // Initially the bet is not settled
  }

  /**
   * Opt-in to the contract (per user)
   */
  optIn(): void {
    assert(this.txn.sender !== this.app.creator, 'Creator cannot opt-in');

    // Check if user has enough ALGO to opt-in and interact with the contract
    const minBalance = globals.minBalance + globals.assetOptInMinBalance;
    assert(this.txn.sender.balance >= minBalance, 'Insufficient balance to opt-in');

    // Initialize local state for the user (no need for additional state at the moment)
    // LocalStateKey({
    //   sender: this.txn.sender,
    //   schema: { number: 0, string: 0 }
    // });
  }

  /**
   * Place a bet on the contract
   * 
   * @param amount The amount to wager in ALGO
   */
  placeBet(amount: uint64): void {
    assert(this.txn.sender !== this.app.creator, 'Creator cannot place a bet');
    assert(this.settled.value === false, 'The bet has already been settled');

    // Check if the bet amount matches the expected wager
    assert(amount === this.betAmount.value, 'Bet amount must match the expected wager');

    // Check that the user has sufficient balance to place the bet
    assert(this.txn.sender.balance >= amount, 'Insufficient balance to place the bet');

    // Deduct the amount from the user’s balance (for the bet)
    sendPayment({
      receiver: this.app.address,
      amount: amount
    });

    // Optionally store additional data about the bet (like user-specific bet status)
    // This can be added to local state or global state depending on the requirements
  }

  /**
   * Settle the bet based on whether the user won or lost
   * 
   * @param isWinner Boolean indicating if the sender is the winner
   */
  settleBet(isWinner: boolean): void {
    assert(this.settled.value === false, 'The bet has already been settled');

    // Mark the bet as settled
    this.settled.value = true;

    // If the sender is the winner, send them the bet amount (refunding the bet)
    if (isWinner) {
      sendPayment({
        receiver: this.txn.sender, // Sender receives the bet amount back
        amount: this.betAmount.value,
        closeRemainderTo: this.txn.sender // Optionally close any remaining balance to the sender
      });
    } else {
      // If the sender lost, the bet amount can stay with the contract or be transferred to another party
      sendPayment({
        receiver: this.app.creator, // Or another address if the bet was lost
        amount: this.betAmount.value,
        closeRemainderTo: this.app.creator // Optionally close any remaining balance to the creator
      });
    }
  }

  /**
   * Method to delete the application
   * This method transfers any remaining funds back to the creator
   */
  deleteApplication(): void {
    assert(this.txn.sender === this.app.creator, 'Only the creator can delete the application');

    // Transfer any remaining ALGO to the creator
    sendPayment({
      receiver: this.app.creator,
      amount: this.app.address.balance,
      closeRemainderTo: this.app.creator
    });
  }
}
