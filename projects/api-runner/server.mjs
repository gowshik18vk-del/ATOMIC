import http from 'node:http';
import https from 'node:https';
import dns from 'node:dns/promises';
import net from 'node:net';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';

export function isPublicAddress(address) {
  const family = net.isIP(address);
  if (family === 4) {
    const p = address.split('.').map(Number);
    return !(p[0] === 0 || p[0] === 10 || p[0] === 127 || p[0] >= 224 ||
      (p[0] === 169 && p[1] === 254) || (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
      (p[0] === 192 && p[1] === 168) || (p[0] === 100 && p[1] >= 64 && p[1] <= 127) ||
      (p[0] === 192 && p[1] === 0 && p[2] === 0) || (p[0] === 198 && (p[1] === 18 || p[1] === 19)));
  }
  if (family === 6) {
    const a = address.toLowerCase();
    if (a.startsWith('::ffff:')) return isPublicAddress(a.slice(7));
    return !(a === '::' || a === '::1' || a.startsWith('fc') || a.startsWith('fd') || a.startsWith('fe8') || a.startsWith('fe9') || a.startsWith('fea') || a.startsWith('feb') || a.startsWith('ff') || a.startsWith('2001:db8:'));
  }
  return false;
}

export async function resolvePublic(hostname) {
  const literal = net.isIP(hostname);
  const records = literal ? [{ address: hostname }] : await dns.lookup(hostname, { all: true, verbatim: true });
  if (!records.length || records.some(({ address }) => !isPublicAddress(address))) throw new Error('Destination resolves to a blocked private or reserved address.');
  return (records.find(({ address }) => net.isIP(address) === 4) || records[0]).address;
}

const MAX_BODY = 5_000_000;
export async function handle(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5173');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method === 'OPTIONS') { res.writeHead(204).end(); return; }
  if (req.method !== 'POST' || req.url !== '/api/request') { res.writeHead(404).end(); return; }
  try {
    let raw = ''; for await (const chunk of req) { raw += chunk; if (raw.length > MAX_BODY) throw new Error('Request payload too large.'); }
    const input = JSON.parse(raw);
    if (!Array.isArray(input.headers) || input.headers.length > 100) throw new Error('Invalid request headers.');
    const url = new URL(input.url);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Only HTTP(S) URLs without embedded credentials are allowed.');
    const address = await resolvePublic(url.hostname);
    const method = String(input.method || 'GET').toUpperCase();
    if (!/^[A-Z!#$%&'*+.^_`|~-]{1,32}$/.test(method)) throw new Error('Invalid HTTP method.');
    const headers = {};
    for (const h of input.headers) {
      if (!h?.enabled || !h.key?.trim()) continue;
      if (/^(host|connection|content-length|transfer-encoding|proxy-authorization)$/i.test(h.key)) continue;
      headers[h.key] = String(h.value ?? '').slice(0, 8192);
    }
    const body = ['GET', 'HEAD'].includes(method) ? undefined : String(input.body ?? '');
    const transport = url.protocol === 'https:' ? https : http;
    const start = performance.now();
    const result = await new Promise((resolve, reject) => {
      const client = transport.request(url, { method, headers, timeout: Math.min(120000, Math.max(1000, Number(input.timeout) || 30000)), autoSelectFamily: false, lookup: (_hostname, _opts, cb) => cb(null, address, net.isIP(address)), servername: net.isIP(url.hostname) ? undefined : url.hostname }, (response) => {
        const chunks = []; let size = 0;
        response.on('data', chunk => { size += chunk.length; if (size > MAX_BODY) { response.destroy(new Error('Response exceeds 5 MB limit.')); return; } chunks.push(chunk); });
        response.on('end', () => resolve({ status: response.statusCode, statusText: response.statusMessage, headers: response.headers, body: Buffer.concat(chunks).toString('base64'), size }));
        response.on('error', reject);
      });
      client.on('timeout', () => client.destroy(new Error('Request timed out.')));
      client.on('error', reject);
      if (body) client.write(body);
      client.end();
    });
    res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ ...result, duration: Math.round(performance.now() - start) }));
  } catch (error) {
    res.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: error.message || 'Request failed.' }));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  http.createServer(handle).listen(8787, '127.0.0.1', () => console.log('API RUNNER executor listening on http://127.0.0.1:8787'));
}
