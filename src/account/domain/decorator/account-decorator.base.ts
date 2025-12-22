import { Account } from '../account.interface';

export abstract class AccountDecorator extends Account {
  protected constructor(protected readonly decoratedAccount: Account) {
    super();
  }

  getBalance(): number {
    return this.decoratedAccount.getBalance();
  }

  withdraw(amount: number): boolean {
    return this.decoratedAccount.withdraw(amount);
  }

  deposit(amount: number): boolean {
    return this.decoratedAccount.deposit(amount);
  }

  decreaseBalance(amount: number): void {
    this.decoratedAccount.decreaseBalance(amount);
  }

  increaseBalance(amount: number): void {
    this.decoratedAccount.decreaseBalance(amount);
  }

  getInterest(amount: number): number {
    return this.decoratedAccount.getInterest(amount);
  }
}
