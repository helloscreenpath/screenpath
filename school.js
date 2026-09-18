/* The three School rooms share timing, results, settings and keyboard behavior. */
(function () {
  'use strict';
  const SP=window.ScreenPath,D=window.SchoolData,$=id=>document.getElementById(id);
  const room=Number(document.body.dataset.room),meta=SP.rooms[room-1];
  const fields=['firstname','lastname','studentid','grade','teacher'];
  let phase='ready',target,elapsed=0,startTime=0,interval=null,attempts=0,wrongBooks=0;
  let mode='practice',allowance=null,sessionId=null,savedSession=null;
  let speaking=false,utterance=null,audioContext=null;
  const warnings=new Set(),found=new Set();
  let sound=SP.get('sp_sound',false)===true;
  const activityId=room===1?'directory-content':room===2?'library-zone':'computer-terminal';
  const form=room===3?$('help-form'):$('answer-form-1');
  const status=room===3?$('form-status'):$('form-status-1');
  const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toLowerCase();
  const choose=(items,previous)=>{const alternatives=items.filter(x=>x!==previous);return alternatives[Math.floor(Math.random()*alternatives.length)];};
  function focusHeading(container) { SP.focus(container.querySelector('h2,h3') || container); }
  function tone(success) {
    if(!sound)return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();
      oscillator.connect(gain);gain.connect(audioContext.destination);
      oscillator.frequency.value=success?660:220;gain.gain.setValueAtTime(.08,audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.2);
      oscillator.start();oscillator.stop(audioContext.currentTime+.22);
    }catch(_){}
  }
  function stopNarration(){ if(window.speechSynthesis)window.speechSynthesis.cancel();speaking=false;setNarration(); }
  function setNarration(){ $('narrate-label').textContent=speaking?'Stop Scene':'Play Scene';$('narrate-icon').textContent=speaking?'■':'▶';$('narrate-btn').setAttribute('aria-pressed',String(speaking));$('narrate-btn').setAttribute('aria-label',speaking?'Stop scene narration':'Play scene narration'); }
  window.toggleNarration=function(){
    if(speaking){stopNarration();return;}
    if(!window.speechSynthesis){$('narrate-status').textContent='Narration is unavailable. The full scene is written above.';return;}
    stopNarration();
    utterance=new SpeechSynthesisUtterance(['scene-p1','scene-p2','scene-p3'].map(id=>$(id)?.textContent || '').join(' '));
    utterance.rate=.9;utterance.onend=()=>{speaking=false;setNarration();};utterance.onerror=()=>{speaking=false;setNarration();$('narrate-status').textContent='Narration stopped. You can read the scene above.';};
    speaking=true;setNarration();window.speechSynthesis.speak(utterance);
  };
  window.toggleSound=function(){sound=!sound;SP.set('sp_sound',sound);$('sound-toggle').setAttribute('aria-checked',String(sound));$('sound-text').textContent=sound?'On':'Off';if(!sound&&audioContext)audioContext.suspend();if(sound&&audioContext)audioContext.resume();SP.announce('Sound effects '+(sound?'on':'off')+'.');};
  function updateSettings(){
    $('time-setting').hidden=$('practice-mode').value!=='challenge';
    SP.set('sp_mode',$('practice-mode').value);
    if(phase==='ready'){$('timer-display').textContent=$('practice-mode').value==='practice'?'No deadline':$('time-minutes').value+':00';$('timer-display').removeAttribute('aria-label');}
  }
  function updateClock(){
    const seconds=mode==='practice'?elapsed:Math.max(0,allowance-elapsed);
    $('timer-display').textContent=SP.formatTime(seconds)+(mode==='practice'?' elapsed':' remaining');
  }
  function tick(){
    if(phase!=='running')return;
    elapsed=Math.max(0,Math.floor((Date.now()-startTime)/1000));updateClock();
    if(mode==='practice')return;
    const left=allowance-elapsed;
    [60,30,10].forEach(n=>{if(left<=n && left>0 && !warnings.has(n)){warnings.add(n);SP.announce(n+' seconds remaining.');}});
    if(left<=0){
      elapsed=allowance;phase='expired';clearInterval(interval);stopNarration();tone(false);
      SP.openDialog('fail-overlay','fail-heading');
    }
  }
  function showActivity(show){const el=$(activityId);el.hidden=!show;el.inert=!show;el.removeAttribute('aria-hidden');el.classList.remove('directory-locked','library-locked','terminal-locked');}
  function prepareTarget(newTarget){
    if(room===1){
      if(newTarget||!target)target=choose(D.targets,target);
      $('target-dept').textContent=target.dept;$('target-title').textContent=target.title;
    }else if(room===2){
      if(newTarget||!target)target=choose(D.series.series,target);
      $('lib-note-text').textContent=target.libNote;
      [1,2,3].forEach(n=>{$('reminder-'+n).textContent=target.reminder;buildTable(n);});
    }else{
      if(newTarget||!target)target=choose(D.profiles,target);
      fields.forEach(k=>$('p-'+k).textContent=target[k]);
    }
  }
  function begin(){
    if(phase!=='ready')return;
    if($('practice-mode').value==='challenge' && !$('time-minutes').reportValidity())return;
    mode=$('practice-mode').value;allowance=mode==='practice'?null:Number($('time-minutes').value)*60;
    SP.set('sp_mode',mode);SP.set('sp_time_'+room,Number($('time-minutes').value));
    $('retry-inline').hidden=true;
    $('practice-mode').disabled=true;$('time-minutes').disabled=true;
    phase='running';startTime=Date.now();elapsed=0;warnings.clear();stopNarration();
    showActivity(true);$('start-btn').hidden=true;
    if(room===1)$('answer-section-1').classList.add('visible');
    $('timer-instructions').textContent=mode==='practice'?'Practice is active. Take the time you need.':'Challenge is active. You can switch to practice at any time.';
    $('switch-practice').hidden=mode==='practice';
    if(room===2)showPage(1);else focusHeading($(activityId));
    updateClock();interval=setInterval(tick,250);tone(true);
    SP.announce((mode==='practice'?'Practice started with no deadline.':'Challenge started. '+allowance/60+' minutes allowed.')+' Your task is now available.');
  }
  window.startTimer=begin;
  function switchPractice(){
    if(phase!=='running'&&phase!=='expired')return;
    mode='practice';allowance=null;phase='running';SP.set('sp_mode','practice');$('practice-mode').value='practice';$('time-setting').hidden=true;$('switch-practice').hidden=true;
    $('timer-instructions').textContent='Practice is active. Take the time you need.';
    clearInterval(interval);startTime=Date.now()-elapsed*1000;interval=setInterval(tick,250);updateClock();
    if($('fail-overlay').open)SP.closeDialog('fail-overlay',$(activityId));else SP.focus($(activityId));
    SP.announce('Practice mode. Your work is preserved and there is no deadline.');
  }
  function reset(newTarget){
    clearInterval(interval);stopNarration();phase='ready';elapsed=0;attempts=0;wrongBooks=0;found.clear();warnings.clear();
    if($('fail-overlay').open)SP.closeDialog('fail-overlay','start-btn');
    form.reset();form.querySelectorAll('input,button').forEach(el=>{el.disabled=false;el.removeAttribute('aria-invalid');});
    document.querySelectorAll('.field-error').forEach(el=>el.textContent='');status.textContent='';status.className='form-status';
    ['answer-section-1','answer-section-2','bridge-msg','next-room-box','debrief-report'].forEach(id=>$(id)?.classList.remove('visible'));
    if(room===3)updateProgress();
    $('practice-mode').disabled=false;$('time-minutes').disabled=false;$('start-btn').hidden=false;$('switch-practice').hidden=true;
    $('retry-inline').hidden=true;showActivity(false);prepareTarget(newTarget);updateSettings();
    $('timer-instructions').textContent='Review your task above, choose your mode, then start when you are ready.';
    SP.focus('start-btn');SP.announce('Room reset. Review your task, then start when ready.');
  }
  window.retryRoom=newTarget=>reset(Boolean(newTarget));
  function makeSession(){
    let session=SP.current();
    if(!session){
      // Carry forward older completion flags without inventing times or attempts.
      const state=SP.schoolState();
      const legacy=!state.history.length?state.keys.map(key=>({roomKey:key,mode:'legacy',timeUsed:null,timeAllowed:null,attempts:null})):[];
      session={startDate:SP.today(),workDates:[SP.today()],screenReader:SP.get('sp_sr_choice',''),rooms:legacy};
    }
    if(!session.id)session.id=window.crypto?.randomUUID?.() || 'session-'+Date.now()+'-'+Math.random().toString(36).slice(2);
    if(!session.workDates)session.workDates=[];
    if(!session.workDates.includes(SP.today()))session.workDates.push(SP.today());
    session.screenReader=SP.get('sp_sr_choice',session.screenReader||'');return session;
  }
  function saveResult(){
    const session=makeSession();sessionId=session.id;
    const result={roomKey:String(room),dateCompleted:SP.today(),attempts,timeUsed:elapsed,timeAllowed:allowance,mode,pct:allowance?Math.min(100,Math.round(elapsed/allowance*100)):null};
    if(room===2)result.wrongBooks=wrongBooks;
    session.rooms=session.rooms.filter(r=>String(r.roomKey)!==String(room));session.rooms.push(result);
    let ok;
    if(SP.roomKeys(session).length===3){
      session.endDate=SP.today();const history=SP.sessions().filter(s=>s.id!==session.id);history.push(session);
      ok=SP.set('sp_school_sessions',history);
      if(ok){try{localStorage.removeItem('sp_school_current_session');}catch(_){}}
    }else ok=SP.set('sp_school_current_session',session);
    if(ok)SP.set('sp_room'+room+'_complete',1);
    savedSession=session;
    return ok;
  }
  function resultText(){return SP.resultText(savedSession,SP.sessions().findIndex(s=>s.id===sessionId)+1 || SP.sessions().length+1);}
  function completeRoom(){
    if(phase!=='running')return;
    tick();if(phase!=='running')return;
    phase='complete';clearInterval(interval);stopNarration();tone(true);
    const saved=saveResult();
    form.querySelectorAll('input,button').forEach(el=>el.disabled=true);
    $('switch-practice').hidden=true;
    $('bridge-msg').classList.add('visible');$('next-room-box').classList.add('visible');
    $('reflection-section').hidden=false;
    $('timer-instructions').textContent='Room complete. Your results are below.';
    status.className='form-status success';status.textContent='Correct. Room complete. '+(saved?'Results saved on this device.':'Results could not be saved; copy them before leaving.');
    $('res-heading').textContent=meta.name+' complete';$('res-room-sub').textContent='Room '+room+' of 3 — '+(mode==='practice'?'Practice':'Challenge');
    $('res-time-used').textContent=SP.formatTime(elapsed);$('res-time-left').textContent=mode==='practice'?'No deadline':SP.formatTime(Math.max(0,allowance-elapsed));
    $('res-attempts').textContent=attempts;$('res-skill').textContent=meta.skill;$('res-skill-label').textContent=room===2?'Other books opened':'Task completed';$('res-skill-value').textContent=room===2?wrongBooks:'Yes';
    $('res-pct').textContent=saved?'Saved on this device. Nothing has been sent.':'Not saved. Copy your results before leaving.';
    SP.openDialog('results-overlay','res-heading');
  }
  function error(id,message){status.className='form-status error';status.textContent=message;const el=$(id);el.setAttribute('aria-invalid','true');SP.focus(el);tone(false);}
  form.addEventListener('submit',e=>{
    e.preventDefault();if(phase!=='running')return;tick();if(phase!=='running')return;attempts++;
    form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
    if(room===1){
      if(normalize($('staff-name').value)!==normalize(target.name)){error('staff-name','The full name does not match your target. Check the department and title in the directory.');return;}
      if(normalize($('access-code').value).replace(/\s/g,'')!==normalize(target.code)){error('access-code','The access code does not match. Check the code next to the staff member’s name.');return;}
    }else if(room===2){
      if(found.size<3){error('door-code','Open the three display books before submitting the final code.');return;}
      if($('door-code').value.trim()!==target.code){error('door-code','The code does not match. Read the code inside the third book and try again.');return;}
    }else{
      let first=null;
      fields.forEach((key,i)=>{
        const id='f-'+key,err=$('e-'+key);err.textContent='';
        if(normalize($(id).value)!==normalize(target[key])){const message='Check item '+(i+1)+' in your student information.';err.textContent=message;$(id).setAttribute('aria-invalid','true');first ||= id;}
      });
      if(first){error(first,'Some fields do not match your student information. Review the messages beside those fields.');return;}
    }
    completeRoom();
  });
  window.updateProgress=function(){const filled=fields.filter(k=>$('f-'+k).value.trim()).length;$('progress-count').textContent=filled;$('progress-bar').style.width=filled/5*100+'%';};
  // Library pages advance only when the learner chooses to continue.
  function buildTable(page){
    const tbody=$('page'+page+'-tbody');tbody.replaceChildren();
    const others=[...D.series.fillers].sort(()=>Math.random()-.5).slice(0,7);
    const books=[{...target.targets[page-1],correct:true},...others].sort(()=>Math.random()-.5);
    books.forEach(book=>{
      const tr=document.createElement('tr');
      [book.title,book.author,book.genre].forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.appendChild(td);});
      const td=document.createElement('td'),link=document.createElement('a');link.href='#library-note-'+page;link.className='book-link';link.textContent='Open display copy';link.setAttribute('aria-label','Open '+book.title);
      link.addEventListener('click',e=>{
        e.preventDefault();if(phase!=='running')return;tick();if(phase!=='running')return;
        if(!book.correct){wrongBooks++;tone(false);$('library-feedback-'+page).textContent='This is not part of Ms. Rivera’s series. Check the title and author, then choose another book.';return;}
        tone(true);found.add(page);const note=$('library-note-'+page);note.hidden=false;
        note.querySelector('p').textContent=page===3?'Terminal access code: '+target.code+'. Enter it in the answer form below.':target.targets[page-1].note;
        if(page===3){$('answer-section-1').classList.add('visible');$('step-label').textContent='All three books found — enter the code';}
        else $('step-label').textContent='Book '+page+' of 3 found';
        SP.focus(note.querySelector('h3'));
      });
      td.appendChild(link);tr.appendChild(td);tbody.appendChild(tr);
    });
    $('library-note-'+page).hidden=true;$('library-feedback-'+page).textContent='';
  }
  function showPage(page){
    if(phase!=='running')return;
    if(page>1 && !found.has(page-1))return;
    [1,2,3].forEach(n=>{const el=$('library-page-'+n);el.hidden=n!==page;el.classList.toggle('active',n===page);});
    focusHeading($('library-page-'+page));
  }
  window.goBack=showPage;
  [1,2].forEach(n=>$('library-next-'+n)?.addEventListener('click',()=>showPage(n+1)));
  $('reflection-form').addEventListener('submit',e=>{
    e.preventDefault();if(phase!=='complete')return;
    const reflection={strategy:$('reflection-strategy').value,confidence:$('reflection-confidence').value,assistance:$('reflection-assistance').value,notes:$('reflection-notes').value.trim()};
    const r=savedSession.rooms.find(r=>String(r.roomKey)===String(room));r.reflection=reflection;
    let ok;const history=SP.sessions(),idx=history.findIndex(s=>s.id===sessionId),current=SP.current();
    const latest=idx>=0?history[idx]:current?.id===sessionId?current:savedSession;
    const latestRoom=latest.rooms.find(r=>String(r.roomKey)===String(room));
    if(latestRoom)latestRoom.reflection=reflection;
    savedSession=latest;
    if(idx>=0){history[idx]=latest;ok=SP.set('sp_school_sessions',history);}
    else if(current && current.id!==sessionId){$('reflection-status').textContent='A different attempt is now active. Copy these results to keep your reflection.';return;}
    else ok=SP.set('sp_school_current_session',latest);
    $('reflection-status').textContent=ok?'Reflection saved on this device. Use Email or Copy Results to share it. Nothing has been sent.':'Reflection could not be saved. Use Copy Results before leaving.';
  });
  document.querySelectorAll('[data-copy-results]').forEach(btn=>btn.addEventListener('click',()=>SP.copy(resultText(),btn)));
  document.querySelectorAll('[data-email-results]').forEach(btn=>btn.addEventListener('click',()=>{window.location.href='mailto:?subject='+encodeURIComponent('ScreenPath Activity Results')+'&body='+encodeURIComponent(resultText());}));
  $('res-skip-btn').addEventListener('click',()=>SP.closeDialog('results-overlay','next-room-heading'));
  $('results-overlay').addEventListener('close',()=>SP.focus('next-room-heading'));
  $('fail-overlay').addEventListener('cancel',e=>{e.preventDefault();});
  $('fail-overlay').addEventListener('close',()=>{if(phase==='expired'){$('retry-inline').hidden=false;SP.focus('retry-inline');}});
  $('switch-practice').addEventListener('click',switchPractice);$('continue-practice').addEventListener('click',switchPractice);
  $('retry-inline').addEventListener('click',()=>SP.openDialog('fail-overlay','fail-heading'));
  $('practice-mode').value=SP.get('sp_mode','practice')==='challenge'?'challenge':'practice';
  const savedMinutes=SP.get('sp_time_'+room,meta.seconds/60);$('time-minutes').value=Number.isInteger(savedMinutes)&&savedMinutes>=1&&savedMinutes<=60?savedMinutes:meta.seconds/60;
  $('practice-mode').addEventListener('change',updateSettings);$('time-minutes').addEventListener('input',updateSettings);
  $('screen-reader').value=SP.get('sp_sr_choice','Prefer not to say');
  $('screen-reader').addEventListener('change',()=>SP.set('sp_sr_choice',$('screen-reader').value));
  $('sound-toggle').setAttribute('aria-checked',String(sound));$('sound-text').textContent=sound?'On':'Off';
  $('timer-display').setAttribute('aria-live','off');
  prepareTarget(true);showActivity(false);updateSettings();
  window.addEventListener('pagehide',()=>{clearInterval(interval);stopNarration();});
  window.addEventListener('pageshow',e=>{if(e.persisted&&phase==='running'){tick();if(phase==='running')interval=setInterval(tick,250);}});
})();
