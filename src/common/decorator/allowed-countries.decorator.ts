import { registerDecorator, ValidationOptions } from 'class-validator';

import { CountryCode } from 'libphonenumber-js';
import { AllowedCountriesPhoneValidator } from '../validator/allowed-countries.validator';

export function IsPhoneFromCountries(
  countries: CountryCode[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPhoneFromCountries',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [countries],
      validator: AllowedCountriesPhoneValidator,
    });
  };
}
