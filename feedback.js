(function(){
  const text=document.getElementById('feedback-template'),status=document.getElementById('feedback-status');
  document.getElementById('send-btn').addEventListener('click',function(){
    window.location.href='mailto:screenpathedu@gmail.com?subject='+encodeURIComponent('ScreenPath Feedback')+'&body='+encodeURIComponent(text.value);
    status.textContent='An email draft was requested. If your email app did not open, use Copy feedback template and email screenpathedu@gmail.com.';
  });
  document.getElementById('copy-feedback').addEventListener('click',function(){ScreenPath.copy(text.value,this,status);});
})();
