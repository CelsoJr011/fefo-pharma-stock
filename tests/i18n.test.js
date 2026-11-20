import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LANGUAGES, translate, allKeys } from '../js/i18n.js';

// If I add a text in English and forget PT or FR, this test catches it.
test('every language has the same keys as English', () => {
  const english = allKeys('en').sort();
  for (const lang of Object.keys(LANGUAGES)) {
    assert.deepEqual(allKeys(lang).sort(), english, `missing or extra keys in "${lang}"`);
  }
});

test('fills placeholders', () => {
  assert.equal(translate('pt', 'days.left', { n: 12 }), '12 dias');
  assert.equal(translate('fr', 'days.ago', { n: 5 }), 'il y a 5 jours');
});

test('falls back to English, then to the key itself', () => {
  assert.equal(translate('de', 'status.ok'), 'OK');
  assert.equal(translate('pt', 'does.not.exist'), 'does.not.exist');
});
