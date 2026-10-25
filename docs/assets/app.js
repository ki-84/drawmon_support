import { PixelGrid, SIZE, PALETTE } from './pixel-grid.mjs';
const copy = JSON.parse(document.getElementById('page-copy').textContent);
const base = new URL(document.querySelector('meta[name="site-base"]').content, location.href);
const byId = id => document.getElementById(id);
byId('language').addEventListener('change', event => {
  const target = new URL(event.target.value === 'ja' ? './' : event.target.value + '/', base);
  target.hash = location.hash;
  location.assign(target.href);
});

const canvas = byId('sketch-canvas');
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;
const grid = new PixelGrid();
const history = [], future = [];
let color = PALETTE[10], width = 2, tool = 'pen', drawing = false, previous = null, pointer = null, zoom = 1, pan = null, beforeStroke = null;
const viewport = byId('canvas-viewport');
const status = message => { byId('canvas-status').textContent = message; };
const remember = () => {
  history.push(grid.snapshot());
  if (history.length > 60) history.shift();
  future.length = 0;
};
function render() {
  context.putImageData(new ImageData(grid.rgba(), SIZE, SIZE), 0, 0);
  byId('undo').disabled = !history.length;
  byId('redo').disabled = !future.length;
  byId('clear').disabled = grid.isEmpty;
}
function setTool(next) {
  tool = next;
  for (const id of ['eraser', 'fill', 'move-canvas']) byId(id).setAttribute('aria-pressed', String(next === ({ eraser: 'eraser', fill: 'fill', 'move-canvas': 'move' })[id]));
  canvas.style.cursor = next === 'move' ? 'grab' : 'crosshair';
  document.querySelectorAll('[data-width]').forEach(button => {
    const selected = Number(button.dataset.width) === width && next === 'pen';
    button.setAttribute('aria-pressed', String(selected));
  });
}
function changeZoom(next) {
  const old = zoom;
  zoom = Math.min(8, Math.max(1, next));
  const x = (viewport.scrollLeft + viewport.clientWidth / 2) / old;
  const y = (viewport.scrollTop + viewport.clientHeight / 2) / old;
  canvas.style.width = zoom * 100 + '%';
  byId('canvas-zoom').textContent = zoom.toFixed(1) + '×';
  byId('zoom-out').disabled = zoom === 1;
  byId('zoom-in').disabled = zoom === 8;
  viewport.scrollLeft = zoom === 1 ? 0 : x * zoom - viewport.clientWidth / 2;
  viewport.scrollTop = zoom === 1 ? 0 : y * zoom - viewport.clientHeight / 2;
}
const pointAt = event => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / rect.width * SIZE);
  const y = Math.floor((event.clientY - rect.top) / rect.height * SIZE);
  return x >= 0 && x < SIZE && y >= 0 && y < SIZE ? { x, y } : null;
};
canvas.addEventListener('pointerdown', event => {
  if (pointer !== null || (event.pointerType === 'mouse' && event.button !== 0)) return;
  const point = pointAt(event);
  if (!point) return;
  event.preventDefault();
  pointer = event.pointerId;
  canvas.setPointerCapture(pointer);
  status('');
  if (tool === 'move') {
    pan = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
    return;
  }
  beforeStroke = grid.snapshot();
  remember();
  drawing = true;
  previous = point;
  if (tool === 'fill') grid.fill(point, color);
  else grid.line(point, point, tool === 'eraser' ? -1 : color, width);
  render();
});
canvas.addEventListener('pointermove', event => {
  if (event.pointerId !== pointer) return;
  if (pan) {
    viewport.scrollLeft = pan.left - (event.clientX - pan.x);
    viewport.scrollTop = pan.top - (event.clientY - pan.y);
    return;
  }
  if (!drawing || tool === 'fill') return;
  const point = pointAt(event);
  if (point) grid.line(previous || point, point, tool === 'eraser' ? -1 : color, width);
  previous = point;
  render();
});
function endStroke(event) {
  if (event.pointerId !== pointer) return;
  if (event.type === 'pointercancel' && beforeStroke) {
    grid.restore(beforeStroke);
    history.pop();
    render();
  }
  pointer = null;
  drawing = false;
  previous = null;
  beforeStroke = null;
  pan = null;
}
for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(name, endStroke);
document.querySelectorAll('[data-color]').forEach(button => button.addEventListener('click', () => {
  color = PALETTE[Number(button.dataset.color)];
  if (tool === 'eraser' || tool === 'move') setTool('pen');
  document.querySelectorAll('[data-color]').forEach(swatch => swatch.setAttribute('aria-pressed', String(swatch === button)));
}));
byId('custom-color').addEventListener('input', event => {
  color = parseInt(event.target.value.slice(1), 16);
  if (tool === 'eraser' || tool === 'move') setTool('pen');
  document.querySelectorAll('[data-color]').forEach(swatch => swatch.setAttribute('aria-pressed', 'false'));
});
document.querySelectorAll('[data-width]').forEach(button => button.addEventListener('click', () => { width = Number(button.dataset.width); setTool('pen'); }));
for (const [id, next] of [['eraser','eraser'],['fill','fill'],['move-canvas','move']]) byId(id).addEventListener('click', () => setTool(tool === next ? 'pen' : next));
byId('zoom-in').addEventListener('click', () => changeZoom(zoom * 2));
byId('zoom-out').addEventListener('click', () => changeZoom(zoom / 2));
byId('zoom-fit').addEventListener('click', () => changeZoom(1));
byId('undo').addEventListener('click', () => {
  if (!history.length) return;
  future.push(grid.snapshot()); grid.restore(history.pop()); render(); status('');
});
byId('redo').addEventListener('click', () => {
  if (!future.length) return;
  history.push(grid.snapshot()); grid.restore(future.pop()); render(); status('');
});
byId('clear').addEventListener('click', () => { remember(); grid.clear(); render(); status(''); });
byId('save').addEventListener('click', () => {
  if (grid.isEmpty) { status(copy.canvasEmpty); return; }
  const output = document.createElement('canvas');
  output.width = output.height = SIZE * 8;
  const exportContext = output.getContext('2d');
  exportContext.imageSmoothingEnabled = false;
  exportContext.drawImage(canvas, 0, 0, output.width, output.height);
  output.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-drawmon-1024.png';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    status(copy.saved);
  }, 'image/png');
});
render();
changeZoom(1);
setTool('pen');

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
  }), { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  document.documentElement.classList.add('is-enhanced');
}
