import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsDateWithinPastSeconds(
  seconds: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDateWithinPastSeconds',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [seconds],
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!(value instanceof Date)) value = new Date(value);

          let [allowedSeconds] = args.constraints;
          const now = new Date();
          allowedSeconds *= 1000;
          const diffInSeconds = now.getTime() - value.getTime();

          return diffInSeconds >= -1000 && diffInSeconds <= allowedSeconds;
        },
        defaultMessage(args: ValidationArguments) {
          const [allowedSeconds] = args.constraints;
          return `${args.property} must be a date within the past ${allowedSeconds} seconds from now`;
        },
      },
    });
  };
}
