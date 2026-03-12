import {describe, expect, it} from 'vitest';
import {
	type ETagCallbackResponse,
	ETagError,
	etagBuilder,
	ifMatch,
	ifMatchCheck,
	ifMatchFunction,
	ifNoneMatch,
	isValueMatch,
	jsonEtagResponse,
	jsonIfNoneMatch,
} from '../src/';
import {MockRequest} from './lib/MockRequest';
import {MockResponse} from './lib/MockResponse';

describe('etag utils', () => {
	describe('etagBuilder', () => {
		it('should be valid etags', () => {
			expect(
				etagBuilder({
					name: 'John Doe',
				}),
			).to.equal('"13-5j0ZZR0tI549fSRsYxl8c9vAU78"');
			expect(etagBuilder(true)).to.equal('"4-X/5TO4MPCKAyY0ipFgr6/IraRNs"');
			expect(etagBuilder('1234567890')).to.equal('"a-AbMHrLpPVPVar8M7sGu79sqAPpo"');
			expect(etagBuilder(1234567890)).to.equal('"a-AbMHrLpPVPVar8M7sGu79sqAPpo"');
			expect(etagBuilder(1234567890n)).to.equal('"a-AbMHrLpPVPVar8M7sGu79sqAPpo"');
			expect(etagBuilder(Buffer.from('1234567890'))).to.equal('"a-AbMHrLpPVPVar8M7sGu79sqAPpo"');
			expect(etagBuilder(new Date(0))).to.equal('"1a-ngLRKDZRZUTYZSmaNhIE2wXoK8w"');
			expect(etagBuilder(null)).to.equal(undefined);
			expect(etagBuilder(undefined)).to.equal(undefined);
			expect(etagBuilder(() => {})).to.equal(undefined);
		});
	});
	describe('isValueMatch', () => {
		it('should valid matcher', () => {
			expect(isValueMatch(undefined, undefined)).to.equal(false);
			expect(isValueMatch('value', undefined)).to.equal(false);
			expect(isValueMatch(undefined, 'value')).to.equal(false);
			expect(isValueMatch('value', 'value')).to.equal(true);
			expect(isValueMatch(['other', 'value'], 'value')).to.equal(true);
		});
	});
	describe('ifMatch/ifNoneMatch', () => {
		it('should valid matcher', () => {
			const etag = etagBuilder({
				name: 'John Doe',
			});
			if (!etag) {
				throw new Error('etag is undefined');
			}
			let req = MockRequest('http://localhost/');
			req.headers['if-match'] = etag;
			req.headers['if-none-match'] = etag;
			expect(ifNoneMatch(req, etag)).to.equal(true);
			expect(ifMatch(req, etag)).to.equal(true);
			expect(ifNoneMatch(req, '')).to.equal(false);
			expect(ifMatch(req, '')).to.equal(false);
			req = MockRequest('http://localhost/');
			expect(ifNoneMatch.bind(undefined, req, etag, true)).to.throw(ETagError, 'if-none-match is not set');
			expect(ifMatch(req, etag, false)).to.equal(false);
		});
	});
	describe('jsonEtagResponse', () => {
		it('should add etag', () => {
			const data = {
				name: 'John Doe',
			};
			const etag = etagBuilder(data);
			if (!etag) {
				throw new Error('etag is undefined');
			}
			const res = MockResponse();
			jsonEtagResponse(data, res);
			expect(res.getHeader('ETag')).to.equal(etag);
		});
	});
	describe('ifMatchCheck', () => {
		it('should add etag', () => {
			const data = {
				name: 'John Doe',
			};
			const etag = etagBuilder(data);
			if (!etag) {
				throw new Error('etag is undefined');
			}
			const req = MockRequest('http://localhost/');
			req.headers['if-match'] = etag;
			expect(ifMatchCheck({body: data}, req)).to.equal(true);
		});
		it('should have custom etag implementation', () => {
			const etag = '123123';
			const data: ETagCallbackResponse<{name: string}> = {
				body: {
					name: 'John Doe',
				},
				etag,
			};
			if (!etag) {
				throw new Error('etag is undefined');
			}
			const req = MockRequest('http://localhost/');
			req.headers['if-match'] = etag;
			expect(ifMatchCheck(data, req)).to.equal(true);
		});
	});
	describe('jsonIfNoneMatch', () => {
		it('should handle matches', () => {
			const data = {
				name: 'John Doe',
			};
			const etag = etagBuilder(data);
			if (!etag) {
				throw new Error('etag is undefined');
			}
			const req = MockRequest('http://localhost/');
			let res = MockResponse();
			req.headers['if-none-match'] = etag;
			jsonIfNoneMatch({body: data}, req, res);
			expect(res.getCurrentStatus()).to.equal(304);
			res = MockResponse();
			req.headers['if-none-match'] = 'empty';
			jsonIfNoneMatch({body: data}, req, res);
			expect(res.getCurrentStatus()).to.equal(200);
			res = MockResponse();
			delete req.headers['if-none-match'];
			jsonIfNoneMatch({body: data}, req, res);
			expect(res.getCurrentStatus()).to.equal(200);
		});
		it('should handle matches with custom etag', () => {
			const etag = '123123';
			const data: ETagCallbackResponse<{name: string}> = {
				body: {name: 'John Doe'},
				etag,
			};
			const req = MockRequest('http://localhost/');
			let res = MockResponse();
			req.headers['if-none-match'] = etag;
			jsonIfNoneMatch(data, req, res);
			expect(res.getCurrentStatus()).to.equal(304);
			res = MockResponse();
			req.headers['if-none-match'] = 'empty';
			jsonIfNoneMatch(data, req, res);
			expect(res.getCurrentStatus()).to.equal(200);
			res = MockResponse();
			delete req.headers['if-none-match'];
			jsonIfNoneMatch(data, req, res);
			expect(res.getCurrentStatus()).to.equal(200);
		});
	});
	describe('ifMatchFunction', () => {
		it('should handle matches', () => {
			const data = {
				name: 'John Doe',
			};
			const etag = etagBuilder(data);
			if (!etag) {
				throw new Error('etag is undefined');
			}
			const req = MockRequest('http://localhost/');
			let res = MockResponse();
			req.headers['if-match'] = etag;
			ifMatchFunction({body: data}, req, res);
			expect(res.getCurrentStatus()).to.equal(200);
			res = MockResponse();
			req.headers['if-match'] = 'empty';
			ifMatchFunction({body: data}, req, res);
			expect(res.getCurrentStatus()).to.equal(409);
			res = MockResponse();
			delete req.headers['if-match'];
			ifMatchFunction({body: data}, req, res);
			expect(res.getCurrentStatus()).to.equal(200);
			ifMatchFunction({body: data}, req, res, undefined, false);
			expect(res.getCurrentStatus()).to.equal(409);
		});
		it('should handle matches with custom etag', () => {
			const etag = '123123';
			const data: ETagCallbackResponse<{name: string}> = {
				body: {name: 'John Doe'},
				etag,
			};
			const req = MockRequest('http://localhost/');
			let res = MockResponse();
			req.headers['if-match'] = etag;
			ifMatchFunction(data, req, res);
			expect(res.getCurrentStatus()).to.equal(200);
			res = MockResponse();
			req.headers['if-match'] = 'empty';
			ifMatchFunction(data, req, res);
			expect(res.getCurrentStatus()).to.equal(409);
			res = MockResponse();
			delete req.headers['if-match'];
			ifMatchFunction(data, req, res);
			expect(res.getCurrentStatus()).to.equal(200);
			ifMatchFunction(data, req, res, undefined, false);
			expect(res.getCurrentStatus()).to.equal(409);
		});
	});
});
