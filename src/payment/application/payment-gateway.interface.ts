export abstract class PaymentGateway {
  abstract charge(amount: number): boolean;
  abstract payout(amount: number): boolean;
}


