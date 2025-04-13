/* -------------- Types --------------- */
import { RequestHandler } from '@/types';

/* -------------- Routes --------------- */
import { registerPOSTHandler } from '@/modules/users/routes/register/POST';
import { loginPOSTHandler } from '@/modules/authentication/routes/login/POST';

interface RequestMapping {
  [key: string]: {
    method: string;
    handler: RequestHandler;
    protected?: boolean;
  }[];
}

export const requestMapping: RequestMapping = {
  '/register': [
    {
      method: 'POST',
      handler: registerPOSTHandler,
    },
  ],
  '/login': [
    {
      method: 'POST',
      handler: loginPOSTHandler,
    },
  ],
};
