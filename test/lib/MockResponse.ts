import type {Response} from 'express';

class _MockResponse {
	public currentStatus = 200;
	public bodyData: any;
	public headerList: Record<string, string | number | string[]> = {};
	public status(code: number): this {
		this.currentStatus = code;
		return this;
	}

	public getCurrentStatus(): number {
		return this.currentStatus;
	}

	public sendStatus(code: number): this {
		this.currentStatus = code;
		return this;
	}

	public send(): this {
		return this;
	}

	public json(data: any): this {
		this.bodyData = data;
		return this;
	}

	public getBodyData(): any {
		return this.bodyData;
	}

	public setHeader(name: string, value: string | number | readonly string[]): this {
		this.headerList[name] = value as any;
		return this;
	}

	public getHeader(name: string): string | number | string[] | undefined {
		return this.headerList[name];
	}
	public end(): this {
		return this;
	}
}

export function MockResponse(): Response & {getCurrentStatus(): number; getBodyData(): any} {
	return new _MockResponse() as unknown as Response & {getCurrentStatus(): number; getBodyData(): any};
}
