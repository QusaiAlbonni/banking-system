import { Account } from '../account.interface';
import { AccountDecorator } from './account-decorator.base';

export class OverdraftDecorator extends AccountDecorator {
  constructor(
    account: Account,
    private readonly overdraftLimit: number,
  ) {
    super(account);
  }

  withdraw(amount: number): void {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than 0');
    }
    const currentBalance = this.decoratedAccount.getBalance();
    const allowed = currentBalance + this.overdraftLimit;
    if (allowed < amount) {
      throw new Error(`Withdrawal amount ${amount} exceeds available balance ${currentBalance} plus overdraft limit ${this.overdraftLimit}`);
    }
    this.decoratedAccount.withdraw(amount);
  }
}

