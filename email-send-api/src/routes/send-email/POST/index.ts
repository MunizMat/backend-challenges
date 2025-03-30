/* ------------- External ---------------- */
import z from 'zod';
import Handlebars from 'handlebars';
import { createTransport } from 'nodemailer';

/* ------------- Types ---------------- */
import { RequestHandler } from '@/types';

/* ------------- Utils ---------------- */
import { ApiError } from '@/utils/ApiError';
import { logger } from '@/utils/logger';
import { json } from '@/utils/json';
import { measureOperationTime } from '@/utils/measureOperationTime';

const attachmentShape = z.object({
  content: z.any().optional(),
  contentDisposition: z.enum(["attachment", "inline"]).optional(),
  contentType: z.string().optional(),
  filename: z.string().optional(),
  path: z.string().optional(),
  encoding: z.string().optional()
});

const bodyShape = z.object({
  subject: z.string().nonempty(),
  to: z.array(z.string().nonempty()
  ).nonempty(),
  variables: z.record(z.string()).optional().nullable(),
  html: z.string().nonempty().optional(),
  plainText: z.string().nonempty().optional(),
  attachDataUrls: z.boolean().optional(),
  cc: z.array(z.string()).optional(),
  bcc: z.array(z.string()).optional(),
  attachments: z.array(attachmentShape).optional()
}).refine((data) => data.html || data.plainText, "Either 'html' or 'plainText' must be specified");

export const sendMailPOSTHandler: RequestHandler = async (request, response) => {
  try {
    const body = bodyShape.parse(request.body);
    let { html, plainText, attachDataUrls, cc, bcc, attachments } = body;

    if (body.variables && html) {
      const htmlTemplate = Handlebars.compile(html);
      html = htmlTemplate(body.variables);
    }

    if (body.variables && plainText) {
      const plainTextTemplate = Handlebars.compile(plainText);
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

    logger.info('Sending email', {
      from: process.env.SMTP_USER,
      to: body.to,
      subject: body.subject,
      attachments: attachments?.length || 0,
      cc,
      bcc,
    });

    await measureOperationTime(() => transporter.sendMail({
      from: process.env.SMTP_USER,
      to: body.to,
      subject: body.subject,
      text: plainText,
      html,
      attachDataUrls,
      bcc,
      cc,
      attachments,
    }), 'Sent email');

    response.write(json({ message: 'Email sent' }));
  } catch (error) {
    throw ApiError.fromError(error);
  }
}