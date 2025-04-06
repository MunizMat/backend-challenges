/* -------------- Types --------------- */
import { registerPOSTHandler } from '@/routes/register/POST';
import { RequestHandler } from '@/types';

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
      protected: true,
    },
  ],
};
