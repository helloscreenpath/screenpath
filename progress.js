(function(){
  'use strict';
  const SP=ScreenPath,$=id=>document.getElementById(id);
  const tabs=[...document.querySelectorAll('[role="tab"]')];
  function selectTab(btn,focus){
    tabs.forEach(t=>{const on=t===btn;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;const panel=$(t.getAttribute('aria-controls'));panel.hidden=!on;panel.classList.toggle('active',on);});
    if(focus)btn.focus();
  }
  tabs.forEach((btn,i)=>{
    btn.removeAttribute('onclick');btn.addEventListener('click',()=>selectTab(btn,false));
    btn.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();selectTab(tabs[n],true);}});
  });
  function element(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
  function date(iso){if(!iso)return 'Not recorded';const d=new Date(iso+'T12:00:00');return Number.isNaN(d.getTime())?'Not recorded':d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});}
  function displaySessions(){const sessions=SP.sessions();const current=SP.current();if(current?.rooms.length)sessions.push(current);return sessions;}
  function email(session,num){window.location.href='mailto:?subject='+encodeURIComponent('ScreenPath Activity Results')+'&body='+encodeURIComponent(SP.resultText(session,num));}
  function allText(){return displaySessions().map((s,i)=>SP.resultText(s,i+1)).join('\n\n---\n\n');}
  function render(){
    const state=SP.schoolState(),sessions=displaySessions(),done=state.keys.length;
    const badge=$('school-status-badge');badge.textContent=done===3?'Complete':done?'In Progress':'Not Started';badge.className='series-status '+(done===3?'status-complete':done?'status-progress':'status-notstarted');
    const summary=$('school-summary');summary.replaceChildren();
    summary.append(element('p',(state.current?'Current attempt: ':'Latest attempt: ')+done+' of 3 rooms completed.'));
    const list=element('ul');SP.rooms.forEach(r=>list.append(element('li','Room '+r.key+': '+r.name+' — '+(state.keys.includes(r.key)?'Completed':'Not completed'))));summary.append(list);
    const next=state.next,a=element('a',next?(done?'Continue to Room ':'Start Room ')+next.key+': '+next.name:'Replay The School — Start Room 1','sp-button primary');a.href=(next||SP.rooms[0]).url;summary.append(a);
    const container=$('school-history');container.replaceChildren();
    if(!sessions.length)container.append(element('p',done?'Your completed rooms are saved, but detailed results are not available for this earlier attempt.':'Complete a room to see your time and attempts here.'));
    sessions.forEach((session,index)=>{
      const num=index+1,block=element('section',undefined,'session-block');
      const heading=element('h3','Session '+num+' — '+(session.endDate?'Completed '+date(session.endDate):'In progress, started '+date(session.startDate)));heading.id='session-school-'+num;block.setAttribute('aria-labelledby',heading.id);block.append(heading);
      if(session.screenReader && session.screenReader!=='Prefer not to say')block.append(element('p','Screen reader: '+session.screenReader,'session-meta'));
      const wrap=element('div',undefined,'data-table-wrap');wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label','Session '+num+' results table; scroll horizontally if needed');
      const table=element('table'),caption=element('caption','Room results for Session '+num);caption.className='sr-only';table.append(caption);
      const thead=element('thead'),hr=element('tr');['Room','Skill','Completed','Mode','Answer submissions','Time used','Time allowed'].forEach(t=>{const th=element('th',t);th.scope='col';hr.append(th);});thead.append(hr);table.append(thead);
      const tbody=element('tbody');SP.rooms.forEach(meta=>{
        const result=session.rooms.find(r=>String(r.roomKey)===meta.key),tr=element('tr'),name=element('th',meta.name);name.scope='row';tr.append(name);
        const values=result?[meta.skill,date(result.dateCompleted),result.mode==='practice'?'Practice':result.mode==='legacy'?'Not recorded':'Challenge',result.attempts??'Not recorded',SP.formatTime(result.timeUsed),result.mode==='practice'?'No deadline':SP.formatTime(result.mode==='legacy'?null:result.timeAllowed??meta.seconds)]:[meta.skill,'Not completed','—','—','—','—'];
        values.forEach(v=>tr.append(element('td',v)));tbody.append(tr);
      });table.append(tbody);wrap.append(table);block.append(wrap);
      session.rooms.forEach(result=>{
        const meta=SP.rooms.find(r=>r.key===String(result.roomKey));if(!meta)return;
        if(result.wrongBooks!==undefined)block.append(element('p',meta.name+': '+result.wrongBooks+' other books opened.'));
        if(result.reflection){const f=result.reflection;const details=element('details',undefined,'sp-help');details.append(element('summary',meta.name+' — reflection'));[['Strategy',f.strategy],['Confidence',f.confidence],['Assistance',f.assistance],['Notes',f.notes]].forEach(([k,v])=>{if(v)details.append(element('p',k+': '+v));});block.append(details);}
      });
      const actions=element('div',undefined,'sp-actions'),share=element('button','Email Session '+num,'sp-button'),copy=element('button','Copy Session '+num,'sp-button');share.type=copy.type='button';share.addEventListener('click',()=>email(session,num));copy.addEventListener('click',()=>SP.copy(SP.resultText(session,num),copy));actions.append(share,copy);block.append(actions);container.append(block);
    });
    const global=$('school-global-btns');global.style.display=sessions.length||done?'flex':'none';$('school-share-all').hidden=!sessions.length;$('school-copy-all').hidden=!sessions.length;
  }
  $('school-share-all').addEventListener('click',()=>window.location.href='mailto:?subject='+encodeURIComponent('ScreenPath Activity Results')+'&body='+encodeURIComponent(allText()));
  $('school-copy-all').addEventListener('click',function(){SP.copy(allText(),this);});
  const reset=document.createElement('dialog');reset.id='reset-dialog';reset.className='sp-dialog';reset.setAttribute('aria-labelledby','reset-title');reset.innerHTML='<h2 id="reset-title" tabindex="-1">Reset The School progress?</h2><p>This removes The School results and reflections saved in this browser. It cannot be undone. Copy any results you want to keep first. Your sound and practice preferences will stay.</p><div class="sp-actions"><button type="button" class="sp-button primary" id="cancel-reset">Keep my progress</button><button type="button" class="sp-button" id="confirm-reset">Delete The School progress</button></div>';document.body.append(reset);
  $('school-reset').addEventListener('click',()=>SP.openDialog(reset,'cancel-reset'));
  $('cancel-reset').addEventListener('click',()=>SP.closeDialog(reset));
  $('confirm-reset').addEventListener('click',()=>{
    try{['sp_school_sessions','sp_school_current_session',...SP.rooms.flatMap(r=>['sp_room'+r.key+'_complete','sp_room'+r.key+'_time','sp_room'+r.key+'_attempts'])].forEach(k=>localStorage.removeItem(k));}
    catch(_){SP.announce('Progress could not be reset in this browser.',true);return;}
    SP.closeDialog(reset,'series-school');render();SP.announce('The School progress was reset.');
  });
  render();window.addEventListener('pageshow',render);window.addEventListener('storage',e=>{if(e.key===null||/^sp_(school_|room[123]_)/.test(e.key))render();});
})();
