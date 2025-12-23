import { AccountClosedException, AccountNotActiveException } from '../application/account.exceptions';
import { AccountStatus } from './account-status.enum';
import { Account } from './account.interface';

export class IndividualAccount extends Account {
  balance = 0;
  primaryOwnerName!: string;

  getBalance(): number {
    return this.balance;
  }

  decreaseBalance(amount: number): void {
    this.balance -= amount;
  }
  increaseBalance(amount: number): void {
    this.balance += amount;
  }
}

export class GroupAccount extends Account {
  private _aggregatedBalance = 0;
  groupName!: string;
  isGroup: true;
  members: Account[] = [];

  get balance(){
    return this.getBalance();
  }

  getBalance(): number {
    if (this.members.length > 0) {
      // derive aggregated balance from members
      this._aggregatedBalance = this.members.reduce(
        (sum, member) => sum + member.getBalance(),
        0,
      );
    }
    return this._aggregatedBalance;
  }

  withdraw(amount: number): void {
    // Validate group account state first (State Pattern)
    // GroupAccount doesn't use strategies on itself, so we validate state directly
    if (!this['currentState']) {
      throw new Error('Account state is not initialized');
    }
    const stateName = this['currentState'].getName();
    
    // Only ACTIVE state allows withdrawals
    if (stateName !== AccountStatus.ACTIVE) {
      if (stateName === AccountStatus.CLOSED) {
        throw new AccountClosedException(this.id, 'withdraw');
      }
      throw new AccountNotActiveException(this.id, stateName, 'withdraw');
    }
    
    // State validation passed, now distribute to members
    // Each member will validate its own state and strategy
    if (amount <= 0 || this.members.length === 0) {
      return;
    }
    const share = amount / this.members.length;

    // Attempt withdrawals on all members
    // If any fails, exception will propagate (rollback would be handled at transaction level)
    for (const member of this.members) {
      member.withdraw(share);
    }

    this.getBalance();
  }

  deposit(amount: number): void {
    // Validate group account state first (State Pattern)
    // GroupAccount doesn't use strategies on itself, so we validate state directly
    if (!this['currentState']) {
      throw new Error('Account state is not initialized');
    }
    const stateName = this['currentState'].getName();
    
    // Only ACTIVE state allows deposits
    if (stateName !== AccountStatus.ACTIVE) {
      if (stateName === AccountStatus.CLOSED) {
        throw new AccountClosedException(this.id, 'deposit');
      }
      throw new AccountNotActiveException(this.id, stateName, 'deposit');
    }
    
    // State validation passed, now distribute to members
    // Each member will validate its own state and strategy
    if (amount <= 0 || this.members.length === 0) {
      return;
    }
    const share = amount / this.members.length;

    // Attempt deposits on all members
    // If any fails, exception will propagate (rollback would be handled at transaction level)
    for (const member of this.members) {
      member.deposit(share);
    }

    this.getBalance();
  }

  decreaseBalance(amount: number): void {
    throw new Error('Group accounts should not be called directly');
  }

  increaseBalance(amount: number): void {
    throw new Error('Group accounts should not be called directly');
  }
}
