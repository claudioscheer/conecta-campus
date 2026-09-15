import { OAuth2Client } from "google-auth-library";
import { env } from "../env";

export interface GoogleUserPayload {
  sub: string;
  email: string;
  name?: string;
  hd?: string;
}

export type GoogleTokenVerifier = (idToken: string) => Promise<GoogleUserPayload>;

const defaultVerifier: GoogleTokenVerifier = async (idToken: string) => {
  const clientId = env.GOOGLE_CLIENT_ID;
  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email) {
    throw new Error("Payload do token Google incompleto ou inválido.");
  }
  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    hd: payload.hd,
  };
};

let currentVerifier: GoogleTokenVerifier = defaultVerifier;

export function setGoogleTokenVerifier(verifier: GoogleTokenVerifier): void {
  currentVerifier = verifier;
}

export function resetGoogleTokenVerifier(): void {
  currentVerifier = defaultVerifier;
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleUserPayload> {
  return await currentVerifier(idToken);
}
