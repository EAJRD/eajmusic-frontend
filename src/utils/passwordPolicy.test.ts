import { describe, it, expect } from 'vitest';
import { validatePassword } from './passwordPolicy';

// These must stay in lockstep with InsForge's configured auth.password
// policy (insforge.toml: min_length=8, require upper/lower/number/special)
// - see passwordPolicy.ts's own comment for why a mismatch here is a real
// bug (Register/ForgotPassword drifting from what InsForge actually accepts).
describe('validatePassword', () => {
  it('accepts a password meeting every rule', () => {
    expect(validatePassword('Str0ng!Pass')).toBeNull();
  });

  it('rejects a password shorter than 8 characters', () => {
    expect(validatePassword('Sh0rt!')).toMatch(/8 characters/);
  });

  it('rejects a password missing an uppercase letter', () => {
    expect(validatePassword('str0ng!pass')).toMatch(/uppercase/);
  });

  it('rejects a password missing a lowercase letter', () => {
    expect(validatePassword('STR0NG!PASS')).toMatch(/lowercase/);
  });

  it('rejects a password missing a number', () => {
    expect(validatePassword('Strong!Pass')).toMatch(/number/);
  });

  it('rejects a password missing a special character', () => {
    expect(validatePassword('Str0ngPass')).toMatch(/special character/);
  });
});
