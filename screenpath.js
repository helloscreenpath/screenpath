/* Shared accessibility, storage and result helpers. No network requests. */
(function () {
  'use strict';
  const SP = window.ScreenPath = {};
  SP.get = function (key, fallback) {
    try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); }
    catch (_) { return fallback; }
  };
  SP.set = function (key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (_) { SP.announce('Your browser could not save this result. Copy your results before leaving.', true); return false; }
  };
  SP.today = function () {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  };
  SP.rooms = [
    {key:'1',name:'The School Office',skill:'Headings',url:'mission-1a.html',seconds:240},
    {key:'2',name:'The Library',skill:'Links and Tables',url:'mission-1b.html',seconds:300},
    {key:'3',name:'The Computer Lab',skill:'Forms',url:'mission-1c.html',seconds:240}
  ];
  SP.roomKeys = session => SP.rooms.filter(r => (session?.rooms || []).some(x => String(x.roomKey) === r.key)).map(r => r.key);
  SP.sessions = function () {
    const saved = SP.get('sp_school_sessions', []);
    return Array.isArray(saved) ? saved.filter(s => s && Array.isArray(s.rooms)) : [];
  };
  SP.current = function () {
    const s = SP.get('sp_school_current_session', null);
    return s && Array.isArray(s.rooms) ? s : null;
  };
  SP.schoolState = function () {
    const current = SP.current(), history = SP.sessions();
    let keys;
    if (current) keys = SP.roomKeys(current);
    else if (history.length) keys = SP.roomKeys(history[history.length-1]);
    else keys = SP.rooms.filter(r => [1,'1',true].includes(SP.get('sp_room'+r.key+'_complete', null))).map(r=>r.key);
    return {current,history,keys,next:SP.rooms.find(r => !keys.includes(r.key)) || null};
  };
  SP.announce = function (message, urgent) {
    const id = urgent ? 'sp-alert' : 'sp-status';
    let region = document.getElementById(id);
    if (!region) {
      region = document.createElement('div'); region.id=id; region.className='sr-only';
      region.setAttribute('role',urgent?'alert':'status'); region.setAttribute('aria-atomic','true');
      document.body.appendChild(region);
    }
    region.textContent = message;
  };
  SP.focus = function (el) {
    if (typeof el === 'string') el = document.getElementById(el);
    if (!el) return;
    if (!el.matches('a,button,input,select,textarea')) el.setAttribute('tabindex','-1');
    el.focus();
  };
  SP.openDialog = function (dialog, focusTarget) {
    if (typeof dialog === 'string') dialog = document.getElementById(dialog);
    if (!dialog || dialog.open) return;
    dialog._opener = document.activeElement;
    dialog.showModal();
    SP.focus(focusTarget || dialog.querySelector('h2,button,a'));
  };
  SP.closeDialog = function (dialog, target) {
    if (typeof dialog === 'string') dialog = document.getElementById(dialog);
    if (!dialog) return;
    dialog.close();
    SP.focus(target || dialog._opener);
  };
  SP.copy = async function (text, button, status) {
    let copied = false;
    try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); copied=true; } } catch (_) {}
    if (!copied) {
      const area = document.createElement('textarea'); area.value=text; area.className='sr-only';
      (button?.closest('dialog[open]') || document.body).appendChild(area); area.select();
      try { copied = document.execCommand('copy'); } catch (_) {}
      area.remove(); if (button) button.focus();
    }
    const message = copied ? 'Copied to clipboard.' : 'Copy was blocked. Select and copy the text in the box below.';
    if (status) status.textContent=message;
    SP.announce(message);
    if (!copied && button) {
      let area = button.parentElement.querySelector('.manual-copy');
      if (!area) { area=document.createElement('textarea');area.className='manual-copy';area.readOnly=true;area.setAttribute('aria-label','Text to copy manually');button.parentElement.appendChild(area); }
      area.value=text;area.focus();area.select();
    }
    return copied;
  };
  SP.formatTime = function (seconds) {
    if (seconds === null || seconds === undefined) return 'Not recorded';
    const s=Math.max(0,Math.round(seconds)); return Math.floor(s/60)+'m '+s%60+'s';
  };
  SP.resultText = function (session, number) {
    const lines=['ScreenPath — The School', 'Session '+number, 'Started: '+(session.startDate || 'Not recorded'), session.endDate ? 'Completed: '+session.endDate : 'In progress'];
    if (session.screenReader && session.screenReader !== 'Prefer not to say') lines.push('Screen reader: '+session.screenReader);
    SP.rooms.forEach(meta => {
      const r=session.rooms.find(r => String(r.roomKey)===meta.key); if (!r) return;
      lines.push('', 'Room '+meta.key+': '+meta.name+' — '+meta.skill,
        'Mode: '+(r.mode==='practice'?'Practice (no deadline)':r.mode==='legacy'?'Not recorded':'Challenge'),
        'Time used: '+SP.formatTime(r.timeUsed),
        'Time allowed: '+(r.mode==='practice'?'No deadline':SP.formatTime(r.timeAllowed)),
        'Answer submissions: '+(r.attempts??'Not recorded'));
      if (r.wrongBooks !== undefined) lines.push('Other books opened: '+r.wrongBooks);
      if (r.reflection) {
        const f=r.reflection;
        if (f.strategy) lines.push('Strategy: '+f.strategy);
        if (f.confidence) lines.push('Confidence: '+f.confidence);
        if (f.assistance) lines.push('Assistance: '+f.assistance);
        if (f.notes) lines.push('Notes: '+f.notes);
      }
    });
    lines.push('', 'Results stay on this device unless you choose to share them.');
    return lines.join('\n');
  };
  function setup() {
    const drawer=document.getElementById('nav-drawer'),menu=document.getElementById('menu-btn');
    window.toggleMenu = function () {
      if (!drawer || !menu) return;
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded',String(open)); menu.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu');
      menu.textContent=open?'✕':'☰';drawer.hidden=!open;drawer.classList.toggle('open',open);
    };
    if (drawer && menu) {
      drawer.hidden=true;
      document.addEventListener('keydown',e=>{ if(e.key==='Escape' && menu.getAttribute('aria-expanded')==='true'){window.toggleMenu();menu.focus();} });
      drawer.addEventListener('click',e=>{if(e.target.closest('a')){drawer.hidden=true;drawer.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation menu');menu.textContent='☰';}});
    }
    document.querySelectorAll('dialog').forEach(d=>d.addEventListener('cancel',e=>{e.preventDefault();SP.closeDialog(d);}));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
