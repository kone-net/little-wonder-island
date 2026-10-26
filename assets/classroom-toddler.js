/* Three-year-olds: one concrete instruction, at most two choices, guided actions. */
(()=>{'use strict';const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const data={
1:{kind:'gifts',prompts:['给小兔一份点心。','再给小熊一份。'],icons:['🐰','🐻']},
2:{kind:'story',prompts:['选一个小伙伴。','让它做一件事。'],icons:['🐰','🐻']},
3:{kind:'size',prompts:['点大球。','再找小球。']},
4:{kind:'echo',prompts:['听一听，再敲两下。']},
5:{kind:'colors',prompts:['找红色气球。','再找蓝色气球。']},
6:{kind:'flowers',prompts:['点两下，开两朵花。']},
7:{kind:'shapes',prompts:['找圆圆的。','再找方方的。']},
8:{kind:'hello',prompts:['朋友来了，打个招呼。','朋友要走了，挥挥手。']},
9:{kind:'position',prompts:['把小猫放到桌上。','再让它躲到桌下。']},
10:{kind:'turns',prompts:['轮到小兔点一下。','现在轮到小熊。']},
11:{kind:'animals',prompts:['汪汪，找小狗。','喵喵，再找小猫。']},
12:{kind:'line',prompts:['把三颗小石子排好。']},
13:{kind:'move',prompts:['跟着小伙伴走一走。','现在停一停。']},
14:{kind:'lantern',prompts:['选一个灯笼的身体。','再选一条小尾巴。']},
15:{kind:'weather',prompts:['太阳出来了，选帽子。','下雨了，选雨伞。']},
16:{kind:'socks',prompts:['给红点袜找朋友。','再给蓝条袜找朋友。']},
17:{kind:'feelings',prompts:['找有点难过的小脸。','再找开心的小脸。']},
18:{kind:'path',prompts:['点亮亮的脚印，走到小屋。']},
19:{kind:'count',prompts:['点一下，种一朵花。']},
20:{kind:'show',prompts:['选一张喜欢的小画。','指给身边的人看吧。']}
};
const scenes={1:['🐦','🪺'],2:['🐰','🍎'],3:['🧤','🧤'],4:['🌧','🎵'],5:['⛵','🔴','🔵'],6:['🌸','🌼'],7:['⚪','🟩'],8:['🐰','👋'],9:['🪑','🚗'],10:['🐰','🥁','🐻'],11:['🐕','🐈'],12:['🪴','🪴','🪴'],13:['🚶','✋'],14:['🏮','🟡'],15:['☀','☂'],16:['🧤','🧤'],17:['🐰','🧱','💗'],18:['🛒','🪨','🏡'],19:['🪴','🪴','🪴'],20:['🖼','👋']};
function b(a,v,picture,label='',cls=''){return '<button type="button" class="t-card '+cls+'" data-t="'+a+'" data-v="'+esc(v)+'"><span class="t-picture">'+picture+'</span>'+(label?'<small>'+esc(label)+'</small>':'')+'</button>';}
function prompt(c,s={}){const t=data[c.sequence];if(s.done)return '做过啦！可以指一指，或说一个词。';if(t.kind==='turns')return t.prompts[(s.turn||0)%2];return t.prompts[Math.min(s.step||0,t.prompts.length-1)];}
function render(c,s={}){const t=data[c.sequence],step=s.step||0;let body='';
if(t.kind==='story'){body=step===0?'<div class="t-two">'+t.icons.map((v,i)=>b('pick',i,v,i===0?'小兔':'小熊')).join('')+'</div>':'<div class="t-story-actor">'+(s.actor===1?'🐻':'🐰')+'</div><div class="t-two">'+b('pick',0,'🍎','吃苹果')+b('pick',1,'⚽','拍拍球')+'</div>';if(s.done)body='<div class="t-finished-scene">'+(s.actor===1?'🐻':'🐰')+'　'+(s.action===1?'⚽':'🍎')+'</div><p class="t-short">你可以指一指，或说一个喜欢的词。</p>';}
else if(t.kind==='gifts')body='<div class="t-two">'+t.icons.map((v,i)=>b('pick',i,v+(s.given?.includes(i)?' 🥮':''),s.given?.includes(i)?'拿好啦':'送一份',!s.given?.includes(i)&&i===step?'glow':'')).join('')+'</div>';
else if(t.kind==='size')body='<div class="t-two">'+b('pick',0,'<i class="t-ball big"></i>','',step===0?'':'')+b('pick',1,'<i class="t-ball small"></i>')+'</div>';
else if(t.kind==='colors')body='<div class="t-two">'+b('pick',0,'<i class="t-balloon red"></i>')+b('pick',1,'<i class="t-balloon blue"></i>')+'</div>';
else if(t.kind==='shapes')body='<div class="t-two">'+b('pick',0,'<i class="t-shape round"></i>')+b('pick',1,'<i class="t-shape square"></i>')+'</div>';
else if(t.kind==='animals')body='<div class="t-two">'+b('pick',0,'🐕')+b('pick',1,'🐈')+'</div>';
else if(t.kind==='hello')body='<div class="t-story-actor">'+(step===0?'🐰 👋':'🐰 🚪')+'</div><div class="t-two">'+b('pick',0,'👋','你好')+b('pick',1,'🚪','再见')+'</div>';
else if(t.kind==='position')body='<div class="t-table">'+b('pick',0,s.cat===0?'🐈':'＋','桌上','t-above')+'<div class="t-table-top"></div>'+b('pick',1,s.cat===1?'🐈':'＋','桌下','t-below')+'</div>';
else if(t.kind==='echo')body='<div class="t-echo">'+b('listen',0,'♫','听一次')+b('tap',0,'🥁','我也敲一敲')+'</div><p class="t-short">敲了 '+Math.min(2,s.taps||0)+' / 2 下，不比速度。</p>';
else if(t.kind==='flowers')body='<div class="t-color-row">'+['#d07162','#7aa2bc','#d4b650'].map((v,i)=>'<button data-t="color" data-v="'+i+'" aria-label="'+['红花','蓝花','黄花'][i]+'" style="background:'+v+'" class="'+((s.color||0)===i?'selected':'')+'"></button>').join('')+'</div><svg class="t-garden" viewBox="0 0 640 300" data-t-garden="true" role="img" aria-label="点画两朵小花"><rect width="640" height="300" fill="#fffbed"/><path d="M0 240Q200 190 400 245T640 235V300H0" fill="#d3e2bf"/>'+(s.flowers||[]).map(o=>'<g transform="translate('+o.x+' '+o.y+')"><path d="M0 10v60" stroke="#7a9d6b" stroke-width="6"/>'+[[0,-16],[16,-5],[10,14],[-10,14],[-16,-5]].map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="13" fill="'+['#d07162','#7aa2bc','#d4b650'][o.color]+'"/>').join('')+'<circle r="8" fill="#f2d178"/></g>').join('')+'</svg>';
else if(t.kind==='turns')body='<div class="t-two">'+['🐰','🐻'].map((v,i)=>b('pick',i,v,((s.turn||0)%2)===i?'轮到我':'我等等',((s.turn||0)%2)===i?'glow':'')).join('')+'</div><div class="t-pebbles">'+Array.from({length:4},(_,i)=>'<span class="'+(i<(s.turn||0)?'placed':'')+'">'+(i<(s.turn||0)?(i%2?'⚪':'⚫'):'·')+'</span>').join('')+'</div>';
else if(t.kind==='line')body='<div class="t-pebbles">'+Array.from({length:3},(_,i)=>b('stone',i,s.line?.includes(i)?'●':'○','',!s.line?.includes(i)&&i===(s.line?.length||0)?'glow':'')).join('')+'</div>';
else if(t.kind==='move')body='<div class="t-move-actor '+(step===0?'walking':'')+'">'+(step===0?'🚶':'🧍')+'</div>'+b('pick',step,step===0?'👣':'✋',step===0?'我跟着走过啦':'我停好啦');
else if(t.kind==='lantern')body='<div class="t-lantern-preview"><svg viewBox="0 0 300 220"><path d="M150 15v32" stroke="#9d8656" stroke-width="8"/><ellipse cx="150" cy="100" rx="65" ry="60" fill="'+(s.body===1?'#6e9db8':'#d37361')+'"/>'+(step>0?'<path d="M130 160v40m20-40v48m20-48v40" stroke="'+(s.tassel===1?'#83a16b':'#d5b665')+'" stroke-width="9"/>':'')+'</svg></div><div class="t-two">'+(step===0?b('pick',0,'🔴','红灯笼')+b('pick',1,'🔵','蓝灯笼'):b('pick',0,'🟡','黄条条')+b('pick',1,'🟢','绿条条'))+'</div>';
else if(t.kind==='weather')body='<div class="t-story-actor">'+(step===0?'☀️':'🌧️')+'</div><div class="t-two">'+b('pick',0,'🧢')+b('pick',1,'☂️')+'</div>';
else if(t.kind==='socks')body='<div class="t-sock-anchor">'+(step===0?'<i class="t-sock red"></i>':'<i class="t-sock blue"></i>')+'<span>找朋友</span></div><div class="t-two">'+b('pick',0,'<i class="t-sock red"></i>')+b('pick',1,'<i class="t-sock blue"></i>')+'</div>';
else if(t.kind==='feelings')body='<div class="t-two">'+b('pick',0,'😔')+b('pick',1,'🙂')+'</div>';
else if(t.kind==='path')body='<div class="t-path"><span>🐰</span>'+[1,2].map(i=>b('path',i,s.position>=i?'🐾':'👣','',i===(s.position||0)+1?'glow':'')).join('')+'<span>🏡</span></div>';
else if(t.kind==='count')body='<div class="t-count-garden">'+Array.from({length:s.count||0},()=>'<span>🌷</span>').join('')+'</div>'+b('count',0,'🌱','再种一朵')+'<p class="t-short">'+(s.count||0)+' / 3 朵</p>';
else if(t.kind==='show')body='<div class="t-two">'+['🌷','🐰'].map((v,i)=>b('show',i,v,'',s.show===i?'selected':'')).join('')+'</div>'+(s.show!=null?b('share',0,'👋','给朋友看过啦'):'');
return '<div class="u-task t-task" data-toddler="'+t.kind+'"><h2 class="t-prompt">'+esc(prompt(c,s))+'</h2>'+body+(s.feedback?'<p class="t-feedback" role="status">'+esc(s.feedback)+'</p>':'')+(s.done?'<div class="t-done"><span>🌟</span>'+b('continue',0,'→','继续出发')+'</div>':'')+'<p class="t-short">指一指、说一个词、模仿一下，都可以。</p></div>';}
function act(c,s,a,v){const t=data[c.sequence],step=s.step||0;let sound=null,wrong=false;
if(s.done)return {state:s,sound};
if(a==='listen')sound=[0,1];if(a==='tap'){s.taps=(s.taps||0)+1;s.done=s.taps>=2;sound=[s.taps%2];}
if(a==='color')s.color=Number(v);if(a==='flower'){s.flowers||=[];if(s.flowers.length<2)s.flowers.push({x:v[0],y:v[1],color:s.color||0});s.done=s.flowers.length>=2;}
if(a==='stone'){s.line||=[];if(!s.line.includes(Number(v)))s.line.push(Number(v));s.done=s.line.length>=3;}
if(a==='path'){if(Number(v)===(s.position||0)+1)s.position=Number(v);else wrong=true;s.done=s.position>=2;}
if(a==='count'){s.count=Math.min(3,(s.count||0)+1);s.done=s.count===3;}
if(a==='show'){s.show=Number(v);s.step=1;}if(a==='share'&&s.show!=null)s.done=true;
if(a==='pick'){const i=Number(v);if(t.kind==='story'){if(step===0){s.actor=i;s.step=1;}else{s.action=i;s.done=true;}}
else if(t.kind==='gifts'){s.given||=[];if(i===step&&!s.given.includes(i))s.given.push(i);else wrong=true;s.step=s.given.length;s.done=s.given.length===2;}
else if(t.kind==='lantern'){if(step===0){s.body=i;s.step=1;}else{s.tassel=i;s.done=true;}}
else if(t.kind==='turns'){if(i===(s.turn||0)%2)s.turn=(s.turn||0)+1;else wrong=true;s.done=s.turn>=4;}
else{const expected=t.kind==='move'?step:step;if(i===expected){if(t.kind==='position')s.cat=i;s.step=step+1;s.done=s.step>=2;}else wrong=true;}}
s.feedback=wrong?'再看看，我陪你一起找。':s.done?'试过啦，真有趣！':'找到了，再玩一下。';
return {state:s,sound,wrong};}
function intro(c,text){const icons=scenes[c.sequence];return '<div class="t-intro"><div class="t-intro-pictures">'+icons.map(v=>'<span>'+v+'</span>').join('')+'</div><p>'+esc(text||prompt(c,{}))+'</p></div>';}
for(const c of ACADEMY.courses.filter(c=>c.age===3)){c.task=data[c.sequence].prompts.join(' ');if(CLASSROOM_EXPERIENCES?.courses[c.id])CLASSROOM_EXPERIENCES.courses[c.id].objective=c.task;}
function voice(c,s={}){const i=data[c.sequence].kind==='turns'?(s.turn||0)%2:Math.min(s.step||0,1);return s.done?'TASK3-done':window.CLASSROOM_TODDLER_PROMPTS?.[c.id]?.[i];}window.ClassroomToddler={render,prompt,act,intro,voice};
})();
