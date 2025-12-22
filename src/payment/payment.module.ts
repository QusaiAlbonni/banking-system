import { Module } from '@nestjs/common';
import {
  CreditCardAdapter,
  ThirdPartyCreditCardAPI,
} from './infrastructure/credit-card.adapter';
import { PaymentGateway } from './application/payment-gateway.interface';

@Module({
  providers: [
    ThirdPartyCreditCardAPI,
    CreditCardAdapter,
    { provide: PaymentGateway, useClass: CreditCardAdapter },
  ],
  exports: [CreditCardAdapter, PaymentGateway],
})
export class PaymentModule {}
