import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http';

export interface SimpleRequest {
  method: string;
  url: string;
  body: Record<string, unknown>;
  headers: IncomingHttpHeaders;
}

type RequestHandler = (
  request: SimpleRequest,
  response: ServerResponse<IncomingMessage>,
) => Promise<void>;
