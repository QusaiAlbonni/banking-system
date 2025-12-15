import { isProfane } from '@/profanity';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

@ValidatorConstraint({ name: 'notProfane', async: false })
export class NotProfaneValidator implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return !isProfane(text);
  }

  defaultMessage(args: ValidationArguments): any {
    return i18nValidationMessage('validation.notProfane');
  }
}
