import { Connection, QueryResult, QueryResultRow } from 'pg';

declare module "pg-cursor"
{
  export interface CursorConfig { 
    rowMode?: 'array';
    types?: any[];
  }

  export class Cursor {
    public constructor(text: string, values?: any[], config?: CursorConfig);
    public submit(conn: Connection): void;
    public end(callback: () => void): void;
    public close(callback?: (err: Error) => void): void;
    public read(rowCount: number, calbback: (error: Error | null, results: QueryResultRow[], result: QueryResult) => void): void;
  }
}