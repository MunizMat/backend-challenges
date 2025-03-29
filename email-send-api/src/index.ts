/* ------------- External --------------- */
import http from 'http';
import { config } from 'dotenv';

/* ------------- Utils --------------- */
import { ApiError } from '@/utils/ApiError';
import { logger } from '@/utils/logger';

/* ------------- Handlers --------------- */
import { sendMailPOSTHandler } from '@/routes/send-email/POST';

const server = http.createServer();
const port = process.env.PORT || 3000;

config();

server.on('request', async (request, response) => {
  if (request.url !== '/send-email') {
    response.statusCode = 404;
    return response.end();
  }

  if (request.method !== 'POST') {
    response.statusCode = 405;
    return response.end();
  }

  let rawBody = '';

  request.on('data', (chunk) => {
    rawBody += chunk;
  });

  request.on('end', () => {
    let body = {};

    try {
      logger.info('Received request', {
        userAgent: request.headers['user-agent'],
        host: request.headers.host,
        origin: request.headers.origin
      });

      body = JSON.parse(rawBody);

      const simplifiedRequest = {
        url: request.url || '',
        method: request.method || '',
        headers: request.headers,
        body,
      }

      sendMailPOSTHandler(simplifiedRequest);

      response.statusCode = 200;
      response.end(JSON.stringify({ message: 'Email sent' }, null, 2));
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

server.listen(port, () => {
  logger.info(`Server up and running on port ${port}`);
  logger.info(`http://localhost:${port}`);
})