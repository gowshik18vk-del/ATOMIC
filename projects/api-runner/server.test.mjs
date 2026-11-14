import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { handle, isPublicAddress } from './server.mjs';

test('blocks common private and reserved IPv4 ranges', () => {
  for (const ip of ['127.0.0.1', '10.0.0.2', '172.16.0.1', '192.168.1.1', '169.254.169.254', '0.0.0.0', '224.0.0.1']) assert.equal(isPublicAddress(ip), false, ip);
});
test('allows public addresses and blocks local IPv6', () => {
  assert.equal(isPublicAddress('8.8.8.8'), true);
  assert.equal(isPublicAddress('2606:4700:4700::1111'), true);
  assert.equal(isPublicAddress('::1'), false);
  assert.equal(isPublicAddress('fd00::1'), false);
});

test('executor rejects private targets and unsafe URL schemes', async (t) => {
  const server = http.createServer(handle);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());
  const endpoint = `http://127.0.0.1:${server.address().port}/api/request`;
  for (const url of ['http://127.0.0.1/admin', 'file:///etc/passwd']) {
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url, method: 'GET', headers: [] }) });
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /Only HTTP|blocked private/i);
  }
});

test('executor reports malformed input as a client error', async (t) => {
  const server = http.createServer(handle);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/request`, { method: 'POST', body: '{invalid' });
  assert.equal(response.status, 400);
  assert.ok((await response.json()).error);
});
