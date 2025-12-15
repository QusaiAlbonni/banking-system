export abstract class AuthRepository {
  abstract login(email: string, password: string);
}
