// import { verifyToken } from "client/lib/token";
import jwt, { JwtPayload } from "jsonwebtoken";
import AuthService, {
  TokenSubject,
} from "server/models/User/services/Auth.service";
// import {CERT_PUBLIC, JWT_ISSUER} from '../../env.config';

export const parseAuthHeader = async (authHeader = "") => {
  try {
    const token = authHeader.replace(/Bearer /i, "");

    if (!!token) {
      const authService = AuthService.getInstance();
      return await authService.verifyToken(
        token,
        TokenSubject.ACCESS_TOKEN_SUBJECT
      );
    }
  } catch (e) {}

  return null;
};
