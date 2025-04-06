/* ----------- External ------------ */
import { IncomingMessage } from "http";
import { verify } from "jsonwebtoken";

interface IsAuthorizedOutput {
  token: string;
  isAuth: boolean;
}

export const isAuthorized = (request: IncomingMessage): IsAuthorizedOutput => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return { isAuth: false, token: '' };

  const [, token] = authHeader.split(' ');

  try {
    verify(token, process.env.JWT_SECRET || '');

    return { isAuth: true, token };
  } catch (e) {
    return { isAuth: false, token };
  }
}

