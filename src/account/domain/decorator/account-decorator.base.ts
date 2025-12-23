import { Account } from '../account.interface';

export abstract class AccountDecorator extends Account {
  protected constructor(protected readonly decoratedAccount: Account) {
    super();
  }

  getBalance(): number {
    return this.decoratedAccount.getBalance();
  }

  withdraw(amount: number): void {
    this.decoratedAccount.withdraw(amount);
  }

  deposit(amount: number): void {
    this.decoratedAccount.deposit(amount);
  }

  decreaseBalance(amount: number): void {
    this.decoratedAccount.decreaseBalance(amount);
  }

  increaseBalance(amount: number): void {
    this.decoratedAccount.increaseBalance(amount);
  }

  getInterest(amount: number): number {
    return this.decoratedAccount.getInterest(amount);
  }
}
