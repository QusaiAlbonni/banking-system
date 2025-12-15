export type TranslationArgs =
  | (
      | {
          [k: string]: any;
        }
      | string
    )[]
  | {
      [k: string]: any;
    };

export class I18nErrorMessage {
  key: string;
  args?: TranslationArgs;

  constructor(key: string, args?: TranslationArgs) {
    this.key = key;
    this.args = args;
  }
}

export function i18nErrorMessage(key: string, args?: TranslationArgs) {
  return new I18nErrorMessage(key, args);
}
