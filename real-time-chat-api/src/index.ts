/* ------------- External --------------- */
import http from 'http';
import { config } from 'dotenv';

/* ------------- Utils --------------- */
import { ApiError } from '@/utils/ApiError';
import { logger } from '@/utils/logger';
import { json } from '@/utils/json';
import { isAuthorized } from '@/utils/isAuthorized';

/* ------------- Constants --------------- */
import { requestMapping } from '@/constants/requestMapping';

config();

const server = http.createServer();
const port = process.env.PORT || 3000;

server.on('request', async (request, response) => {
  logger.info('Received request', {
    userAgent: request.headers['user-agent'],
    host: request.headers.host,
    origin: request.headers.origin,
  });

  let rawBody = '';

  request.on('data', chunk => {
    rawBody += chunk;
  });

  request.on('end', async () => {
    let body = {};

    const methodsAvailable = requestMapping[request.url || ''];

    if (!methodsAvailable) {
      response.statusCode = 404;
      return response.end(json({ message: 'Resource does not exist' }));
    }

    const method = methodsAvailable.find(
      available => available.method === request.method,
    );

    if (!method) {
      response.statusCode = 405;
      return response.end(
        json({ message: 'Invalid method for the requested resource' }),
      );
    }

    if (method.protected) {
      const { isAuth } = isAuthorized(request);

      if (!isAuth) {
        response.statusCode = 401;
        return response.end(json({ message: 'Unauthorized' }));
      }
    }

    try {
      if (rawBody) body = JSON.parse(rawBody);

      const simplifiedRequest = {
        url: request.url || '',
        method: request.method || '',
        headers: request.headers,
        body,
      };

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

    return response.end();
  });
});

server.listen(port, async () => {
  logger.info(`Server up and running on port ${port}`);
  logger.info(
    `http://localhost:${port}\n---------------------\nAvailable Endpoints:`,
  );

  Object.entries(requestMapping).forEach(([path, methods]) => {
    methods.forEach(({ method }) => {
      logger.info(`${method} ${path}`);
    });
  });
});
