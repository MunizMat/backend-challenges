import http from 'http';
import { createTransport } from 'nodemailer';
import { config } from 'dotenv';
import { z } from 'zod';
import { sendMailPOSTHandler } from './routes/send-email/POST';

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
    console.log(chunk);
    rawBody += chunk;
  });

  request.on('end', () => {
    let body = {};

    try {
      body = JSON.parse(rawBody);
    } catch (error) {
      console.error(error);

      response.statusCode = 406;
      return response.end();
    }

    const simplifiedRequest = {
      url: request.url || '',
      method: request.method || '',
      headers: request.headers,
      body,
    }

    sendMailPOSTHandler(simplifiedRequest, response);
  });




  response.end();
});

server.listen(port, () => {
  console.log(`Server up and running on port ${port}`);
  console.log(`http://localhost:${port}`);
})