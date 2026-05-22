// Redirect API calls to the Express backend when opened via Live Server (port 5500)
(function () {
  const BACKEND = 'http://localhost:3000';
  if (window.location.port === '5500' || window.location.port === '5501') {
    const _fetch = window.fetch.bind(window);
    window.fetch = function (url, opts) {
      opts = opts || {};
      if (typeof url === 'string' && url.startsWith('/') && !url.startsWith('//')) {
        url = BACKEND + url;
      }
      if (!opts.credentials) opts.credentials = 'include';
      return _fetch(url, opts);
    };
  }
})();
