/* ------------- External --------------- */
import http from 'http';
import { config } from 'dotenv';
config();

/* ------------- Utils --------------- */
import { ApiError } from '@/utils/ApiError';
import { logger } from '@/utils/logger';

/* ------------- Types --------------- */
import { RequestHandler } from '@/types';

/* ------------- Utils --------------- */
import { json } from '@/utils/json';
import { isAuthorized } from '@/utils/isAuthorized';
import { measureOperationTime } from '@/utils/measureOperationTime';
import { rateLimit } from '@/utils/rateLimit';

/* ------------- Clients --------------- */
import { mongo } from '@/clients/mongodb';
import { redis } from '@/clients/redis';

/* ------------- Handlers --------------- */
import { sendMailPOSTHandler } from '@/routes/send-email/POST';
import { authenticationGETHandler } from '@/routes/authentication/GET';
import { authenticationPOSTHandler } from '@/routes/authentication/POST';

const server = http.createServer();
const port = process.env.PORT || 3000;


interface RequestMapping {
  [key: string]: Array<{
    method: string;
    handler: RequestHandler;
    protected?: boolean;
  }>
}

const requestMapping: RequestMapping = {
  '/send-email': [
    {
      method: 'POST',
      handler: sendMailPOSTHandler,
      protected: true,
    }
  ],
  '/authentication': [
    {
      method: 'GET',
      handler: authenticationGETHandler
    },
    {
      method: 'POST',
      handler: authenticationPOSTHandler
    }
  ]
}

server.on('request', async (request, response) => {
  logger.info('Received request', {
    userAgent: request.headers['user-agent'],
    host: request.headers.host,
    origin: request.headers.origin
  });

  let rawBody = '';

  request.on('data', (chunk) => {
    rawBody += chunk;
  });


  request.on('end', async () => {
    let body = {};

    const methodsAvailable = requestMapping[request.url || ''];

    if (!methodsAvailable) {
      response.statusCode = 404;
      return response.end(json({ message: 'Resource does not exist' }));
    }

    const method = methodsAvailable.find(({ method }) => method === request.method);

    if (!method) {
      response.statusCode = 405;
      return response.end(json({ message: 'Invalid method for the requested resource' }));
    }

    if (method.protected) {
      const { isAuth, token } = isAuthorized(request);

      if (!isAuth) {
        response.statusCode = 401;
        return response.end(json({ message: 'Unauthorized' }));
      }

      const { isRateLimited } = await rateLimit(token);

      if (isRateLimited) {
        response.statusCode = 429;
        return response.end(json({ message: 'Too many requests' }));
      }
    }

    try {
      if (rawBody) body = JSON.parse(rawBody);

      const simplifiedRequest = {
        url: request.url || '',
        method: request.method || '',
        headers: request.headers,
        body,
      }

      await method.handler(simplifiedRequest, response);

      response.statusCode = 200;
      response.end();
    } catch (error) {
      logger.error(`Error at ${request.method} ${request.url}: `, error);

      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        response.statusCode = 406;
        return response.end();
      }

      if (error instanceof ApiError) {
        response.statusCode = error.status;
        response.write(error.toJSON());
        return response.end();
      }

      return response.end();
    }
  });
});

server.listen(port, async () => {
  await measureOperationTime(() => mongo.connect(), 'Connected to MongoDB');
  await measureOperationTime(() => redis.connect(), 'Connected to Redis');

  logger.info(`Server up and running on port ${port}`);
  logger.info(`http://localhost:${port}\n---------------------\nAvailable Endpoints:`);

  Object.entries(requestMapping).forEach(([path, methods]) => {
    methods.forEach(({ method }) => {
      logger.info(`${method} ${path}`);
    })
  });
})