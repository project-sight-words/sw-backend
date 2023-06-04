/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { registerDecorator, ValidationOptions } from "class-validator";

export function IsTimeWithTimezone(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "IsTimeWithTimezone",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: string) {
          // Regular expression to match a valid PostgreSQL time with time zone format
          const pattern =
            /^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]\s?([+-](0[0-9]|1[0-5])[0-5][0-9])$/;
          return typeof value === "string" && pattern.test(value);
        },
        defaultMessage: () =>
          propertyName +
          " must be a valid time with timezone (eg. 12:00:00 +0800)",
      },
    });
  };
}
