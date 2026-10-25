import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PixelGrid, SIZE, PALETTE } from '../docs/assets/pixel-grid.mjs';

test('native-sized grid rasterizes a diagonal to exactly 128 opaque pixels', () => {
  const grid = new PixelGrid();
  assert.equal(SIZE, 128);
  assert.equal(grid.pixels.length, 128 * 128);
  grid.line({ x: 0, y: 0 }, { x: 127, y: 127 }, PALETTE[10], 1);
  assert.equal(grid.pixels.filter(value => value !== -1).length, 128);
  const rgba = grid.rgba();
  assert.equal(rgba.length, 128 * 128 * 4);
  for (let i = 3; i < rgba.length; i += 4) assert.ok(rgba[i] === 0 || rgba[i] === 255);
});

test('all four native square brush widths retain their exact footprint', () => {
  for (const width of [1, 2, 4, 8]) {
    const grid = new PixelGrid();
    grid.line({ x: 64, y: 64 }, { x: 64, y: 64 }, PALETTE[0], width);
    assert.equal(grid.pixels.filter(value => value !== -1).length, width * width);
  }
});

test('fill stays inside an outline and does not cross diagonal corners', () => {
  const grid = new PixelGrid();
  for (const [from, to] of [[[10,10],[20,10]], [[20,10],[20,20]], [[20,20],[10,20]], [[10,20],[10,10]]]) {
    grid.line({ x: from[0], y: from[1] }, { x: to[0], y: to[1] }, PALETTE[10], 1);
  }
  grid.fill({ x: 15, y: 15 }, PALETTE[9]);
  assert.equal(grid.pixels.filter(value => value === PALETTE[9]).length, 81);
  assert.equal(grid.pixels[0], -1);
  const corner = new PixelGrid();
  corner.pixels[1] = corner.pixels[128] = PALETTE[10];
  corner.fill({ x: 0, y: 0 }, PALETTE[9]);
  assert.equal(corner.pixels.filter(value => value === PALETTE[9]).length, 1);
});

test('eraser and history preserve transparency and earlier custom colors', () => {
  const grid = new PixelGrid();
  grid.line({ x: 60, y: 60 }, { x: 60, y: 60 }, 0x123456, 2);
  const saved = grid.snapshot();
  grid.line({ x: 60, y: 60 }, { x: 60, y: 60 }, -1, 2);
  assert.ok(grid.isEmpty);
  grid.restore(saved);
  assert.equal(grid.pixels[60 * 128 + 60], 0x123456);
  grid.clear();
  assert.ok(grid.isEmpty);
});
