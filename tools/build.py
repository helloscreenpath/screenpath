import os, sys
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")

CSS = r"""
:root{--bg:#080808;--surface:#111111;--surface-2:#1c1c1c;--border:#2a2a2a;--text:#f0f0f0;--text-muted:#8f8f8f;--green:#39d98a;--green-dim:#0d2e1c;--nav-bg:rgba(8,8,8,0.94);--radius:14px;--font:'SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;--mono:'SF Mono','Fira Code','Consolas',monospace;--ease:0.24s cubic-bezier(.4,0,.2,1);}
html.light{--bg:#f5f5f7;--surface:#ffffff;--surface-2:#ebebed;--border:#d2d2d4;--text:#1d1d1f;--text-muted:#6e6e73;--nav-bg:rgba(245,245,247,0.94);}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{background:var(--bg);color:var(--text);font-family:var(--font);font-size:18px;line-height:1.7;min-height:100vh;overflow-x:hidden;transition:background var(--ease),color var(--ease);}
.skip-link{position:absolute;top:-120px;left:1rem;background:var(--green);color:#000;padding:.75rem 1.5rem;border-radius:100px;font-weight:700;font-size:.95rem;text-decoration:none;z-index:9999;transition:top .2s;}
.skip-link:focus{top:1rem;}
#live{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;}
a{color:var(--green);text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px;}
a:hover{color:var(--text);}
a:focus-visible,button:focus-visible,select:focus-visible{outline:3px solid var(--green);outline-offset:3px;border-radius:3px;}
nav[role="navigation"]{position:fixed;top:0;left:0;right:0;z-index:500;background:var(--nav-bg);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);border-bottom:1px solid var(--border);}
.nav-inner{max-width:1400px;margin:0 auto;padding:0 2rem;height:64px;display:flex;align-items:center;justify-content:space-between;gap:1.5rem;}
.sp-wordmark{display:flex;align-items:center;text-decoration:none;font-size:1.05rem;font-weight:700;color:var(--text);letter-spacing:-.01em;}.sp-wordmark span{color:var(--green);}
.nav-links{display:flex;align-items:center;gap:.15rem;list-style:none;}
.nav-links a{color:var(--text-muted);text-decoration:none;font-size:.86rem;font-weight:500;padding:.45rem .8rem;border-radius:100px;white-space:nowrap;}
.nav-links a:hover{color:var(--text);background:var(--surface-2);}
.nav-links a[aria-current="page"]{color:var(--green);}
.menu-btn{display:none;align-items:center;justify-content:center;background:none;border:1px solid var(--border);border-radius:8px;padding:.42rem .55rem;cursor:pointer;color:var(--text-muted);font-size:1.15rem;line-height:1;}
.nav-drawer{display:flex;flex-direction:column;background:var(--nav-bg);border-top:1px solid var(--border);padding:1rem 1.5rem 1.5rem;}
.nav-drawer[hidden]{display:none;}
.nav-drawer a{color:var(--text-muted);text-decoration:none;font-size:1rem;font-weight:500;padding:.65rem 0;border-bottom:1px solid var(--border);}
.nav-drawer a:last-child{border-bottom:none;}
.nav-drawer a[aria-current="page"]{color:var(--green);}
.page-hero{background:#050505;padding:130px 2rem 50px;text-align:center;}
.page-hero-eyebrow{font-family:var(--mono);font-size:.7rem;letter-spacing:.22em;text-transform:uppercase;color:var(--green);display:block;margin-bottom:1rem;}
.page-hero h1{font-size:clamp(2.2rem,6vw,4.2rem);font-weight:800;letter-spacing:-.04em;line-height:1.05;color:#fff;margin-bottom:1rem;}
.page-hero p{font-size:clamp(.95rem,2vw,1.1rem);color:rgba(255,255,255,.62);max-width:560px;margin:0 auto .5rem;line-height:1.65;}
.main-wrap{max-width:1100px;margin:0 auto;padding:3.5rem 2rem 5rem;}
.narrow{max-width:820px;margin:0 auto;}
.lead{color:var(--text-muted);font-size:1rem;max-width:680px;margin-bottom:1.75rem;line-height:1.7;}
.card-grid{list-style:none;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.25rem;max-width:1100px;margin:0 auto;}
.card{position:relative;display:flex;flex-direction:column;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;transition:border-color var(--ease),transform var(--ease);}
.card:hover{border-color:var(--green);transform:translateY(-3px);}
.card-img{order:-1;display:block;width:100%;height:auto;aspect-ratio:400/220;}
.card-body{padding:1.25rem 1.4rem 1.5rem;display:flex;flex-direction:column;gap:.5rem;}
.card h2{font-size:1.25rem;font-weight:700;letter-spacing:-.01em;line-height:1.3;}
.card-link{color:var(--text);font-size:1.2rem;font-weight:700;line-height:1.3;text-decoration:underline;text-decoration-color:var(--green);text-underline-offset:4px;}
.card-link:hover{color:var(--green);}
.card-link::after{content:"";position:absolute;inset:0;z-index:1;}
.card p{color:var(--text-muted);font-size:.95rem;line-height:1.6;}
@supports selector(:has(a)){.card-link:focus-visible{outline:none;}.card:has(.card-link:focus-visible){outline:3px solid var(--green);outline-offset:3px;}}
.note{background:var(--surface);border:1px solid var(--border);border-left:3px solid var(--green);border-radius:0;padding:1.25rem 1.5rem;margin:0 auto 2rem;max-width:760px;display:flex;flex-direction:column;gap:.6rem;}
.note p{font-size:.95rem;color:var(--text-muted);}
.note strong{color:var(--text);}
.sp-button{display:inline-flex;align-items:center;gap:.5rem;background:var(--surface-2);color:var(--text);font-family:var(--font);font-size:.95rem;font-weight:600;padding:.8rem 1.6rem;border-radius:100px;border:1px solid var(--border);cursor:pointer;text-decoration:none;}
.sp-button:hover{border-color:var(--green);color:var(--text);}
.sp-button.primary{background:var(--green);color:#000;border-color:var(--green);}
.sp-actions{display:flex;gap:.9rem;flex-wrap:wrap;margin:0 0 2rem;}
.back-link{display:inline-block;margin-top:2.5rem;font-size:.95rem;}
footer{background:var(--surface);border-top:1px solid var(--border);padding:3rem 2rem 2rem;}
.sp-footer{max-width:1400px;margin:0 auto;display:flex;flex-direction:column;gap:.75rem;text-align:center;}
.sp-footer p{color:var(--text-muted);font-size:.88rem;}
.sp-footer strong{color:var(--text);}
.sp-footer .sp-actions{justify-content:center;margin:0;}
.sp-footer .sp-actions a{color:var(--text-muted);text-decoration:none;font-size:.85rem;padding:.3rem .5rem;}
.sp-footer .sp-actions a:hover{color:var(--green);}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important;}}
@media (max-width:1024px){.nav-links{display:none;}.menu-btn{display:flex;}}
@media (max-width:768px){.nav-inner{padding:0 1rem;}.page-hero{padding:110px 1rem 50px;}.main-wrap{padding:2.5rem 1rem 4rem;}.card-grid{grid-template-columns:1fr;}}
"""

THEME = "<script>(function(){try{if(localStorage.getItem('sp_theme')==='light')document.documentElement.classList.add('light');}catch(e){}})();</script>"

NAV_ITEMS = [("index.html","Activities"),("progress.html","My Progress"),("teachers.html","For Teachers"),("about.html","About"),("feedback.html","Feedback")]

def nav(current):
    def a(h,t,li):
        cur = ' aria-current="page"' if h==current else ''
        s = f'<a href="{h}"{cur}>{t}</a>'
        return f'<li>{s}</li>' if li else s
    links = ''.join(a(h,t,True) for h,t in NAV_ITEMS)
    drawer = ''.join(a(h,t,False) for h,t in NAV_ITEMS)
    return ('<nav role="navigation" aria-label="Main navigation"><div class="nav-inner">'
            '<a class="sp-wordmark" href="index.html" aria-label="ScreenPath home">Screen<span>Path</span></a>'
            f'<ul class="nav-links">{links}</ul>'
            '<button id="menu-btn" class="menu-btn" type="button" aria-expanded="false" aria-controls="nav-drawer" aria-label="Open navigation menu">&#9776;</button>'
            f'</div><div class="nav-drawer" id="nav-drawer" hidden>{drawer}</div></nav>')

FOOTER = ('<footer><div class="sp-footer"><p><strong>ScreenPath</strong>: free screen reader practice.</p>'
          '<p>Built by Moises Betancourt for screen reader learners everywhere.</p>'
          '<div class="sp-actions"><a href="progress.html#privacy">How your results are saved</a></div></div></footer>')

MENU_JS = """
(function(){var b=document.getElementById('menu-btn'),d=document.getElementById('nav-drawer');if(!b||!d)return;
b.addEventListener('click',function(){var open=d.hasAttribute('hidden');if(open){d.removeAttribute('hidden');}else{d.setAttribute('hidden','');}
b.setAttribute('aria-expanded',open?'true':'false');b.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu');b.innerHTML=open?'&#10005;':'&#9776;';});})();
function announce(msg){var el=document.getElementById('live');if(!el)return;el.textContent='';setTimeout(function(){el.textContent=msg;},100);}
"""

def page(fname, title, current, body, extra_css='', extra_js=''):
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
{THEME}
<style>{CSS}{extra_css}</style>
</head>
<body>
<a class="skip-link" href="#main">Skip to main content</a>
<div id="live" aria-live="assertive" aria-atomic="true"></div>
{nav(current)}
<main id="main" tabindex="-1">
{body}
</main>
{FOOTER}
<script>{MENU_JS}{extra_js}</script>
</body>
</html>
"""
    open(os.path.join(OUT, fname), 'w').write(html)

def hero(eyebrow, h1, paras):
    ps = ''.join(f'<p>{p}</p>' for p in paras)
    return f'<div class="page-hero"><span class="page-hero-eyebrow" aria-hidden="true">{eyebrow}</span><h1>{h1}</h1>{ps}</div>'

def item(href, name, paras, img):
    ps = ''.join(f'<p>{p}</p>' for p in paras)
    return (f'<li class="card"><div class="card-body"><a class="card-link" href="{href}">{name}</a>{ps}</div>'
            f'<img class="card-img" src="images/{img}" alt=""></li>')

# ---------------- HOMEPAGE ----------------
CATS = [
 ("escape-rooms.html","Escape Rooms","Step into a story where your screen reader is the key. Each escape room is set somewhere you know, with clues to find and puzzles to solve before time runs out.","Skills practiced: moving through web pages, reading tables, and completing forms, with each room focused on one skill.","escape-rooms.svg"),
 ("arcade.html","Arcade","Quick games you can replay anytime to stay sharp between lessons.","Skills practiced: listening, recall, and screen reader commands.","arcade.svg"),
 ("skill-drills.html","Skill Drills","Focused practice on one skill at a time, built around tasks you will meet in everyday life.","Skills practiced: typing, listening, and other everyday screen reader tasks.","skill-drills.svg"),
]
cards = ''.join(
  f'<li class="card"><div class="card-body"><h2><a class="card-link" href="{h}">{n}</a></h2><p>{d}</p><p>{s}</p></div><img class="card-img" src="images/{i}" alt=""></li>'
  for h,n,d,s,i in CATS)

home_css = """
.hero{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:128px 2rem 56px;background:#050505;}
.hero-eyebrow{font-family:var(--mono);font-size:.7rem;letter-spacing:.22em;text-transform:uppercase;color:var(--green);margin-bottom:1.5rem;}
.hero-title{font-size:clamp(2.4rem,6.5vw,5.25rem);font-weight:800;letter-spacing:-.04em;line-height:1;color:#fff;margin-bottom:1.5rem;}
.hero-title .accent{color:var(--green);}
.hero-subtitle{font-size:clamp(.95rem,2.2vw,1.25rem);color:rgba(255,255,255,.62);max-width:540px;margin:0 auto 1rem;line-height:1.65;}
.hero-note{font-size:.95rem;color:rgba(255,255,255,.55);margin:0 0 1.5rem;}
.hero .sp-actions{justify-content:center;}
"""
home_body = f"""<noscript><p class="note">JavaScript is needed for the activities and saved progress. Please enable it, or contact helloscreenpath@gmail.com for help.</p></noscript>
<div class="hero">
<h1 class="hero-title">Build confidence.<br><span class="accent">Find your own way.</span></h1>
<p class="hero-subtitle">Screen reader practice through escape rooms, games, and everyday skills.</p>
<div class="sp-actions"><a href="mission-1a.html" class="sp-button primary" id="home-continue">Start The School: Room 1</a></div>
</div>
<div class="main-wrap">
<ul class="card-grid">{cards}</ul>
</div>"""

home_js = r"""
function formatRelativeDate(iso){try{var then=new Date(iso);var days=Math.floor((Date.now()-then.getTime())/86400000);if(days<=0)return 'today';if(days===1)return 'yesterday';if(days<7)return days+' days ago';return then.toLocaleDateString('en-US',{month:'short',day:'numeric'});}catch(e){return '';}}
function getMostRecentActivity(){
  var candidates=[];
  var seriesConfigs=[
    {label:'The School',currentKey:'sp_school_current_session',sessionsKey:'sp_school_sessions',totalRooms:3,roomFiles:['mission-1a.html','mission-1b.html','mission-1c.html'],roomNames:['The School Office','The Library','The Computer Lab'],startFile:'mission-1a.html'},
    {label:"The Doctor's Visit",currentKey:'sp_doctor_current_session',sessionsKey:'sp_doctor_sessions',totalRooms:4,roomFiles:['mission-2a.html','mission-2b.html','mission-2c.html','mission-2d.html'],roomNames:['The Check-In Desk','The Exam Room','Growth and Vitals History','The Front Desk'],startFile:'mission-2a.html'},
    {label:'The Grocery Store',currentKey:'sp_grocery_current_session',sessionsKey:'sp_grocery_sessions',totalRooms:4,roomFiles:['mission-3a.html','mission-3b.html','mission-3c.html','mission-3d.html'],roomNames:['The Entrance','The Aisles','The Express Checkout','Out the Door'],startFile:'mission-3a.html'}
  ];
  seriesConfigs.forEach(function(cfg){try{
    var cur=JSON.parse(localStorage.getItem(cfg.currentKey)||'null');
    if(cur&&cur.rooms&&cur.rooms.length>0&&cur.rooms.length<cfg.totalRooms){
      var lastDate=(cur.workDates&&cur.workDates.length)?cur.workDates[cur.workDates.length-1]:cur.startDate;var n=cur.rooms.length;
      candidates.push({date:lastDate,label:'Continue Room '+(n+1)+': '+cfg.roomNames[n],sub:cfg.label+': '+n+' of '+cfg.totalRooms+' rooms complete.',href:cfg.roomFiles[n]});return;}
    var sessions=JSON.parse(localStorage.getItem(cfg.sessionsKey)||'[]');
    if(sessions.length>0){var last=sessions[sessions.length-1];candidates.push({date:last.endDate||last.seriesCompleteDate||last.startDate,label:'Continue Practicing: '+cfg.label,sub:cfg.label+': completed. Play again anytime.',href:cfg.startFile});}
  }catch(e){}});
  var gameConfigs=[
    {label:'Word Guess',sessionsKeys:['sp_word_guess_sessions'],href:'word-guess.html'},
    {label:'Are You Smarter Than a 5th Grader?',sessionsKeys:['sp_arcade_5th_grader_sessions'],href:'are-you-smarter-than-a-5th-grader.html'},
    {label:'Writing Lab',sessionsKeys:['sp_writing_lab_sessions','sp_writing_lab_dictation_sessions'],href:'writing-lab.html'},
    {label:'Form Lab',sessionsKeys:['sp_formskills_sessions'],href:'form-lab.html'}
  ];
  gameConfigs.forEach(function(cfg){try{var mostRecent=null;
    cfg.sessionsKeys.forEach(function(k){var arr=JSON.parse(localStorage.getItem(k)||'[]');if(arr.length>0){var last=arr[arr.length-1];if(!mostRecent||new Date(last.date)>new Date(mostRecent))mostRecent=last.date;}});
    if(mostRecent){candidates.push({date:mostRecent,label:'Continue Practicing: '+cfg.label,sub:cfg.label+': last played '+formatRelativeDate(mostRecent)+'.',href:cfg.href});}
  }catch(e){}});
  if(candidates.length===0)return null;
  candidates.sort(function(a,b){return new Date(b.date)-new Date(a.date);});return candidates[0];
}
(function(){var w=getMostRecentActivity();if(!w)return;var b=document.getElementById('home-continue');if(b){b.textContent=w.label;b.href=w.href;}})();
"""
page('index.html','ScreenPath: Accessible Digital Learning for Screen Reader Users','index.html',home_body,home_css,home_js)

# ---------------- ESCAPE ROOMS ----------------
esc_body = hero('Activities','Escape Rooms',[]) + f"""<div class="main-wrap">
<div class="note"><p><strong>Your pace, your choice.</strong> Practice has no deadline and lets you choose your own time limit. Challenge mode adds a timer to each room.</p>
<p><strong>Before you start:</strong> each escape room lists the skills it uses, so check them before you open it.</p></div>
<ul class="card-grid">
{item('the-school.html','The School',['The doors have locked after school. Find the codes, follow the clues, and use the computer lab to unlock the exit.','Skills practiced: headings, links, tables, and forms.'],'the-school.svg')}
{item('doctors-visit.html',"The Doctor's Visit",['Check in, get seen, and check out during a visit to the school health office.','Skills practiced: forms, listening, and tables.'],'doctors-visit.svg')}
{item('grocery-store.html','The Grocery Store',['Dinner at Seven. Your grandparents arrive at 7:00 and your ride leaves at 6:15. Sort the list, shop the aisles, beat the scanner, and get out the door.','Skills practiced: dropdowns, tables, checkboxes, links, and radio buttons.'],'grocery-store.svg')}
</ul>
<a class="back-link" href="index.html">Back to all activities</a>
</div>"""
page('escape-rooms.html','Escape Rooms on ScreenPath','',esc_body)

# ---------------- STORY PAGES ----------------
STORIES = {
 'the-school.html': dict(label='The School', img='the-school.svg', desc='The doors have locked after school. Find the codes, follow the clues, and use the computer lab to unlock the exit.', time='Challenge mode starts with 4, 5, and 4 minutes, and you can choose 1 to 60 minutes per room.', currentKey='sp_school_current_session', sessionsKey='sp_school_sessions',
   rooms=[('The School Office','headings','mission-1a.html'),('The Library','links and tables','mission-1b.html'),('The Computer Lab','form navigation and text entry','mission-1c.html')]),
 'grocery-store.html': dict(label='The Grocery Store', img='grocery-store.svg', desc='', time='Challenge mode gives you 6, 5, 4, and 3 minutes for the four rooms.', currentKey='sp_grocery_current_session', sessionsKey='sp_grocery_sessions',
   rooms=[('The Entrance','matching questions and dropdowns','mission-3a.html'),('The Aisles','tables and checkboxes','mission-3b.html'),('The Express Checkout','links and verification','mission-3c.html'),('Out the Door','radio buttons','mission-3d.html')]),
 'doctors-visit.html': dict(label="The Doctor's Visit", img='doctors-visit.svg', desc='Check in, get seen, and check out during a visit to the school health office.', time='Challenge mode gives you 5, 3, 5, and 5 minutes for the four rooms.', currentKey='sp_doctor_current_session', sessionsKey='sp_doctor_sessions',
   rooms=[('The Check-In Desk','edit fields and combo boxes','mission-2a.html'),('The Exam Room','listening and auditory attention','mission-2b.html'),('Growth and Vitals History','table navigation','mission-2c.html'),('The Front Desk','interactive tables and booking','mission-2d.html')]),
}
story_css = """
.story-img{display:block;width:100%;max-width:520px;height:auto;border-radius:var(--radius);border:1px solid var(--border);margin:0 0 2rem;}
.room-list{list-style:none;display:flex;flex-direction:column;gap:.9rem;max-width:760px;counter-reset:room;}
.room{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:1.1rem 1.4rem;position:relative;}
.room:hover{border-color:var(--green);}
.room p{color:var(--text-muted);font-size:.95rem;margin-top:.25rem;}
"""
import json
for fname, s in STORIES.items():
    rooms = ''.join(f'<li class="room"><a class="card-link" href="{h}">Room {i+1}: {n}</a><p>Skills: {sk}.</p></li>' for i,(n,sk,h) in enumerate(s['rooms']))
    body = hero('Escape Rooms', s['label'], [s['time']]) + f"""<div class="main-wrap">
<img class="story-img" src="images/{s['img']}" alt="">
<div class="sp-actions"><a class="sp-button primary" id="story-continue" href="{s['rooms'][0][2]}">Start {s['label']}</a></div>
<ol class="room-list">{rooms}</ol>
<a class="back-link" href="escape-rooms.html">Back to Escape Rooms</a>
</div>"""
    meta = json.dumps({'label':s['label'],'currentKey':s['currentKey'],'sessionsKey':s['sessionsKey'],'rooms':[[n,h] for n,_,h in s['rooms']]})
    js = "var S="+meta+r""";
(function(){try{var a=document.getElementById('story-continue');
var cur=JSON.parse(localStorage.getItem(S.currentKey)||'null');
if(cur&&cur.rooms&&cur.rooms.length>0&&cur.rooms.length<S.rooms.length){var n=cur.rooms.length;a.textContent='Continue Room '+(n+1)+': '+S.rooms[n][0];a.href=S.rooms[n][1];return;}
var sessions=JSON.parse(localStorage.getItem(S.sessionsKey)||'[]');if(sessions.length>0){a.textContent='Play '+S.label+' Again';}
}catch(e){}})();
"""
    page(fname, f"{s['label']} on ScreenPath", '', body, story_css, js)

# ---------------- ARCADE ----------------
arc_body = hero('Activities','Arcade',[]) + f"""<div class="main-wrap">
<ul class="card-grid">
{item('word-guess.html','Word Guess',['Guess a secret word letter by letter. Choose a grade level, then listen for spoken feedback after every guess.','Skills practiced: spelling and listening.'],'word-guess.svg')}
{item('are-you-smarter-than-a-5th-grader.html','Are You Smarter Than a 5th Grader?',['Climb from 1st grade to 6th, answering questions on math, reading, science, and screen reader commands.','Skills practiced: recall and assistive technology commands.'],'quiz.svg')}
</ul>
<a class="back-link" href="index.html">Back to all activities</a>
</div>"""
page('arcade.html','Arcade on ScreenPath','',arc_body)

# ---------------- SKILL DRILLS ----------------
sd_body = hero('Activities','Skill Drills',[]) + f"""<div class="main-wrap">
<ul class="card-grid">
{item('writing-lab.html','Writing Lab',['Free Write for open ended typing practice, or Dictation Practice to type back exactly what you hear.','Skills practiced: typing accuracy and listening.'],'writing-lab.svg')}
{item('form-lab.html','Form Lab',['Practice the forms you will meet in real life, from ordering at a restaurant to applying for college and scholarships.','Skills practiced: edit fields, combo boxes, checkboxes, radio buttons, and submitting forms.'],'form-lab.svg')}
</ul>
<a class="back-link" href="index.html">Back to all activities</a>
</div>"""
page('skill-drills.html','Skill Drills on ScreenPath','',sd_body)

# ---------------- FORM LAB ----------------
fl_css = """
.form-group{margin-bottom:2.5rem;}
.form-group h2{font-size:1.4rem;font-weight:700;margin-bottom:.4rem;}
.group-head{display:flex;flex-direction:column;gap:1rem;margin-bottom:1.25rem;max-width:760px;}
.group-text p,.form-group > p{color:var(--text-muted);max-width:760px;}
.group-img{order:-1;display:block;width:100%;max-width:320px;height:auto;aspect-ratio:400/220;border-radius:var(--radius);}
@media (min-width:640px){.group-head{flex-direction:row;align-items:center;gap:1.5rem;}.group-img{width:200px;flex-shrink:0;}}
.form-list{list-style:none;display:flex;flex-direction:column;gap:.9rem;max-width:760px;}
.form-item{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:1.1rem 1.4rem;position:relative;}
.form-item:hover{border-color:var(--green);}
.form-item p{color:var(--text-muted);font-size:.95rem;margin-top:.25rem;}
"""
def fl_group(title, intro, items, img):
    lis=''.join(f'<li class="form-item"><a class="card-link" href="{h}">{n}</a><p>{d}</p></li>' for h,n,d in items)
    lst=f'<ul class="form-list">{lis}</ul>' if items else '<p>Forms for this section are on the way.</p>'
    return f'<div class="form-group">\n<div class="group-head"><div class="group-text"><h2>{title}</h2>\n<p>{intro}</p></div><img class="group-img" src="images/{img}" alt=""></div>\n{lst}\n</div>\n'
# To add a form: add (file, name, description) to the right list below and rebuild.
# Only the rental and MoyCheese forms have a Not Accessible version. Every new form is accessible only (decided October 2026).
FL_YOUNGER = [('form-moycheese.html','MoyCheese Online Order','Order burgers, sides, and drinks from a menu that tells you what you added and keeps a running total with tax, with a clean version and a version with real accessibility problems on purpose.')]
FL_HIGH = [('form-skills-rental.html','Rental Property Application','Apply to rent a home, with a clean version and a version with real accessibility problems on purpose.')]
fl_body = hero('Skill Drills','Form Lab',[]) + '<div class="main-wrap narrow">\n' + \
  fl_group('Middle School and Junior High','Everyday forms like ordering food, joining a club, or signing up for a team.',FL_YOUNGER,'form-lab-younger.svg') + \
  fl_group('High School','Forms for work and life after school, like jobs, side jobs, scholarships, college, and housing.',FL_HIGH,'form-lab-high.svg') + \
  '<a class="back-link" href="skill-drills.html">Back to Skill Drills</a>\n</div>'
page('form-lab.html','Form Lab on ScreenPath','',fl_body,fl_css,'')

# ---------------- FEEDBACK ----------------
fb_css = """
.feedback-wrap{max-width:640px;margin:0 auto;padding:4rem 2rem 6rem;}
.feedback-p{font-size:1rem;color:var(--text-muted);line-height:1.85;margin-bottom:1.25rem;}
.feedback-p strong{color:var(--text);}
.template-box{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:1.75rem;margin:2rem 0;}
.template-box-label{font-family:var(--mono);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--green);display:block;margin-bottom:1rem;}
.template-text{font-size:.9rem;color:var(--text-muted);line-height:2;white-space:pre-wrap;}
.template-text .ex{color:var(--green);font-style:italic;}
.field{margin:2rem 0 1rem;}
.field label{display:block;font-weight:600;margin-bottom:.5rem;}
.field select{background:var(--surface-2);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:.65rem .85rem;font-family:var(--font);font-size:1rem;min-width:16rem;max-width:100%;}
.field .hint{color:var(--text-muted);font-size:.9rem;margin-top:.4rem;}
.details{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:1.25rem 1.5rem;margin:1.5rem 0 2rem;}
.details p{color:var(--text-muted);font-size:.95rem;margin-bottom:.5rem;}
.details ul{list-style:none;color:var(--text);font-size:.95rem;}
.details li{padding:.2rem 0;}
.send-btn{display:inline-flex;align-items:center;gap:.65rem;background:var(--green);color:#000;font-family:var(--font);font-size:1rem;font-weight:700;padding:1rem 2rem;border-radius:100px;border:none;cursor:pointer;}
.send-btn:focus-visible{outline:3px solid var(--green);outline-offset:4px;border-radius:100px;}
"""
sr_opts = ''.join(f'<option>{o}</option>' for o in ['JAWS','NVDA','VoiceOver on Mac','VoiceOver on iPhone or iPad','TalkBack','Narrator','ChromeVox','I do not use a screen reader','Other'])
fb_body = hero('Feedback','I want to hear from you.',['Every message comes directly to me. I read each one personally and I take every word seriously.']) + f"""<div class="feedback-wrap">
<p class="feedback-p">Whether you found something that was not working, noticed something that felt off, have an idea for a new activity, or just want to say hello, I want to know. Every message helps me make ScreenPath better for everyone who uses it.</p>
<p class="feedback-p">When you press the button below, your email app will open with everything already set up. My email address, the subject line, and a short example message will all be there. The example is just to help you think through what to share. Replace it with your own words, skip the parts that do not apply, or delete the whole thing and write whatever feels right.</p>
<p class="feedback-p"><strong>There are no wrong answers. Just tell me what you noticed.</strong></p>
<div class="template-box">
<span class="template-box-label">Here is what the email will look like</span>
<p class="template-text">Hi Moises,

I am a <span class="ex">student</span> reaching out about ScreenPath.

I was on <span class="ex">Room 2, The Library</span> when <span class="ex">the page stopped responding after I submitted my answer</span>. I expected <span class="ex">the next room to unlock</span> but instead <span class="ex">nothing happened and the page went quiet</span>.

This happened <span class="ex">more than once</span>.

<span class="ex">I also noticed the timer sound kept playing even after I submitted. Not sure if that is related.</span></p>
</div>
<div class="field">
<label for="fb-sr">Which screen reader do you use?</label>
<select id="fb-sr"><option value="">Choose one (optional)</option>{sr_opts}</select>
<p class="hint">This helps me find and fix problems faster, since the same page can behave differently in each screen reader.</p>
</div>
<div class="details">
<p>These details will also be added to the end of your email. You can read or change them before you send it.</p>
<ul id="auto-details"></ul>
</div>
<button type="button" class="send-btn" id="send-btn">Send feedback <span aria-hidden="true">&rarr;</span></button>
<p class="feedback-p" style="margin-top:1rem;">This opens your email app. Nothing is sent until you press send there.</p>
</div>"""
fb_js = r"""
function detectBrowser(ua){if(/Edg\//.test(ua))return 'Microsoft Edge';if(/OPR\//.test(ua))return 'Opera';if(/Firefox\//.test(ua))return 'Firefox';if(/CriOS|Chrome\//.test(ua))return 'Chrome';if(/Safari\//.test(ua))return 'Safari';return 'Not detected';}
function detectDevice(ua){if(/iPad/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1))return 'iPad';if(/iPhone/.test(ua))return 'iPhone';if(/Android/.test(ua))return /Mobile/.test(ua)?'Android phone':'Android tablet';if(/CrOS/.test(ua))return 'Chromebook';if(/Windows/.test(ua))return 'Windows computer';if(/Macintosh/.test(ua))return 'Mac';if(/Linux/.test(ua))return 'Linux computer';return 'Not detected';}
function detectPage(){try{if(document.referrer){var r=new URL(document.referrer);if(r.origin===location.origin){var f=r.pathname.split('/').pop()||'index.html';if(f!=='feedback.html')return f;}}}catch(e){}return 'Not detected';}
var ua=navigator.userAgent;
var D={page:detectPage(),browser:detectBrowser(ua),device:detectDevice(ua),date:new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})};
(function(){var ul=document.getElementById('auto-details');[['Page you came from',D.page],['Browser',D.browser],['Device',D.device],['Date',D.date]].forEach(function(p){var li=document.createElement('li');li.textContent=p[0]+': '+p[1];ul.appendChild(li);});})();
document.getElementById('send-btn').addEventListener('click',function(){
  var sr=document.getElementById('fb-sr').value||'Not given';
  var body=['Hi Moises,','','I am a student reaching out about ScreenPath.','',
    'I was on Room 2, The Library when the page stopped responding after I submitted my answer. I expected the next room to unlock but instead nothing happened and the page went quiet.','',
    'This happened more than once.','',
    'I also noticed the timer sound kept playing even after I submitted. Not sure if that is related.','',
    'Details for Moises:','Screen reader: '+sr,'Page: '+D.page,'Browser: '+D.browser,'Device: '+D.device,'Date: '+D.date].join('\n');
  window.location.href='mailto:helloscreenpath@gmail.com?subject='+encodeURIComponent('ScreenPath Feedback')+'&body='+encodeURIComponent(body);
});
"""
page('feedback.html','Feedback on ScreenPath','feedback.html',fb_body,fb_css,fb_js)
print('built')

# ---------------- FOR TEACHERS ----------------
# Kept general on purpose: describe categories and how things work, never individual activities,
# so this page does not need edits when activities are added. Category pages list the specifics.
tw_css = """
.guide{max-width:820px;margin:0 auto;}
.guide h2{font-size:1.5rem;font-weight:700;margin:3rem 0 .9rem;}
.guide h2:first-child{margin-top:0;}
.guide p{color:var(--text-muted);margin-bottom:1rem;line-height:1.7;}
.guide ol{padding-left:1.4rem;color:var(--text-muted);display:flex;flex-direction:column;gap:.75rem;line-height:1.7;}
.guide ol strong,.guide p strong{color:var(--text);}
.cat-list{list-style:none;padding:0;display:flex;flex-direction:column;gap:.9rem;margin-top:1.25rem;}
.cat-item{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:1.1rem 1.4rem;position:relative;}
.cat-item:hover{border-color:var(--green);}
.cat-item .card-link{font-weight:700;font-size:1.1rem;}
.cat-item p{margin:.35rem 0 0;font-size:.97rem;}
.faq-list{display:flex;flex-direction:column;gap:.6rem;margin-top:1rem;}
.faq{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);}
.faq[open]{border-color:var(--green);}
.faq summary{cursor:pointer;padding:1rem 3rem 1rem 1.25rem;font-weight:700;color:var(--text);font-size:1.05rem;list-style:none;display:block;position:relative;}
.faq summary::-webkit-details-marker{display:none;}
.faq summary::after{content:"+";position:absolute;right:1.25rem;top:50%;transform:translateY(-50%);color:var(--green);font-size:1.4rem;font-weight:400;line-height:1;}
.faq[open] summary::after{content:"\\2212";}
.faq summary:focus-visible{outline:3px solid var(--green);outline-offset:2px;border-radius:var(--radius);}
.faq-answer{padding:0 1.25rem 1.1rem;}
.faq-answer p:last-child{margin-bottom:0;}
.after-faq{margin-top:1.5rem;}
"""
FAQ = [
 ("Which screen readers and devices work with it?",
  ["ScreenPath runs in any current web browser, so it works with screen readers on computers, tablets, and phones, and nothing needs to be installed. It has been tested with JAWS and NVDA on Windows and VoiceOver on Mac and iPhone.",
   "Some activities can also read text aloud with the browser's built in voice. That works best in Chrome and Edge, is always optional, and every activity works fully without it."]),
 ("How is student progress saved, and why might it disappear?",
  ["Each finished room, game, or practice session saves a record in the student's own browser, and students can see it anytime on the <a href=\"progress.html\">My Progress page</a>. The bottom of that page explains in student friendly words what is saved and what is not.",
   "Because progress lives only in that browser, it does not follow the student to another computer or browser, and clearing browsing data or using a private window erases it. Review it with the student on their own device."]),
 ("How do students send me their results?",
  ["Most activities end with a summary the student can email to you, copy and paste somewhere else, or close. When an activity asks for a teacher's email at the start, have the student enter yours so the email is ready when they finish. Nothing is sent until the student presses send in their own email app."]),
 ("How does ScreenPath connect to the expanded core curriculum?",
  ["Many activities practice real life tasks, such as ordering food, applying for housing, checking prices, and deciding what personal information is safe to share. These connect to independent living, career education, self determination, and compensatory skills.",
   "Two features make good lesson starters. <strong>Why they ask</strong> notes explain why a form asks for something, like income before taxes or a phone number. <strong>Talk it over</strong> questions at the end of an activity give you ready made discussion topics about money, budgeting, and privacy."]),
 ("What are the Not Accessible versions in Form Lab?",
  ["A few forms in Form Lab come in two versions. The Accessible version is built correctly. The Not Accessible version has real problems built in on purpose, like missing labels and fake headings, so students learn to work around the forms they will run into on real websites. Students can switch to a correctly built reference copy at any time to compare, and the Form Lab page notes which forms include this version."]),
 ("What if a student is still learning the basics?",
  ["ScreenPath builds speed, confidence, and independence on top of skills a student already has, so it works best once the foundation is in place.",
   "A structured teaching packet is in development, with lessons, practice exercises, and instructional videos that take a student from no screen reader experience to ready for ScreenPath. To hear when it is available, email <a href=\"mailto:helloscreenpath@gmail.com\">helloscreenpath@gmail.com</a>."]),
]
faq_html=''.join(f'<details class="faq"><summary>{q}</summary><div class="faq-answer">'+''.join(f'<p>{p}</p>' for p in ans)+'</div></details>\n' for q,ans in FAQ)
tw_body = hero('For Teachers','Bring ScreenPath into your classroom.',
  ['ScreenPath is free and needs no account. It is made for learners who already know the basics and want to become more independent.']) + f"""<div class="main-wrap"><div class="guide">

<h2>What ScreenPath is</h2>
<p>ScreenPath gives students engaging practice with screen reader skills they already know, set in situations they will meet at school and in everyday life. The same moves carry over to Canvas, Google Classroom, online forms, and the websites they use outside of school.</p>
<p>To read how and why ScreenPath started, visit the <a href="about.html">About page</a>.</p>

<h2>Three kinds of activities</h2>
<p>Each category page lists every activity in it and the skills each one practices.</p>
<ul class="cat-list">
<li class="cat-item"><a class="card-link" href="escape-rooms.html">Escape Rooms</a><p>Story based series where each room focuses on one skill, with an untimed Practice mode and a timed Challenge mode.</p></li>
<li class="cat-item"><a class="card-link" href="arcade.html">Arcade</a><p>Short games students can replay anytime, good for a warm up or a few spare minutes.</p></li>
<li class="cat-item"><a class="card-link" href="skill-drills.html">Skill Drills</a><p>Focused practice on one skill at a time, including Form Lab, where students fill out real life forms.</p></li>
</ul>

<h2>Getting started</h2>
<ol>
<li><strong>Share the link</strong> with students and colleagues. There is nothing to install, no login, and no permission needed.</li>
<li><strong>Start with The School in Practice mode.</strong> Its rooms cover the fundamentals the rest of ScreenPath builds on.</li>
<li><strong>Add Challenge mode when a student is ready</strong> for some time pressure.</li>
<li><strong>Review My Progress together</strong> on the student's own device.</li>
</ol>

<h2>Frequently asked questions</h2>
<p>Select a question to show its answer.</p>
<div class="faq-list">
{faq_html}</div>
<p class="after-faq">Have a question that is not here, or something not working the way you expect? <a href="feedback.html">Send feedback</a> and I will get back to you.</p>

</div></div>"""
page('teachers.html','For Teachers on ScreenPath','teachers.html',tw_body,tw_css)


# ---------------- ABOUT ----------------
ab_css = """
.guide .about-opening{font-size:clamp(1.3rem,2.6vw,1.75rem);font-weight:700;line-height:1.45;color:var(--text);margin-bottom:1.75rem;}
.about-person{display:flex;flex-direction:column;gap:1.25rem;margin-bottom:1rem;}
.about-person img{width:100%;max-width:260px;height:auto;border-radius:var(--radius);border:1px solid var(--border);}
.about-person p{margin:0;}
@media (min-width:640px){.about-person{flex-direction:row;align-items:center;gap:1.75rem;}.about-person img{width:200px;flex-shrink:0;}}
.guide hr{border:none;border-top:1px solid var(--border);margin:3rem 0 0;}
.guide ul.plain{padding-left:1.4rem;color:var(--text-muted);display:flex;flex-direction:column;gap:.6rem;line-height:1.7;margin-bottom:1rem;}
.guide ul.plain strong{color:var(--text);}
"""
ab_body = hero('About ScreenPath','Built for every student<br>who ever felt left out.',
  ['The story behind ScreenPath, and where it is going.']) + """<div class="main-wrap"><div class="guide">

<p class="about-opening">I built this for my students. And for every student who has ever felt like the technology was the obstacle.</p>

<h2>How it started</h2>
<p>There was a moment in my life when I had to learn to navigate the world in a completely different way than I had planned. Gradually. Quietly. And mostly on my own.</p>
<p>Nobody had been through it before me, at least not anyone I knew. There was no roadmap. I found programs that taught me the basics but not enough to get me where I needed to go. Most of what I know today I taught myself. Podcasts at night. YouTube on weekends. User guides until things finally clicked. Hundreds of hours learning by doing until one day navigating the web independently felt not just possible but natural.</p>
<p>That feeling changed everything for me.</p>

<h2>Why I built it</h2>
<p>I did not want my students to have to find their way the same way I did. Alone. By trial and error. Without something designed specifically for them. That is why ScreenPath exists.</p>
<p>ScreenPath is not here to teach screen reader navigation from scratch. Your teacher does that. ScreenPath is here for what comes after. After you have the foundation. After you know the skills but they do not feel like yours yet. After you want to get faster, more confident, more natural.</p>
<p>Every activity is designed so the technology disappears into the experience. You stop thinking about the screen reader and start thinking about what you are actually doing with it.</p>

<h2>About the project</h2>
<div class="about-person"><img src="images/moises.jpg" width="480" height="720" alt="Moises Betancourt smiling, wearing a white knit sweater in front of a mint green wall."><p>ScreenPath is built and maintained by me, Moises Betancourt, a Teacher of the Visually Impaired. Every activity is designed for screen reader users first, then tested with a screen reader before it goes live.</p></div>
<p>I am blind, and I use a screen reader every day, just like you. I know what it feels like when a page will not cooperate, when it feels like you and your screen reader are on two different teams, or when it seems like your homework is going to take forever. That frustration is real, and I have felt it more times than I can count.</p>
<p>Today my screen reader is how I answer email, write lesson plans, plan my week, and work on this site. None of that happened overnight. I learned it one small step at a time, and I still learn something new almost every week. That is why I teach it now, so you do not have to figure it out alone, and so you can reach the goals that matter to you.</p>
<p>The activities are set in places students already know, like a school, a doctor's office, a grocery store, and a restaurant, because the goal is not just to finish a game. It is to walk into the real version of that moment and feel ready.</p>
<p>ScreenPath is free. No cost, no login, and no barriers, for any student or teacher who wants to use it.</p>

<h2>What comes next</h2>
<p>ScreenPath keeps growing, and much of what gets built next comes from the students and teachers who use it. If you have an idea, found something that is not working, or just want to share how it is going, <a href="feedback.html">I would love to hear from you</a>.</p>

</div></div>"""
page('about.html','About ScreenPath','about.html',ab_body,tw_css+ab_css)

# ---------------- MY PROGRESS ----------------
# Script and table styles live in scratchpad/src so this file stays readable.
_SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src')
pg_css = open(os.path.join(_SRC, 'progress-final.css')).read()
pg_js = open(os.path.join(_SRC, 'progress-final.js')).read()
def pg_series(key, title, label):
    return f'''<div class="series-section">
<h3>{title}</h3>
<p class="status-line">Status: <span class="series-status status-notstarted" id="{key}-status-badge">Not Started</span></p>
<div id="{key}-history"></div>
<div class="global-btns" id="{key}-global-btns" style="display:none;">
<button type="button" class="btn-global btn-global-email" id="{key}-share-all" aria-label="Email all sessions for {label}">Share All Sessions</button>
<button type="button" class="btn-global btn-global-copy" id="{key}-copy-all" aria-label="Copy all sessions for {label}">Copy All Sessions</button>
<button type="button" class="btn-global btn-reset" id="{key}-reset" aria-label="Reset all progress for {label}. This cannot be undone.">Reset Progress</button>
</div>
</div>'''
pg_body = hero('My Progress','Your Learning Journey',
  ['Everything you finish on this device is saved here. Use headings to jump to an activity.']) + f"""<div class="main-wrap">
<div class="pg-cat">
<h2>Escape Rooms</h2>
<p>Each session shows the rooms you finished, your attempts, and your time.</p>
{pg_series('school','The School','The School')}
{pg_series('doctor',"The Doctor's Visit","The Doctor's Visit")}
{pg_series('grocery','The Grocery Store','The Grocery Store')}
</div>
<div class="pg-cat">
<h2>Arcade</h2>
<p>Each attempt shows how far you got and what you used.</p>
{pg_series('arcade-5th-grader','Are You Smarter Than a 5th Grader?','Are You Smarter Than a 5th Grader')}
{pg_series('word-guess','Word Guess','Word Guess')}
</div>
<div class="pg-cat">
<h2>Skill Drills</h2>
<p>Each attempt shows your results for that practice.</p>
{pg_series('writing-lab','Writing Lab: Free Write','Writing Lab Free Write')}
{pg_series('dictation-practice','Writing Lab: Dictation Practice','Writing Lab Dictation Practice')}
{pg_series('form-lab','Form Lab','Form Lab')}
</div>
<div class="pg-cat narrow" style="margin-left:0;">
<h2 id="privacy">How your results are saved</h2>
<p>When you finish an activity, ScreenPath saves a few basic things, like how long it took, how many attempts you made, and whether you finished. <strong>No names, no personal information, and nothing is sent anywhere automatically.</strong> Everything stays in this browser on this device.</p>
<p>At the end of most activities you can email your results to your teacher, copy them to paste somewhere else, or close the summary and move on. Your progress is saved here either way.</p>
</div>
</div>"""
page('progress.html','My Progress on ScreenPath','progress.html',pg_body,pg_css,pg_js)
