import { AuthenticatedUser } from '@/auth/domain/authenticated-user';
import { ActiveGuard, JwtGuard } from '@/auth/guard';
import { GetUser } from '@/common/decorator';
import { DepositService } from '@/transaction/application/deposit.service';
import { TransferService } from '@/transaction/application/transfer.service';
import { WithdrawService } from '@/transaction/application/withdraw.service';
import {
    BadRequestException,
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { ApproveTransactionDto } from './dto/approve-transaction.dto';
import { DepositRequestDto } from './dto/deposit-request.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransferRequestDto } from './dto/transfer-request.dto';
import { WithdrawRequestDto } from './dto/withdraw-request.dto';

@ApiTags('Transactions')
@Controller('transactions')
@ApiBearerAuth()
@UseGuards(JwtGuard, ActiveGuard)
export class TransactionController {
  constructor(
    private readonly depositService: DepositService,
    private readonly withdrawService: WithdrawService,
    private readonly transferService: TransferService,
  ) {}

  @ApiOperation({
    summary: 'Process Deposit',
    description: 'Deposit funds into an account. May require manager approval for large amounts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Deposit processed successfully or pending approval',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or account not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiBody({ type: DepositRequestDto })
  @HttpCode(HttpStatus.OK)
  @Post('deposit')
  async processDeposit(
    @Body() dto: DepositRequestDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<TransactionResponseDto> {
    try {
      const ctx = await this.depositService.processDeposit(
        dto.accountId,
        dto.amount,
      );

      return this.mapToResponse(ctx);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to process deposit',
      );
    }
  }

  @ApiOperation({
    summary: 'Process Withdrawal',
    description: 'Withdraw funds from an account. May require manager approval for large amounts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal processed successfully or pending approval',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data, insufficient funds, or account not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiBody({ type: WithdrawRequestDto })
  @HttpCode(HttpStatus.OK)
  @Post('withdraw')
  async processWithdraw(
    @Body() dto: WithdrawRequestDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<TransactionResponseDto> {
    try {
      const ctx = await this.withdrawService.processWithdraw(
        dto.accountId,
        dto.amount,
      );

      return this.mapToResponse(ctx);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to process withdrawal',
      );
    }
  }

  @ApiOperation({
    summary: 'Process Transfer',
    description: 'Transfer funds between accounts. May require manager approval for large amounts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Transfer processed successfully or pending approval',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data, insufficient funds, or accounts not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiBody({ type: TransferRequestDto })
  @HttpCode(HttpStatus.OK)
  @Post('transfer')
  async processTransfer(
    @Body() dto: TransferRequestDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<TransactionResponseDto> {
    try {
      const ctx = await this.transferService.requestTransfer(
        dto.fromAccountId,
        dto.toAccountId,
        dto.amount,
      );

      return this.mapToResponse(ctx);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to process transfer',
      );
    }
  }

  @ApiOperation({
    summary: 'Approve Deposit',
    description: 'Approve a pending deposit transaction that requires manager approval.',
  })
  @ApiResponse({
    status: 200,
    description: 'Deposit approved and processed successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Transaction does not require approval or not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiBody({ type: ApproveTransactionDto })
  @HttpCode(HttpStatus.OK)
  @Post('deposit/approve')
  async approveDeposit(
    @Body() dto: ApproveTransactionDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<TransactionResponseDto> {
    try {
      const ctx = await this.depositService.approveDeposit(
        dto.transactionId,
        dto.approvedBy,
      );

      return this.mapToResponse(ctx);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to approve deposit',
      );
    }
  }

  @ApiOperation({
    summary: 'Approve Withdrawal',
    description: 'Approve a pending withdrawal transaction that requires manager approval.',
  })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal approved and processed successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Transaction does not require approval or not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiBody({ type: ApproveTransactionDto })
  @HttpCode(HttpStatus.OK)
  @Post('withdraw/approve')
  async approveWithdraw(
    @Body() dto: ApproveTransactionDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<TransactionResponseDto> {
    try {
      const ctx = await this.withdrawService.approveWithdraw(
        dto.transactionId,
        dto.approvedBy,
      );

      return this.mapToResponse(ctx);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to approve withdrawal',
      );
    }
  }

  @ApiOperation({
    summary: 'Approve Transfer',
    description: 'Approve a pending transfer transaction that requires manager approval.',
  })
  @ApiResponse({
    status: 200,
    description: 'Transfer approved and processed successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Transaction does not require approval or not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiBody({ type: ApproveTransactionDto })
  @HttpCode(HttpStatus.OK)
  @Post('transfer/approve')
  async approveTransfer(
    @Body() dto: ApproveTransactionDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<TransactionResponseDto> {
    try {
      const ctx = await this.transferService.approveTransfer(
        dto.transactionId,
        dto.approvedBy,
      );

      return this.mapToResponse(ctx);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to approve transfer',
      );
    }
  }

  private mapToResponse(ctx: any): TransactionResponseDto {
    const transaction = ctx.getTransaction();
    return plainToInstance(TransactionResponseDto, {
      id: transaction.id,
      fromAccountId: transaction.fromAccountId,
      toAccountId: transaction.toAccountId,
      type: transaction.type,
      amount: transaction.amount,
      status: transaction.status,
      createdAt: transaction.createdAt,
      executedAt: transaction.executedAt,
      requiresManagerApproval: ctx.requiresManagerApproval,
      riskScore: ctx.riskScore,
      approvalNotes: ctx.approvalNotes,
      approvedBy: ctx.approvedBy,
      approvedAt: ctx.approvedAt,
    });
  }
}

