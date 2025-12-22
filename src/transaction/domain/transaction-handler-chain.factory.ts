import { Injectable } from '@nestjs/common';
import {
  ManagerApprovalHandler,
  RiskCheckHandler,
  SmallTransactionHandler,
  TransactionHandler,
} from './transaction.handler';

/**
 * Factory for creating approval handler chains
 * Allows runtime configuration of the approval workflow
 */
@Injectable()
export class TransactionHandlerChainFactory {
  createDefaultChain(): TransactionHandler {
    const smallTransactionHandler = new SmallTransactionHandler(1000);
    const riskCheckHandler = new RiskCheckHandler(10000, 70);
    const managerApprovalHandler = new ManagerApprovalHandler();

    // Build chain: SmallTransaction -> RiskCheck -> ManagerApproval
    smallTransactionHandler.setNextHandler(riskCheckHandler);
    riskCheckHandler.setNextHandler(managerApprovalHandler);

    return smallTransactionHandler;
  }

  createCustomChain(
    smallThreshold?: number,
    highRiskThreshold?: number,
    riskScoreThreshold?: number,
  ): TransactionHandler {
    const smallTransactionHandler = new SmallTransactionHandler(
      smallThreshold ?? 1000,
    );
    const riskCheckHandler = new RiskCheckHandler(
      highRiskThreshold ?? 10000,
      riskScoreThreshold ?? 70,
    );
    const managerApprovalHandler = new ManagerApprovalHandler();

    smallTransactionHandler.setNextHandler(riskCheckHandler);
    riskCheckHandler.setNextHandler(managerApprovalHandler);

    return smallTransactionHandler;
  }
}

