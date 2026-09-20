export interface ErrorLike {
  code?: string;
  message?: string;
}

export function getErrorDetails(error: unknown, fallbackMessage: string): ErrorLike {
  if (typeof error === "object" && error !== null) {
    const candidate = error as Record<string, unknown>;
    return {
      code: typeof candidate.code === "string" ? candidate.code : undefined,
      message: typeof candidate.message === "string" ? candidate.message : fallbackMessage,
    };
  }

  return { message: fallbackMessage };
}
