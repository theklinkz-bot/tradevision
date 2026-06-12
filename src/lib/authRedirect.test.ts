import assert from 'node:assert/strict';
import { getAuthRedirectUrl } from './authRedirect';

assert.equal(
  getAuthRedirectUrl('https://flow-the-edge.example/dashboard?x=1', 'http://localhost:5174'),
  'https://flow-the-edge.example',
);

assert.equal(
  getAuthRedirectUrl('', 'http://localhost:5174'),
  'http://localhost:5174',
);

assert.equal(
  getAuthRedirectUrl('not a url', 'http://localhost:5174'),
  'http://localhost:5174',
);

console.log('Auth redirect tests passed');
