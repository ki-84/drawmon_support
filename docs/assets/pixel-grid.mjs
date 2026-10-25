// The same 128×128 grid, integer line rasterization and square brushes as PixelGrid.swift.
export const SIZE = 128;
export const PALETTE = [0x222034, 0xFFFFFF, 0xD8DFEA, 0x747D95, 0xF26375, 0xFFA65A, 0xFFE478, 0xA8E06E, 0x38B88C, 0x64DAEA, 0x5095EF, 0x6065C9, 0xA879EB, 0xF49AD1, 0xB67A5E, 0xF4D5B5];
export class PixelGrid {
  constructor() { this.pixels = new Int32Array(SIZE * SIZE).fill(-1); }
  get isEmpty() { return this.pixels.every(pixel => pixel === -1); }
  snapshot() { return this.pixels.slice(); }
  restore(pixels) { this.pixels.set(pixels); }
  clear() { this.pixels.fill(-1); }
  stamp(x, y, color, width) {
    const offset = Math.floor((width - 1) / 2);
    for (let row = y - offset; row < y - offset + width; row++) {
      for (let column = x - offset; column < x - offset + width; column++) {
        if (row >= 0 && row < SIZE && column >= 0 && column < SIZE) this.pixels[row * SIZE + column] = color;
      }
    }
  }
  line(start, end, color, width) {
    if (![1, 2, 4, 8].includes(width) || ![start.x, start.y, end.x, end.y].every(n => Number.isInteger(n) && n >= 0 && n < SIZE)) return;
    let { x, y } = start;
    const dx = Math.abs(end.x - x), dy = -Math.abs(end.y - y);
    const sx = x < end.x ? 1 : -1, sy = y < end.y ? 1 : -1;
    let error = dx + dy;
    while (true) {
      this.stamp(x, y, color, width);
      if (x === end.x && y === end.y) break;
      const twice = 2 * error;
      if (twice >= dy) { error += dy; x += sx; }
      if (twice <= dx) { error += dx; y += sy; }
    }
  }
  fill(point, color) {
    const start = point.y * SIZE + point.x;
    const target = this.pixels[start];
    if (target === color) return;
    const pending = [start];
    this.pixels[start] = color;
    while (pending.length) {
      const index = pending.pop(), x = index % SIZE, y = Math.floor(index / SIZE);
      for (const next of [x > 0 ? index - 1 : -1, x + 1 < SIZE ? index + 1 : -1, y > 0 ? index - SIZE : -1, y + 1 < SIZE ? index + SIZE : -1]) {
        if (next >= 0 && this.pixels[next] === target) { this.pixels[next] = color; pending.push(next); }
      }
    }
  }
  rgba() {
    const rgba = new Uint8ClampedArray(SIZE * SIZE * 4);
    this.pixels.forEach((pixel, index) => {
      if (pixel === -1) return;
      rgba.set([pixel >>> 16 & 255, pixel >>> 8 & 255, pixel & 255, 255], index * 4);
    });
    return rgba;
  }
}
