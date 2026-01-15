import { describe, test, expect } from 'vitest';
import { validate, toStandardSchema } from '@/utils';
import { extractSchema } from '@/schemas/extract';
import type { Form, Document, Checklist, Bundle } from '@open-form/types';

describe('validate - Standard Schema Format', () => {
	test('validates valid form', () => {
		const result = validate<Form>({ kind: 'form', version: '1.0.0', name: 'test', title: 'Test' });
		expect('value' in result).toBe(true);
	});

	test('rejects invalid form', () => {
		const result = validate({ kind: 'form', name: '', title: 'Test' });
		expect('issues' in result).toBe(true);
	});

	test('toStandardSchema creates valid adapter', () => {
		const schema = toStandardSchema(extractSchema('Form') as Record<string, unknown>);
		expect(schema).toHaveProperty('~standard');
		expect(schema['~standard'].version).toBe(1);
	});
});
