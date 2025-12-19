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

  withdraw(amount: number): boolean {
    if (amount <= 0) return false;
    const adjusted = amount * (1 + this.withdrawFeePercent);
    return this.decoratedAccount.withdraw(adjusted);
  }

  deposit(amount: number): boolean {
    if (amount <= 0) return false;
    const bonus = amount * this.depositBonusPercent;
    const total = amount + bonus;
    return this.decoratedAccount.deposit(total);
  }
}

