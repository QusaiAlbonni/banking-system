import { Account } from '../account.interface';
import { AccountDecorator } from './account-decorator.base';

export class OverdraftDecorator extends AccountDecorator {
  constructor(
    account: Account,
    private readonly overdraftLimit: number,
  ) {
    super(account);
  }

  withdraw(amount: number): boolean {
    if (amount <= 0) return false;
    const currentBalance = this.decoratedAccount.getBalance();
    const allowed = currentBalance + this.overdraftLimit;
    if (allowed < amount) {
      return false;
    }
    return this.decoratedAccount.withdraw(amount);
  }
}

