type HiveErrorContext = {
  method?: string;
  url?: string;
  path?: string;
  hint?: string;
};

function toPrettyMessage(input: {
  message: string;
  status: number;
  code: string;
  context?: HiveErrorContext;
}) {
  const lines = [
    "[hive-cms] request error",
    `message: ${input.message}`,
    `status : ${input.status}`,
    `code   : ${input.code}`,
  ];

  if (input.context?.method) {
    lines.push(`method : ${input.context.method}`);
  }
  if (input.context?.path) {
    lines.push(`path   : ${input.context.path}`);
  }
  if (input.context?.url) {
    lines.push(`url    : ${input.context.url}`);
  }
  if (input.context?.hint) {
    lines.push(`hint   : ${input.context.hint}`);
  }

  return lines.join("\n");
}

export class HiveApiError extends Error {
  public readonly rawMessage: string;
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly context?: HiveErrorContext;

  constructor(
    message: string,
    status = 500,
    code = "SDK_ERROR",
    details?: unknown,
    context?: HiveErrorContext,
  ) {
    super(
      toPrettyMessage({
        message,
        status,
        code,
        context,
      }),
    );
    this.name = "HiveApiError";
    this.rawMessage = message;
    this.status = status;
    this.code = code;
    this.details = details;
    this.context = context;
  }
}
