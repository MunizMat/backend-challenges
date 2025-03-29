export interface SimpleRequest {
  headers: any;
  method: string;
  url: string;
  body: Record<string, unknown>;
}