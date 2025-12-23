import { Account } from "../account.interface";

export interface DepositStrategy {
  deposit(account: Account, amount: number): boolean;
}