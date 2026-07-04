let accessTokenValue: string | undefined;

export function setAccessToken(token: string | undefined) {
  accessTokenValue = token;
}

export function getAccessToken(): string | undefined {
  return accessTokenValue;
}
