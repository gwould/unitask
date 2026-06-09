const BACKEND = 'http://ec2-52-62-106-186.ap-southeast-2.compute.amazonaws.com';

export default async function handler(req, res) {
  const { path } = req.query;
  const target = `${BACKEND}/api/${Array.isArray(path) ? path.join('/') : path}`;

  // Forward query string
  const url = new URL(target);
  for (const [key, value] of Object.entries(req.query)) {
    if (key !== 'path') {
      url.searchParams.set(key, value);
    }
  }

  // Build headers to forward
  const headers = {};
  if (req.headers['content-type']) headers['Content-Type'] = req.headers['content-type'];
  if (req.headers['authorization']) headers['Authorization'] = req.headers['authorization'];
  if (req.headers['accept']) headers['Accept'] = req.headers['accept'];

  try {
    const fetchOptions = {
      method: req.method,
      headers,
    };

    // Forward body for non-GET requests
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(url.toString(), fetchOptions);

    // Forward response headers
    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const text = await response.text();
    res.status(response.status).send(text);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).json({ error: 'Backend unavailable', detail: err.message });
  }
}
