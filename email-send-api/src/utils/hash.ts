import { createHash } from 'node:crypto'

export const hash = (input: string, salt: string = '') =>
  createHash('sha256').update(`${salt}${input}`).digest('hex');