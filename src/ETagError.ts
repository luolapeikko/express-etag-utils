export class ETagError extends Error {
	public constructor(message: string) {
		super(message);
		this.name = 'ETagError';
		Error.captureStackTrace(this, this.constructor);
	}
}

export function isETagError(error: unknown): error is ETagError {
	return error instanceof ETagError;
}
