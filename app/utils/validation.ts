type ValidationConfig = {
  value: any;
  message: string;
};

type ValidationSchema<T> = {
  [K in keyof T]?: {
    minLength?: ValidationConfig;
    regex?: ValidationConfig;
    isEqualTo?: ValidationConfig;
    min?: ValidationConfig;
    max?: ValidationConfig;
    skip?: object;
  };
};

const validationHandler: Record<string, (configValue: any, inputValue: any) => boolean> = {
  minLength: (minLength: number, value: string) => value.length < minLength,
  regex: (regex: RegExp, value: string) => !regex.test(value),
  isEqualTo: (stringToMatch: string | string[], value: string) => Array.isArray(stringToMatch) ? !stringToMatch.some(string => string === value) : stringToMatch !== value,
  min: (number: number, value) => value < number,
  max: (number: number, value) => value > number,
};

export function validation<T extends Record<string, unknown>>(
  data: T,
  validationSchema: ValidationSchema<T>
) {
  const errors: Partial<Record<keyof T, string>> = {};

  (Object.entries(data) as [keyof T, any][]).forEach(([key, value]) => {
    const schema = validationSchema[key];

    if (!schema) {
      return;
    }

    if (schema.skip) {
      const shouldSkip = Object.entries(schema.skip).some(([skipKey, skipValue]) => {
        return data[skipKey as keyof T] === skipValue;
      });

      if (shouldSkip) {
        return;
      }
    }

    Object.entries(schema).forEach(([validationType, config]) => {
      if (validationType === 'skip') {
        return;
      }

      const handler = validationHandler[validationType];

      if (handler && config && typeof config === 'object' && 'value' in config) {
        const isInvalid = handler(config.value, value);
        if (isInvalid) {
          errors[key] = config.message;
        }
      }
    });
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}