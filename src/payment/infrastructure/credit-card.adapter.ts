import { Injectable } from '@nestjs/common';
import { PaymentGateway } from '../application/payment-gateway.interface';

// Placeholder for third-party SDK
export class ThirdPartyCreditCardAPI {}

@Injectable()
export class CreditCardAdapter implements PaymentGateway {
  constructor(private readonly api: ThirdPartyCreditCardAPI) {}

  charge(amount: number): boolean {
    void amount;
    // integrate with third-party API
    return true;
  }

  payout(amount: number): boolean {
    void amount;
    // integrate with third-party API
    return true;
  }
}
