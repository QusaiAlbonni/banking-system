import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

@Entity('accounts')
export class AccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_type', type: 'varchar', length: 50 })
  accountType: string;

  @Column({ name: 'is_group', type: 'boolean', default: false })
  isGroup: boolean;

  @Column({ name: 'owner_id', type: 'varchar', length: 255 })
  ownerId: string;

  @Column({
    name: 'balance',
    type: 'numeric',
    precision: 18,
    scale: 2,
    default: 0,
  })
  balance: number;

  @Column({ name: 'status', type: 'varchar', length: 50 })
  status: string;

  @Column({
    name: 'loan_interest_rate',
    type: 'numeric',
    precision: 5,
    scale: 4,
    nullable: true,
  })
  loanInterestRate?: number;

  @Column({
    name: 'loan_min_payment',
    type: 'numeric',
    precision: 18,
    scale: 2,
    nullable: true,
  })
  loanMinPayment?: number;

  @Column({
    name: 'max_deposit',
    type: 'numeric',
    precision: 18,
    scale: 2,
    nullable: true,
  })
  maxDeposit?: number;

  @Column({
    name: 'max_withdrawal',
    type: 'numeric',
    precision: 18,
    scale: 2,
    nullable: true,
  })
  maxWithdrawal?: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @VersionColumn({ name: 'version' })
  version: number;

  @OneToMany(() => AccountGroupMemberEntity, (gm) => gm.groupAccount, {
    cascade: true,
  })
  groupMembers?: AccountGroupMemberEntity[];

  @OneToMany(() => AccountGroupMemberEntity, (gm) => gm.memberAccount, {
    cascade: true,
  })
  memberOfGroups?: AccountGroupMemberEntity[];
}

@Entity('account_group_members')
export class AccountGroupMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'group_account_id', type: 'uuid' })
  groupAccountId: string;

  @Column({ name: 'member_account_id', type: 'uuid' })
  memberAccountId: string;

  @Column({ name: 'role', type: 'varchar', length: 50, default: 'MEMBER' })
  role: string;

  @CreateDateColumn({ name: 'joined_at', type: 'timestamp' })
  joinedAt: Date;

  @ManyToOne(() => AccountEntity, (account) => account.groupMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_account_id' })
  groupAccount: AccountEntity;

  @ManyToOne(() => AccountEntity, (account) => account.memberOfGroups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'member_account_id' })
  memberAccount: AccountEntity;
}
