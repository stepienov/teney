export type UserProfile = {
  email: string;
  preferredLocale: string | null;
  countryCode: string | null;
  favoriteCount: number;
};

export type UserAuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: UserProfile;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: UserProfile;
};

export type RegisterRequest = {
  email: string;
  password: string;
  preferredLocale?: string;
  countryCode?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type PatchMeRequest = {
  preferredLocale?: string;
  countryCode?: string;
};

export type ProblemFieldError = {
  field: string;
  message: string;
};

export type ProblemJson = {
  status?: number;
  title?: string;
  detail?: string;
  code?: string;
  fieldErrors?: ProblemFieldError[];
};
