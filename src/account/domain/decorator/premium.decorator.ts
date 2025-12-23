import { Account } from '../account.interface';
import { AccountDecorator } from './account-decorator.base';

export class PremiumDecorator extends AccountDecorator {
  constructor(
    account: Account,
    private readonly depositBonusPercent = 0.01,
    private readonly withdrawFeePercent = 0.005,
  ) {
    super(account);
    this.metadata = { ...account.metadata, premium: 'true' };
  }

  withdraw(amount: number): void {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than 0');
    }
    const adjusted = amount * (1 + this.withdrawFeePercent);
    this.decoratedAccount.withdraw(adjusted);
  }

  deposit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Deposit amount must be greater than 0');
    }
    const bonus = amount * this.depositBonusPercent;
    const total = amount + bonus;
    this.decoratedAccount.deposit(total);
  }
}

