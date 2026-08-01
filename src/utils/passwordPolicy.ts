// Must match InsForge's configured auth.password policy exactly (see
// insforge.toml: min_length=8, require_uppercase/lowercase/number/special_char
// all true). Two separate forms (Register, ForgotPassword's new-password
// step) used to each hand-roll a looser check - a password could pass the
// form's own validation and then get rejected by InsForge itself with a
// separate, differently-worded error. One shared check, used everywhere a
// password is set, so the two can never drift apart again.
export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character.';
  return null;
}
