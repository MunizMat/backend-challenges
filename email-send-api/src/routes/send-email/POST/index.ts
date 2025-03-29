import z from 'zod';
import { SimpleRequest } from '../../../@types';
import { IncomingMessage, ServerResponse } from 'http';
import { createTransport } from 'nodemailer';
import Handlebars from 'handlebars';

const bodyShape = z.object({
  subject: z.string().nonempty(),
  to: z.array(z.string().nonempty()
  ).nonempty(),
  variables: z.record(z.string()).optional().nullable(),
  html: z.string().nonempty(),
  plainText: z.string().nonempty(),
});

export const sendMailPOSTHandler = (request: SimpleRequest, response: ServerResponse<IncomingMessage>) => {
  const body = bodyShape.parse(request.body);
  let { html, plainText } = body;


  if (body.variables) {
    const htmlTemplate = Handlebars.compile(html);
    const plainTextTemplate = Handlebars.compile(plainText);

    html = htmlTemplate(body.variables);
    plainText = plainTextTemplate(body.variables);
  }


  const transporter = createTransport({
    service: 'gmail',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  transporter.sendMail({
    from: process.env.SMTP_USER,
    to: body.to,
    subject: body.subject,
    text: plainText,
    html,
  });
}