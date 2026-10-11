// 'empty' is not a failure: the server answered, but there is nothing to show yet (for example before the first sensor report).
export type ApiErrorKind = 'config' | 'network' | 'timeout' | 'server' | 'empty';

export class ApiError extends Error {
  kind: ApiErrorKind;
  status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}
