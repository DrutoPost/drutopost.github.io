import { describe, it, expect } from 'vitest';
import { handleRouteFallback } from '../routerFallback';

describe('Router Fallback & Route Handling', () => {
  it('correctly rewrites valid multi-page routes', () => {
    expect(handleRouteFallback('/demo')).toEqual({ rewriteUrl: '/demo/index.html', is404: false });
    expect(handleRouteFallback('/demo/')).toEqual({ rewriteUrl: '/demo/index.html', is404: false });
    expect(handleRouteFallback('/demo/index.html')).toEqual({ rewriteUrl: '/demo/index.html', is404: false });

    expect(handleRouteFallback('/LMX')).toEqual({ rewriteUrl: '/LMX/index.html', is404: false });
    expect(handleRouteFallback('/lmx/')).toEqual({ rewriteUrl: '/LMX/index.html', is404: false });

    expect(handleRouteFallback('/DEEF')).toEqual({ rewriteUrl: '/DEEF/index.html', is404: false });
    expect(handleRouteFallback('/deef/')).toEqual({ rewriteUrl: '/DEEF/index.html', is404: false });

    expect(handleRouteFallback('/IPA')).toEqual({ rewriteUrl: '/IPA/index.html', is404: false });
    expect(handleRouteFallback('/ipa/')).toEqual({ rewriteUrl: '/IPA/index.html', is404: false });
  });

  it('allows root and static assets without rewriting', () => {
    expect(handleRouteFallback('/')).toEqual({ rewriteUrl: null, is404: false });
    expect(handleRouteFallback('/index.html')).toEqual({ rewriteUrl: null, is404: false });
    expect(handleRouteFallback('/404.html')).toEqual({ rewriteUrl: null, is404: false });
    expect(handleRouteFallback('/src/main.tsx')).toEqual({ rewriteUrl: null, is404: false });
    expect(handleRouteFallback('/assets/index.js')).toEqual({ rewriteUrl: null, is404: false });
    expect(handleRouteFallback('/Logoicon.svg')).toEqual({ rewriteUrl: null, is404: false });
  });

  it('routes invalid/unknown paths to 404 page', () => {
    expect(handleRouteFallback('/randomText')).toEqual({ rewriteUrl: '/404.html', is404: true });
    expect(handleRouteFallback('/demo/eu7e7')).toEqual({ rewriteUrl: '/404.html', is404: true });
    expect(handleRouteFallback('/LMX/invalid')).toEqual({ rewriteUrl: '/404.html', is404: true });
    expect(handleRouteFallback('/DEEF/random')).toEqual({ rewriteUrl: '/404.html', is404: true });
    expect(handleRouteFallback('/IPA/something')).toEqual({ rewriteUrl: '/404.html', is404: true });
  });
});
