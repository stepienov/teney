/** Common visitor countries — ISO 3166-1 alpha-2. Extend as needed. */
export const USER_COUNTRY_CODES = [
  "PL",
  "DE",
  "AT",
  "CH",
  "CZ",
  "SK",
  "HU",
  "RO",
  "UA",
  "GB",
  "IE",
  "FR",
  "BE",
  "NL",
  "LU",
  "ES",
  "IT",
  "PT",
  "DK",
  "SE",
  "NO",
  "FI",
  "IS",
  "US",
  "CA",
  "AU",
  "NZ",
  "BR",
  "AR",
  "MX",
  "RU",
  "TR",
  "IL",
  "IN",
  "CN",
  "JP",
  "KR",
] as const;

export type UserCountryCode = (typeof USER_COUNTRY_CODES)[number];

export function isUserCountryCode(value: string): value is UserCountryCode {
  return (USER_COUNTRY_CODES as readonly string[]).includes(value);
}

export function getCountrySelectOptions(
  locale: string,
): { value: UserCountryCode; label: string }[] {
  const displayNames = new Intl.DisplayNames([locale], { type: "region" });

  return USER_COUNTRY_CODES.map((code) => ({
    value: code,
    label: displayNames.of(code) ?? code,
  })).sort((a, b) => a.label.localeCompare(b.label, locale));
}
