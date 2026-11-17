/* ScreenPath Form Lab: shared behavior for every Form Lab activity.
   Each form loads this file before its own script and calls FL.setup({...}).

   What lives here:
   1. announce(): the assertive live region (#live), plus announcePolite() for #live-polite when a page has one.
   2. The setup screen: screen reader check, mode choice, and the switch to practice.
   3. The Not Accessible and Accessible tabs, including how often and how long the Accessible tab was checked.
   4. The elapsed time clock in the status bar.
   5. The completion pop-up: focus, Tab trap, Escape to close, Copy, and the email link.
   6. Saving the session to My Progress (sp_formskills_sessions). Only counts are saved, never what the student typed.
   7. The site menu button.
   8. The scenario card: the fictional person's details above the form, one "Label: value" line each,
      and a Show My Scenario button beside each Submit button that opens the same details in a pop-up.

   House rules this file follows: no em dashes, no regions, screen reader terms instead of key names in
   anything a student reads, and focus moves only when the page itself changes (setup to practice, the pop-up). */
(function () {
  'use strict';
  var FL = window.FL = {
    state: { mode: 'accessible', sr: '', teacherEmail: '', attempts: 0, hintViews: 0, hintMs: 0 }
  };
  var hintEnteredAt = null, startTime = null, timerInterval = null, cfg = {};

  function $(id) { return document.getElementById(id); }

  // ── Live regions ──
  window.announce = FL.announce = function (msg) {
    var el = $('live'); if (!el) return;
    el.textContent = '';
    setTimeout(function () { el.textContent = msg; }, 100);
  };
  window.announcePolite = FL.announcePolite = function (msg) {
    var el = $('live-polite'); if (!el) { FL.announce(msg); return; }
    el.textContent = '';
    setTimeout(function () { el.textContent = msg; }, 100);
  };

  FL.modeLabel = function () { return FL.state.mode === 'accessible' ? 'Accessible' : 'Not Accessible'; };

  // A tip for spotting text that only looks like a heading, in screen reader terms
  FL.fakeHeadingTip = function () {
    return ' If a section name does not show up when you move by heading, explore the nearby text line by line, or check your screen reader\'s list of elements. It may only be styled to look like a heading.';
  };

  // ── Tabs: roving focus, automatic activation ──
  function visibleTabs() {
    return Array.prototype.filter.call(document.querySelectorAll('.tab'), function (t) { return !t.hidden; });
  }
  FL.activateTab = function (tabId) {
    visibleTabs().forEach(function (t) {
      var sel = t.id === tabId;
      t.setAttribute('aria-selected', sel ? 'true' : 'false');
      t.tabIndex = sel ? 0 : -1;
      var panel = $(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !sel;
    });
    if (tabId === 'tab-accessible') { FL.state.hintViews++; hintEnteredAt = Date.now(); }
    else if (hintEnteredAt) { FL.state.hintMs += Date.now() - hintEnteredAt; hintEnteredAt = null; }
  };
  function wireTabs() {
    document.querySelectorAll('.tab').forEach(function (tab) {
      tab.addEventListener('click', function () { FL.activateTab(tab.id); tab.focus(); });
      tab.addEventListener('keydown', function (e) {
        var tabs = visibleTabs(), i = tabs.indexOf(tab), next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); FL.activateTab(next.id); next.focus(); }
      });
    });
  }
  FL.hintSeconds = function () {
    if (hintEnteredAt) { FL.state.hintMs += Date.now() - hintEnteredAt; hintEnteredAt = null; }
    return Math.round(FL.state.hintMs / 1000);
  };

  // ── Elapsed time clock ──
  FL.startTimer = function () {
    startTime = Date.now();
    timerInterval = setInterval(function () {
      var s = Math.floor((Date.now() - startTime) / 1000), el = $('status-timer');
      if (el) el.textContent = Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
    }, 1000);
  };
  FL.stopTimer = function () { clearInterval(timerInterval); return Math.round((Date.now() - startTime) / 1000); };
  FL.time = function (seconds) {
    var m = Math.floor(seconds / 60), s = seconds % 60, pad = (s < 10 ? '0' : '') + s;
    return { long: m + ' min ' + pad + ' sec', short: m + ':' + pad };
  };

  // ── Setup screen ──
  function begin() {
    var srSel = $('gate-screen-reader'), srErr = $('sr-error');
    if (!srSel.value) {
      srErr.hidden = false; srSel.setAttribute('aria-invalid', 'true'); srSel.closest('.field').classList.add('invalid');
      srSel.focus(); FL.announce('Choose your screen reader before you begin.'); return;
    }
    srErr.hidden = true; srSel.removeAttribute('aria-invalid'); srSel.closest('.field').classList.remove('invalid');
    FL.state.sr = srSel.value;
    FL.state.mode = document.querySelector('input[name="setup-mode"]:checked').value;
    FL.state.teacherEmail = $('setup-teacher-email').value.trim();
    var acc = FL.state.mode === 'accessible';

    if (cfg.beforeShow) cfg.beforeShow(FL.state.mode);
    $('setup-section').hidden = true;
    $('practice-section').hidden = false;
    $('status-sr').textContent = FL.state.sr;
    $('status-mode').textContent = FL.modeLabel();
    $('skill-focus-text').innerHTML = cfg.skillFocus(FL.state.mode, FL.state.sr);

    var tablist = document.querySelector('.tablist'), panelAcc = $('panel-accessible'), panelNA = $('panel-notaccessible');
    // The form's own layout first (its banners, buttons, and tabs), then the tabs are switched on
    if (cfg.afterLayout) cfg.afterLayout(FL.state.mode);
    renderScenario(cfg.scenario);
    if (acc) {
      tablist.hidden = true; panelNA.hidden = true; panelAcc.hidden = false;
      panelAcc.removeAttribute('role'); panelAcc.removeAttribute('aria-labelledby'); panelAcc.removeAttribute('tabindex');
    } else {
      tablist.hidden = false;
      panelAcc.setAttribute('role', 'tabpanel'); panelAcc.setAttribute('aria-labelledby', 'tab-accessible');
      FL.activateTab('tab-notaccessible');
    }

    FL.startTimer();
    FL.announce(acc ? cfg.startAccessible : 'Practice started. You are on the Not Accessible tab. Switch to the Accessible tab anytime to check something.');
    var h = $('practice-title'); h.setAttribute('tabindex', '-1'); h.focus();
  }

  // ── Scenario card: fictional details only, so students never type their own information ──
  function scenarioList(items) {
    return '<ul class="scenario-list">' + items.map(function (it) {
      return '<li><span class="scenario-label">' + it[0] + ':</span> ' + it[1] + '</li>';
    }).join('') + '</ul>';
  }
  function renderScenario(sc) {
    if (!sc || document.getElementById('scenario-card')) return;
    var card = document.createElement('div');
    card.className = 'scenario-card'; card.id = 'scenario-card';
    card.innerHTML = '<h2 id="scenario-heading">Your Scenario</h2><p>' + sc.intro + '</p>' + scenarioList(sc.items);
    var tablist = document.querySelector('.tablist');
    tablist.parentNode.insertBefore(card, tablist);
    var dlg = document.createElement('dialog');
    dlg.className = 'scenario-dialog'; dlg.id = 'scenario-dialog'; dlg.setAttribute('aria-labelledby', 'scenario-dialog-heading');
    dlg.innerHTML = '<h2 id="scenario-dialog-heading">Your Scenario</h2><p>' + sc.intro + '</p>' + scenarioList(sc.items) +
      '<button type="button" class="btn primary" id="scenario-close">Close</button>';
    document.body.appendChild(dlg);
    document.getElementById('scenario-close').addEventListener('click', function () { dlg.close(); });
    (sc.buttonsBefore || []).forEach(function (id) {
      var target = document.getElementById(id); if (!target) return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'btn scenario-btn'; b.textContent = 'Show My Scenario';
      b.addEventListener('click', function () { dlg.showModal(); var h = document.getElementById('scenario-dialog-heading'); h.setAttribute('tabindex', '-1'); h.focus(); });
      target.parentNode.insertBefore(b, target);
    });
  }

  // ── Checking answers against the scenario, after Submit ──
  //    Each check: { label, field, expect, type } where type is text, digits, money, date, choice, radio, contains, or custom.
  //    Spaces, dashes, punctuation, and capital letters never count as mistakes.
  function norm(t) { return String(t || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
  function isoDate(t) {
    t = String(t || '').trim(); if (!t) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
    var d = new Date(t); if (isNaN(d)) return t;
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function niceDate(iso) {
    var p = String(iso).split('-'); if (p.length !== 3) return iso;
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return months[+p[1] - 1] + ' ' + (+p[2]) + ', ' + p[0];
  }
  function findField(panel, prefix, field) {
    return panel.querySelector('[name="' + field + '"]') || document.getElementById(prefix + '-' + field);
  }
  FL.checkScenario = function (prefix, checks) {
    var panel = document.getElementById(prefix === 'acc' ? 'panel-accessible' : 'panel-notaccessible');
    var res = { matched: 0, total: checks.length, mismatches: [] };
    checks.forEach(function (c) {
      var got = '', shown = '', ok = false;
      if (c.type === 'radio') {
        var r = panel.querySelector('input[type="radio"][name="' + prefix + '-' + c.field + '"]:checked') || panel.querySelector('input[type="radio"][name="' + c.field + '"]:checked');
        got = r ? r.value : ''; shown = got; ok = norm(got) === norm(c.expect);
      } else if (c.type === 'custom') {
        var out = c.test(); ok = out.ok; shown = out.shown;
      } else {
        var el = findField(panel, prefix, c.field);
        if (el && el.tagName === 'SELECT') { got = el.selectedIndex > 0 ? el.options[el.selectedIndex].text : ''; }
        else got = el ? el.value : '';
        shown = got;
        if (c.type === 'digits') ok = got.replace(/\D/g, '') === String(c.expect).replace(/\D/g, '');
        else if (c.type === 'money') ok = parseFloat(String(got).replace(/[^0-9.]/g, '')) === parseFloat(String(c.expect).replace(/[^0-9.]/g, ''));
        else if (c.type === 'date') { ok = isoDate(got) === c.expect; if (/^\d{4}-\d{2}-\d{2}$/.test(got)) shown = niceDate(got); }
        else if (c.type === 'contains') ok = c.expect.every(function (w) { return norm(got).indexOf(norm(w)) !== -1; });
        else ok = norm(got) === norm(c.expect);
      }
      if (ok) res.matched++;
      else res.mismatches.push({ label: c.label, shown: String(shown).trim() || 'nothing', want: c.type === 'date' ? niceDate(c.expect) : (c.say || c.expect) });
    });
    return res;
  };
  FL.matchLines = function (res) {
    var l = ['Matches the scenario: ' + res.matched + ' of ' + res.total + ' answers'];
    res.mismatches.forEach(function (m) { l.push('  ' + m.label + ': entered ' + m.shown + ', scenario says ' + m.want); });
    return l;
  };
  FL.showMatch = function (res) {
    var old = document.getElementById('match-results'); if (old) old.remove();
    var box = document.createElement('div'); box.className = 'match-results'; box.id = 'match-results';
    var esc = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
    var h = '<h3>How your answers match the scenario</h3><p>Matches the scenario: ' + res.matched + ' of ' + res.total + ' answers.</p>';
    if (res.mismatches.length) {
      h += '<ul>' + res.mismatches.map(function (m) {
        return '<li>' + esc(m.label) + ': you entered ' + esc(m.shown) + '. The scenario says ' + esc(m.want) + '.</li>';
      }).join('') + '</ul>';
    } else h += '<p>Every answer matches. Great attention to detail.</p>';
    box.innerHTML = h;
    var talk = document.querySelector('#completion-overlay .talk');
    talk.parentNode.insertBefore(box, talk);
  };

  // ── Completion pop-up ──
  FL.setEmail = function (subject, body) {
    $('email-btn').href = 'mailto:' + encodeURIComponent(FL.state.teacherEmail) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  };
  FL.openCompletion = function (message) {
    $('completion-overlay').classList.add('open');
    setTimeout(function () { $('completion-heading').focus(); }, 80);
    FL.announce(message);
  };
  FL.closeCompletion = function () {
    $('completion-overlay').classList.remove('open');
    var h = $('practice-title'); if (h) h.focus();
  };
  function wireCompletion() {
    $('copy-btn').addEventListener('click', function () {
      var text = $('summary-text').value;
      try { navigator.clipboard.writeText(text).then(function () { FL.announce('Copied to clipboard.'); }); }
      catch (e) { $('summary-text').select(); FL.announce('Could not copy automatically. The summary is selected for you to copy.'); }
    });
    $('skip-btn').addEventListener('click', FL.closeCompletion);
    $('email-btn').addEventListener('click', function () { FL.announce('Opening your email application.'); });
    document.addEventListener('keydown', function (e) {
      var ov = $('completion-overlay');
      if (!ov.classList.contains('open')) return;
      if (e.key === 'Escape') { FL.closeCompletion(); return; }
      if (e.key !== 'Tab') return;
      var f = ov.querySelectorAll('button,a[href],textarea'), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  // ── My Progress: counts only, never what the student typed ──
  FL.saveSession = function (extra) {
    try {
      var sessions = JSON.parse(localStorage.getItem('sp_formskills_sessions') || '[]');
      var s = { format: 'web', screenReader: FL.state.sr, mode: FL.modeLabel(), hintViews: FL.state.hintViews,
        hintSeconds: Math.round(FL.state.hintMs / 1000), attempts: FL.state.attempts, date: new Date().toISOString() };
      for (var k in extra) s[k] = extra[k];
      sessions.push(s);
      localStorage.setItem('sp_formskills_sessions', JSON.stringify(sessions));
    } catch (e) {}
  };

  // ── Site menu button, the same as every other ScreenPath page ──
  function wireMenu() {
    var b = $('menu-btn'), d = $('nav-drawer'); if (!b || !d) return;
    b.addEventListener('click', function () {
      var open = d.hasAttribute('hidden');
      if (open) d.removeAttribute('hidden'); else d.setAttribute('hidden', '');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      b.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      b.innerHTML = open ? '&#10005;' : '&#9776;';
    });
  }

  FL.setup = function (config) {
    cfg = config || {};
    $('begin-btn').addEventListener('click', begin);
    wireTabs(); wireCompletion(); wireMenu();
  };
})();
