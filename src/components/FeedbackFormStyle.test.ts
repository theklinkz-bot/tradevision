import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appSource = readFileSync('src/App.tsx', 'utf8');
const cssSource = readFileSync('src/index.css', 'utf8');

const labelClassMatches = appSource.match(/className="feedback-field-label"/g) || [];

assert.equal(labelClassMatches.length, 3);
assert.match(cssSource, /\.feedback-field-label\s*\{/);
assert.match(cssSource, /\.feedback-section-title\s*\{/);
assert.match(cssSource, /\.feedback-section-subtitle\s*\{/);
assert.match(cssSource, /color:\s*var\(--brand-text-bright\)/);
assert.match(appSource, /feedback_label_subject:\s*"Feedback Topic"/);
assert.match(appSource, /feedback_placeholder_subject:\s*"Enter feedback topic\.\.\."/);
assert.match(appSource, /className="feedback-section-title"/);
assert.match(appSource, /className="feedback-section-subtitle"/);

console.log('Feedback form style tests passed');
