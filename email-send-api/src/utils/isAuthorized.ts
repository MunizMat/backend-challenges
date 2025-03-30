/* ----------- External ------------ */
import { IncomingMessage } from "http";
import { verify } from "jsonwebtoken";

export const isAuthorized = (request: IncomingMessage) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return false;

  const [, token] = authHeader.split(' ');

  try {
    verify(token, process.env.JWT_SECRET || '');

    return true;
  } catch (e) {
    return false;
  }
}