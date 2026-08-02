import { beforeEach, describe, expect, it } from 'vitest';
import { crossDomainUrl } from './subdomain';

describe('crossDomainUrl', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('sends an /admin link from the marketing domain to the admin subdomain', () => {
    expect(crossDomainUrl('admin', '/')).toBe('https://eaj.eajmusic.com/');
  });

  it('keeps a destination path and query string while changing subdomains', () => {
    expect(crossDomainUrl('admin', '/releases?status=PENDING')).toBe('https://eaj.eajmusic.com/releases?status=PENDING');
  });
});
