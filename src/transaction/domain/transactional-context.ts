import { Account } from '../../account/domain/account.interface';
import { Transaction } from './transaction';

export class TransactionalContext {
  transaction!: Transaction;
  fromAccount?: Account;
  toAccount?: Account;
  // dbSession is kept as unknown to avoid coupling to a specific ORM here.
  dbSession?: unknown;
  isNewTransaction = false;
  // Approval workflow fields
  requiresManagerApproval = false;
  riskScore?: number;
  approvalNotes?: string;
  approvedBy?: string;
  approvedAt?: Date;

  getTransaction(): Transaction {
    return this.transaction;
  }

  getFromAccount(): Account | undefined {
    return this.fromAccount;
  }

  getToAccount(): Account | undefined {
    return this.toAccount;
  }

  markForManagerApproval(reason: string): void {
    this.requiresManagerApproval = true;
    this.approvalNotes = reason;
  }

  approve(approvedBy: string): void {
    this.requiresManagerApproval = false;
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
  }

  clearManagerApprovalRequirement() {
    this.requiresManagerApproval = false;
  }
}
