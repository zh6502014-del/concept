/* NIGHTFALL DUEL V0.3 — dependency-free, visual-only page turning.
 * Live application DOM is never cloned into application state. The temporary
 * leaves are inert snapshots, with IDs removed, discarded after every turn.
 * Native browser APIs only; works with relative assets and no build step.
 */
'use strict';
(() => {
  const OPTIONS = Object.freeze({
    duration: 820,
    mobileDuration: 680,
    mobileBreakpoint: 680,
    imageWait: 200
  });
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = null;

  function capture(book) {
    if (!book) return null;
    const rect = book.getBoundingClientRect();
    const node = book.cloneNode(true);
    node.classList.remove('enter');
    node.classList.add('turn-snapshot');
    node.setAttribute('aria-hidden', 'true');
    node.inert = true;
    // cloneNode does not retain scroll offsets. Freeze the visible content
    // inside the inert animation snapshot instead of jumping to its top.
    const scroller = book.querySelector('.book-content');
    const snapshotScroller = node.querySelector('.book-content');
    if (scroller && snapshotScroller) {
      snapshotScroller.style.overflow = 'hidden';
      for (const child of snapshotScroller.children) {
        child.style.transform = `translateY(${-scroller.scrollTop}px)`;
      }
    }
    const originals = Array.from(book.querySelectorAll('img'));
    node.querySelectorAll('img').forEach((img, i) => {
      // Freeze the selected responsive image so both sides use the same pixels.
      const src = originals[i]?.currentSrc || originals[i]?.src;
      if (src) img.src = src;
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.loading = 'eager';
    });
    for (const el of [node, ...node.querySelectorAll('*')]) {
      el.removeAttribute('id');
      el.removeAttribute('for');
      el.removeAttribute('aria-labelledby');
      el.removeAttribute('aria-describedby');
      el.removeAttribute('aria-controls');
      el.removeAttribute('autofocus');
      if (el.matches('button,a,input,textarea,select,[tabindex]')) el.tabIndex = -1;
    }
    node.style.setProperty('width', `${rect.width}px`, 'important');
    node.style.setProperty('height', `${rect.height}px`, 'important');
    node.style.setProperty('min-height', `${rect.height}px`, 'important');
    node.style.setProperty('max-height', `${rect.height}px`, 'important');
    return {
      node,
      width: rect.width,
      height: rect.height,
      background: getComputedStyle(book).backgroundColor,
      dark: book.classList.contains('dark')
    };
  }

  const make = (cls) => {
    const node = document.createElement('div');
    node.className = cls;
    return node;
  };

  function fill(frame, offset = 0) {
    const node = frame.node.cloneNode(true);
    node.style.left = `${-offset}px`;
    return node;
  }

  function panel(cls, frame, offset = 0) {
    const node = make(cls);
    node.style.backgroundColor = frame.background;
    node.appendChild(fill(frame, offset));
    return node;
  }

  function waitForImages(stage) {
    const images = Array.from(stage.querySelectorAll('img'));
    const tasks = images.map(img => {
      if (img.complete) return Promise.resolve();
      if (typeof img.decode === 'function') return img.decode().catch(() => {});
      return new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    });
    return Promise.race([
      Promise.all(tasks),
      new Promise(resolve => setTimeout(resolve, OPTIONS.imageWait))
    ]);
  }

  /** Commit the destination immediately, e.g. on resize, Escape or tab hide. */
  function finish() {
    if (active) active.complete();
  }

  /** Run once after the destination book has been rendered in the reader. */
  async function play({ reader, source, target, direction = 1, reduced = false }) {
    finish();
    if (!reader || !source || !target || reduced || motion.matches ||
        typeof Element.prototype.animate !== 'function' ||
        !CSS.supports('transform-style', 'preserve-3d')) return;
    const dest = capture(target);
    if (!dest || source.width < 1 || dest.width < 1) return;
    // On a responsive breakpoint change, a clean immediate commit is safer.
    if (Math.abs(source.width - dest.width) > 1) return;

    const w = source.width;
    const forward = direction >= 0;
    const mobile = window.innerWidth <= OPTIONS.mobileBreakpoint;
    const duration = mobile ? OPTIONS.mobileDuration : OPTIONS.duration;
    const viewport = make(`page-turn-viewport ${mobile ? 'turn-single' : 'turn-spread'} ${forward ? 'turn-forward' : 'turn-backward'}`);
    viewport.setAttribute('aria-hidden', 'true');
    viewport.inert = true;
    viewport.style.setProperty('--turn-width', `${w}px`);
    viewport.style.setProperty('--turn-height', `${Math.max(source.height, dest.height)}px`);
    const stage = make('page-turn-stage');
    stage.style.perspective = `${Math.max(1500, w * 3.1)}px`;
    viewport.appendChild(stage);

    let stationary, rotor, front, back;
    if (!mobile) {
      stage.appendChild(panel('turn-base', dest));
      stationary = panel(`turn-stationary ${forward ? 'stationary-left' : 'stationary-right'}`, source, forward ? 0 : w / 2);
      stage.appendChild(stationary);
      rotor = make('turn-leaf');
      front = panel('turn-face turn-front', source, forward ? w / 2 : 0);
      back = panel('turn-face turn-back', dest, forward ? 0 : w / 2);
    } else {
      // A mobile screen is one leaf, not two squeezed columns. For a backward
      // turn the destination leaf arrives above the outgoing page.
      stage.appendChild(panel('turn-base', forward ? dest : source));
      rotor = make('turn-leaf');
      front = panel('turn-face turn-front', forward ? source : dest);
      back = make('turn-face turn-back turn-blank');
      back.style.backgroundColor = (forward ? source : dest).background;
      if ((forward ? source : dest).dark) back.classList.add('turn-blank-dark');
    }
    rotor.style.height = `${Math.max(source.height, dest.height)}px`;
    const frontShade = make('turn-face-shade');
    const backShade = make('turn-face-shade');
    front.appendChild(frontShade);
    back.appendChild(backShade);
    rotor.append(front, back);
    stage.appendChild(rotor);
    const shadow = make('turn-cast-shadow');
    stage.insertBefore(shadow, rotor);
    const spine = make('turn-spine');
    stage.appendChild(spine);
    const saved = {
      height: reader.style.height,
      visibility: target.style.visibility,
      inert: target.inert
    };
    const animations = [];
    let done = false, resolveDone;
    const result = new Promise(resolve => { resolveDone = resolve; });
    const complete = () => {
      if (done) return;
      done = true;
      clearTimeout(record.watchdog);
      animations.forEach(a => { try { a.cancel(); } catch (_) {} });
      viewport.remove();
      reader.style.height = saved.height;
      reader.classList.remove('is-page-turning');
      target.style.visibility = saved.visibility;
      target.inert = saved.inert;
      if (active === record) active = null;
      resolveDone();
    };
    const record = { complete, watchdog: null, viewportWidth: window.innerWidth };
    active = record;
    reader.classList.add('is-page-turning');
    reader.style.height = `${source.height}px`;
    target.style.visibility = 'hidden';
    target.inert = true;
    reader.appendChild(viewport);

    // A full opaque source stays above the preparatory layers until all initial
    // transforms are applied. This prevents a one-frame destination flash.
    const waitingCover = panel('turn-loading-cover', source);
    viewport.appendChild(waitingCover);
    record.watchdog = setTimeout(complete, duration + OPTIONS.imageWait + 1600);
    try {
      await waitForImages(stage);
      if (done) return result;
      if (motion.matches || reduced || !target.isConnected) {
        complete();
        return result;
      }
      const timing = { duration, easing: mobile ? 'cubic-bezier(.42,0,.35,1)' : 'cubic-bezier(.32,.08,.20,1)', fill: 'both' };
      let keys;
      if (mobile) {
        keys = forward
          ? [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-112deg)' }]
          : [{ transform: 'rotateY(-112deg)' }, { transform: 'rotateY(0deg)' }];
      } else {
        keys = [
          { transform: 'rotateY(0deg)' },
          { transform: `rotateY(${forward ? -180 : 180}deg)` }
        ];
      }
      animations.push(rotor.animate(keys, timing));
      animations.push(reader.animate([
        { height: `${source.height}px` }, { height: `${dest.height}px` }
      ], timing));
      const linear = { duration, easing: 'linear', fill: 'both' };
      animations.push(frontShade.animate([
        { opacity: 0 }, { opacity: .08, offset: .16 },
        { opacity: .5, offset: .46 }, { opacity: .07, offset: .86 }, { opacity: 0 }
      ], linear));
      animations.push(backShade.animate([
        { opacity: .06 }, { opacity: .45, offset: .43 },
        { opacity: .1, offset: .72 }, { opacity: 0 }
      ], linear));
      animations.push(shadow.animate([
        { opacity: 0, transform: 'scaleX(.15)' },
        { opacity: .58, transform: 'scaleX(1)', offset: .3 },
        { opacity: .30, transform: 'scaleX(.8)', offset: .65 },
        { opacity: 0, transform: 'scaleX(.1)' }
      ], linear));
      animations.push(spine.animate([
        { opacity: 0 }, { opacity: .65, offset: .22 },
        { opacity: .65, offset: .72 }, { opacity: 0 }
      ], linear));
      waitingCover.remove();
      // CSS cannot turn off Web Animations API animations: the reduced-motion
      // checks and change handler here are intentional, not just styling.
      Promise.all(animations.map(a => a.finished.catch(() => {}))).then(complete);
    } catch (error) {
      console.warn('Page turn skipped; reading can continue.', error);
      complete();
    }
    return result;
  }

  // Mobile address-bar expansion changes height but not page composition.
  // Only a width change invalidates the captured responsive layout.
  window.addEventListener('resize', () => {
    if (active && window.innerWidth !== active.viewportWidth) finish();
  }, { passive: true });
  window.addEventListener('pagehide', finish);
  document.addEventListener('visibilitychange', () => { if (document.hidden) finish(); });
  if (motion.addEventListener) motion.addEventListener('change', e => { if (e.matches) finish(); });
  window.NDPageTurn = Object.freeze({ capture, play, finish, options: OPTIONS, get active() { return !!active; } });
})();
