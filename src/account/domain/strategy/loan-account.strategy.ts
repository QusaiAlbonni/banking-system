import {
  DepositNotAllowedException,
  InvalidTransactionAmountException,
  MinimumPaymentRequiredException
} from '../../application/account.exceptions';
import { LOAN_INTEREST_RATE, LOAN_MIN_PAYMENT } from './strategy.constants';
import { DepositStrategy } from './deposit.strategy';
import { Account } from '../account.interface';
import { InterestStrategy } from './interest.strategy';

/**
 * Loan account strategy - only allows deposits (repayments)
 * Tracks loan balance, interest, and validates minimum payments
 */
export class LoanAccountStrategy implements DepositStrategy {
  constructor(
    private readonly minPayment: number = LOAN_MIN_PAYMENT,
  ) {}

  deposit(account: Account, amount: number): void {
    // Basic validation
    if (amount <= 0 || !Number.isFinite(amount)) {
      throw new InvalidTransactionAmountException(account.id, amount, 'Amount must be greater than 0 and finite');
    }
    
    if (amount < this.minPayment) {
      throw new MinimumPaymentRequiredException(account.id, amount, this.minPayment);
    }

    const balanceBefore = account.getBalance(); // negative = debt
    if (balanceBefore >= 0) {
      // No outstanding loan (or already positive); policy: reject deposits to paid-off loans
      throw new DepositNotAllowedException(
        account.id,
        account.type,
        'Loan account has no outstanding balance. Deposits are only allowed for loan repayments.'
      );
    }

    const outstanding = Math.abs(balanceBefore);

    // Calculate interest for the period (account.getInterest should follow same convention)
    const interestAccrued = account.getInterest(outstanding);
    // Payment applies to interest first, then to principal
    const interestPaid = Math.min(amount, interestAccrued);
    let principalPayment = amount - interestPaid;

    // Don't pay more principal than outstanding
    if (principalPayment > outstanding) {
      // optional: cap and treat remainder as overpayment (positive balance)
      const overpay = principalPayment - outstanding;
      principalPayment = outstanding;
      // apply capped principal; overpay left will be applied below as positive deposit
      account.increaseBalance(principalPayment + interestPaid + overpay); // note: increaseBalance adds amount
      // update metadata below using full 'amount' as totalPaid
    } else {
      // Normal case: apply interest (paid out of amount) and the principal portion reduces the debt.
      account.increaseBalance(principalPayment);
    }

    // Update metadata
    const prevTotal = parseFloat(account.metadata.totalPaid || '0');
    const prevInterestPaid = parseFloat(account.metadata.interestPaid || '0');
    const prevPrincipalPaid = parseFloat(account.metadata.principalPaid || '0');
    const prevInterestAccrued = parseFloat(account.metadata.interestAccrued || '0');

    account.metadata.totalPaid = (prevTotal + amount).toString();
    account.metadata.interestPaid = (prevInterestPaid + interestPaid).toString();
    account.metadata.principalPaid = (prevPrincipalPaid + principalPayment).toString();
    account.metadata.interestAccrued = (prevInterestAccrued + interestAccrued).toString();
    account.metadata.lastPayment = new Date().toISOString();

    account.updatedAt = new Date();
  }

  getRemainingBalance(account: Account): number {
    const balance = account.getBalance();
    return balance < 0 ? Math.abs(balance) : 0;
  }
}


export class LoanInterestStrategy implements InterestStrategy {
  constructor(
    private readonly interestRate: number = LOAN_INTEREST_RATE,
  ) {}

  calculate(amount: number): number {
    return this.calculateInterest(amount, this.interestRate);
  }

  private calculateInterest(amount: number, rate: number): number {
    return amount * (rate / 12);
  }
}
