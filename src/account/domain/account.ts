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
  members: IndividualAccount[] = [];

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

  withdraw(amount: number): boolean {
    if (amount <= 0 || this.members.length === 0) {
      return false;
    }
    const share = amount / this.members.length;
    let success = true;

    for (const member of this.members) {
      const ok = member.withdraw(share);
      if (!ok) {
        success = false;
      }
    }

    this.getBalance();
    return success;
  }

  deposit(amount: number): boolean {
    if (amount <= 0 || this.members.length === 0) {
      return false;
    }
    const share = amount / this.members.length;

    for (const member of this.members) {
      member.deposit(share);
    }

    this.getBalance();
    return true;
  }

  decreaseBalance(amount: number): void {
    throw new Error('Group accounts should not be called directly');
  }

  increaseBalance(amount: number): void {
    throw new Error('Group accounts should not be called directly');
  }
}
