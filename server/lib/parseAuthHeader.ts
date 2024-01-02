// import { verifyToken } from "client/lib/token";
import jwt, { JwtPayload } from "jsonwebtoken";
// import {CERT_PUBLIC, JWT_ISSUER} from '../../env.config';

export const parseAuthHeader = async (authHeader: string = "") => {
  try {
    const token = authHeader.replace(/Bearer /i, "");
    console.log("token: ", token);
    // return await verifyToken(token, projectId);
  } catch (e) {}

  return null;
};
