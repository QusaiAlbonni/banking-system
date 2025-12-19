import { Account } from '../account.interface';
import { OverdraftDecorator } from './overdraft.decorator';
import { InsuranceDecorator } from './insurance.decorator';
import { PremiumDecorator } from './premium.decorator';

type DecoratorFactory = (account: Account) => Account;

const makeAccountPropertyDecorator =
  (factory: DecoratorFactory): PropertyDecorator =>
  (target: unknown, propertyKey: string | symbol) => {
    let value: Account;
    Object.defineProperty(target, propertyKey, {
      get: () => value,
      set: (newVal: Account) => {
        value = factory(newVal);
      },
      enumerable: true,
      configurable: true,
    });
  };

export const WithOverdraft = (limit: number): PropertyDecorator =>
  makeAccountPropertyDecorator(
    (account) => new OverdraftDecorator(account, limit),
  );

export const WithInsurance = (feePercent = 0.01): PropertyDecorator =>
  makeAccountPropertyDecorator(
    (account) => new InsuranceDecorator(account, feePercent),
  );

export const WithPremium = (
  depositBonusPercent = 0.01,
  withdrawFeePercent = 0.005,
): PropertyDecorator =>
  makeAccountPropertyDecorator(
    (account) =>
      new PremiumDecorator(account, depositBonusPercent, withdrawFeePercent),
  );
