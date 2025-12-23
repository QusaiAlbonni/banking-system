import { Account } from '../account.interface';

export abstract class AccountDecorator extends Account {
  protected constructor(protected readonly decoratedAccount: Account) {
    super();
    this.id = decoratedAccount.id;
    this.ownerId = decoratedAccount.ownerId;
    this.status = decoratedAccount.status;
    this.createdAt = decoratedAccount.createdAt;
    this.updatedAt = decoratedAccount.updatedAt;
    this.metadata = decoratedAccount.metadata;
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
}
