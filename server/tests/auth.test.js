import test from 'node:test';
import assert from 'node:assert/strict';
import { requireAdmin } from '../src/middleware/auth.js';
import { supabaseAuth } from '../src/config/supabase.js';

test('admin routes reject missing, invalid and ordinary user tokens', async () => {
  const original = supabaseAuth.auth.getUser;
  try {
    for (const [header, result, expected] of [
      [undefined, null, 401],
      ['Bearer invalid', { data: {}, error: new Error('invalid') }, 401],
      ['Bearer ordinary', { data: { user: { app_metadata: {}, user_metadata: { role: 'admin' } } } }, 403],
      ['Bearer admin', { data: { user: { app_metadata: { role: 'admin' } } } }, 200],
    ]) {
      supabaseAuth.auth.getUser = async () => result;
      let status = 200;
      let passed = false;
      const res = { status(code) { status = code; return this; }, json() {} };
      await requireAdmin({ headers: { authorization: header } }, res, () => { passed = true; });
      assert.equal(status, expected);
      assert.equal(passed, expected === 200);
    }
  } finally {
    supabaseAuth.auth.getUser = original;
  }
});
