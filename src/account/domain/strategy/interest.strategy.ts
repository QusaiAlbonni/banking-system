export interface InterestStrategy {
  calculate(amount: number): number;
}