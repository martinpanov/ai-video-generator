const validationHandler: Record<string, (configValue: any, inputValue: any) => boolean> = {
  minLength: (minLength: number, value: string) => value.length < minLength,
  regex: (regex: RegExp, value: string) => !regex.test(value),
  isEqualTo: (stringToMatch: string | string[], value: string) => Array.isArray(stringToMatch) ? !stringToMatch.some(string => string === value) : stringToMatch !== value,
  min: (number: number, value) => value < number,
  max: (number: number, value) => value > number,
};

export function validation(data: Record<string, any>, validationSchema: any) {
  const errors: Record<string, string> = {};

  Object.entries(data).forEach(([key, value]) => {
    const schema = validationSchema[key as keyof typeof validationSchema];

    if (!schema) {
      return;
    };

    if (schema.skip) {
      const shouldSkip = Object.entries(schema.skip).some(([skipKey, skipValue]) => {
        return data[skipKey] === skipValue;
      });

      if (shouldSkip) {
        return;
      }
    }

    Object.entries(schema).forEach(([validationType, config]: [string, any]) => {
      if (validationType === 'skip') {
        return;
      }

      const handler = validationHandler[validationType as keyof typeof validationHandler];

      if (handler) {
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