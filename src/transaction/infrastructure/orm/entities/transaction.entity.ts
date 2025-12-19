import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { AccountEntity } from '@/account/infrastructure/orm/entities/account.entity';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'from_account_id', type: 'uuid', nullable: true })
  fromAccountId?: string;

  @Column({ name: 'to_account_id', type: 'uuid', nullable: true })
  toAccountId?: string;

  @Column({ name: 'type', type: 'varchar', length: 50 })
  type: string;

  @Column({ name: 'amount', type: 'numeric', precision: 18, scale: 2 })
  amount: number;

  @Column({ name: 'status', type: 'varchar', length: 50 })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'executed_at', type: 'timestamp', nullable: true })
  executedAt?: Date;

  @VersionColumn({ name: 'version' })
  version: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => AccountEntity, { nullable: true })
  fromAccount?: AccountEntity;

  @ManyToOne(() => AccountEntity, { nullable: true })
  toAccount?: AccountEntity;
}

@Entity('ledger_entries')
export class LedgerEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'transaction_id', type: 'uuid' })
  transactionId: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @Column({ name: 'entry_type', type: 'varchar', length: 10 })
  entryType: string;

  @Column({ name: 'amount', type: 'numeric', precision: 18, scale: 2 })
  amount: number;

  @Column({ name: 'balance_before', type: 'numeric', precision: 18, scale: 2 })
  balanceBefore: number;

  @Column({ name: 'balance_after', type: 'numeric', precision: 18, scale: 2 })
  balanceAfter: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}


