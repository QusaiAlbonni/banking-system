import { Account } from "../domain/account.interface";

export abstract class AccountRepository {
  abstract getAccount(id: string): Promise<Account | null>;
  abstract save(account: Account): Promise<void>;
}