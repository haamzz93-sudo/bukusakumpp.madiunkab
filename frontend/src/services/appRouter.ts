/**
 * AppRouter - Modern SaaS HTML5 History Routing for Buku Saku MPP Kabupaten Madiun
 * Eliminates crude URL hashes (/#) and provides crisp, clean, shareable URLs:
 * - /                    -> Beranda
 * - /perizinan           -> Katalog 80+ Perizinan
 * - /perizinan/:slug     -> Detail SOP Perizinan (Modal / SOP Lengkap)
 * - /telusuri            -> Eksplorasi Klaster Pelayanan
 * - /telusuri/:klaster   -> Klaster Spesifik (usaha, pajak, dukcapil, dll)
 * - /tanya?q=...         -> Tanya AI Gemini RAG
 * - /kontak              -> Kontak & Lokasi MPP
 * - /admin               -> Dashboard Admin MPP
 * - /admin/:tab          -> Tab Admin (dashboard, perizinan, ai, web, klaster)
 * - /admin/login         -> Modal Login Admin
 */

export type AdminTab = 'dashboard' | 'perizinan' | 'ai' | 'web' | 'klaster' | 'users';

export type AppRoute =
  | { name: 'home' }
  | { name: 'perizinan'; slug?: string }
  | { name: 'telusuri'; klasterKey?: string }
  | { name: 'tanya'; query?: string }
  | { name: 'kontak' }
  | { name: 'login' }
  | { name: 'admin'; tab?: AdminTab };

const ROUTE_CHANGE_EVENT = 'bukusaku_route_changed';

/**
 * Normalizes legacy hash or path into clean SaaS route
 */
export const parseCurrentRoute = (): AppRoute => {
  // 1. Check legacy hash (e.g., #admin, #telusuri, #perizinan, #kontak, or /#)
  const hash = window.location.hash;
  if (hash && hash !== '#') {
    const rawHash = hash.replace(/^#\/?/, '').trim();
    if (rawHash === 'admin') return { name: 'admin', tab: 'dashboard' };
    if (rawHash.startsWith('admin/')) {
      const tab = rawHash.replace('admin/', '') as AdminTab;
      return { name: 'admin', tab };
    }
    if (rawHash === 'telusuri') return { name: 'telusuri' };
    if (rawHash.startsWith('telusuri/')) {
      return { name: 'telusuri', klasterKey: rawHash.replace('telusuri/', '') };
    }
    if (rawHash === 'perizinan') return { name: 'perizinan' };
    if (rawHash.startsWith('perizinan/')) {
      return { name: 'perizinan', slug: rawHash.replace('perizinan/', '') };
    }
    if (rawHash === 'kontak') return { name: 'kontak' };
    if (rawHash === 'login') return { name: 'login' };
    if (rawHash.startsWith('tanya')) {
      const q = new URLSearchParams(window.location.search).get('q') || '';
      return { name: 'tanya', query: q };
    }
  }

  // 2. Parse standard clean pathname
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const searchParams = new URLSearchParams(window.location.search);

  if (pathname === '/' || pathname === '') {
    return { name: 'home' };
  }

  if (pathname === '/perizinan') {
    return { name: 'perizinan' };
  }

  if (pathname.startsWith('/perizinan/')) {
    const slug = decodeURIComponent(pathname.substring('/perizinan/'.length));
    return { name: 'perizinan', slug: slug || undefined };
  }

  if (pathname === '/telusuri') {
    return { name: 'telusuri' };
  }

  if (pathname.startsWith('/telusuri/')) {
    const klasterKey = decodeURIComponent(pathname.substring('/telusuri/'.length));
    return { name: 'telusuri', klasterKey: klasterKey || undefined };
  }

  if (pathname === '/tanya' || pathname === '/chat') {
    const query = searchParams.get('q') || '';
    return { name: 'tanya', query };
  }

  if (pathname === '/kontak') {
    return { name: 'kontak' };
  }

  if (pathname === '/login' || pathname === '/admin/login') {
    return { name: 'login' };
  }

  if (pathname === '/admin') {
    return { name: 'admin', tab: 'dashboard' };
  }

  if (pathname.startsWith('/admin/')) {
    const rawTab = pathname.substring('/admin/'.length) as AdminTab;
    const validTabs: AdminTab[] = ['dashboard', 'perizinan', 'ai', 'web', 'klaster'];
    const tab = validTabs.includes(rawTab) ? rawTab : 'dashboard';
    return { name: 'admin', tab };
  }

  return { name: 'home' };
};

/**
 * Builds clean, professional URL path for a given route
 */
export const buildRouteUrl = (route: AppRoute): string => {
  switch (route.name) {
    case 'home':
      return '/';
    case 'perizinan':
      return route.slug ? `/perizinan/${encodeURIComponent(route.slug)}` : '/perizinan';
    case 'telusuri':
      return route.klasterKey ? `/telusuri/${encodeURIComponent(route.klasterKey)}` : '/telusuri';
    case 'tanya':
      return route.query ? `/tanya?q=${encodeURIComponent(route.query)}` : '/tanya';
    case 'kontak':
      return '/kontak';
    case 'login':
      return '/admin/login';
    case 'admin':
      return route.tab && route.tab !== 'dashboard' ? `/admin/${route.tab}` : '/admin';
    default:
      return '/';
  }
};

/**
 * Navigates to a new SaaS route using HTML5 History API (no hash, no reload)
 */
export const navigateTo = (
  route: AppRoute, 
  options: { replace?: boolean; scroll?: boolean } = {}
): void => {
  const targetUrl = buildRouteUrl(route);
  const currentPathWithSearch = window.location.pathname + window.location.search;

  if (currentPathWithSearch !== targetUrl || window.location.hash) {
    if (options.replace) {
      window.history.replaceState(route, '', targetUrl);
    } else {
      window.history.pushState(route, '', targetUrl);
    }
  }

  // Dispatch custom route change event
  window.dispatchEvent(new CustomEvent(ROUTE_CHANGE_EVENT, { detail: route }));

  if (options.scroll !== false) {
    if (route.name === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (route.name === 'perizinan' && !route.slug) {
      setTimeout(() => {
        const el = document.getElementById('katalog-perizinan');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else if (route.name === 'telusuri') {
      setTimeout(() => {
        const el = document.getElementById('telusuri');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else if (route.name === 'kontak') {
      setTimeout(() => {
        const el = document.getElementById('kontak');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    }
  }
};

/**
 * Subscribes to route changes (both pushState and browser back/forward popstate)
 */
export const subscribeRoute = (callback: (route: AppRoute) => void): (() => void) => {
  const handlePopState = () => {
    const route = parseCurrentRoute();
    // Auto sanitize hash if present
    if (window.location.hash) {
      const cleanUrl = buildRouteUrl(route);
      window.history.replaceState(route, '', cleanUrl);
    }
    callback(route);
  };

  const handleCustomChange = (e: Event) => {
    const customEvent = e as CustomEvent<AppRoute>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    } else {
      callback(parseCurrentRoute());
    }
  };

  window.addEventListener('popstate', handlePopState);
  window.addEventListener(ROUTE_CHANGE_EVENT, handleCustomChange);

  // Initial check: if there is an ugly hash (e.g. /# or /#admin), clean it immediately
  if (window.location.hash) {
    const current = parseCurrentRoute();
    const cleanUrl = buildRouteUrl(current);
    window.history.replaceState(current, '', cleanUrl);
  }

  return () => {
    window.removeEventListener('popstate', handlePopState);
    window.removeEventListener(ROUTE_CHANGE_EVENT, handleCustomChange);
  };
};
