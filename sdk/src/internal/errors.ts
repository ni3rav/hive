export class HiveApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    status = 500,
    code = "SDK_ERROR",
    details?: unknown,
  ) {
    super(message);
    this.name = "HiveApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
