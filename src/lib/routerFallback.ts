export function handleRouteFallback(rawUrl: string): { rewriteUrl: string | null; is404: boolean } {
  const url = rawUrl.split('?')[0] || '';
  const normalizedUrl = url.toLowerCase();

  if (normalizedUrl === '/demo' || normalizedUrl === '/demo/' || normalizedUrl === '/demo/index.html') {
    return { rewriteUrl: '/demo/index.html', is404: false };
  } else if (normalizedUrl === '/lmx' || normalizedUrl === '/lmx/' || normalizedUrl === '/lmx/index.html') {
    return { rewriteUrl: '/LMX/index.html', is404: false };
  } else if (normalizedUrl === '/deef' || normalizedUrl === '/deef/' || normalizedUrl === '/deef/index.html') {
    return { rewriteUrl: '/DEEF/index.html', is404: false };
  } else if (normalizedUrl === '/ipa' || normalizedUrl === '/ipa/' || normalizedUrl === '/ipa/index.html') {
    return { rewriteUrl: '/IPA/index.html', is404: false };
  } else if (normalizedUrl === '/cors' || normalizedUrl === '/cors/' || normalizedUrl === '/cors/index.html') {
    return { rewriteUrl: '/CORS/index.html', is404: false };
  } else if (normalizedUrl === '/pitch.pdf' || normalizedUrl === '/pitch.pdf/') {
    return { rewriteUrl: '/pitch.pdf', is404: false };
  } else if (
    url === '/' ||
    url === '/index.html' ||
    url === '/404.html' ||
    url.startsWith('/@') ||
    url.startsWith('/src') ||
    url.startsWith('/node_modules') ||
    url.startsWith('/assets') ||
    /\.(js|ts|tsx|jsx|css|json|svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|mp3|webmanifest|pdf)$/i.test(url)
  ) {
    return { rewriteUrl: null, is404: false };
  } else {
    return { rewriteUrl: '/404.html', is404: true };
  }
}
