import {
  InvalidTransactionAmountException,
  MinimumPaymentRequiredException
} from '../../application/account.exceptions';
import { Account, DepositStrategy } from '../account.interface';
import { LOAN_INTEREST_RATE, LOAN_MIN_PAYMENT } from './strategy.constants';

/**
 * Loan account strategy - only allows deposits (repayments)
 * Tracks loan balance, interest, and validates minimum payments
 */
export class LoanAccountStrategy implements DepositStrategy {
  constructor(
    private readonly interestRate: number = LOAN_INTEREST_RATE,
    private readonly minPayment: number = LOAN_MIN_PAYMENT,
  ) {}

  deposit(account: Account, amount: number): void {
    // Validate amount
    if (amount <= 0 || !Number.isFinite(amount)) {
      throw new InvalidTransactionAmountException(account.id, amount, 'Amount must be greater than 0 and finite');
    }

    // Check minimum payment requirement
    if (amount < this.minPayment) {
      throw new MinimumPaymentRequiredException(account.id, amount, this.minPayment);
    }

    // Loan accounts typically have negative balance (debt)
    // Deposits reduce the debt (add to balance, which moves it toward zero)
    const balanceBefore = account.getBalance();
    account.increaseBalance(amount);

    // Calculate interest accrued (simplified - in real system, this would be more complex)
    const interestAccrued = this.calculateInterest(
      Math.abs(balanceBefore),
      this.interestRate,
    );

    // Update metadata with loan information
    const totalPaid = parseFloat(account.metadata.totalPaid || '0') + amount;
    const principalPaid =
      totalPaid - parseFloat(account.metadata.interestPaid || '0');
    account.metadata.totalPaid = totalPaid.toString();
    account.metadata.principalPaid = principalPaid.toString();
    account.metadata.interestRate = this.interestRate.toString();
    account.metadata.lastPayment = new Date().toISOString();
    account.metadata.interestAccrued = (
      parseFloat(account.metadata.interestAccrued || '0') + interestAccrued
    ).toString();

    account.updatedAt = new Date();
  }

  /**
   * Calculate interest accrued (simplified calculation)
   * In a real system, this would consider time periods, compounding, etc.
   */
  private calculateInterest(principal: number, rate: number): number {
    // Simplified: assume monthly interest calculation
    return principal * (rate / 12);
  }

  /**
   * Get remaining loan balance (absolute value of negative balance)
   */
  getRemainingBalance(account: Account): number {
    const balance = account.getBalance();
    return balance < 0 ? Math.abs(balance) : 0;
  }
}
