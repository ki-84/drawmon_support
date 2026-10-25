(() => {
  'use strict';
  const copy = JSON.parse(document.getElementById('page-copy').textContent);
  const base = new URL(document.querySelector('meta[name="site-base"]').content, location.href);
  const art = name => new URL(`assets/art/${name}`, base).href;
  const byId = id => document.getElementById(id);

  byId('language').addEventListener('change', event => {
    const code = event.target.value;
    const target = new URL(code === 'ja' ? './' : `${code}/`, base);
    target.hash = location.hash;
    location.assign(target.href);
  });

  // The website demonstrates authored examples; it never judges a visitor's drawing.
  const stage = byId('battle-stage');
  const run = byId('demo-run');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let floor = '1';
  let idea = 'water';
  let timer;
  let resolved = false;
  const setRunLabel = label => {
    run.replaceChildren(document.createTextNode(label + ' '));
    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    run.append(arrow);
  };
  function resetDemo() {
    clearTimeout(timer);
    resolved = false;
    run.disabled = false;
    stage.className = `battle-stage ${idea}-idea`;
    stage.style.backgroundImage = `url("${art(`region${floor}.webp`)}")`;
    byId('stage-floor').textContent = `0${floor}F`;
    byId('doodle-fighter').src = art(`doodle-${idea}.svg`);
    byId('doodle-fighter').alt = copy[idea === 'water' ? 'waterName' : 'spongeName'];
    byId('guardian-fighter').src = art(floor === '1' ? 'enemy-flame.webp' : 'enemy-water.webp');
    byId('guardian-fighter').alt = copy[floor === '1' ? 'floorOne' : 'floorTwo'];
    byId('enemy-bubble').textContent = copy.enemyReady;
    byId('battle-impact').textContent = '';
    byId('result-tag').textContent = copy.chooseIdea;
    byId('result-tag').style.color = '';
    byId('result-copy').textContent = copy[floor === '1' ? 'demoInitial' : 'demoWaterInitial'];
    setRunLabel(copy.demoRun);
    document.querySelectorAll('[data-floor]').forEach(button => {
      const active = button.dataset.floor === floor;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-idea]').forEach(button => {
      const active = button.dataset.idea === idea;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  document.querySelectorAll('[data-floor]').forEach(button => button.addEventListener('click', () => {
    floor = button.dataset.floor;
    resetDemo();
  }));
  document.querySelectorAll('[data-idea]').forEach(button => button.addEventListener('click', () => {
    idea = button.dataset.idea;
    resetDemo();
  }));
  run.addEventListener('click', () => {
    if (resolved) resetDemo();
    run.disabled = true;
    setRunLabel(copy.demoRunning);
    stage.classList.add('running');
    timer = setTimeout(() => {
      stage.classList.remove('running');
      const win = idea === 'water' && floor === '1';
      const hint = idea === 'sponge';
      stage.classList.add(win ? 'resolved-win' : hint ? 'resolved-idea' : 'resolved-no');
      const title = copy[win ? 'resultWin' : hint ? 'resultIdea' : 'resultNo'];
      byId('result-tag').textContent = title;
      byId('result-tag').style.color = win ? '#168a85' : hint ? '#967435' : '#c55a47';
      byId('result-copy').textContent = copy[win ? 'flameReason' : hint ? (floor === '1' ? 'spongeFlameReason' : 'spongeReason') : 'waterReason'];
      byId('enemy-bubble').textContent = copy[win ? 'enemyPanic' : hint ? 'enemyThink' : 'enemyCalm'];
      byId('battle-impact').textContent = win ? '✦' : hint ? '?' : '…!?';
      if (win) byId('guardian-fighter').src = art('enemy-flame-spent.webp');
      resolved = true;
      run.disabled = false;
      setRunLabel(copy.demoReset);
    }, reducedMotion.matches ? 30 : 1500);
  });
  resetDemo();

  // A local-only sketchbook with undo history and PNG export.
  const canvas = byId('sketch-canvas');
  const context = canvas.getContext('2d');
  let color = '#2769d7';
  let erasing = false;
  let drawing = false;
  let activePointer = null;
  let strokes = [];
  let points = [];
  const status = text => { byId('canvas-status').textContent = text; };
  function paintPoint(point, previous) {
    context.globalCompositeOperation = erasing ? 'destination-out' : 'source-over';
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = erasing ? 34 : 7;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    if (previous) {
      context.beginPath();
      context.moveTo(previous.x, previous.y);
      context.lineTo(point.x, point.y);
      context.stroke();
    } else {
      context.beginPath();
      context.arc(point.x, point.y, context.lineWidth / 2, 0, Math.PI * 2);
      context.fill();
    }
  }
  function redraw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    const previousColor = color;
    const previousEraser = erasing;
    strokes.forEach(stroke => {
      color = stroke.color;
      erasing = stroke.erasing;
      stroke.points.forEach((point, index) => paintPoint(point, stroke.points[index - 1]));
    });
    color = previousColor;
    erasing = previousEraser;
    context.globalCompositeOperation = 'source-over';
  }
  const pointAt = event => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width * canvas.width,
      y: (event.clientY - rect.top) / rect.height * canvas.height,
    };
  };
  canvas.addEventListener('pointerdown', event => {
    if (drawing || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault();
    drawing = true;
    activePointer = event.pointerId;
    canvas.setPointerCapture(event.pointerId);
    points = [pointAt(event)];
    paintPoint(points[0]);
    status('');
  });
  canvas.addEventListener('pointermove', event => {
    if (!drawing || event.pointerId !== activePointer) return;
    const point = pointAt(event);
    paintPoint(point, points[points.length - 1]);
    points.push(point);
  });
  const endStroke = event => {
    if (!drawing || event.pointerId !== activePointer) return;
    strokes.push({ color, erasing, points });
    drawing = false;
    activePointer = null;
    points = [];
  };
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', endStroke);
  canvas.addEventListener('lostpointercapture', endStroke);
  document.querySelectorAll('[data-color]').forEach(button => button.addEventListener('click', () => {
    color = button.dataset.color;
    erasing = false;
    byId('eraser').setAttribute('aria-pressed', 'false');
    document.querySelectorAll('[data-color]').forEach(swatch => {
      swatch.classList.toggle('selected', swatch === button);
      swatch.setAttribute('aria-pressed', String(swatch === button));
    });
  }));
  byId('eraser').addEventListener('click', () => {
    erasing = !erasing;
    byId('eraser').setAttribute('aria-pressed', String(erasing));
  });
  byId('undo').addEventListener('click', () => { strokes.pop(); redraw(); status(''); });
  byId('clear').addEventListener('click', () => { strokes = []; redraw(); status(''); });
  byId('save').addEventListener('click', () => {
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let hasInk = false;
    for (let index = 3; index < pixels.length; index += 4) {
      if (pixels[index]) { hasInk = true; break; }
    }
    if (!hasInk) { status(copy.canvasEmpty); return; }
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const output = exportCanvas.getContext('2d');
    output.fillStyle = '#fbf6e9';
    output.fillRect(0, 0, canvas.width, canvas.height);
    output.drawImage(canvas, 0, 0);
    exportCanvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'my-drawmon.png';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      status(copy.saved);
    }, 'image/png');
  });

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
      });
    }, { threshold: .08 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    document.documentElement.classList.add('is-enhanced');
  }
})();
