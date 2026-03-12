import type {Request} from 'express';

class _MockRequest {
	public url: string;
	public baseUrl: string;
	public originalUrl: string;
	public headers: Record<string, string> = {};
	public constructor(url: string) {
		this.url = url;
		this.baseUrl = url;
		this.originalUrl = url;
	}
}

export function MockRequest(url: string): Request {
	return new _MockRequest(url) as Request;
}
