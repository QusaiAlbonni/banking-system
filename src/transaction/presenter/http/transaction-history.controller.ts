import {
  Controller,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { ActiveGuard, JwtGuard } from '@/auth/guard';
import { GetUser } from '@/common/decorator';
import { AuthenticatedUser } from '@/auth/domain/authenticated-user';
import { TransactionHistoryService } from '@/transaction/application/transaction-history.service';
import { TransactionHistoryQueryDto } from './dto/transaction-history-query.dto';
import {
  AccountTransactionHistoryDto,
  TransactionHistoryEntryDto,
} from './dto/transaction-history-response.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Transaction History')
@Controller('transactions/history')
@ApiBearerAuth()
@UseGuards(JwtGuard, ActiveGuard)
export class TransactionHistoryController {
  constructor(
    private readonly historyService: TransactionHistoryService,
  ) {}

  @ApiOperation({
    summary: 'Get Account Transaction History',
    description: 'Get comprehensive transaction history for an account with ledger entries, including balance tracking.',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction history retrieved successfully',
    type: AccountTransactionHistoryDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiQuery({
    name: 'accountId',
    type: String,
    description: 'Account ID to get history for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'startDate',
    type: String,
    description: 'Start date for filtering (ISO 8601 format)',
    required: false,
    example: '2024-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    description: 'End date for filtering (ISO 8601 format)',
    required: false,
    example: '2024-12-31T23:59:59Z',
  })
  @Get('account')
  async getAccountHistory(
    @Query('accountId') accountId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @GetUser() user?: AuthenticatedUser,
  ): Promise<AccountTransactionHistoryDto> {
    try {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;

      const history = await this.historyService.getAccountHistory(
        accountId,
        start,
        end,
      );

      return plainToInstance(AccountTransactionHistoryDto, history);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to retrieve transaction history',
      );
    }
  }

  @ApiOperation({
    summary: 'Get All Account Transactions',
    description: 'Get all transactions for an account, including pending transactions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    type: [TransactionHistoryEntryDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiQuery({
    name: 'accountId',
    type: String,
    description: 'Account ID to get transactions for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'startDate',
    type: String,
    description: 'Start date for filtering (ISO 8601 format)',
    required: false,
    example: '2024-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    description: 'End date for filtering (ISO 8601 format)',
    required: false,
    example: '2024-12-31T23:59:59Z',
  })
  @Get('account/all')
  async getAllAccountTransactions(
    @Query('accountId') accountId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @GetUser() user?: AuthenticatedUser,
  ): Promise<TransactionHistoryEntryDto[]> {
    try {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;

      const transactions = await this.historyService.getAllAccountTransactions(
        accountId,
        start,
        end,
      );

      return transactions.map((tx) =>
        plainToInstance(TransactionHistoryEntryDto, tx),
      );
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to retrieve transactions',
      );
    }
  }

  @ApiOperation({
    summary: 'Get Transaction History by Transaction ID',
    description: 'Get detailed history for a specific transaction, including all ledger entries.',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction history retrieved successfully',
    type: [TransactionHistoryEntryDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Transaction not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiQuery({
    name: 'transactionId',
    type: String,
    description: 'Transaction ID to get history for',
    example: '770e8400-e29b-41d4-a716-446655440002',
  })
  @Get('transaction')
  async getTransactionHistory(
    @Query('transactionId') transactionId: string,
    @GetUser() user?: AuthenticatedUser,
  ): Promise<TransactionHistoryEntryDto[]> {
    try {
      const history = await this.historyService.getTransactionHistory(
        transactionId,
      );

      return history.map((entry) =>
        plainToInstance(TransactionHistoryEntryDto, entry),
      );
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to retrieve transaction history',
      );
    }
  }
}

