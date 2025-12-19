import { Account } from '../account.interface';
import { AccountDecorator } from './account-decorator.base';

export class InsuranceDecorator extends AccountDecorator {
  constructor(
    account: Account,
    private readonly feePercent = 0.01,
  ) {
    super(account);
    this.metadata = { ...account.metadata, insured: 'true' };
  }

  withdraw(amount: number): boolean {
    if (amount <= 0) return false;
    const withFee = amount * (1 + this.feePercent);
    return this.decoratedAccount.withdraw(withFee);
  }
}

