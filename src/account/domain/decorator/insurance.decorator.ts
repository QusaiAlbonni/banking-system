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

  withdraw(amount: number): void {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than 0');
    }
    const withFee = amount * (1 + this.feePercent);
    this.decoratedAccount.withdraw(withFee);
  }
}

