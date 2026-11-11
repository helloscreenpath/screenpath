/* ScreenPath escape rooms: shared behavior for every room in every escape room.
   Load this file before the room's own script. Each room calls SPRoom.init({...}) with its settings.

   Room settings:
     modeKey    localStorage key for Practice or Challenge, such as 'sp_school_mode'
     hints      the room's two hints, in screen reader terms with no key names
     hintWhere  where the Get a Hint button is, such as 'below the Submit button'

   Each room sets its clock with SPRoom.seconds(roomSeconds, modeKey), so Mr. Moy Mode gets half the time.

   House rules this file follows: focus never jumps on its own, no computer voice,
   both choices when time runs out, results once at the end of an escape room. */
(function () {
  'use strict';
  var SP = window.SPRoom = { cfg: {} };

  // ── Site navigation menu button, the same as every other ScreenPath page ──
  (function () {
    var b = document.getElementById('menu-btn'), d = document.getElementById('nav-drawer');
    if (!b || !d) return;
    b.addEventListener('click', function () {
      var open = d.hasAttribute('hidden');
      if (open) d.removeAttribute('hidden'); else d.setAttribute('hidden', '');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      b.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      b.innerHTML = open ? '&#10005;' : '&#9776;';
    });
  })();

  // ── Small helpers ──
  // Move focus to an element that is not normally focusable
  window.focusEl = function (el) { if (!el) return; if (!el.matches('a,button,input,select,textarea')) el.setAttribute('tabindex', '-1'); el.focus(); };
  // Today's date in the student's own time zone (toISOString gives UTC, which can be a day ahead)
  SP.localDate = function () { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  function say(msg) { if (typeof window.announce === 'function') window.announce(msg); }

  // ── Modes: Practice (no clock), Challenge (the room's time), Mr. Moy Mode (half the Challenge time) ──
  var MODE_NAMES = { practice: 'Practice Mode', challenge: 'Challenge Mode', moy: 'Mr. Moy Mode' };
  var MODE_LABELS = { practice: 'Practice', challenge: 'Challenge', moy: 'Mr. Moy Mode' };
  function modeOf(key) { try { return localStorage.getItem(key || SP.cfg.modeKey) || 'challenge'; } catch (e) { return 'challenge'; } }
  SP.modeName = function (key) { return MODE_NAMES[modeOf(key)] || 'Challenge Mode'; };
  SP.modeLabel = function (key) { return MODE_LABELS[modeOf(key)] || 'Challenge'; };
  // The room's time limit in seconds for the chosen mode. Call it where the room sets its clock.
  SP.seconds = function (sec, key) {
    SP.total = modeOf(key) === 'moy' ? Math.round(sec / 2) : sec;
    SP.isMoy = modeOf(key) === 'moy';
    return SP.total;
  };
  // In Mr. Moy Mode, the room's own words about its clock are halved: "five minute clock" becomes "two and a half minute clock"
  var HALF = { three: 'one and a half', four: 'two', five: 'two and a half', six: 'three' };
  SP.mins = function (text) {
    if (!SP.isMoy || typeof text !== 'string') return text;
    return text.replace(/\b(three|four|five|six)( minutes?)\b/gi, function (m, w, rest) {
      var h = HALF[w.toLowerCase()];
      return (w[0] === w[0].toUpperCase() ? h[0].toUpperCase() + h.slice(1) : h) + rest;
    });
  };
  function applyMoy() {
    if (!SP.isMoy) return;
    // Announcements
    var orig = window.announce;
    if (typeof orig === 'function' && !orig._moy) { window.announce = function (msg, p) { return orig(SP.mins(msg), p); }; window.announce._moy = true; }
    // The clock instructions, now and whenever the room changes them
    var ins = document.getElementById('timer-instructions');
    if (ins) {
      // Halve each new text once: skip the text this function itself just wrote
      var fix = function () { if (ins.textContent === ins._moyOut) return; var t = SP.mins(ins.textContent); ins._moyOut = t; if (t !== ins.textContent) ins.textContent = t; };
      fix(); new MutationObserver(fix).observe(ins, { childList: true, characterData: true, subtree: true });
    }
    // The clock itself, before Start
    var d = document.getElementById('timer-display');
    if (d && /^\d+:\d\d$/.test(d.textContent.trim())) {
      var m = Math.floor(SP.total / 60), s = SP.total % 60;
      d.textContent = m + ':' + String(s).padStart(2, '0');
      d.setAttribute('aria-label', 'Time remaining: ' + m + ' minutes and ' + s + ' seconds');
    }
  }
  // Remember the mode on the escape room's session, so My Progress can show it
  function recordMode() {
    var key = SP.cfg.modeKey; if (!key) return;
    var skey = key.replace(/_mode$/, '_current_session'), today = SP.localDate();
    try {
      var sess = JSON.parse(localStorage.getItem(skey) || 'null') ||
        { startDate: today, workDates: [today], screenReader: localStorage.getItem(key.replace(/_mode$/, '_screenreader')) || '', rooms: [] };
      sess.mode = modeOf(key);
      localStorage.setItem(skey, JSON.stringify(sess));
    } catch (e) {}
  }

  // ── Start: the button stays where it is, so focus stays on it ──
  SP.markStarted = function (btn, practice) {
    if (typeof btn === 'string') btn = document.getElementById(btn);
    if (!btn) return;
    btn.setAttribute('aria-disabled', 'true');
    btn.textContent = practice ? 'Started: No Time Limit' : 'Started: Clock Running';
    recordMode();
  };

  // ── Hints: offered after two misses; they teach the strategy, not the answer ──
  window.hintsUsed = 0;
  var misses = 0;
  // Counts a miss. Returns the sentence to add to the room's message once a hint is available.
  window.noteMiss = function () {
    var hints = SP.cfg.hints || [];
    misses++;
    if (misses < 2 || window.hintsUsed >= hints.length) return '';
    var area = document.getElementById('hint-area'); if (area) area.hidden = false;
    return ' A hint is available ' + (SP.cfg.hintWhere || 'below the answer button') + '.';
  };
  function setupHints() {
    var btn = document.getElementById('hint-btn'); if (!btn) return;
    btn.addEventListener('click', function () {
      var hints = SP.cfg.hints || [];
      if (window.hintsUsed >= hints.length) return;
      var p = document.createElement('p');
      p.textContent = 'Hint ' + (window.hintsUsed + 1) + ': ' + hints[window.hintsUsed];
      document.getElementById('hint-text').appendChild(p);
      window.hintsUsed++;
      if (window.hintsUsed < hints.length) btn.textContent = 'Get Another Hint';
      else { btn.textContent = 'No More Hints'; btn.setAttribute('aria-disabled', 'true'); }
    });
  }

  // ── Time up: Continue in Practice Mode or Try Again in Challenge Mode ──
  var timeUpOpts = null;
  function timeUpOverlay() {
    var ov = document.getElementById('fail-overlay');
    if (ov) return ov;
    ov = document.createElement('div');
    ov.id = 'fail-overlay'; ov.className = 'sp-timeup';
    ov.setAttribute('role', 'alertdialog'); ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-labelledby', 'fail-heading'); ov.setAttribute('aria-describedby', 'fail-desc');
    ov.innerHTML = '<p class="fail-glitch" aria-hidden="true">Time Is Up</p>' +
      '<h2 id="fail-heading" class="fail-title"></h2><p id="fail-desc" class="fail-message"></p>' +
      '<div class="fail-buttons"><button type="button" class="btn btn-primary" id="switch-practice">Continue in Practice Mode</button>' +
      '<button type="button" class="btn btn-secondary" id="retry-challenge"></button></div>';
    document.body.appendChild(ov);
    document.getElementById('switch-practice').addEventListener('click', choosePractice);
    document.getElementById('retry-challenge').addEventListener('click', SP.retry);
    ov.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); choosePractice(); return; }
      if (e.key !== 'Tab') return;
      var els = Array.prototype.slice.call(ov.querySelectorAll('button')), first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    return ov;
  }
  function choosePractice() {
    var ov = document.getElementById('fail-overlay'); if (ov) ov.classList.remove('active');
    try { if (SP.cfg.modeKey) localStorage.setItem(SP.cfg.modeKey, 'practice'); } catch (e) {}
    if (timeUpOpts && typeof timeUpOpts.onPractice === 'function') timeUpOpts.onPractice();
  }
  // opts: title, message, onPractice (the room keeps the student's work and turns off its clock)
  SP.timeUp = function (opts) {
    timeUpOpts = opts || {};
    // Close any open pop-up so the choices can be reached
    Array.prototype.forEach.call(document.querySelectorAll('dialog[open]'), function (d) { d.close(); });
    var ov = timeUpOverlay();
    document.getElementById('fail-heading').textContent = timeUpOpts.title || 'Good Effort. The Clock Ran Out';
    var again = 'Try Again in ' + SP.modeName();
    document.getElementById('retry-challenge').textContent = again;
    document.getElementById('fail-desc').textContent = SP.mins(timeUpOpts.message || '') +
      ' Continue in Practice Mode keeps your work and turns off the clock. ' + again + ' starts this room over with a new task and a fresh clock.';
    ov.classList.add('active');
    setTimeout(function () { document.getElementById('switch-practice').focus(); }, 150);
  };
  SP.timeUpOpen = function () { var ov = document.getElementById('fail-overlay'); return !!(ov && ov.classList.contains('active')); };
  SP.retry = function () {
    // Same timed mode as before: Challenge stays Challenge, Mr. Moy Mode stays Mr. Moy Mode
    try { if (SP.cfg.modeKey && modeOf() !== 'moy') localStorage.setItem(SP.cfg.modeKey, 'challenge'); sessionStorage.setItem('sp_retry_room', '1'); } catch (e) {}
    window.location.reload();
  };
  // After Try Again, land on the room heading so the student can review the new task
  function afterRetry() {
    var retry = false;
    try { retry = !!sessionStorage.getItem('sp_retry_room'); sessionStorage.removeItem('sp_retry_room'); } catch (e) {}
    if (!retry) return;
    window.scrollTo(0, 0);
    setTimeout(function () {
      var h = document.querySelector('#room-content h1') || document.querySelector('main h1');
      window.focusEl(h);
      say('New attempt in ' + SP.modeName() + '. Review your new task, then press Start when you are ready.');
    }, 400);
  }

  // ── Results for the whole escape room, shown once at the end ──
  // opts: heading, lines (one result per line), emailTitle, onClose
  SP.results = function (opts) {
    var d = document.getElementById('results-dialog');
    if (!d) {
      d = document.createElement('dialog');
      d.id = 'results-dialog'; d.className = 'sp-dialog'; d.setAttribute('aria-labelledby', 'results-heading');
      d.innerHTML = '<p class="results-label" aria-hidden="true">Escape Room Complete</p>' +
        '<h2 id="results-heading" tabindex="-1"></h2><p class="results-sub" id="results-sub"></p>' +
        '<div class="results-rows" id="results-rows"></div>' +
        '<div class="results-btns"><button type="button" class="btn btn-primary" id="res-email-btn">Email Results</button>' +
        '<button type="button" class="btn btn-secondary" id="res-copy-btn">Copy Results</button>' +
        '<button type="button" class="btn btn-secondary" id="res-skip-btn">Skip</button></div>';
      document.body.appendChild(d);
      d.addEventListener('close', function () { if (typeof d._onClose === 'function') d._onClose(); });
      document.getElementById('res-skip-btn').addEventListener('click', function () { d.close(); });
    }
    d._onClose = opts.onClose;
    document.getElementById('results-heading').textContent = opts.heading;
    document.getElementById('results-sub').textContent = opts.sub || 'Your results for every room';
    var rows = document.getElementById('results-rows'); rows.innerHTML = '';
    opts.lines.forEach(function (t) { var p = document.createElement('p'); p.textContent = t; rows.appendChild(p); });
    var ds = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    var body = ['ScreenPath: ' + opts.emailTitle, ds, ''].concat(opts.lines).join('\n');
    document.getElementById('res-email-btn').onclick = function () {
      window.location.href = 'mailto:?subject=' + encodeURIComponent('ScreenPath Results: ' + opts.emailTitle) + '&body=' + encodeURIComponent(body);
    };
    document.getElementById('res-copy-btn').onclick = function () {
      var btn = this;
      function done() { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy Results'; }, 2500); say('Results copied to clipboard.'); }
      if (navigator.clipboard) navigator.clipboard.writeText(body).then(done);
      else { var ta = document.createElement('textarea'); ta.value = body; ta.style.cssText = 'position:fixed;left:-9999px'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); done(); }
    };
    d.showModal();
    document.getElementById('results-heading').focus();
  };
  // One line per room: "Room 1, The School Office: 2 minutes, 1 attempt, 0 hints"
  SP.resultLines = function (session, rooms, modeKey, fmt) {
    var lines = [], total = 0;
    rooms.forEach(function (m) {
      var r = session && session.rooms ? session.rooms.find(function (x) { return x.roomKey === m[0]; }) : null;
      if (r) {
        total += r.timeUsed || 0;
        lines.push('Room ' + m[0] + ', ' + m[1] + ': ' + fmt(r.timeUsed || 0) + ', ' + r.attempts + ' attempt' + (r.attempts !== 1 ? 's' : '') +
          (r.hints != null ? ', ' + r.hints + ' hint' + (r.hints !== 1 ? 's' : '') : ''));
      } else lines.push('Room ' + m[0] + ', ' + m[1] + ': Not recorded');
    });
    lines.push('Total time: ' + fmt(total));
    lines.push('Mode: ' + SP.modeLabel(modeKey));
    if (session && session.screenReader) lines.push('Screen reader: ' + session.screenReader);
    return lines;
  };

  // ── End of the escape room: the story and Moises's message ──
  SP.finale = function () {
    var m = document.getElementById('series-complete'); if (!m) return;
    m.classList.add('open'); m.setAttribute('aria-hidden', 'false');
    var c = document.getElementById('sc-particles');
    if (c && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      c.innerHTML = '';
      var colors = ['#39d98a', '#a8ffd4', '#ffffff', '#f5a623', '#4da6ff'];
      for (var i = 0; i < 70; i++) {
        var p = document.createElement('div'); p.className = 'sc-particle';
        var a = Math.random() * Math.PI * 2, dist = 80 + Math.random() * 300;
        p.style.setProperty('--dx', Math.cos(a) * dist + 'px'); p.style.setProperty('--dy', Math.sin(a) * dist + 'px');
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.animationDelay = (Math.random() * .3) + 's';
        c.appendChild(p);
      }
    }
    setTimeout(function () { var h = document.getElementById('sc-heading'); if (h) h.focus({ preventScroll: true }); }, 400);
    m.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var els = m.querySelectorAll('a[href]'); if (!els.length) return;
      var first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  };

  // Mr. Moy Mode chosen on the setup screen: reload so the room sets its shorter clock, then land on the room heading
  SP.reloadAfterSetup = function (msg) {
    try { sessionStorage.setItem('sp_setup_msg', msg); } catch (e) {}
    window.location.reload();
  };
  function afterSetup() {
    var msg = null;
    try { msg = sessionStorage.getItem('sp_setup_msg'); sessionStorage.removeItem('sp_setup_msg'); } catch (e) {}
    if (!msg) return;
    window.scrollTo(0, 0);
    setTimeout(function () { window.focusEl(document.querySelector('#room-content h1') || document.querySelector('main h1')); say(msg); }, 400);
  }

  SP.init = function (cfg) {
    SP.cfg = cfg || {};
    if (SP.total == null) SP.isMoy = false;
    applyMoy();
    setupHints();
    afterRetry();
    afterSetup();
  };
})();
