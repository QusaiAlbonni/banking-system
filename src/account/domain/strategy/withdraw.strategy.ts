import { Account } from "../account.interface";

export interface WithdrawStrategy {
  withdraw(account: Account, amount: number): void;
}