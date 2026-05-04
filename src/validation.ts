export const INVALID_CHARACTERS_MESSAGE =
  '郵便番号は半角数字のみまたは半角数字とハイフンのみで入力してください。';

export const INVALID_FORMAT_MESSAGE =
  '郵便番号は半角数字でハイフンありの8桁かハイフンなしの7桁で入力してください。';

const ALLOWED_CHARACTERS_PATTERN = /^[0-9-]+$/;
const ZIPCODE_FORMAT_PATTERN = /^([0-9]{3}-[0-9]{4}|[0-9]{7})$/;

export function validateZipcode(value: string): string | null {
  if (!ALLOWED_CHARACTERS_PATTERN.test(value)) {
    return INVALID_CHARACTERS_MESSAGE;
  }

  if (!ZIPCODE_FORMAT_PATTERN.test(value)) {
    return INVALID_FORMAT_MESSAGE;
  }

  return null;
}

