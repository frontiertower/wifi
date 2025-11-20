import crypto from "crypto";

const OAUTH_CONFIG = {
  authorizeUrl: "https://api.berlinhouse.com/o/authorize/",
  tokenUrl: "https://api.berlinhouse.com/o/token/",
  revokeUrl: "https://api.berlinhouse.com/o/revoke_token/",
  userInfoUrl: "https://api.berlinhouse.com/o/userinfo/",
};

export function generateCodeVerifier(): string {
  // Generate 64 random bytes (512 bits of entropy)
  const buffer = crypto.randomBytes(64);
  return buffer
    .toString("base64url")
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const hash = crypto.createHash("sha256").update(codeVerifier).digest();
  return Buffer.from(hash)
    .toString("base64url")
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function generateCSRFToken(): string {
  return crypto.randomUUID();
}

export function getOAuthLoginUrl(
  clientId: string,
  redirectUri: string,
  csrfToken: string,
  codeChallenge: string
): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "read write openid",
    state: csrfToken,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return `${OAUTH_CONFIG.authorizeUrl}?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  error?: string;
}

export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  codeVerifier: string
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
    code_verifier: codeVerifier,
  });

  const response = await fetch(OAUTH_CONFIG.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  return response.json();
}

export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(OAUTH_CONFIG.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  return response.json();
}

export async function revokeToken(
  token: string,
  clientId: string,
  clientSecret: string
): Promise<boolean> {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    token,
  });

  const response = await fetch(OAUTH_CONFIG.revokeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  return response.ok;
}

interface UserInfo {
  id: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

export async function getUserInfo(
  accessToken: string,
  tokenType: string
): Promise<UserInfo> {
  const response = await fetch(OAUTH_CONFIG.userInfoUrl, {
    headers: {
      Accept: "application/json",
      Authorization: `${tokenType} ${accessToken}`,
    },
  });

  return response.json();
}
