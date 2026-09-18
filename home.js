(function(){
  function update(){
    const state=ScreenPath.schoolState(),next=state.next;
    const label=next?(state.keys.length?'Continue to Room ':'Start Room ')+next.key+': '+next.name:'Replay The School — Start Room 1';
    ['home-continue','catalog-continue'].forEach(id=>{const a=document.getElementById(id);a.textContent=label;a.href=(next||ScreenPath.rooms[0]).url;});
    document.getElementById('home-progress').textContent=state.keys.length?state.keys.length+' of 3 rooms completed in your latest attempt.':'Three rooms. Practice at your own pace.';
  }
  update();window.addEventListener('pageshow',update);window.addEventListener('storage',update);
})();
