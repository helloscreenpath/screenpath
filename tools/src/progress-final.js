    // ── STORAGE HELPERS ───────────────────────────────────────────
    function store(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e){} }
    function recall(key, def) { try { var v=localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch(e){ return def; } }

    // ── SESSION DATA STRUCTURE ────────────────────────────────────
    // sp_school_sessions = [ { id, startDate, endDate, workDates[], screenReader, rooms:[ {room,skill,dateCompleted,attempts,timeUsed,timeAllowed,pct} ] } ]

    var ROOM_META = [
      { key:'1', name:'The School Office',      skill:'Headings',         timeAllowed:240 },
      { key:'2', name:'The Library',             skill:'Links and Tables', timeAllowed:300 },
      { key:'3', name:'The Computer Lab',        skill:'Forms',            timeAllowed:240 },
    ];

    function loadSchoolSessions() {
      return recall('sp_school_sessions', []);
    }

    function fmtTime(s) {
      if (!s && s !== 0) return 'n/a';
      var m = Math.floor(s/60), sec = s%60;
      if (m===0) return sec+'s';
      if (sec===0) return m+'m';
      return m+'m '+sec+'s';
    }

    function fmtDate(iso) {
      if (!iso) return 'n/a';
      try {
        return new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
      } catch(e){ return iso; }
    }

    // ── RENDER SCHOOL HISTORY ─────────────────────────────────────
    function renderSchoolHistory() {
      var sessions = loadSchoolSessions();
      var container = document.getElementById('school-history');
      var badge     = document.getElementById('school-status-badge');
      var globalBtns= document.getElementById('school-global-btns');

      // Also check legacy simple completion keys
      var r1done = recall('sp_room1_complete',null)==='1' || recall('sp_room1_complete',null)===true;
      var r2done = recall('sp_room2_complete',null)==='1' || recall('sp_room2_complete',null)===true;
      var r3done = recall('sp_room3_complete',null)==='1' || recall('sp_room3_complete',null)===true;

      if (sessions.length === 0) {
        // Check for legacy data
        if (!r1done && !r2done && !r3done) {
          badge.textContent = 'Not Started';
          badge.className = 'series-status status-notstarted';
          container.innerHTML = '<div class="no-data"><p>You have not started The School yet. <a href="the-school.html">Go to The School</a></p></div>';
          return;
        }
        // Has legacy data show simple status
        if (r3done) {
          badge.textContent = 'Complete';
          badge.className = 'series-status status-complete';
        } else {
          badge.textContent = 'In Progress';
          badge.className = 'series-status status-progress';
        }
        container.innerHTML = '<div class="no-data"><p>Complete the series using the current version of ScreenPath to see your full session history here.</p></div>';
        return;
      }

      // Determine overall status
      var lastSession = sessions[sessions.length - 1];
      var allComplete = lastSession.rooms && lastSession.rooms.length === 3;
      if (allComplete) {
        badge.textContent = 'Complete';
        badge.className = 'series-status status-complete';
      } else if (sessions.length > 0) {
        badge.textContent = 'In Progress';
        badge.className = 'series-status status-progress';
      }

      container.innerHTML = '';

      sessions.forEach(function(session, sIdx) {
        var sNum = sIdx + 1;
        var startFmt = fmtDate(session.startDate);
        var endFmt   = session.endDate ? fmtDate(session.endDate) : 'In Progress';
        var dateRange = session.endDate ? startFmt + ' to ' + endFmt : 'Started ' + startFmt;

        // H3 heading
        var heading = document.createElement('h4');
        heading.id  = 'session-school-' + sNum;
        heading.textContent = 'Session ' + sNum + ': ' + dateRange;

        var block = document.createElement('div');
        block.className = 'session-block';

        // Screen reader used
        if (session.screenReader) {
          var srLine = document.createElement('p');
          srLine.className = 'session-sr';
          srLine.textContent = 'Screen reader: ' + session.screenReader;
          block.appendChild(srLine);
        }

        // Working dates
        if (session.workDates && session.workDates.length > 1) {
          var wdLine = document.createElement('p');
          wdLine.className = 'session-meta';
          wdLine.textContent = 'Working dates: ' + session.workDates.map(fmtDate).join(', ');
          block.appendChild(wdLine);
        }

        // Table
        var tableWrap = document.createElement('div');
        tableWrap.className = 'data-table-wrap';

        var rooms = session.rooms || [];
        var table = document.createElement('table');
        table.setAttribute('aria-label', 'Session ' + sNum + ' results for The School');

        table.innerHTML = '<thead><tr>' +
          '<th scope="col">Room</th>' +
          '<th scope="col">Skill</th>' +
          '<th scope="col">Date Completed</th>' +
          '<th scope="col">Attempts</th>' +
          '<th scope="col">Time Used</th>' +
          '<th scope="col">Time Allowed</th>' +
          '<th scope="col">Used</th>' +
          '</tr></thead>';

        var tbody = document.createElement('tbody');

        ROOM_META.forEach(function(rm) {
          var roomData = rooms.find(function(r){ return r.roomKey===rm.key; });
          var tr = document.createElement('tr');
          tr.innerHTML =
            '<td>' + rm.name + '</td>' +
            '<td class="td-skill">' + rm.skill + '</td>' +
            '<td>' + (roomData ? fmtDate(roomData.dateCompleted) : 'Not yet') + '</td>' +
            '<td class="td-attempts">' + (roomData ? roomData.attempts : 'Not yet') + '</td>' +
            '<td class="td-time">' + (roomData ? fmtTime(roomData.timeUsed) : 'Not yet') + '</td>' +
            '<td class="td-time">' + fmtTime(rm.timeAllowed) + '</td>' +
            '<td class="td-pct">' + (roomData ? roomData.pct + '%' : 'Not yet') + '</td>';
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        tableWrap.appendChild(table);
        block.appendChild(tableWrap);

        // Session total
        if (rooms.length > 0) {
          var totalTime = rooms.reduce(function(sum, r){ return sum + (r.timeUsed||0); }, 0);
          var totalAttempts = rooms.reduce(function(sum, r){ return sum + (r.attempts||0); }, 0);
          var totalLine = document.createElement('p');
          totalLine.className = 'session-total';
          totalLine.innerHTML = '<strong>Session total:</strong> ' + fmtTime(totalTime) + ' across ' + totalAttempts + ' attempts';
          block.appendChild(totalLine);
        }

        // Session buttons
        var btns = document.createElement('div');
        btns.className = 'session-btns';

        var shareBtn = document.createElement('button');
        shareBtn.type = 'button';
        shareBtn.className = 'btn-share btn-share-email';
        shareBtn.setAttribute('aria-label', 'Share Session ' + sNum + ' via email');
        shareBtn.textContent = 'Share Session ' + sNum;
        shareBtn.addEventListener('click', function(){ shareSession(session, sNum); });

        var copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'btn-share btn-share-copy';
        copyBtn.setAttribute('aria-label', 'Copy Session ' + sNum + ' to clipboard');
        copyBtn.textContent = 'Copy Session ' + sNum;
        copyBtn.addEventListener('click', function(){ copySession(session, sNum, copyBtn); });

        btns.appendChild(shareBtn);
        btns.appendChild(copyBtn);
        block.appendChild(btns);

        container.appendChild(heading);
        container.appendChild(block);
      });

      // Show global buttons if there is data
      if (sessions.length > 0) {
        globalBtns.style.display = 'flex';
        document.getElementById('school-share-all').onclick = function(){ shareAllSessions(); };
        document.getElementById('school-copy-all').onclick  = function(){ copyAllSessions(); };
        document.getElementById('school-reset').onclick     = function(){ resetSchool(); };
      }
    }

    // ── SESSION TEXT BUILDER ──────────────────────────────────────
    function sessionText(session, sNum) {
      var lines = [];
      var startFmt = fmtDate(session.startDate);
      var endFmt   = session.endDate ? fmtDate(session.endDate) : 'In Progress';
      lines.push('Escape Rooms: The School');
      lines.push('Session ' + sNum + ': ' + startFmt + ' to ' + endFmt);
      if (session.screenReader) lines.push('Screen reader: ' + session.screenReader);
      lines.push('');

      var rooms = session.rooms || [];
      ROOM_META.forEach(function(rm) {
        var r = rooms.find(function(x){ return x.roomKey===rm.key; });
        if (r) {
          lines.push('Room ' + rm.key + ', ' + rm.name + ', ' + rm.skill);
          lines.push('Completed: ' + fmtDate(r.dateCompleted) + ', Attempts: ' + r.attempts + ', Time: ' + fmtTime(r.timeUsed) + ' of ' + fmtTime(rm.timeAllowed) + ', ' + r.pct + '%');
          lines.push('');
        }
      });

      if (rooms.length > 0) {
        var totalTime = rooms.reduce(function(s,r){ return s+(r.timeUsed||0); },0);
        var totalAttempts = rooms.reduce(function(s,r){ return s+(r.attempts||0); },0);
        lines.push('Total: ' + fmtTime(totalTime) + ' across ' + totalAttempts + ' attempts');
      }

      return lines.join('\n');
    }

    function shareSession(session, sNum) {
      var text = sessionText(session, sNum);
      var subj = 'ScreenPath Activity Results';
      window.location.href = 'mailto:?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(text);
    }

    function copySession(session, sNum, btn) {
      var text = sessionText(session, sNum);
      copyText(text, btn, 'Copy Session ' + sNum);
    }

    function shareAllSessions() {
      var sessions = loadSchoolSessions();
      var all = sessions.map(function(s,i){ return sessionText(s, i+1); }).join('\n\n---\n\n');
      var subj = 'ScreenPath Activity Results';
      window.location.href = 'mailto:?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(all);
    }

    function copyAllSessions() {
      var sessions = loadSchoolSessions();
      var all = sessions.map(function(s,i){ return sessionText(s, i+1); }).join('\n\n---\n\n');
      var btn = document.getElementById('school-copy-all');
      copyText(all, btn, 'Copy All Sessions');
    }

    function copyText(text, btn, originalLabel) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() {
          btn.textContent = 'Copied';
          setTimeout(function(){ btn.textContent = originalLabel; }, 2500);
        });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        btn.textContent = 'Copied';
        setTimeout(function(){ btn.textContent = originalLabel; }, 2500);
      }
    }

    function resetSchool() {
      if (!confirm('This will delete all progress and session history for The School. This cannot be undone. Are you sure?')) return;
      ['sp_room1_complete','sp_room2_complete','sp_room3_complete',
       'sp_room1_time','sp_room2_time','sp_room3_time',
       'sp_room1_attempts','sp_room2_attempts','sp_room3_attempts',
       'sp_school_sessions','sp_school_current_session','sp_sr_choice'].forEach(function(k){
        try { localStorage.removeItem(k); } catch(e){}
      });
      renderSchoolHistory();
      announce('Progress for The School has been reset.');
    }

    // ── ESCAPE ROOMS: THE DOCTOR'S VISIT ─────────────────────────────
    // sp_doctor_sessions = [ { startDate, workDates[], screenReader, assignedDoctor,
    //   patientName, rooms:[{roomKey,dateCompleted,attempts,timeUsed,timeAllowed,pct}],
    //   endDate, seriesComplete, seriesCompleteDate } ]

    var DOCTOR_ROOM_META = [
      { key:'1', name:"The Check-In Desk", skill:'Edit Fields & Combo Boxes',      timeAllowed:300 },
      { key:'2', name:'The Exam Room',      skill:'Auditory Attention',            timeAllowed:180 },
      { key:'3', name:'Growth and Vitals History', skill:'Table Navigation',       timeAllowed:300 },
      { key:'4', name:'The Front Desk',     skill:'Interactive Tables & Booking',  timeAllowed:300 },
    ];

    function loadDoctorSessions() {
      return recall('sp_doctor_sessions', []);
    }

    function renderDoctorHistory() {
      var sessions = loadDoctorSessions();
      var container = document.getElementById('doctor-history');
      var badge     = document.getElementById('doctor-status-badge');
      var globalBtns= document.getElementById('doctor-global-btns');

      // Also check legacy simple completion keys
      var r1done = recall('sp_doctor_room1_complete',null)==='1' || recall('sp_doctor_room1_complete',null)===true;
      var r2done = recall('sp_doctor_room2_complete',null)==='1' || recall('sp_doctor_room2_complete',null)===true;
      var r3done = recall('sp_doctor_room3_complete',null)==='1' || recall('sp_doctor_room3_complete',null)===true;
      var r4done = recall('sp_doctor_room4_complete',null)==='1' || recall('sp_doctor_room4_complete',null)===true;

      if (sessions.length === 0) {
        if (!r1done && !r2done && !r3done && !r4done) {
          badge.textContent = 'Not Started';
          badge.className = 'series-status status-notstarted';
          container.innerHTML = '<div class="no-data"><p>You have not started The Doctor\'s Visit yet. <a href="doctors-visit.html">Go to The Doctor\'s Visit</a></p></div>';
          return;
        }
        if (r4done) {
          badge.textContent = 'Complete';
          badge.className = 'series-status status-complete';
        } else {
          badge.textContent = 'In Progress';
          badge.className = 'series-status status-progress';
        }
        container.innerHTML = '<div class="no-data"><p>Complete the series using the current version of ScreenPath to see your full session history here.</p></div>';
        return;
      }

      var lastSession = sessions[sessions.length - 1];
      var allComplete = lastSession.rooms && lastSession.rooms.length === 4;
      if (allComplete) {
        badge.textContent = 'Complete';
        badge.className = 'series-status status-complete';
      } else if (sessions.length > 0) {
        badge.textContent = 'In Progress';
        badge.className = 'series-status status-progress';
      }

      container.innerHTML = '';

      sessions.forEach(function(session, sIdx) {
        var sNum = sIdx + 1;
        var startFmt = fmtDate(session.startDate);
        var endFmt   = session.endDate ? fmtDate(session.endDate) : 'In Progress';
        var dateRange = session.endDate ? startFmt + ' to ' + endFmt : 'Started ' + startFmt;

        var heading = document.createElement('h4');
        heading.id  = 'session-doctor-' + sNum;
        heading.textContent = 'Session ' + sNum + ': ' + dateRange;

        var block = document.createElement('div');
        block.className = 'session-block';

        if (session.screenReader) {
          var srLine = document.createElement('p');
          srLine.className = 'session-sr';
          srLine.textContent = 'Screen reader: ' + session.screenReader;
          block.appendChild(srLine);
        }

        if (session.assignedDoctor || session.patientName) {
          var charLine = document.createElement('p');
          charLine.className = 'session-sr';
          var bits = [];
          if (session.assignedDoctor) bits.push('Doctor: ' + session.assignedDoctor);
          if (session.patientName) bits.push('Patient: ' + session.patientName);
          charLine.textContent = bits.join(', ');
          block.appendChild(charLine);
        }

        if (session.workDates && session.workDates.length > 1) {
          var wdLine = document.createElement('p');
          wdLine.className = 'session-meta';
          wdLine.textContent = 'Working dates: ' + session.workDates.map(fmtDate).join(', ');
          block.appendChild(wdLine);
        }

        var tableWrap = document.createElement('div');
        tableWrap.className = 'data-table-wrap';

        var rooms = session.rooms || [];
        var table = document.createElement('table');
        table.setAttribute('aria-label', 'Session ' + sNum + ' results for The Doctor\'s Visit');

        table.innerHTML = '<thead><tr>' +
          '<th scope="col">Room</th>' +
          '<th scope="col">Skill</th>' +
          '<th scope="col">Date Completed</th>' +
          '<th scope="col">Attempts</th>' +
          '<th scope="col">Time Used</th>' +
          '<th scope="col">Time Allowed</th>' +
          '<th scope="col">Used</th>' +
          '</tr></thead>';

        var tbody = document.createElement('tbody');

        DOCTOR_ROOM_META.forEach(function(rm) {
          var roomData = rooms.find(function(r){ return r.roomKey===rm.key; });
          var tr = document.createElement('tr');
          tr.innerHTML =
            '<td>' + rm.name + '</td>' +
            '<td class="td-skill">' + rm.skill + '</td>' +
            '<td>' + (roomData ? fmtDate(roomData.dateCompleted) : 'Not yet') + '</td>' +
            '<td class="td-attempts">' + (roomData ? roomData.attempts : 'Not yet') + '</td>' +
            '<td class="td-time">' + (roomData ? fmtTime(roomData.timeUsed) : 'Not yet') + '</td>' +
            '<td class="td-time">' + fmtTime(rm.timeAllowed) + '</td>' +
            '<td class="td-pct">' + (roomData ? roomData.pct + '%' : 'Not yet') + '</td>';
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        tableWrap.appendChild(table);
        block.appendChild(tableWrap);

        if (rooms.length > 0) {
          var totalTime = rooms.reduce(function(sum, r){ return sum + (r.timeUsed||0); }, 0);
          var totalAttempts = rooms.reduce(function(sum, r){ return sum + (r.attempts||0); }, 0);
          var totalLine = document.createElement('p');
          totalLine.className = 'session-total';
          totalLine.innerHTML = '<strong>Session total:</strong> ' + fmtTime(totalTime) + ' across ' + totalAttempts + ' attempts';
          block.appendChild(totalLine);
        }

        var btns = document.createElement('div');
        btns.className = 'session-btns';

        var shareBtn = document.createElement('button');
        shareBtn.type = 'button';
        shareBtn.className = 'btn-share btn-share-email';
        shareBtn.setAttribute('aria-label', 'Share Session ' + sNum + ' via email');
        shareBtn.textContent = 'Share Session ' + sNum;
        shareBtn.addEventListener('click', function(){ shareDoctorSession(session, sNum); });

        var copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'btn-share btn-share-copy';
        copyBtn.setAttribute('aria-label', 'Copy Session ' + sNum + ' to clipboard');
        copyBtn.textContent = 'Copy Session ' + sNum;
        copyBtn.addEventListener('click', function(){ copyDoctorSession(session, sNum, copyBtn); });

        btns.appendChild(shareBtn);
        btns.appendChild(copyBtn);
        block.appendChild(btns);

        container.appendChild(heading);
        container.appendChild(block);
      });

      if (sessions.length > 0) {
        globalBtns.style.display = 'flex';
        document.getElementById('doctor-share-all').onclick = function(){ shareAllDoctorSessions(); };
        document.getElementById('doctor-copy-all').onclick  = function(){ copyAllDoctorSessions(); };
        document.getElementById('doctor-reset').onclick     = function(){ resetDoctor(); };
      }
    }

    function doctorSessionText(session, sNum) {
      var lines = [];
      var startFmt = fmtDate(session.startDate);
      var endFmt   = session.endDate ? fmtDate(session.endDate) : 'In Progress';
      lines.push('Escape Rooms: The Doctor\'s Visit');
      lines.push('Session ' + sNum + ': ' + startFmt + ' to ' + endFmt);
      if (session.screenReader) lines.push('Screen reader: ' + session.screenReader);
      if (session.assignedDoctor) lines.push('Doctor: ' + session.assignedDoctor);
      if (session.patientName) lines.push('Patient: ' + session.patientName);
      lines.push('');

      var rooms = session.rooms || [];
      DOCTOR_ROOM_META.forEach(function(rm) {
        var r = rooms.find(function(x){ return x.roomKey===rm.key; });
        if (r) {
          lines.push('Room ' + rm.key + ', ' + rm.name + ', ' + rm.skill);
          lines.push('Completed: ' + fmtDate(r.dateCompleted) + ', Attempts: ' + r.attempts + ', Time: ' + fmtTime(r.timeUsed) + ' of ' + fmtTime(rm.timeAllowed) + ', ' + r.pct + '%');
          lines.push('');
        }
      });

      if (rooms.length > 0) {
        var totalTime = rooms.reduce(function(s,r){ return s+(r.timeUsed||0); },0);
        var totalAttempts = rooms.reduce(function(s,r){ return s+(r.attempts||0); },0);
        lines.push('Total: ' + fmtTime(totalTime) + ' across ' + totalAttempts + ' attempts');
      }

      return lines.join('\n');
    }

    function shareDoctorSession(session, sNum) {
      var text = doctorSessionText(session, sNum);
      var subj = 'ScreenPath Activity Results';
      window.location.href = 'mailto:?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(text);
    }

    function copyDoctorSession(session, sNum, btn) {
      var text = doctorSessionText(session, sNum);
      copyText(text, btn, 'Copy Session ' + sNum);
    }

    function shareAllDoctorSessions() {
      var sessions = loadDoctorSessions();
      var all = sessions.map(function(s,i){ return doctorSessionText(s, i+1); }).join('\n\n---\n\n');
      var subj = 'ScreenPath Activity Results';
      window.location.href = 'mailto:?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(all);
    }

    function copyAllDoctorSessions() {
      var sessions = loadDoctorSessions();
      var all = sessions.map(function(s,i){ return doctorSessionText(s, i+1); }).join('\n\n---\n\n');
      var btn = document.getElementById('doctor-copy-all');
      copyText(all, btn, 'Copy All Sessions');
    }

    function resetDoctor() {
      if (!confirm('This will delete all progress and session history for The Doctor\'s Visit. This cannot be undone. Are you sure?')) return;
      ['sp_doctor_room1_complete','sp_doctor_room2_complete','sp_doctor_room3_complete','sp_doctor_room4_complete',
       'sp_doctor_sessions','sp_doctor_current_session'].forEach(function(k){
        try { localStorage.removeItem(k); } catch(e){}
      });
      renderDoctorHistory();
      announce('Progress for The Doctor\'s Visit has been reset.');
    }

    // ── ESCAPE ROOMS: THE GROCERY STORE (DINNER AT SEVEN) ───────────
    // sp_grocery_sessions = [ { startDate, workDates[], screenReader,
    //   rooms:[{roomKey,dateCompleted,attempts,timeUsed,timeAllowed,pct}],
    //   endDate, seriesComplete, seriesCompleteDate } ]

    var GROCERY_ROOM_META = [
      { key:'1', name:'The Entrance',         skill:'Matching Questions',     timeAllowed:360 },
      { key:'2', name:'The Aisles',           skill:'Tables & Checkboxes',    timeAllowed:300 },
      { key:'3', name:'The Express Checkout', skill:'Links & Verification',   timeAllowed:240 },
      { key:'4', name:'Out the Door',         skill:'Radio Buttons',          timeAllowed:180 },
    ];

    function loadGrocerySessions() {
      return recall('sp_grocery_sessions', []);
    }

    function renderGroceryHistory() {
      var sessions = loadGrocerySessions();
      var container = document.getElementById('grocery-history');
      var badge     = document.getElementById('grocery-status-badge');
      var globalBtns= document.getElementById('grocery-global-btns');

      // Also check legacy simple completion keys
      // Room flags are saved as the text '1'; recall() parses JSON, which turns that into the number 1.
      function groceryDone(n){ var v=recall('sp_grocery_room'+n+'_complete',null); return v===1 || v==='1' || v===true; }
      var r1done = groceryDone(1);
      var r2done = groceryDone(2);
      var r3done = groceryDone(3);
      var r4done = groceryDone(4);

      if (sessions.length === 0) {
        if (!r1done && !r2done && !r3done && !r4done) {
          badge.textContent = 'Not Started';
          badge.className = 'series-status status-notstarted';
          container.innerHTML = '<div class="no-data"><p>You have not started The Grocery Store yet. <a href="grocery-store.html">Go to The Grocery Store</a></p></div>';
          return;
        }
        if (r4done) {
          badge.textContent = 'Complete';
          badge.className = 'series-status status-complete';
        } else {
          badge.textContent = 'In Progress';
          badge.className = 'series-status status-progress';
        }
        container.innerHTML = '<div class="no-data"><p>Complete the series using the current version of ScreenPath to see your full session history here.</p></div>';
        return;
      }

      var lastSession = sessions[sessions.length - 1];
      var allComplete = lastSession.rooms && lastSession.rooms.length === 4;
      if (allComplete) {
        badge.textContent = 'Complete';
        badge.className = 'series-status status-complete';
      } else if (sessions.length > 0) {
        badge.textContent = 'In Progress';
        badge.className = 'series-status status-progress';
      }

      container.innerHTML = '';

      sessions.forEach(function(session, sIdx) {
        var sNum = sIdx + 1;
        var startFmt = fmtDate(session.startDate);
        var endFmt   = session.endDate ? fmtDate(session.endDate) : 'In Progress';
        var dateRange = session.endDate ? startFmt + ' to ' + endFmt : 'Started ' + startFmt;

        var heading = document.createElement('h4');
        heading.id  = 'session-grocery-' + sNum;
        heading.textContent = 'Session ' + sNum + ': ' + dateRange;

        var block = document.createElement('div');
        block.className = 'session-block';

        if (session.screenReader) {
          var srLine = document.createElement('p');
          srLine.className = 'session-sr';
          srLine.textContent = 'Screen reader: ' + session.screenReader;
          block.appendChild(srLine);
        }

        if (session.workDates && session.workDates.length > 1) {
          var wdLine = document.createElement('p');
          wdLine.className = 'session-meta';
          wdLine.textContent = 'Working dates: ' + session.workDates.map(fmtDate).join(', ');
          block.appendChild(wdLine);
        }

        var tableWrap = document.createElement('div');
        tableWrap.className = 'data-table-wrap';

        var rooms = session.rooms || [];
        var table = document.createElement('table');
        table.setAttribute('aria-label', 'Session ' + sNum + ' results for The Grocery Store');

        table.innerHTML = '<thead><tr>' +
          '<th scope="col">Room</th>' +
          '<th scope="col">Skill</th>' +
          '<th scope="col">Date Completed</th>' +
          '<th scope="col">Attempts</th>' +
          '<th scope="col">Time Used</th>' +
          '<th scope="col">Time Allowed</th>' +
          '<th scope="col">Used</th>' +
          '</tr></thead>';

        var tbody = document.createElement('tbody');

        GROCERY_ROOM_META.forEach(function(rm) {
          var roomData = rooms.find(function(r){ return r.roomKey===rm.key; });
          var tr = document.createElement('tr');
          tr.innerHTML =
            '<td>' + rm.name + '</td>' +
            '<td class="td-skill">' + rm.skill + '</td>' +
            '<td>' + (roomData ? fmtDate(roomData.dateCompleted) : 'Not yet') + '</td>' +
            '<td class="td-attempts">' + (roomData ? roomData.attempts : 'Not yet') + '</td>' +
            '<td class="td-time">' + (roomData ? fmtTime(roomData.timeUsed) : 'Not yet') + '</td>' +
            '<td class="td-time">' + fmtTime(rm.timeAllowed) + '</td>' +
            '<td class="td-pct">' + (roomData ? roomData.pct + '%' : 'Not yet') + '</td>';
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        tableWrap.appendChild(table);
        block.appendChild(tableWrap);

        if (rooms.length > 0) {
          var totalTime = rooms.reduce(function(sum, r){ return sum + (r.timeUsed||0); }, 0);
          var totalAttempts = rooms.reduce(function(sum, r){ return sum + (r.attempts||0); }, 0);
          var totalLine = document.createElement('p');
          totalLine.className = 'session-total';
          totalLine.innerHTML = '<strong>Session total:</strong> ' + fmtTime(totalTime) + ' across ' + totalAttempts + ' attempts';
          block.appendChild(totalLine);
        }

        var btns = document.createElement('div');
        btns.className = 'session-btns';

        var shareBtn = document.createElement('button');
        shareBtn.type = 'button';
        shareBtn.className = 'btn-share btn-share-email';
        shareBtn.setAttribute('aria-label', 'Share Session ' + sNum + ' via email');
        shareBtn.textContent = 'Share Session ' + sNum;
        shareBtn.addEventListener('click', function(){ shareGrocerySession(session, sNum); });

        var copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'btn-share btn-share-copy';
        copyBtn.setAttribute('aria-label', 'Copy Session ' + sNum + ' to clipboard');
        copyBtn.textContent = 'Copy Session ' + sNum;
        copyBtn.addEventListener('click', function(){ copyGrocerySession(session, sNum, copyBtn); });

        btns.appendChild(shareBtn);
        btns.appendChild(copyBtn);
        block.appendChild(btns);

        container.appendChild(heading);
        container.appendChild(block);
      });

      if (sessions.length > 0) {
        globalBtns.style.display = 'flex';
        document.getElementById('grocery-share-all').onclick = function(){ shareAllGrocerySessions(); };
        document.getElementById('grocery-copy-all').onclick  = function(){ copyAllGrocerySessions(); };
        document.getElementById('grocery-reset').onclick     = function(){ resetGrocery(); };
      }
    }

    function grocerySessionText(session, sNum) {
      var lines = [];
      var startFmt = fmtDate(session.startDate);
      var endFmt   = session.endDate ? fmtDate(session.endDate) : 'In Progress';
      lines.push('Escape Rooms: The Grocery Store, Dinner at Seven');
      lines.push('Session ' + sNum + ': ' + startFmt + ' to ' + endFmt);
      if (session.screenReader) lines.push('Screen reader: ' + session.screenReader);
      lines.push('');

      var rooms = session.rooms || [];
      GROCERY_ROOM_META.forEach(function(rm) {
        var r = rooms.find(function(x){ return x.roomKey===rm.key; });
        if (r) {
          lines.push('Room ' + rm.key + ', ' + rm.name + ', ' + rm.skill);
          lines.push('Completed: ' + fmtDate(r.dateCompleted) + ', Attempts: ' + r.attempts + ', Time: ' + fmtTime(r.timeUsed) + ' of ' + fmtTime(rm.timeAllowed) + ', ' + r.pct + '%');
          lines.push('');
        }
      });

      if (rooms.length > 0) {
        var totalTime = rooms.reduce(function(s,r){ return s+(r.timeUsed||0); },0);
        var totalAttempts = rooms.reduce(function(s,r){ return s+(r.attempts||0); },0);
        lines.push('Total: ' + fmtTime(totalTime) + ' across ' + totalAttempts + ' attempts');
      }

      return lines.join('\n');
    }

    function shareGrocerySession(session, sNum) {
      var text = grocerySessionText(session, sNum);
      var subj = 'ScreenPath Activity Results';
      window.location.href = 'mailto:?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(text);
    }

    function copyGrocerySession(session, sNum, btn) {
      var text = grocerySessionText(session, sNum);
      copyText(text, btn, 'Copy Session ' + sNum);
    }

    function shareAllGrocerySessions() {
      var sessions = loadGrocerySessions();
      var all = sessions.map(function(s,i){ return grocerySessionText(s, i+1); }).join('\n\n---\n\n');
      var subj = 'ScreenPath Activity Results';
      window.location.href = 'mailto:?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(all);
    }

    function copyAllGrocerySessions() {
      var sessions = loadGrocerySessions();
      var all = sessions.map(function(s,i){ return grocerySessionText(s, i+1); }).join('\n\n---\n\n');
      var btn = document.getElementById('grocery-copy-all');
      copyText(all, btn, 'Copy All Sessions');
    }

    function resetGrocery() {
      if (!confirm('This will delete all progress and session history for The Grocery Store. This cannot be undone. Are you sure?')) return;
      ['sp_grocery_room1_complete','sp_grocery_room2_complete','sp_grocery_room3_complete','sp_grocery_room4_complete',
       'sp_grocery_sessions','sp_grocery_current_session','sp_grocery_mode','sp_grocery_screenreader'].forEach(function(k){
        try { localStorage.removeItem(k); } catch(e){}
      });
      renderGroceryHistory();
      announce('Progress for The Grocery Store has been reset.');
    }

    // ── ARCADE: ARE YOU SMARTER THAN A 5TH GRADER? ─────────────────
    // sp_arcade_5th_grader_sessions = [ { date, result, highestGrade, highestGradeLabel,
    //   questionsCorrect, lifelinesUsed, subjectsPlayed[], durationSeconds } ]

    function loadArcade5thGraderSessions() {
      return recall('sp_arcade_5th_grader_sessions', []);
    }

    function renderArcade5thGraderHistory() {
      var sessions  = loadArcade5thGraderSessions();
      var container = document.getElementById('arcade-5th-grader-history');
      var badge     = document.getElementById('arcade-5th-grader-status-badge');
      var globalBtns= document.getElementById('arcade-5th-grader-global-btns');

      if (sessions.length === 0) {
        badge.textContent = 'Not Started';
        badge.className = 'series-status status-notstarted';
        container.innerHTML = '<div class="no-data"><p>You have not played Are You Smarter Than a 5th Grader yet. <a href="are-you-smarter-than-a-5th-grader.html">Play it now</a></p></div>';
        globalBtns.style.display = 'none';
        return;
      }

      var hasVictory = sessions.some(function(s){ return s.result === 'victory'; });
      if (hasVictory) {
        badge.textContent = 'Grand Champion';
        badge.className = 'series-status status-complete';
      } else {
        badge.textContent = 'In Progress';
        badge.className = 'series-status status-progress';
      }

      container.innerHTML = '';

      // Most recent attempt first
      var ordered = sessions.slice().reverse();

      ordered.forEach(function(session, idx) {
        var sNum = sessions.length - idx;
        var resultLabel = session.result === 'victory' ? 'Grand Champion' : 'Game Over';

        var heading = document.createElement('h4');
        heading.id  = 'session-arcade-5th-grader-' + sNum;
        heading.textContent = 'Attempt ' + sNum + ': ' + fmtDate(session.date) + ', ' + resultLabel;

        var block = document.createElement('div');
        block.className = 'session-block';

        var tableWrap = document.createElement('div');
        tableWrap.className = 'data-table-wrap';

        var table = document.createElement('table');
        table.setAttribute('aria-label', 'Attempt ' + sNum + ' results for Are You Smarter Than a 5th Grader');

        table.innerHTML = '<thead><tr>' +
          '<th scope="col">Result</th>' +
          '<th scope="col">Highest Grade Reached</th>' +
          '<th scope="col">Questions Correct</th>' +
          '<th scope="col">Lifelines Used</th>' +
          '<th scope="col">Subjects Played</th>' +
          '<th scope="col">Time Spent</th>' +
          '</tr></thead>';

        var tbody = document.createElement('tbody');
        var tr = document.createElement('tr');
        var subjectsPlayed = (session.subjectsPlayed && session.subjectsPlayed.length) ? session.subjectsPlayed.join(', ') : 'None';
        tr.innerHTML =
          '<td>' + resultLabel + '</td>' +
          '<td>' + (session.highestGradeLabel || 'None') + '</td>' +
          '<td class="td-attempts">' + (session.questionsCorrect != null ? session.questionsCorrect : 'None') + '</td>' +
          '<td class="td-attempts">' + (session.lifelinesUsed != null ? session.lifelinesUsed : 'None') + '</td>' +
          '<td class="td-skill">' + subjectsPlayed + '</td>' +
          '<td class="td-time">' + fmtTime(session.durationSeconds) + '</td>';
        tbody.appendChild(tr);
        table.appendChild(tbody);
        tableWrap.appendChild(table);
        block.appendChild(tableWrap);

        // Buttons
        var btns = document.createElement('div');
        btns.className = 'session-btns';

        var shareBtn = document.createElement('button');
        shareBtn.type = 'button';
        shareBtn.className = 'btn-share btn-share-email';
        shareBtn.setAttribute('aria-label', 'Share Attempt ' + sNum + ' via email');
        shareBtn.textContent = 'Share Attempt ' + sNum;
        shareBtn.addEventListener('click', function(){ shareArcade5thGraderSession(session, sNum); });

        var copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'btn-share btn-share-copy';
        copyBtn.setAttribute('aria-label', 'Copy Attempt ' + sNum + ' to clipboard');
        copyBtn.textContent = 'Copy Attempt ' + sNum;
        copyBtn.addEventListener('click', function(){ copyArcade5thGraderSession(session, sNum, copyBtn); });

        btns.appendChild(shareBtn);
        btns.appendChild(copyBtn);
        block.appendChild(btns);

        container.appendChild(heading);
        container.appendChild(block);
      });

      globalBtns.style.display = 'flex';
      document.getElementById('arcade-5th-grader-share-all').onclick = function(){ shareAllArcade5thGraderSessions(); };
      document.getElementById('arcade-5th-grader-copy-all').onclick  = function(){ copyAllArcade5thGraderSessions(); };
      document.getElementById('arcade-5th-grader-reset').onclick     = function(){ resetArcade5thGrader(); };
    }

    function arcade5thGraderSessionText(session, sNum) {
      var resultLabel = session.result === 'victory' ? 'Grand Champion' : 'Game Over';
      var subjectsPlayed = (session.subjectsPlayed && session.subjectsPlayed.length) ? session.subjectsPlayed.join(', ') : 'None recorded';
      var lines = [];
      lines.push('Arcade: Are You Smarter Than a 5th Grader?');
      lines.push('Attempt ' + sNum + ': ' + fmtDate(session.date));
      lines.push('Result: ' + resultLabel);
      lines.push('Highest grade reached: ' + (session.highestGradeLabel || 'n/a'));
      lines.push('Questions correct: ' + (session.questionsCorrect != null ? session.questionsCorrect : 'n/a'));
      lines.push('Lifelines used: ' + (session.lifelinesUsed != null ? session.lifelinesUsed : 'n/a'));
      lines.push('Subjects played: ' + subjectsPlayed);
      lines.push('Time spent: ' + fmtTime(session.durationSeconds));
      return lines.join('\n');
    }

    function shareArcade5thGraderSession(session, sNum) {
      var text = arcade5thGraderSessionText(session, sNum);
      var subj = 'ScreenPath Activity Results';
      window.location.href = 'mailto:?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(text);
    }

    function copyArcade5thGraderSession(session, sNum, btn) {
      var text = arcade5thGraderSessionText(session, sNum);
      copyText(text, btn, 'Copy Attempt ' + sNum);
    }

    function shareAllArcade5thGraderSessions() {
      var sessions = loadArcade5thGraderSessions();
      var all = sessions.map(function(s,i){ return arcade5thGraderSessionText(s, i+1); }).join('\n\n---\n\n');
      var subj = 'ScreenPath Activity Results';
      window.location.href = 'mailto:?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(all);
    }

    function copyAllArcade5thGraderSessions() {
      var sessions = loadArcade5thGraderSessions();
      var all = sessions.map(function(s,i){ return arcade5thGraderSessionText(s, i+1); }).join('\n\n---\n\n');
      var btn = document.getElementById('arcade-5th-grader-copy-all');
      copyText(all, btn, 'Copy All Sessions');
    }

    function resetArcade5thGrader() {
      if (!confirm('This will delete all progress and session history for Are You Smarter Than a 5th Grader. This cannot be undone. Are you sure?')) return;
      try { localStorage.removeItem('sp_arcade_5th_grader_sessions'); } catch(e){}
      renderArcade5thGraderHistory();
      announce('Progress for Are You Smarter Than a 5th Grader has been reset.');
    }

    // ── ARCADE: WORD GUESS ──────────────────────────────────────────
    // sp_word_guess_sessions = [ { date, result, grade, gradeLabel, wordLength,
    //   word, category, guessesUsed, maxGuesses, lifelinesUsed, durationSeconds } ]

    function loadWordGuessSessions() {
      return recall('sp_word_guess_sessions', []);
    }

    function renderWordGuessHistory() {
      var sessions  = loadWordGuessSessions();
      var container = document.getElementById('word-guess-history');
      var badge     = document.getElementById('word-guess-status-badge');
      var globalBtns= document.getElementById('word-guess-global-btns');

      if (sessions.length === 0) {
        badge.textContent = 'Not Started';
        badge.className = 'series-status status-notstarted';
        container.innerHTML = '<div class="no-data"><p>You have not played Word Guess yet. <a href="word-guess.html">Play Word Guess</a></p></div>';
        globalBtns.style.display = 'none';
        return;
      }

      var hasWin = sessions.some(function(s){ return s.result === 'win'; });
      if (hasWin) {
        badge.textContent = 'Solved';
        badge.className = 'series-status status-complete';
      } else {
        badge.textContent = 'In Progress';
        badge.className = 'series-status status-progress';
      }

      container.innerHTML = '';

      // Most recent attempt first
      var ordered = sessions.slice().reverse();

      ordered.forEach(function(session, idx) {
        var sNum = sessions.length - idx;
        var resultLabel = session.result === 'win' ? 'Solved' : 'Out of Guesses';

        var heading = document.createElement('h4');
        heading.id  = 'session-word-guess-' + sNum;
        heading.textContent = 'Attempt ' + sNum + ': ' + fmtDate(session.date) + ', ' + resultLabel;

        var block = document.createElement('div');
        block.className = 'session-block';

        var tableWrap = document.createElement('div');
        tableWrap.className = 'data-table-wrap';

        var table = document.createElement('table');
        table.setAttribute('aria-label', 'Attempt ' + sNum + ' results for Word Guess');

        table.innerHTML = '<thead><tr>' +
          '<th scope="col">Result</th>' +
          '<th scope="col">Grade</th>' +
          '<th scope="col">Word</th>' +
          '<th scope="col">Category</th>' +
          '<th scope="col">Guesses Used</th>' +
          '<th scope="col">Lifelines Used</th>' +
          '<th scope="col">Time Spent</th>' +
          '</tr></thead>';

        var tbody = document.createElement('tbody');
        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td>' + resultLabel + '</td>' +
          '<td>' + (session.gradeLabel || 'None') + '</td>' +
          '<td>' + (session.word || 'None') + '</td>' +
          '<td class="td-skill">' + (session.category || 'None') + '</td>' +
          '<td class="td-attempts">' + (session.guessesUsed != null ? (session.guessesUsed + ' / ' + session.maxGuesses) : 'None') + '</td>' +
          '<td class="td-attempts">' + (session.lifelinesUsed != null ? session.lifelinesUsed : 'None') + '</td>' +
          '<td class="td-time">' + fmtTime(session.durationSeconds) + '</td>';
        tbody.appendChild(tr);
        table.appendChild(tbody);
        tableWrap.appendChild(table);
        block.appendChild(tableWrap);

        // Buttons
        var btns = document.createElement('div');
        btns.className = 'session-btns';

        var shareBtn = document.createElement('button');
        shareBtn.type = 'button';
        shareBtn.className = 'btn-share btn-share-email';
        shareBtn.setAttribute('aria-label', 'Share Attempt ' + sNum + ' via email');
        shareBtn.textContent = 'Share Attempt ' + sNum;
        shareBtn.addEventListener('click', function(){ shareWordGuessSession(session, sNum); });

        var copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'btn-share btn-share-copy';
        copyBtn.setAttribute('aria-label', 'Copy Attempt ' + sNum + ' to clipboard');
        copyBtn.textContent = 'Copy Attempt ' + sNum;
        copyBtn.addEventListener('click', function(){ copyWordGuessSession(session, sNum, copyBtn); });

        btns.appendChild(shareBtn);
        btns.appendChild(copyBtn);
        block.appendChild(btns);

        container.appendChild(heading);
        container.appendChild(block);
      });

      globalBtns.style.display = 'flex';
      document.getElementById('word-guess-share-all').onclick = function(){ shareAllWordGuessSessions(); };
      document.getElementById('word-guess-copy-all').onclick  = function(){ copyAllWordGuessSessions(); };
      document.getElementById('word-guess-reset').onclick     = function(){ resetWordGuess(); };
    }

    function wordGuessSessionText(session, sNum) {
      var resultLabel = session.result === 'win' ? 'Solved' : 'Out of Guesses';
      var lines = [];
      lines.push('Arcade: Word Guess');
      lines.push('Attempt ' + sNum + ': ' + fmtDate(session.date));
      lines.push('Result: ' + resultLabel);
      lines.push('Grade: ' + (session.gradeLabel || 'n/a'));
      lines.push('Word: ' + (session.word || 'n/a'));
      lines.push('Category: ' + (session.category || 'n/a'));
      lines.push('Guesses used: ' + (session.guessesUsed != null ? (session.guessesUsed + ' of ' + session.maxGuesses) : 'n/a'));
      lines.push('Lifelines used: ' + (session.lifelinesUsed != null ? session.lifelinesUsed : 'n/a'));
      lines.push('Time spent: ' + fmtTime(session.durationSeconds));
      return lines.join('\n');
    }

    function shareWordGuessSession(session, sNum) {
      var text = wordGuessSessionText(session, sNum);
      var subj = 'ScreenPath Activity Results';
      window.location.href = 'mailto:?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(text);
    }

    function copyWordGuessSession(session, sNum, btn) {
      var text = wordGuessSessionText(session, sNum);
      copyText(text, btn, 'Copy Attempt ' + sNum);
    }

    function shareAllWordGuessSessions() {
      var sessions = loadWordGuessSessions();
      var all = sessions.map(function(s,i){ return wordGuessSessionText(s, i+1); }).join('\n\n---\n\n');
      var subj = 'ScreenPath Activity Results';
      window.location.href = 'mailto:?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(all);
    }

    function copyAllWordGuessSessions() {
      var sessions = loadWordGuessSessions();
      var all = sessions.map(function(s,i){ return wordGuessSessionText(s, i+1); }).join('\n\n---\n\n');
      var btn = document.getElementById('word-guess-copy-all');
      copyText(all, btn, 'Copy All Sessions');
    }

    function resetWordGuess() {
      if (!confirm('This will delete all progress and session history for Word Guess. This cannot be undone. Are you sure?')) return;
      try { localStorage.removeItem('sp_word_guess_sessions'); } catch(e){}
      renderWordGuessHistory();
      announce('Progress for Word Guess has been reset.');
    }

    // ── SKILL DRILLS: WRITING LAB (FREE WRITE) ───────────────────────
    // sp_writing_lab_sessions = [ { date, grade, gradeLabel, topic, wordCount,
    //   wpm, punctuationTracked, punctuationCount, spellingChecked,
    //   spellingAccuracy, misspelledWords[], durationSeconds } ]

    function loadWritingLabSessions() {
      return recall('sp_writing_lab_sessions', []);
    }

    function renderWritingLabHistory() {
      var sessions  = loadWritingLabSessions();
      var container = document.getElementById('writing-lab-history');
      var badge     = document.getElementById('writing-lab-status-badge');
      var globalBtns= document.getElementById('writing-lab-global-btns');

      if (sessions.length === 0) {
        badge.textContent = 'Not Started';
        badge.className = 'series-status status-notstarted';
        container.innerHTML = '<div class="no-data"><p>You have not tried Free Write in Writing Lab yet. <a href="writing-lab.html">Go to Writing Lab</a></p></div>';
        globalBtns.style.display = 'none';
        return;
      }

      badge.textContent = 'Practicing';
      badge.className = 'series-status status-progress';

      container.innerHTML = '';
      var ordered = sessions.slice().reverse();

      ordered.forEach(function(session, idx) {
        var sNum = sessions.length - idx;

        var heading = document.createElement('h4');
        heading.id  = 'session-writing-lab-' + sNum;
        heading.textContent = 'Attempt ' + sNum + ': ' + fmtDate(session.date) + ', ' + (session.levelLabel || 'Level');

        var block = document.createElement('div');
        block.className = 'session-block';

        var tableWrap = document.createElement('div');
        tableWrap.className = 'data-table-wrap';

        var table = document.createElement('table');
        table.setAttribute('aria-label', 'Attempt ' + sNum + ' results for Writing Lab');

        table.innerHTML = '<thead><tr>' +
          '<th scope="col">Level</th>' +
          '<th scope="col">Topic</th>' +
          '<th scope="col">Words</th>' +
          '<th scope="col">Words / Min</th>' +
          '<th scope="col">Punctuation Marks</th>' +
          '<th scope="col">Spelling Accuracy</th>' +
          '<th scope="col">Misspelled Words</th>' +
          '<th scope="col">Time Spent</th>' +
          '</tr></thead>';

        var tbody = document.createElement('tbody');
        var tr = document.createElement('tr');
        var punctText = session.punctuationTracked ? (session.punctuationCount != null ? session.punctuationCount : 'None') : 'Not tracked';
        var spellText = session.spellingChecked ? (session.spellingAccuracy != null ? session.spellingAccuracy + '%' : 'None') : 'Not checked';
        var misspelledWords = (session.misspelledWords && session.misspelledWords.length) ? session.misspelledWords.join(', ') : (session.spellingChecked ? 'None' : 'None');
        tr.innerHTML =
          '<td>' + (session.levelLabel || 'None') + '</td>' +
          '<td class="td-skill">' + (session.topic || 'None') + '</td>' +
          '<td class="td-attempts">' + (session.wordCount != null ? session.wordCount : 'None') + '</td>' +
          '<td class="td-attempts">' + (session.wpm != null ? session.wpm : 'None') + '</td>' +
          '<td class="td-attempts">' + punctText + '</td>' +
          '<td class="td-attempts">' + spellText + '</td>' +
          '<td class="td-skill">' + misspelledWords + '</td>' +
          '<td class="td-time">' + fmtTime(session.durationSeconds) + '</td>';
        tbody.appendChild(tr);
        table.appendChild(tbody);
        tableWrap.appendChild(table);
        block.appendChild(tableWrap);

        var btns = document.createElement('div');
        btns.className = 'session-btns';

        var shareBtn = document.createElement('button');
        shareBtn.type = 'button';
        shareBtn.className = 'btn-share btn-share-email';
        shareBtn.setAttribute('aria-label', 'Share Attempt ' + sNum + ' via email');
        shareBtn.textContent = 'Share Attempt ' + sNum;
        shareBtn.addEventListener('click', function(){ shareWritingLabSession(session, sNum); });

        var copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'btn-share btn-share-copy';
        copyBtn.setAttribute('aria-label', 'Copy Attempt ' + sNum + ' to clipboard');
        copyBtn.textContent = 'Copy Attempt ' + sNum;
        copyBtn.addEventListener('click', function(){ copyWritingLabSession(session, sNum, copyBtn); });

        btns.appendChild(shareBtn);
        btns.appendChild(copyBtn);
        block.appendChild(btns);

        container.appendChild(heading);
        container.appendChild(block);
      });

      globalBtns.style.display = 'flex';
      document.getElementById('writing-lab-share-all').onclick = function(){ shareAllWritingLabSessions(); };
      document.getElementById('writing-lab-copy-all').onclick  = function(){ copyAllWritingLabSessions(); };
      document.getElementById('writing-lab-reset').onclick     = function(){ resetWritingLab(); };
    }

    function writingLabSessionText(session, sNum) {
      var punctText = session.punctuationTracked ? (session.punctuationCount != null ? session.punctuationCount : 'n/a') : 'Not tracked';
      var spellText = session.spellingChecked ? (session.spellingAccuracy != null ? session.spellingAccuracy + '%' : 'n/a') : 'Not checked';
      var misspelledWords = (session.misspelledWords && session.misspelledWords.length) ? session.misspelledWords.join(', ') : (session.spellingChecked ? 'None' : 'n/a');
      var lines = [];
      lines.push('Skill Drills: Writing Lab');
      lines.push('Attempt ' + sNum + ': ' + fmtDate(session.date));
      lines.push('Level: ' + (session.levelLabel || 'n/a'));
      lines.push('Topic: ' + (session.topic || 'n/a'));
      lines.push('Words written: ' + (session.wordCount != null ? session.wordCount : 'n/a'));
      lines.push('Words per minute: ' + (session.wpm != null ? session.wpm : 'n/a'));
      lines.push('Punctuation marks: ' + punctText);
      lines.push('Spelling accuracy: ' + spellText);
      lines.push('Misspelled words: ' + misspelledWords);
      lines.push('Time spent: ' + fmtTime(session.durationSeconds));
      return lines.join('\n');
    }

    function shareWritingLabSession(session, sNum) {
      var text = writingLabSessionText(session, sNum);
      var subj = 'ScreenPath Activity Results';
      window.location.href = 'mailto:?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(text);
    }

    function copyWritingLabSession(session, sNum, btn) {
      var text = writingLabSessionText(session, sNum);
      copyText(text, btn, 'Copy Attempt ' + sNum);
    }

    function shareAllWritingLabSessions() {
      var sessions = loadWritingLabSessions();
      var all = sessions.map(function(s,i){ return writingLabSessionText(s, i+1); }).join('\n\n---\n\n');
      var subj = 'ScreenPath Activity Results';
      window.location.href = 'mailto:?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(all);
    }

    function copyAllWritingLabSessions() {
      var sessions = loadWritingLabSessions();
      var all = sessions.map(function(s,i){ return writingLabSessionText(s, i+1); }).join('\n\n---\n\n');
      var btn = document.getElementById('writing-lab-copy-all');
      copyText(all, btn, 'Copy All Sessions');
    }

    function resetWritingLab() {
      if (!confirm('This will delete all progress and session history for Writing Lab. This cannot be undone. Are you sure?')) return;
      try { localStorage.removeItem('sp_writing_lab_sessions'); } catch(e){}
      renderWritingLabHistory();
      announce('Progress for Writing Lab has been reset.');
    }

    // ── SKILL DRILLS: DICTATION PRACTICE ─────────────────────────────
    // sp_writing_lab_dictation_sessions = [ { date, grade, gradeLabel, topic,
    //   style, correctWords, totalWords, accuracy, mismatches[], durationSeconds } ]

    function loadDictationPracticeSessions() {
      return recall('sp_writing_lab_dictation_sessions', []);
    }

    function dictationStyleLabel(style) {
      if (style === 'phrase') return 'A Few Words at a Time';
      if (style === 'sentence') return 'Sentence by Sentence';
      return 'Whole Passage';
    }

    function renderDictationPracticeHistory() {
      var sessions  = loadDictationPracticeSessions();
      var container = document.getElementById('dictation-practice-history');
      var badge     = document.getElementById('dictation-practice-status-badge');
      var globalBtns= document.getElementById('dictation-practice-global-btns');

      if (sessions.length === 0) {
        badge.textContent = 'Not Started';
        badge.className = 'series-status status-notstarted';
        container.innerHTML = '<div class="no-data"><p>You have not tried Dictation Practice in Writing Lab yet. <a href="writing-lab.html">Go to Writing Lab</a></p></div>';
        globalBtns.style.display = 'none';
        return;
      }

      badge.textContent = 'Practicing';
      badge.className = 'series-status status-progress';

      container.innerHTML = '';
      var ordered = sessions.slice().reverse();

      ordered.forEach(function(session, idx) {
        var sNum = sessions.length - idx;

        var heading = document.createElement('h4');
        heading.id  = 'session-dictation-practice-' + sNum;
        heading.textContent = 'Attempt ' + sNum + ': ' + fmtDate(session.date) + ', ' + (session.levelLabel || 'Level');

        var block = document.createElement('div');
        block.className = 'session-block';

        var tableWrap = document.createElement('div');
        tableWrap.className = 'data-table-wrap';

        var table = document.createElement('table');
        table.setAttribute('aria-label', 'Attempt ' + sNum + ' results for Dictation Practice');

        table.innerHTML = '<thead><tr>' +
          '<th scope="col">Level</th>' +
          '<th scope="col">Topic</th>' +
          '<th scope="col">Style</th>' +
          '<th scope="col">Accuracy</th>' +
          '<th scope="col">Mismatched Words</th>' +
          '<th scope="col">Time Spent</th>' +
          '</tr></thead>';

        var tbody = document.createElement('tbody');
        var tr = document.createElement('tr');
        var mismatchedWords = (session.mismatches && session.mismatches.length) ? session.mismatches.join(', ') : 'None';
        tr.innerHTML =
          '<td>' + (session.levelLabel || 'None') + '</td>' +
          '<td class="td-skill">' + (session.topic || 'None') + '</td>' +
          '<td>' + dictationStyleLabel(session.style) + '</td>' +
          '<td class="td-attempts">' + (session.accuracy != null ? session.accuracy + '%' : 'None') + '</td>' +
          '<td class="td-skill">' + mismatchedWords + '</td>' +
          '<td class="td-time">' + fmtTime(session.durationSeconds) + '</td>';
        tbody.appendChild(tr);
        table.appendChild(tbody);
        tableWrap.appendChild(table);
        block.appendChild(tableWrap);

        var btns = document.createElement('div');
        btns.className = 'session-btns';

        var shareBtn = document.createElement('button');
        shareBtn.type = 'button';
        shareBtn.className = 'btn-share btn-share-email';
        shareBtn.setAttribute('aria-label', 'Share Attempt ' + sNum + ' via email');
        shareBtn.textContent = 'Share Attempt ' + sNum;
        shareBtn.addEventListener('click', function(){ shareDictationPracticeSession(session, sNum); });

        var copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'btn-share btn-share-copy';
        copyBtn.setAttribute('aria-label', 'Copy Attempt ' + sNum + ' to clipboard');
        copyBtn.textContent = 'Copy Attempt ' + sNum;
        copyBtn.addEventListener('click', function(){ copyDictationPracticeSession(session, sNum, copyBtn); });

        btns.appendChild(shareBtn);
        btns.appendChild(copyBtn);
        block.appendChild(btns);

        container.appendChild(heading);
        container.appendChild(block);
      });

      globalBtns.style.display = 'flex';
      document.getElementById('dictation-practice-share-all').onclick = function(){ shareAllDictationPracticeSessions(); };
      document.getElementById('dictation-practice-copy-all').onclick  = function(){ copyAllDictationPracticeSessions(); };
      document.getElementById('dictation-practice-reset').onclick     = function(){ resetDictationPractice(); };
    }

    function dictationPracticeSessionText(session, sNum) {
      var mismatchedWords = (session.mismatches && session.mismatches.length) ? session.mismatches.join(', ') : 'None';
      var lines = [];
      lines.push('Skill Drills: Dictation Practice');
      lines.push('Attempt ' + sNum + ': ' + fmtDate(session.date));
      lines.push('Level: ' + (session.levelLabel || 'n/a'));
      lines.push('Topic: ' + (session.topic || 'n/a'));
      lines.push('Style: ' + dictationStyleLabel(session.style));
      lines.push('Accuracy: ' + (session.accuracy != null ? session.accuracy + '%' : 'n/a'));
      lines.push('Mismatched words: ' + mismatchedWords);
      lines.push('Time spent: ' + fmtTime(session.durationSeconds));
      return lines.join('\n');
    }

    function shareDictationPracticeSession(session, sNum) {
      var text = dictationPracticeSessionText(session, sNum);
      var subj = 'ScreenPath Activity Results';
      window.location.href = 'mailto:?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(text);
    }

    function copyDictationPracticeSession(session, sNum, btn) {
      var text = dictationPracticeSessionText(session, sNum);
      copyText(text, btn, 'Copy Attempt ' + sNum);
    }

    function shareAllDictationPracticeSessions() {
      var sessions = loadDictationPracticeSessions();
      var all = sessions.map(function(s,i){ return dictationPracticeSessionText(s, i+1); }).join('\n\n---\n\n');
      var subj = 'ScreenPath Activity Results';
      window.location.href = 'mailto:?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(all);
    }

    function copyAllDictationPracticeSessions() {
      var sessions = loadDictationPracticeSessions();
      var all = sessions.map(function(s,i){ return dictationPracticeSessionText(s, i+1); }).join('\n\n---\n\n');
      var btn = document.getElementById('dictation-practice-copy-all');
      copyText(all, btn, 'Copy All Sessions');
    }

    function resetDictationPractice() {
      if (!confirm('This will delete all progress and session history for Dictation Practice. This cannot be undone. Are you sure?')) return;
      try { localStorage.removeItem('sp_writing_lab_dictation_sessions'); } catch(e){}
      renderDictationPracticeHistory();
    renderFormLabHistory();
      announce('Progress for Dictation Practice has been reset.');
    }



    // ---------- SKILL DRILLS: FORM LAB ----------
    // sp_formskills_sessions = [ { category, mode, screenReader, attempts, elapsedSeconds, date,
    //   totalFilled, totalFields (rental) | itemCount, orderTotal, fulfillment (MoyCheese) } ]
    function loadFormLabSessions(){ return recall('sp_formskills_sessions', []) || []; }
    function formLabResult(s){
      if (s.orderTotal != null) return s.itemCount + ' item' + (s.itemCount===1?'':'s') + ', total $' + Number(s.orderTotal).toFixed(2);
      if (s.totalFields != null) return s.totalFilled + ' of ' + s.totalFields + ' fields';
      return 'Completed';
    }
    function formLabText(s, n){
      return ['Skill Drills: Form Lab','Attempt ' + n + ': ' + fmtDate(s.date),'Form: ' + (s.category||'Form'),
        'Version: ' + (s.mode||'Accessible'),'Screen reader: ' + (s.screenReader||'Not given'),
        'Submit attempts: ' + (s.attempts!=null?s.attempts:'None'),'Time: ' + fmtTime(s.elapsedSeconds),'Result: ' + formLabResult(s)].join('\n');
    }
    function renderFormLabHistory(){
      var sessions = loadFormLabSessions();
      var container = document.getElementById('form-lab-history');
      var badge = document.getElementById('form-lab-status-badge');
      var globalBtns = document.getElementById('form-lab-global-btns');
      if (!sessions.length){
        badge.textContent = 'Not Started'; badge.className = 'series-status status-notstarted';
        container.innerHTML = '<div class="no-data"><p>You have not filled out a Form Lab form yet. <a href="form-lab.html">Go to Form Lab</a></p></div>';
        globalBtns.style.display = 'none';
        return;
      }
      badge.textContent = sessions.length + ' form' + (sessions.length===1?'':'s') + ' completed';
      badge.className = 'series-status status-complete';
      var wrap = document.createElement('div'); wrap.className = 'data-table-wrap';
      var table = document.createElement('table');
      table.innerHTML = '<caption class="visually-hidden">Form Lab attempts</caption><thead><tr><th scope="col">Attempt</th><th scope="col">Date</th><th scope="col">Form</th><th scope="col">Version</th><th scope="col">Screen reader</th><th scope="col">Time</th><th scope="col">Submit attempts</th><th scope="col">Result</th></tr></thead>';
      var tb = document.createElement('tbody');
      sessions.forEach(function(s, i){
        var tr = document.createElement('tr');
        [String(i+1), fmtDate(s.date), s.category||'Form', s.mode||'Accessible', s.screenReader||'Not given', fmtTime(s.elapsedSeconds), s.attempts!=null?String(s.attempts):'None', formLabResult(s)].forEach(function(v, c){
          var cell = document.createElement(c===0?'th':'td'); if(c===0) cell.setAttribute('scope','row');
          cell.textContent = v; tr.appendChild(cell);
        });
        tb.appendChild(tr);
      });
      table.appendChild(tb); wrap.appendChild(table);
      container.innerHTML = ''; container.appendChild(wrap);
      globalBtns.style.display = 'flex';
      document.getElementById('form-lab-share-all').onclick = function(){
        var all = loadFormLabSessions().map(function(s,i){ return formLabText(s,i+1); }).join('\n\n---\n\n');
        window.location.href = 'mailto:?subject=' + encodeURIComponent('ScreenPath Activity Results') + '&body=' + encodeURIComponent(all);
      };
      document.getElementById('form-lab-copy-all').onclick = function(){
        var all = loadFormLabSessions().map(function(s,i){ return formLabText(s,i+1); }).join('\n\n---\n\n');
        copyText(all, document.getElementById('form-lab-copy-all'), 'Copy All Sessions');
      };
      document.getElementById('form-lab-reset').onclick = function(){
        if (!confirm('This will delete all Form Lab history. This cannot be undone. Are you sure?')) return;
        try { localStorage.removeItem('sp_formskills_sessions'); } catch(e){}
        renderFormLabHistory(); announce('Progress for Form Lab has been reset.');
      };
    }
    // ── INIT ──────────────────────────────────────────────────────
    renderSchoolHistory();
    renderDoctorHistory();
    renderGroceryHistory();
    renderArcade5thGraderHistory();
    renderWordGuessHistory();
    renderWritingLabHistory();
    renderDictationPracticeHistory();
    renderFormLabHistory();
  