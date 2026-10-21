import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8');
const tokens = Object.fromEntries([...css.matchAll(/--color-([\w-]+):\s*(#[\da-f]{6});/gi)].map(([, name, hex]) => [name, hex]));
function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255)
    .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return channels.reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
}
function contrast(a, b) {
  const [low, high] = [luminance(tokens[a]), luminance(tokens[b])].sort((x, y) => x - y);
  return (high + 0.05) / (low + 0.05);
}
test('brand text and semantic messages meet WCAG AA normal-text contrast', () => {
  for (const background of ['midnight', 'graphite', 'steel']) {
    for (const foreground of ['arctic', 'silver', 'success', 'warning', 'error', 'info']) {
      assert.ok(contrast(foreground, background) >= 4.5, `${foreground} on ${background} must reach 4.5:1`);
    }
  }
  for (const background of ['primary', 'success-solid', 'error-solid']) {
    assert.ok(contrast('arctic', background) >= 4.5, `button label on ${background} must reach 4.5:1`);
  }
});
test('control boundaries and focus indicators meet 3:1 on both surfaces', () => {
  for (const surface of ['midnight', 'graphite']) assert.ok(contrast('silver', surface) >= 3);
});
