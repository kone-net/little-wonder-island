(()=>{
'use strict';
const data=window.COURSES,E=window.GameEngine,root=document.getElementById('app'),voice=document.getElementById('narrator');
const KEY='little-story-island-v2-20261024';
const stageNames=['故事出发','看看方法','我来试试','故事影院','英语小岛','动一动','生活里试试','故事结局'];
const labels=['开场','教学','游戏','短片','英语','运动','实物','结局'];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let store={version:2,courses:{},muted:false},storageOK=true;
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved?.version===2&&saved.courses&&typeof saved.courses==='object')store={...store,...saved};}catch(_){storageOK=false;}
if(![3,4,5,6].includes(store.selectedAge))store.selectedAge=Object.keys(store.courses).some(id=>/^\d{2}$/.test(id))?4:null;
store.journeyByAge||={};
let page='home',course=null,state=null,paused=false,modal=null,slow=false,lastClip=null,autoRemaining=null,autoTotal=0,spoken=false,feedback='',feedbackKind='',showDemo=false,demoStep=0,sessionSeconds=0,resumeVoice=false,voiceToken=0;
const STORY_GAP_MS=450;
const nextStoryAudio=new Audio();nextStoryAudio.preload='auto';
let englishLoop=null,englishFocusOverride=null,pausedSongSrc=null;
const motion=IslandMotion.create(root,{enabled:()=>page==='class'&&state?.chapter===2&&!state.game.checked&&!modal&&!paused,onDrop:(id,zone,rect)=>moveItem(id,zone,rect)});
function fresh(l){return {contentVersion:l.contentVersion,chapter:0,step:0,elapsed:Array(8).fill(0),stages:{},game:E.create(l.mode,0,l.gameConfig),english:{},filmSeen:[],movementSteps:[],homeSteps:[],observations:{},finished:false,updated:Date.now()};}
function save(){if(state&&course){if(page==='class'){state.started=true;store.journeyCourseId=course.id;store.journeyByAge[course.age]=course.id;}state.updated=Date.now();store.courses[course.id]=state;}try{localStorage.setItem(KEY,JSON.stringify(store));storageOK=true;}catch(_){storageOK=false;}}
function getCourse(id){return data.lessons.find(l=>l.id===id);}
function upgradeLearning(previous){if(!previous||state.contentVersion===course.contentVersion)return;if(state.chapter===1)state.step=Math.min(state.step+1,course.teaching.length-1);if(Object.keys(state.english).length)state.englishArchive={version:2,steps:state.english};state.english={};if(state.chapter===4)state.step=0;state.contentVersion=course.contentVersion;}
function ageLessons(age=store.selectedAge||4){return data.lessons.filter(l=>l.age===age);}
function chapterPlan(){return data.ageProfiles?.find(p=>p.age===(course?.age||store.selectedAge))?.seconds.map((seconds,i)=>({...data.chapters[i],seconds}))||data.chapters;}
function journeyTarget(){const lessons=ageLessons(),age=store.selectedAge||4,cursor=store.journeyByAge[age]||(lessons.some(l=>l.id===store.journeyCourseId)?store.journeyCourseId:undefined);return Journey.target(lessons,{courses:store.courses,journeyCourseId:cursor});}
function englishSteps(){return course.englishPlan||englishTasks[course.mode];}
function beginCourse(id){stopVoice();save();if(!activate(id))return;state.started=true;store.journeyCourseId=id;page=state.finished?'summary':'class';url((state.finished?'done-':'lesson-')+id);save();render();window.scrollTo(0,0);}
function activate(id){course=getCourse(id);if(!course)return false;store.selectedAge=course.age;const previous=store.courses[id];state=previous&&Array.isArray(previous.elapsed)&&previous.elapsed.length===8?previous:fresh(course);state.chapter=Math.min(7,Math.max(0,Number(state.chapter)||0));state.step=Math.max(0,Number(state.step)||0);if(course.gameConfig&&state.game?.mode===course.mode)state.game.config=course.gameConfig;if(!state.game||state.game.mode!==course.mode||state.game.round>=E.roundCount(state.game))state.game=E.create(course.mode,0,course.gameConfig);state.english||={};state.stages||={};state.observations||={};state.filmSeen||=[];state.movementSteps||=[];state.homeSteps||=[];state.songEmbed=false;state.cinemaMode??="songs";upgradeLearning(previous);return true;}
function url(hash){history.replaceState(null,'',hash?`#${hash}`:location.pathname+location.search);}
function btn(act,text,kind='',attrs=''){return `<button type="button" class="btn ${kind}" data-act="${act}" ${attrs}>${text}</button>`;}
function header(){return `<header class="site-head"><a href="#" class="brand" data-act="home"><img src="assets/island.svg" alt=""><span class="brand-name">小小奇遇岛<small lang="en">Little Wonder Island</small></span></a><div class="head-actions">${btn('mute',store.muted?'打开声音':'♫ 声音开','small',`aria-pressed="${store.muted}"`)}${store.selectedAge?btn('ages',store.selectedAge+'岁 ⌄','small',`aria-label="更换年龄，当前 ${store.selectedAge} 岁"`):''}${btn('records','家长记录','small')}</div></header>`;}
function footer(){return '<footer class="footer">每天一个小冒险，玩出一个新发现。3–6 岁 · 家人陪伴 · 无需登录</footer>';}
function scene(phase,step=0,options={}){return `<div class="scene" id="scene">${Scenes.render(course,phase,phase==='teach'?(course.teaching[step]?.visualStep??step):step,options)}<span class="scene-label">${esc(course.title)} · ${phase==='film'?'完整故事小剧场':'米米和点点'}</span></div>`;}
function tools(){return `<div class="audio-tools">${btn('replay','↻ 再听一遍','small')}${state?.chapter===4?btn('slow',slow?'慢一点 · 已开':'慢一点','small',`aria-pressed="${slow}"`):''}${state?.chapter!==4?btn('captions',state?.hideCaptions?'显示字幕':'隐藏字幕','small'):''}</div><div class="audio-status" id="audioStatus" role="status"></div>`;}
function parentNote(text){return `<details class="parent-details"><summary>家长提示</summary><p>${esc(text)}</p><p>不用认字，也不用录音。可以陪着指、摆或做动作；今天只观看也能继续。</p></details>`;}
function shell(body){root.innerHTML=header()+(!storageOK?'<div class="storage-warning" role="status">浏览器暂时不能保存进度。当前仍可上课，请保持本页打开。</div>':'')+`<main class="wrap" id="mainContent">${body}</main>`+footer();document.body.classList.toggle('is-paused',paused);if(modal)renderModal();}
function home(){
 if(!store.selectedAge)return agePicker();
 const target=journeyTarget(),next=getCourse(target.id),progress=store.courses[target.id],finished=ageLessons().filter(l=>store.courses[l.id]?.finished).length;
 const subtitle=target.completed?'十个故事都走到结局啦。可以回顾喜欢的一关，或和家人再玩一次。':target.resume?`上次来到第 ${next.sequence} 关的「${stageNames[progress.chapter]||stageNames[0]}」。点一下，就从这里继续。`:`按顺序走，一次一小关。今天是第 ${next.sequence} 关，准备好就一起出发。`;
 const entry=`<section class="journey-entry" aria-label="继续顺序冒险"><span class="pill">${store.selectedAge} 岁 · ${finished} / 10 关已走到结局</span><h2>${next.emoji} ${esc(next.title)}</h2><p>${esc(subtitle)}</p>${btn('continueJourney',target.completed?'回顾第一关 ↗':target.resume?'接着上次，继续冒险 ▶':'开始今天的冒险 ▶','primary journey-button')}<div class="journey-materials">这关准备：${esc(next.materials.join('、'))}</div></section>`;
 const cards=ageLessons().map((l,i)=>{const p=store.courses[l.id],count=p?Object.keys(p.stages||{}).length:0;return `<button class="course-card" data-act="course" data-id="${l.id}" style="--card-color:${['#e8edd7','#f2e3cc','#dfe9e0','#e1e9ed'][i%4]}"><span class="num">${String(l.sequence).padStart(2,'0')} / 10</span><span class="card-icon" aria-hidden="true">${l.emoji}</span><h3>${esc(l.title)}</h3><p>${esc(l.primaryObjective)}</p><div class="tiny-progress" aria-hidden="true"><span style="width:${count/8*100}%"></span></div><div class="card-bottom"><span>${p?.finished?'已走完故事 · 可再玩':count?'已浏览 '+count+' / 8 个环节':'约 20 分钟 · '+l.englishCoreWords.join(' / ')}</span><strong>${p?'再去看看':'一起出发'} ↗</strong></div></button>`;}).join('');
 shell(`<section class="hero"><div><div class="eyebrow">故事里认识世界 · 生活里试一试</div><h1>今天，去小岛<br>发现一点新东西。</h1><p>跟米米和点点看故事、玩游戏，听一点英语，再把发现带回生活里。${store.selectedAge} 岁的十次小冒险，每次约二十分钟。</p>${entry}</div><div class="hero-art">${Scenes.render(null)}</div></section><details class="course-picker" id="coursePicker"><summary>看看全部关卡 · 家长选课</summary><div class="section-title"><h2>十次小冒险，按顺序出发</h2><small>也可以自由回看</small></div><section class="course-grid" aria-label="十节课程">${cards}</section></details><aside class="parent-note"><a href="video-library.html">家长视频素材库 ↗</a><br>给陪伴的大人：先备好材料，再一起出发。每节包含八个环节；二十分钟是活动预算，孩子可以提前继续或多试一会儿。没有材料、暂时不想说话，都可以先听故事。</aside>`);
}
function agePicker(){shell(`<section class="age-intro"><div class="eyebrow">3–6 岁 · 每个年龄十次小冒险</div><h1>从孩子的年龄开始。</h1><p>选一个适合今天的起点。以后会记住选择，点击就能接着上次玩；换年龄也保留各自进度。</p><div class="age-grid">${data.ageProfiles.map(p=>`<button class="age-card ${store.selectedAge===p.age?'active':''}" data-act="selectAge" data-age="${p.age}"><span class="age-number">${p.age}<small> 岁</small></span><h2>${esc(p.title)}</h2><p>${esc(p.description)}</p><span class="pill">10 节课程 · 独立续关</span></button>`).join('')}</div><p class="muted">年龄是选择活动难度的起点，可以根据兴趣和陪伴情况随时调整。</p></section>`);}
function intro(){
 shell(`<section class="intro"><div class="intro-top"><div class="intro-copy"><div class="eyebrow">${course.age} 岁 · 第 ${course.sequence} 次小冒险 · 约 20 分钟</div><h1>${esc(course.title)}</h1><p>${esc(course.primaryObjective)}</p><div class="pills"><span class="pill">英语：${esc(course.englishCoreWords.join(' · '))}</span><span class="pill">家人陪伴</span></div><div class="controls">${btn('start',store.courses[course.id]?'继续这次冒险 ▶':'准备好了，出发 ▶','primary')}${store.courses[course.id]?btn('restart','重新开始','small'):''}</div></div>${scene('opening')}</div><h3 style="margin-top:28px">一起准备</h3><div class="materials">${course.materials.map(m=>`<span class="material">${esc(m)}</span>`).join('')}</div><p class="muted">材料可以替换。没有准备好时，也可以先看故事，实物活动留到稍后。</p><div class="outline">${chapterPlan().map((c,i)=>`<div>${i+1}. ${labels[i]}<span>约 ${c.seconds/60} 分钟</span></div>`).join('')}</div>${btn('home','← 回到小岛','quiet')}</section>`);
}
function currentList(){return [course.opening,course.teaching,null,course.film,course.english,course.movement,course.home,course.ending][state.chapter];}
function currentItem(){const list=currentList();return list?.[Math.min(state.step,list.length-1)]||null;}
function gameItem(){return {id:`L${course.id}-G${state.game.round+1}`,text:E.task(state.game).prompt};}
function caption(item,english=false){return `<div class="caption-box">${!state.hideCaptions||english?`<p class="${english?'english-caption':''}" ${english?'lang="en"':''}>${esc(item?.text||'看看画面，试一试。')}</p>`:'<p class="muted">字幕已隐藏，可以专心看动画。</p>'}${tools()}</div>`;}
function nav(){return `<div class="class-bar"><div><div class="eyebrow" style="margin:0">${course.age} 岁 · 第 ${course.sequence} 关 · ${esc(course.title)}</div><h2>${stageNames[state.chapter]}</h2></div><div class="head-actions"><span class="pill" id="segmentClock">本环节 ${Math.floor(state.elapsed[state.chapter]/60)}:${String(state.elapsed[state.chapter]%60).padStart(2,'0')} / 建议 ${chapterPlan()[state.chapter].seconds/60} 分钟</span>${btn('pause','Ⅱ 休息一下','small')}</div></div><nav class="stage-nav" aria-label="课堂环节">${labels.map((s,i)=>`<button class="stage-dot ${i===state.chapter?'current':''} ${state.stages[i]?'done':''}" data-act="stage" data-index="${i}" ${i===state.chapter?'aria-current="step"':''}><span>${state.stages[i]?'✓':i+1}</span>${s}</button>`).join('')}</nav>`;}
function storyPanel(){
 const list=currentList(),item=currentItem(),isFilm=state.chapter===3,phase=state.chapter===0?'opening':state.chapter===1?'teach':'film';
 if(isFilm&&state.cinemaMode==='songs')return songPanel();
 const packing=state.chapter===0&&course.id==='01'&&state.step===0;
 return `<div class="lesson-layout"><div class="theatre">${scene(phase,state.step)}${caption(item)}</div><aside class="side-panel"><div class="eyebrow">${isFilm?'故事影院 · 连续观看':state.chapter===1?'看看动作，发现方法':'朋友来邀请你啦'}</div><h3>${isFilm?esc(course.movieTitle):state.chapter===1?'方法藏在动作里':'一起走进故事'}</h3><p>${isFilm?'这一段只管看故事。可以模仿喜欢的动作，和家人聊聊好笑的地方。':state.chapter===1?'不急着答题。看看角色怎么比较、移动和调整，想试的时候再继续。':'准备好了吗？可以指一指，和身边的人说一说。'}</p><div class="counter">${state.step+1} / ${list.length} ${isFilm?'幕':'段'}</div><div class="stage-progress"><span style="width:${(state.step+1)/list.length*100}%"></span></div>${packing?`<div class="choices">${[['plates','🍽️','带盘子'],['water','💧','带水'],['boots','🥾','带雨靴']].map(([key,icon,label])=>`<button class="choice ${state.packed?.includes(key)?'chosen':''}" data-act="pack" data-value="${key}"><span class="symbol">${icon}</span><span>${label}</span></button>`).join('')}</div>`:''}<div class="controls">${state.step>0?btn('previous','← 上一段','small'):''}${btn('storyNext',state.step===list.length-1?(isFilm?'看完啦，去英语小岛':'我们去试试'):'下一幕 →','primary')}</div><div class="controls">${btn('auto',state.auto===false?'▶ 连续播放':'Ⅱ 停在这一幕','small')}</div>${parentNote(isFilm?'本地原创短片，无外部登录或广告。每幕有旁白和连续动作；可随时停在喜欢的一幕，不会穿插问题。':item?.action||'可以一起看，也可以指给家人看。')}</aside></div>`;
}
function token(x){return x.shape==='apple'?'<span class="emoji-token">🍎</span>':x.shape==='cookie'?'<span class="emoji-token">🍪</span>':x.shape==='cake'?'<span class="emoji-token">🥮</span>':`<span class="token ${x.color} ${x.shape}" aria-hidden="true"></span>`;}
function itemLabel(x){return x.shape==='apple'?'苹果':x.shape==='cookie'?'饼干':x.shape==='cake'?'派对点心':`${({red:'红色',blue:'蓝色',green:'绿色',gold:'金色'})[x.color]||''}${x.shape==='circle'?'圆片':x.shape==='triangle'?'三角片':'方片'}`;}
function itemButton(x){return `<button type="button" class="item-btn ${state.game.selected===x.id?'selected':''}" data-act="selectItem" data-id="${x.id}" aria-label="${itemLabel(x)} ${x.id}" aria-pressed="${state.game.selected===x.id}" ${state.game.checked?'disabled':''}>${token(x)}</button>`;}
function zoneName(z){return E.task(state.game).zoneLabels?.[z]||({left:'米米的盘子',middle:'小鸟的盘子',right:'点点的盘子',fourth:'小熊的盘子',red:'红色小屋',blue:'蓝色小屋',circle:'圆窗洞',square:'方窗洞'})[z]||z;}
function zoneIcon(z){const name=zoneName(z);return name.includes('米米')?'🐰':name.includes('点点')?'🦊':name.includes('小鸟')?'🐥':name.includes('小熊')?'🐻':z==='red'?'🔴':z==='blue'?'🔵':z==='match'?'🧺':z==='other'?'↗':'';}
function distributive(){
 const g=state.game,t=E.task(g),isShape=!!g.windows;
 const loose=g.items.filter(x=>isShape?!Object.values(g.windows).includes(x.id):!x.zone);
 return `<div class="items" aria-label="待放置的物品">${loose.map(itemButton).join('')||'<span class="muted">都送出去啦。还可以选中物品，再换一个位置。</span>'}</div><div class="drop-zones" style="--zones:${Math.min(t.zones.length,4)}">${t.zones.map(z=>{const assigned=g.items.filter(x=>isShape?g.windows[z]===x.id:x.zone===z);return `<div class="drop-zone ${g.selected?'target-active':''}" data-zone="${z}"><button class="zone-hit" data-act="drop" data-zone="${z}">${isShape&&['circle','square'].includes(z)?`<span class="token green ${z}"></span> `:''}<span class="zone-avatar" aria-hidden="true">${zoneIcon(z)}</span>${zoneName(z)}${!isShape?' · '+assigned.length:''}</button><div class="items">${assigned.map(itemButton).join('')}</div></div>`;}).join('')}</div><p class="counter">先点物品，再点位置；也可以拖过去。分错了可以搬动，不会清空。</p>`;
}
function choiceButtons(options,english=false){return `<div class="choices ${english?'english-choices':''}">${options.map(([value,label,symbol])=>`<button type="button" class="choice ${state.game.choice===value?'chosen':''}" data-act="choose" data-value="${value}" aria-label="${esc(label)}" ${state.game.checked?'disabled':''}><span class="symbol">${Activities.picture(symbol)}</span><span class="label">${esc(label)}</span></button>`).join('')}</div>`;}
function tableGame(choice,english=false){return `<div class="table-game" role="group" aria-label="以桌面为参照放置小猫"><div class="table-top"></div><div class="table-leg left"></div><div class="table-leg right"></div>${['on','under'].map(pos=>`<button class="position-hit ${pos} ${choice===pos?'active':''}" data-act="${english?'enChoose':'choose'}" data-value="${pos}" aria-label="${pos==='on'?'on the table':'under the table'}">${choice===pos?'<span class="cat">🐈</span>':'<span class="muted">＋</span>'}${english?'':pos==='on'?'桌子上面':'桌子下面'}</button>`).join('')}</div>`;}
function patternTrain(t){const token=v=>Activities.picture(v==='circle'?'token:gold:circle':v==='square'?'token:green:square':v==='gold'?'🟡':v==='blue'?'🔵':'🔴');return `<div class="pattern-train">${t.sequence.map((v,i)=>`<span class="car">${i===0?'🚂 ':''}${v==='?'?(state.game.checked?token(state.game.choice):'？'):token(v)}</span>`).join('')}${t.gapIndex===undefined?`<span class="car ${t.wrongTail&&!state.game.checked?'wrong':''}">${state.game.checked?token(state.game.choice):t.wrongTail?token(t.wrongTail):'？'}</span>`:''}</div>`;}
function gamePanel(){
 const g=state.game,t=E.task(g);let game='';
 if(t.kind==='distribute'||t.kind==='shape'||t.kind==='assemble')game=(t.kind==='assemble'?Activities.assembly(t,g):'')+distributive();
 else if(t.kind==='position')game=tableGame(g.choice);
 else if(t.kind==='pattern')game=patternTrain(t)+choiceButtons(t.options);
 else if(['route','sequence','counter','experiment'].includes(t.kind))game=Activities.board(t,g);
 else game=choiceButtons(t.options);
 const final=g.round===E.roundCount(g)-1;
 return `<div class="lesson-layout"><div class="theatre">${scene('game',g.round,{choice:g.choice,game:g})}<div class="caption-box"><p>${esc(t.prompt)}</p>${tools()}</div></div><aside class="side-panel"><div class="eyebrow">第 ${g.round+1} / ${E.roundCount(g)} 个小任务</div><h3>${g.mode==='party'?'先用自己的办法':'轮到你试试啦'}</h3><p>选一选、搬一搬。看过的方法可以再看，已经做的部分会留下来。</p><div class="controls">${btn('hint','给我一点提示','small')}${btn('demo','再看方法','small')}</div>${parentNote(course.help)}<div class="controls">${btn('skip','这一段稍后再试','quiet')}</div></aside></div><section class="game-area" aria-label="主题游戏"><div class="game-head"><h3>${esc(t.prompt)}</h3></div>${course.id==='10'?`<div class="free-decor" aria-label="自由装饰">${btn('decorate','🔴 挂红彩旗','small','data-value="red"')}${btn('decorate','🔵 挂蓝彩旗','small','data-value="blue"')}<span>${state.decoration==='blue'?'🔵 🔵 🔵':state.decoration==='red'?'🔴 🔴 🔴':'自由装饰，不判对错'}</span></div>`:''}${game}<div id="feedback" class="feedback ${feedbackKind==='warn'?'warn':''}" role="status" aria-live="polite">${esc(feedback||'按照自己的想法试试看。')}</div><div class="controls">${g.checked?btn('gameNext',final?'完成啦，去看故事':'换一个材料再试试','primary'):btn('check',t.kind==='experiment'?'试一试并观察':t.kind==='route'?'到达了，检查任务':'看看这样可以吗','primary')}</div></section>`;
}
const englishTasks={
 share:[{idx:0},{idx:1,options:[['cookie','cookie','🍪'],['apple','apple','🍎'],['water','water','💧']],answer:'apple'},{idx:2,options:[['green','green apple','🟢'],['red','red apple','🍎']],answer:'red'},{idx:3,gift:true},{idx:4},{idx:5},{idx:6,body:true}],
 color:[{idx:0},{idx:1,options:[['blue','blue','🔵'],['red','red','🔴']],answer:'red'},{idx:2,options:[['red','red square','🟥'],['blue','blue square','🟦']],answer:'blue'},{idx:3,options:[['blue','blue cup','🔵'],['red','red ball','🔴']],answer:'red'},{idx:4,options:[['red','red flag','🔴'],['blue','blue flag','🔵']],answer:'blue'},{idx:5,body:true},{idx:6}],
 shape:[{idx:0},{idx:1,options:[['square','square','■'],['circle','circle','●']],answer:'circle'},{idx:2,options:[['circle','circle','●'],['square','square','◆']],answer:'square'},{idx:3,options:[['circle','circle','●'],['square','square','■']],answer:'circle'},{idx:4,body:true},{idx:5},{idx:7,body:true}],
 weather:[{idx:0},{idx:1,options:[['rain','rain','🌧️'],['sun','sun','☀️']],answer:'sun'},{idx:2,options:[['sun','sun','☀️'],['rain','rain','🌧️']],answer:'rain'},{idx:3},{idx:4,body:true},{idx:5,body:true},{idx:6}],
 position:[{idx:0},{idx:1},{idx:2},{idx:3,position:true,answer:'on'},{idx:4,position:true,answer:'under'},{idx:5,body:true},{idx:7,body:true}],
 action:[{idx:0},{idx:1},{idx:2,options:[['stop','stop','✋'],['walk','walk','🚶']],answer:'walk'},{idx:3,options:[['walk','walk','🚶'],['stop','stop','✋']],answer:'stop'},{idx:4,body:true},{idx:5,body:true},{idx:6,body:true},{idx:7}],
 pattern:[{idx:0},{idx:1,sequence:['red','blue','red','blue'],options:[['blue','blue','🔵'],['red','red','🔴']],answer:'red'},{idx:2,options:[['red','red','🔴'],['blue','blue','🔵']],answer:'red'},{idx:3,options:[['red','red','🔴'],['blue','blue','🔵']],answer:'blue'},{idx:5,body:true},{idx:6,body:true},{idx:7}],
 emotion:[{idx:0},{idx:1},{idx:2},{idx:3,options:[['sad','sad, the tower fell','🧱 ☁️'],['happy','happy, the house is built','🏡 ☀️']],answer:'happy'},{idx:4,options:[['happy','happy, the house is built','🏡 ☀️'],['sad','sad, the tower fell','🧱 ☁️']],answer:'sad'},{idx:5,body:true},{idx:6,body:true},{idx:7,body:true}],
 shadow:[{idx:0},{idx:1},{idx:2,options:[['shadow','shadow','◼'],['light','light','🔦']],answer:'light'},{idx:3,options:[['light','light','🔦'],['shadow','shadow','◼']],answer:'shadow'},{idx:4,shadow:true,answer:'in'},{idx:5},{idx:6,body:true},{idx:7}],
 party:[{idx:0},{idx:1,gift:true},{idx:2,body:true},{idx:3},{idx:4},{idx:5,body:true},{idx:7}]
};
function enTask(){return englishSteps()[Math.min(state.step,englishSteps().length-1)];}
function enItem(){return course.english[enTask().idx];}
function englishPanel(){
 const t=enTask(),quiz=!!t.options,override=englishFocusOverride&&!quiz?course.englishVocabulary.find(v=>v.key===englishFocusOverride):null,item=override?course.english[override.wordIndex]:enItem(),done=state.english[state.step]?.done;
 const names={word:'单词认识',listen:'听音找物',sentence:'句子跟读',transfer:'换个位置再辨认',find:'身边找一找',dialogue:'和朋友说一说'};
 const guidance={word:'听三遍：看一看亮起来的物品。也可以点另一件，听听它的名字。',listen:'先听声音，再点对应物品。这次先自己找，不提示答案。',sentence:'指着对应的物品听三遍。两遍之间，留一点时间一起说。',transfer:'物品换位置了。听完整句，再找一次，别只记住左右。',find:'在身边找找相同的物品、数量或动作。可以指一指、做一做。',dialogue:'和身边的人轮流说这一句，也可以用手势表达。'};
 let vocabulary=[...course.englishVocabulary];if((course.sequence%2===0)!==!!t.swap)vocabulary.reverse();
 const cards=vocabulary.map(v=>`<button class="vocab-card ${state.english[state.step]?.choice===v.key?'chosen':''}" data-act="${quiz?'enChoose':'modelWord'}" data-value="${esc(v.key)}" data-vocab="${esc(v.key)}" aria-label="${esc(v.word)}"><span class="vocab-picture">${Activities.picture(v.picture)}</span><span class="vocab-word" lang="en">${esc(v.word)}</span></button>`).join('');
 const scene=`<div class="scene english-stage ${quiz?'quiz':'model'} ${t.swap?'transfer':''}"><div class="vocab-sky" aria-hidden="true">✦</div><div class="vocab-stage">${cards}</div><span class="scene-label">英语小岛 · ${esc(names[t.practice])}</span></div>`;
 const interaction=t.body?`<div class="controls">${btn('enTried',t.practice==='find'?'我指过 / 做过了':'我试着说过了','gold')}${btn('enListened','今天先听一听','small')}</div>`:'';
 return `<div class="lesson-layout english-lesson"><div class="theatre">${scene}${caption(item,true)}<div id="repeatCue" class="repeat-cue" role="status"></div></div><aside class="side-panel"><div class="eyebrow">ENGLISH ISLAND · 约 ${chapterPlan()[4].seconds/60} 分钟</div><h3>${esc(names[t.practice])}</h3><p>${esc(guidance[t.practice])}</p><div class="counter">${state.step+1} / ${englishSteps().length} · 听词 → 找物 → 说句子 → 换位置 → 用到生活里</div>${interaction}<div id="feedback" class="feedback ${feedbackKind==='warn'?'warn':''}" role="status">${esc(feedback||(done?'完成一次尝试啦。':quiz?'听清楚，再选一选。':'不急着说，先听也可以。'))}</div><div class="controls">${state.step?btn('previous','← 上一步','small'):''}${btn('enNext',state.step===englishSteps().length-1?'完成，去动一动':'下一小步 →','primary',!done&&(quiz||t.body)?'disabled':'')}${!done&&(quiz||t.body)?btn('enSkip','先听，继续下一步','small'):''}</div>${parentNote('跟读由陪伴者观察，不采集录音，不进行发音打分。可以点“再听一遍”重复整组，或点学习图卡再次听词。')}</aside></div>`;
}
function activityPanel(){
 const isHome=state.chapter===6,list=isHome?course.home:course.movement,item=list[Math.min(state.step,list.length-1)],checked=(isHome?state.homeSteps:state.movementSteps).includes(state.step),suggested=chapterPlan()[state.chapter].seconds;
 return `<div class="lesson-layout"><div class="theatre">${scene(isHome?'home':'move',state.step)}${caption(item)}</div><aside class="side-panel"><div class="eyebrow">${isHome?'把发现带回生活里':'离开椅子，轻轻动起来'}</div><h3>${isHome?'屏幕旁边，真的试一试':'跟朋友做一个动作'}</h3>${isHome?`<div class="material-reminder">准备：${esc(course.materials.join('、'))}</div>`:'<p>原地就可以，不用跑。不方便做时，坐着模仿或先观看都可以。</p>'}<p class="home-task">${esc(item.text)}</p><p class="counter">步骤 ${state.step+1} / ${list.length} · 本环节约 ${suggested/60} 分钟，可按孩子节奏继续</p>${checked?'<p class="checkmark">✓ 已记为尝试过</p>':''}<div class="controls">${btn('activityDone',checked?'再试一次也可以':'我们试过这一小步','gold')}${btn('activityNext',state.step===list.length-1?'回到故事结局':'下一步 →','primary')}</div><div class="controls">${btn('activityLater',isHome?'材料没备好，留到稍后':'今天先观看','quiet')}</div>${parentNote(isHome?'家长先观察孩子怎么做，再按需提示。按钮由陪伴者确认，不代表系统看见或评判了孩子的动作。':'可以提前继续，不必等满计时。系统没有摄像头动作识别，不按反应速度计分。')}</aside></div>`;
}
function endingPanel(){const item=currentItem();return `<div class="lesson-layout"><div class="theatre">${scene('ending',state.step)}${caption(item)}</div><aside class="side-panel"><div class="eyebrow">故事的最后，留一点给你</div><h3>谢谢你来做客。</h3><p>把刚才的发现指给家人看，或者摆出来。不想说也没关系。</p><div class="controls">${state.step<course.ending.length-1?btn('storyNext','听听朋友还想说什么 →','primary'):btn('finish','今天先到这里 ✓','primary')}</div>${parentNote(course.observation)}</aside></div>`;}
function classroom(speak=true){
 motion.cancel();
 if(speak){stopVoice();englishFocusOverride=null;}
 let panel=state.chapter===2?gamePanel():state.chapter===4?englishPanel():state.chapter===5||state.chapter===6?activityPanel():state.chapter===7?endingPanel():storyPanel();
 shell(nav()+panel);
 if(state.chapter===3&&state.cinemaMode!=='songs'){document.querySelector('.audio-tools')?.insertAdjacentHTML('beforeend',btn('cinemaFull','⛶ 大屏看故事','small'));document.querySelector('.lesson-layout').insertAdjacentHTML('beforebegin',cinemaTabs());}
 if([1,2,6,7].includes(state.chapter))document.querySelector('.lesson-layout')?.insertAdjacentHTML('beforebegin',conceptCard());
 if(state.chapter===2)document.querySelector('.game-area').insertAdjacentHTML('afterbegin',`<div class="mobile-game-help"><div class="controls">${btn('hint','一点提示','small')}${btn('demo','再看方法','small')}${btn('skip','稍后再试','small')}</div></div>`);
 if(speak){if(state.chapter===2)say(gameItem());else if(state.chapter===4)startEnglish(enItem(),enTask().repeats||3);else if(!(state.chapter===3&&state.cinemaMode==='songs'))say(currentItem(),[0,1,3].includes(state.chapter));}
 if(state.chapter===4)updateEnglishCue();
}
function summary(){
 const target=journeyTarget(),following=getCourse(target.id);
 const nextButton=target.completed?btn('home','十关都走完啦，回到小岛','primary'):btn('continueJourney',`${target.resume?'继续':'下一关'}：${esc(following.title)} →`,'primary');
 const options='<option value="">暂未记录</option><option value="independent">独立尝试</option><option value="hinted">提示后尝试</option><option value="together">共同完成</option><option value="watched">今天主要观看</option>';
 const observed=(label,key)=>`<label>${label}<select data-observation="${key}">${options.replace(`value="${state.observations[key]}"`,`value="${state.observations[key]}" selected`)}</select></label>`;
 const gameStatus=state.stages[2]==='participated'?'已完成屏幕任务':state.stages[2]==='skipped'?'屏幕任务稍后再试':'屏幕任务未完整记录';
 const film=state.stages[3]==='parent-confirmed-external'?'儿歌由陪伴者确认观看':state.filmSeen.length>=course.film.length?'六幕均已播放':state.filmSeen.length?`播放了 ${state.filmSeen.length} 幕，其余可回看`:'未记录完整观看';
 shell(`<section class="completion"><div class="trophy" aria-hidden="true">🌿</div><div class="eyebrow">${course.age} 岁 · 第 ${course.sequence} 次小冒险</div><h1>今天的小故事，<br>陪你走到这里。</h1><p>${esc(course.title)} · ${esc(course.primaryObjective)}</p><div class="parent-note mini-summary">${gameStatus}；${film}。<br>身体活动确认 ${state.movementSteps.length} 步，实物活动确认 ${state.homeSteps.length} 步。参与记录不等于能力测评。</div><h3>给陪伴者的一点记录</h3><p class="muted">按实际观察选择，可以留空。记录只保存在这台设备。</p><div class="observation-grid">${observed('这次主要方法','method')}${observed('英语听后操作','english')}${observed('真实材料里的尝试','home')}${observed('表达或演示发现','expression')}</div><p id="recordStatus" class="muted" role="status">选择后自动保存。</p><div class="controls">${nextButton}${target.completed?'':btn('home','今天先休息，回到小岛','small')}${btn('revisit','再看看这节课','small')}${btn('export','导出学习记录','small')}</div></section>`);
}
function records(){shell(`<section class="completion"><div class="eyebrow">只记录实际参与</div><h1>${store.selectedAge||4} 岁 · 小岛上的足迹</h1><p class="muted">保存在当前浏览器，不上传孩子的录音、照片或个人信息。</p><div class="record-list">${ageLessons().map(l=>{const s=store.courses[l.id];return `<div class="record-row"><div><strong>第 ${l.sequence} 关 · ${esc(l.title)}</strong><br><small>${s?Object.keys(s.stages||{}).length+' 个环节有浏览或活动记录；'+(s.finished?'故事已走到结局':'可以继续'):'还没出发'}</small></div>${btn('course','去看看','small',`data-id="${l.id}"`)}</div>`;}).join('')}</div><div class="controls">${btn('home','回到小岛','primary')}${btn('export','导出记录','small')}${btn('clear','清除本机记录','quiet danger')}</div></section>`);}
function render(speak=true){if(page==='home')home();else if(page==='ages')agePicker();else if(page==='intro')intro();else if(page==='class')classroom(speak);else if(page==='summary')summary();else records();}
function stopVoice(){pausedSongSrc=null;voiceToken++;voice.pause();voice.onended=null;voice.onerror=null;autoRemaining=null;lastClip=null;englishLoop=null;document.querySelectorAll('.vocab-card.is-speaking').forEach(el=>el.classList.remove('is-speaking'));}
function status(message){const el=document.getElementById('audioStatus');if(el)el.textContent=message;}
function say(item,auto=false){
 stopVoice();if(!item)return;lastClip=item;const token=voiceToken;
 const meta=window.COURSE_AUDIO?.[item.id];
 if(!meta){status('这段声音尚未加载，可先看字幕或点再听。');return;}
 if(auto&&page==='class'&&[0,1,3].includes(state.chapter)){
  const next=currentList()?.[state.step+1],src=next&&window.COURSE_AUDIO?.[next.id]?.src;
  if(src&&nextStoryAudio.getAttribute('src')!=='assets/'+src)nextStoryAudio.src='assets/'+src;
 }
 voice.src='assets/'+meta.src;
 // Loading a new source can restore defaultPlaybackRate in the browser.
 voice.defaultPlaybackRate=state?.chapter===4&&slow ? .85:1;
 voice.playbackRate=voice.defaultPlaybackRate;
 const ended=()=>{if(token!==voiceToken)return;if(englishLoop?.token===token){if(englishLoop.round<englishLoop.total){englishLoop.wait=englishLoop.sentence?1400:900;status('轮到你说一说，也可以指一指。稍后再听一遍。');}else status('这一组听完啦。可以再听，也可以继续试一试。');updateEnglishCue();return;}if(page==='class'&&state.chapter===3){if(!state.filmSeen.includes(state.step))state.filmSeen.push(state.step);save();}const continues=auto&&state?.auto!==false&&state.step+1<(currentList()?.length||0);status(continues?'故事继续……':store.muted?'声音已关闭':'这一段讲完啦，准备好就继续。');if(continues){autoRemaining=STORY_GAP_MS;autoTotal=autoRemaining;}};
 voice.onended=ended;
 voice.onerror=()=>{if(token!==voiceToken)return;autoRemaining=null;englishLoop=null;updateEnglishCue();status('声音暂时没加载成功。点“再听一遍”重试，也可以继续看字幕。');};
 if(store.muted){status('声音已关闭。可以打开声音，或看画面和字幕。');if(auto&&state?.auto!==false){autoRemaining=(meta.duration*1000)+STORY_GAP_MS;autoTotal=autoRemaining;}return;}
 if(paused)return;
 voice.play().then(()=>{if(token!==voiceToken)return;spoken=true;status(state?.chapter===4?'听一听，看对应的物品。':'正在讲故事……');}).catch(error=>{if(token!==voiceToken||error.name==='AbortError')return;status(voice.error?'声音暂时没加载成功。点“再听一遍”重试，也可以继续看字幕。':'点“再听一遍”，让故事的声音开始。');});
}
function message(text,kind='',id=null){feedback=text;feedbackKind=kind;classroom(false);if(id)say({id,text});}
function conceptCard(){const c=course.concept,r=state.chapter===2?course.gameConcepts?.[state.game.round]:null;if(!c)return '';return `<section class="concept-card" aria-label="今天学习的概念"><div class="eyebrow">今天的方法有名字</div><h3>${esc(r?.name||c.name)}</h3><p>${esc(c.meaning)}</p><div class="concept-example">看看这个例子：${esc(r?.example||c.example)}</div>${btn('hearConcept','♫ 再听概念讲解','small')}</section>`;}
function cinemaTabs(){return `<div class="cinema-tabs" aria-label="选择短片类型">${btn('cinemaSongs','🎬 本关视频','small',`aria-pressed="${state.cinemaMode==='songs'}"`)}${btn('cinemaLocal','🌿 原创故事','small',`aria-pressed="${state.cinemaMode!=='songs'}"`)}<small>看一集，再去英语小岛。</small></div>`;}
function recommendedSong(){return window.LESSON_VIDEOS?.[course.id]?.videoId||'finger';}
function songPanel(){
 const songs=window.ISLAND_SONGS,assignment=window.LESSON_VIDEOS?.[course.id],song=songs.find(s=>s.id===state.songId)||songs.find(s=>s.id===recommendedSong()),isAssigned=song.id===recommendedSong(),canEmbed=IslandVideo.canEmbed(),watch=IslandVideo.watchURL(song.id,location,{muted:store.muted});
 const alternatives=songs.filter(s=>!s.id.startsWith('yt-')&&s.id!==song.id);
 return `${cinemaTabs()}<section class="song-cinema"><div class="eyebrow">${esc(song.publisher||'Super Simple Songs')} · ${isAssigned?'本关预选':'自由回看'}${song.duration?' · '+esc(song.duration):''}</div><h2>${esc(song.title)}</h2><p>${esc(isAssigned?assignment.cue:song.cue)}</p>${isAssigned?`<p class="video-match"><span class="pill">${esc(assignment.match)}</span> ${esc(assignment.note)}</p>`:''}<div class="song-player">${state.songEmbed&&canEmbed?`<iframe data-song-player title="${esc(song.title)} 官方视频" src="${esc(IslandVideo.embedURL(song.videoId,{muted:store.muted})||'')}" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`:`<div class="song-cover"><span aria-hidden="true">🎬</span><h3>${esc(song.topic)}</h3>${canEmbed?btn('playSong','▶ 播放本集','primary'):`<a class="btn primary" data-song-online href="${esc(watch)}" target="_blank" rel="noopener">▶ 在线播放本集 ↗</a>`}</div>`}</div><div class="controls"><a class="btn small" data-song-online href="${esc(watch)}" target="_blank" rel="noopener">新窗口播放 ↗</a><a class="btn small" href="https://www.youtube.com/watch?v=${song.videoId}" target="_blank" rel="noopener">在 YouTube 打开原片 ↗</a><a href="${song.source}" target="_blank" rel="noopener">官方来源 ↗</a></div><p class="muted song-help">${canEmbed?'原版视频需联网，由家长陪看。':'本地课堂的视频会在在线播放器中打开，看完关闭新页面即可回到这里。'}${song.durationSeconds>180?' 本集较长，可以把看后活动留到课后。':''}</p>${isAssigned?`<details class="parent-details"><summary>看后一起试试</summary><p>${esc(assignment.after)}</p></details>`:''}<details class="song-help"><summary>无法播放，或想暂停？</summary><p>外部视频可能有广告、登录验证或地区限制。无法播放可打开原片，或切回原创故事。课堂“休息一下”会停止视频，继续时重新播放；视频内暂停可保留位置。</p></details><details class="video-alternatives"><summary>家长选片 · 换回本关视频或回看儿歌</summary><div class="song-list">${[songs.find(s=>s.id===recommendedSong()),...alternatives].map(s=>`<button class="song-option ${song.id===s.id?'active':''}" data-act="chooseSong" data-id="${s.id}" aria-pressed="${song.id===s.id}"><strong>${esc(s.title)}</strong><small>${s.id===recommendedSong()?'本关预选':esc(s.topic)}</small></button>`).join('')}</div><p><a href="video-library.html" target="_blank" rel="noopener">打开完整视频素材库 ↗</a></p></details><div class="controls">${btn('songDone','看过了，去英语小岛 →','primary')}${btn('cinemaLocal','看原创故事','small')}</div><p class="muted">看一集即可，也可以只欣赏；观看由陪伴者确认。</p></section>`;
}
function startEnglish(item,total=3){say(item);if(!store.muted&&window.COURSE_AUDIO?.[item?.id])englishLoop={token:voiceToken,round:1,total,wait:null,sentence:item.id.includes('-ES')};updateEnglishCue();}
function updateEnglishCue(){if(page!=='class'||state?.chapter!==4)return;const t=enTask(),answer=state.english[state.step],key=t.options?(answer?.done?answer.choice:null):(englishFocusOverride||t.focus);for(const el of document.querySelectorAll('.vocab-card')){el.classList.toggle('focus-target',el.dataset.vocab===key);el.classList.toggle('is-speaking',el.dataset.vocab===key&&!voice.paused&&!voice.ended);}const counter=document.getElementById('repeatCue');if(counter)counter.textContent=store.muted?'声音已关闭，可看图或打开声音':englishLoop?`第 ${englishLoop.round} / ${englishLoop.total} 遍 · 听一听，轮到你说一说`:`重点词句重复 ${t.repeats||3} 遍，可随时再听`;}
voice.addEventListener('playing',()=>{updateEnglishCue();if(englishLoop)status('听一听，看对应的物品。');});
voice.addEventListener('pause',updateEnglishCue);
function moveItem(id,zone,fromRect){
 if(!state?.game||state.game.checked)return false;
 const before=motion.snapshot();if(fromRect)before.set(id,fromRect);
 if(!E.move(state.game,id,zone))return false;
 feedback='搬过去啦。可以继续分，也可以选中它再调整。';feedbackKind='';save();classroom(false);motion.settle(before,id,zone);return true;
}
function enterChapter(index,mark=true){
 if(mark&&!state.stages[state.chapter])state.stages[state.chapter]='visited';
 state.chapter=index;state.step=0;feedback='';feedbackKind='';showDemo=false;slow=false;save();classroom();window.scrollTo({top:0,behavior:'instant'});
}
function nextChapter(mark='participated'){state.stages[state.chapter]=mark;save();if(state.chapter<7)enterChapter(state.chapter+1,false);else finish();}
function storyNext(auto=false){if(state.chapter===0&&course.id==='01'&&state.step===0&&(state.packed?.length||0)<2){autoRemaining=null;status('盘子和水还没带齐。我们等你准备好，再一起出发。');return;}const list=currentList();if(state.step+1<list.length){state.step++;feedback='';save();classroom();}else if(!auto)nextChapter(state.chapter===3?(state.filmSeen.length===course.film.length?'watched':'visited'):'participated');else{autoRemaining=null;status('这一段讲完啦，准备好就继续。');}}
function finish(){stopVoice();state.finished=true;state.stages[7]='visited';store.journeyCourseId=course.id;save();page='summary';url('done-'+course.id);render();window.scrollTo(0,0);}
function renderModal(){
 const overlay=document.createElement('div');overlay.className='overlay';overlay.id='overlay';
 const copy=modal==='pause'?`<h2>小小休息一下。</h2><p>故事、动画和活动计时都暂停啦。准备好了，我们再一起回去。</p><div class="controls">${btn('unpause','▶ 继续冒险','primary')}${btn('saveHome','保存并回到小岛','small')}</div>`:modal==='restart'?`<h2>重新走一遍？</h2><p>这节课当前的进度和观察会清空，其他课程会保留。</p><div class="controls">${btn('confirmRestart','重新开始这节课','primary')}${btn('cancelModal','保留进度','small')}</div>`:modal==='clear'?`<h2>清除本机足迹？</h2><p>将清除所有年龄段在当前浏览器的进度和观察。可以先导出记录保存。</p><div class="controls">${btn('confirmClear','确认清除','primary')}${btn('cancelModal','保留记录','small')}</div>`:`<h2>再看一遍方法</h2><div id="demoScene" class="scene">${Scenes.render(course,'teach',course.teaching[demoStep]?.visualStep??demoStep)}</div><p id="demoCaption">${esc(course.teaching[demoStep].text)}</p><div class="controls">${btn('demoNext','下一步演示','small')}${btn('closeDemo','回到我刚才的分法','primary')}</div>`;
 overlay.innerHTML=`<section class="dialog" role="dialog" aria-modal="true" aria-label="${modal==='pause'?'休息一下':modal==='demo'?'方法示范':'操作确认'}" tabindex="-1">${copy}</section>`;root.appendChild(overlay);overlay.querySelector('.btn')?.focus();
}
function pause(){if(page!=='class')return;motion.cancel();const frame=document.querySelector('[data-song-player]');if(frame?.getAttribute('src')){pausedSongSrc=frame.src;frame.removeAttribute('src');}resumeVoice=!voice.paused&&!voice.ended;paused=true;voice.pause();modal='pause';document.body.classList.add('is-paused');renderModal();save();}
function closeModal(){document.getElementById('overlay')?.remove();modal=null;paused=false;document.body.classList.remove('is-paused');}
function englishChoose(value){const t=enTask();if(!state.english[state.step])state.english[state.step]={};const s=state.english[state.step];s.choice=value;s.done=false;s.attempts=(s.attempts||0)+1;if(value===t.answer){s.done=true;s.status='responded';save();message('找到了！声音和这件物品对应起来啦。','',null);}else{s.status='attempted';save();message('再听一遍，看看哪件物品和声音对应。','warn');startEnglish(enItem(),2);}}
function exportRecords(){save();const blob=new Blob([JSON.stringify({product:'小小奇遇岛 V2',exported:new Date().toISOString(),...store},null,2)],{type:'application/json'});const a=document.createElement('a'),objectURL=URL.createObjectURL(blob);a.href=objectURL;a.download='小小奇遇岛-学习记录.json';a.click();setTimeout(()=>URL.revokeObjectURL(objectURL),1000);}
function act(action,el){
 if(modal&&!['unpause','saveHome','confirmRestart','cancelModal','confirmClear','demoNext','closeDemo'].includes(action))return;
 switch(action){
 case 'ages':stopVoice();save();page='ages';url('ages');render();break;
 case 'selectAge':stopVoice();save();store.selectedAge=Number(el.dataset.age);page='home';course=null;state=null;save();url('');render();window.scrollTo(0,0);break;
 case 'home':stopVoice();closeModal();save();page='home';url('');render();break;
 case 'course':stopVoice();save();activate(el.dataset.id);page='intro';url('course-'+course.id);render();window.scrollTo(0,0);break;
 case 'start':beginCourse(course.id);break;
 case 'continueJourney':beginCourse(journeyTarget().id);break;
 case 'restart':modal='restart';renderModal();break;
 case 'confirmRestart':closeModal();state=fresh(course);state.started=true;store.journeyCourseId=course.id;save();page='class';url('lesson-'+course.id);render();break;
 case 'cancelModal':closeModal();break;
 case 'mute':{store.muted=!store.muted;save();const item=lastClip;if(item&&!paused){if(state?.chapter===4)startEnglish(item,enTask().repeats||3);else say(item,[0,1,3].includes(state?.chapter));}else{voice.pause();if(store.muted)englishLoop=null;}render(false);break;}
 case 'records':stopVoice();save();page='records';url('records');render();break;
 case 'stage':enterChapter(Number(el.dataset.index));break;
 case 'replay':if(state.chapter===4)startEnglish(lastClip||enItem(),enTask().repeats||3);else say(state.chapter===2?gameItem():currentItem(),[0,1,3].includes(state.chapter));break;
 case 'cinemaFull':{const theatre=document.querySelector('.theatre');if(document.fullscreenElement)document.exitFullscreen?.();else theatre?.requestFullscreen?.().catch(()=>status('当前浏览器不支持大屏，可以横屏观看。'));break;}
 case 'slow':slow=!slow;englishFocusOverride=null;classroom(false);startEnglish(enItem(),enTask().repeats||3);break;
 case 'hearConcept':say(course.teaching.find(x=>x.id===course.concept.clipId));break;
 case 'modelWord':{const v=course.englishVocabulary.find(v=>v.key===el.dataset.value);if(!v)return;englishFocusOverride=v.key;const item=course.english[v.wordIndex];document.querySelector('.caption-box p').textContent=item.text;startEnglish(item,3);break;}
 case 'cinemaSongs':stopVoice();state.cinemaMode='songs';state.songEmbed=false;save();classroom(false);break;
 case 'cinemaLocal':stopVoice();state.cinemaMode='local';state.songEmbed=false;save();classroom();break;
 case 'chooseSong':stopVoice();state.songId=el.dataset.id;state.songEmbed=false;save();classroom(false);break;
 case 'playSong':if(!IslandVideo.canEmbed())return;stopVoice();state.songEmbed=true;state.songReports||={};state.songReports[state.songId||recommendedSong()]='opened';save();classroom(false);break;
 case 'songDone':state.songReports||={};state.songReports[state.songId||recommendedSong()]='parent-confirmed-viewed';state.songEmbed=false;nextChapter('parent-confirmed-external');break;
 case 'captions':state.hideCaptions=!state.hideCaptions;save();classroom(false);break;
 case 'auto':state.auto=state.auto===false;save();if(state.auto)say(currentItem(),true);else autoRemaining=null;classroom(false);break;
 case 'previous':state.step=Math.max(0,state.step-1);save();feedback='';classroom();break;
 case 'storyNext':storyNext();break;
 case 'pack':if(el.dataset.value==='boots')message('画里是晴天，今天先带盘子和水就够啦。','warn');else{state.packed||=[];if(!state.packed.includes(el.dataset.value))state.packed.push(el.dataset.value);save();message(state.packed.length===2?'盘子和水都带好啦。准备好就继续故事。':'装进去啦。再看看还要带什么。');}break;
 case 'selectItem':if(state.game.checked)return;state.game.selected=state.game.selected===el.dataset.id?null:el.dataset.id;save();classroom(false);break;
 case 'drop':{if(state.game.checked)return;const id=state.game.selected;if(!id){message('先选一件物品，再点它要去的位置。','warn');return;}moveItem(id,el.dataset.zone);break;}
 case 'choose':{const t=E.task(state.game),review=t.kind==='experiment'&&state.game.checked;if(state.game.checked&&!review)return;state.game.choice=el.dataset.value;if(review){feedback=t.outcomes[el.dataset.value].text+' 可以来回比较，再继续故事。';feedbackKind='';}save();classroom(false);if(state.game.config)say({id:review?`L${course.id}-X${state.game.round+1}-${el.dataset.value}`:`L${course.id}-V${state.game.round+1}-${el.dataset.value}`,text:''});break;}
 case 'check':{const result=E.check(state.game);save();const task=E.task(state.game);if(task.kind==='experiment'&&task.outcomes[state.game.choice]){const outcome=task.outcomes[state.game.choice];message(outcome.text+(result.good?' 两种条件都观察过啦，可以继续。':' 再换一种条件试一试。'),'',`L${course.id}-X${state.game.round+1}-${state.game.choice}`);break;}if(result.good)message('这次用到的方法是：'+course.gameConcepts[state.game.round].name+'。'+course.gameConcepts[state.game.round].example,'','common-done');else{const errors={arrangement:'请按这次的订单或线索核对各处物品，不必把全部清空。',sequence:'想想哪一步要先准备好，后一件事才可能发生。可以点小画取回来再排。',route:'看看是否取到了星星处的信，再到信箱。可以回退，试另一条路。',count:'一件一件点着看。要添一些还是拿走一些，才能符合这次的数量？',remaining:'中间还有物品没有放好。把它们也送过去，再看看。',unequal:'看看两边，哪边多一点？可以选中一个，搬到另一边。',color:'把这件物品挨着小屋的颜色比一比。同色、不同形也能住一起。',shape:'看看边有没有对上。颜色可以不一样，圆和方的轮廓不同。',choice:course.mode==='emotion'?'先听听点点的请求。可以问一问，也可以安静陪一会儿。':course.mode==='shadow'?'灯和纸先不动，只改变中间的物体，再看看纸面。':'看看现在的画面，再试一种办法。'};message(errors[result.reason],'warn','common-try');}break;}
 case 'routeStep':if(E.walk(state.game,el.dataset.value)){feedback='走了一格。看看信件和终点在哪里。';feedbackKind='';}else{feedback='这一格走不通，看看边界和石头，可以换个方向。';feedbackKind='warn';}save();classroom(false);break;
 case 'sequencePick':if(state.game.checked)return;{const order=state.game.order,index=order.indexOf(el.dataset.value);if(index>=0)order.splice(index,1);else order.push(el.dataset.value);save();classroom(false);say({id:`L${course.id}-V${state.game.round+1}-${el.dataset.value}`,text:''});break;}
 case 'counterChange':if(state.game.checked)return;{const t=E.task(state.game);state.game.counter=Math.max(0,Math.min(t.maximum,state.game.counter+Number(el.dataset.value)));save();classroom(false);break;}
 case 'gameNext':if(!state.game.checked)return;{const next=E.next(state.game);if(next){state.game=next;feedback='';feedbackKind='';save();classroom();}else nextChapter();}break;
 case 'hint':state.game.hints++;save();message(E.hint({...state.game}),'',state.game.config?`L${course.id}-HINT${state.game.round+1}`:'common-hint');break;
 case 'demo':stopVoice();showDemo=true;demoStep=0;paused=true;modal='demo';document.body.classList.add('is-paused');renderModal();paused=false;document.body.classList.remove('is-paused');say(course.teaching[0]);break;
 case 'demoNext':demoStep=(demoStep+1)%course.teaching.length;document.getElementById('demoScene').innerHTML=Scenes.render(course,'teach',demoStep);document.getElementById('demoCaption').textContent=course.teaching[demoStep].text;say(course.teaching[demoStep]);break;
 case 'closeDemo':stopVoice();showDemo=false;closeModal();classroom(false);break;
 case 'skip':nextChapter('skipped');break;
 case 'decorate':state.decoration=el.dataset.value;save();classroom(false);break;
 case 'enChoose':englishChoose(el.dataset.value);break;
 case 'enPick':state.english[state.step]||={};state.english[state.step].picked=true;save();feedback='Now, touch the plate.';classroom(false);break;
 case 'enPlate':{const s=state.english[state.step]||{};if(!s.picked){message('Touch the apple first. Then touch the plate.','warn');if(course.mode==='share')say(course.english[7]);return;}s.done=true;s.status='responded';state.english[state.step]=s;save();message('Thank you!');say(course.english[course.mode==='share'?4:3]);break;}
 case 'enTried':case 'enListened':state.english[state.step]={...state.english[state.step],done:true,status:action==='enTried'?'parent-confirmed-attempt':'listened'};save();message(action==='enTried'?'Thank you for trying!':'Listening is okay.');break;
 case 'enNext':{const t=enTask();if((t.options||t.position||t.gift||t.shadow||t.body)&&!state.english[state.step]?.done)return;if(state.step+1<englishSteps().length){state.step++;feedback='';feedbackKind='';save();classroom();}else nextChapter();break;}
 case 'enSkip':state.english[state.step]={...state.english[state.step],done:true,status:'listened'};save();act('enNext',el);break;
 case 'activityDone':{const list=state.chapter===6?state.homeSteps:state.movementSteps;if(!list.includes(state.step))list.push(state.step);save();feedback='';classroom(false);break;}
 case 'activityNext':if(state.step+1<currentList().length){state.step++;save();classroom();}else nextChapter((state.chapter===6?state.homeSteps:state.movementSteps).length?'parent-confirmed-attempt':'viewed-instructions');break;
 case 'activityLater':nextChapter('deferred');break;
 case 'pause':pause();break;
 case 'unpause':closeModal();if(pausedSongSrc){const frame=document.querySelector('[data-song-player]');if(frame)frame.src=pausedSongSrc;pausedSongSrc=null;}if(resumeVoice&&lastClip&&!store.muted)voice.play().catch(()=>status('点再听一遍继续声音。'));resumeVoice=false;break;
 case 'saveHome':closeModal();stopVoice();save();page='home';url('');render();break;
 case 'finish':finish();break;
 case 'revisit':state.finished=false;page='class';save();url('lesson-'+course.id);classroom();break;
 case 'export':exportRecords();break;
 case 'clear':modal='clear';renderModal();break;
 case 'confirmClear':stopVoice();closeModal();store.courses={};delete store.journeyCourseId;store.journeyByAge={};state=null;course=null;save();page='home';url('');render();break;
 }
}
root.addEventListener('click',event=>{if(motion.consumeClick(event))return;const el=event.target.closest('[data-act]');if(!el||el.disabled)return;event.preventDefault();act(el.dataset.act,el);});
root.addEventListener('change',event=>{const key=event.target.dataset.observation;if(key){state.observations[key]=event.target.value;save();const s=document.getElementById('recordStatus');if(s)s.textContent=storageOK?'已保存在这台设备。':'暂时无法保存，请保持本页打开。';}});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(modal==='pause')act('unpause',{});else if(modal==='demo')act('closeDemo',{});else if(modal)act('cancelModal',{});else if(page==='class')pause();}if(event.key==='Tab'&&modal){const els=[...document.querySelectorAll('#overlay button:not(:disabled),#overlay [tabindex="0"]')];if(els.length){if(event.shiftKey&&document.activeElement===els[0]){els.at(-1).focus();event.preventDefault();}else if(!event.shiftKey&&document.activeElement===els.at(-1)){els[0].focus();event.preventDefault();}}}});
let tick=performance.now(),elapsedFraction=0;
setInterval(()=>{const now=performance.now(),delta=Math.min(1500,now-tick);tick=now;if(page!=='class'||paused||modal)return;elapsedFraction+=delta;if(elapsedFraction>=1000){elapsedFraction-=1000;state.elapsed[state.chapter]++;sessionSeconds++;const clock=document.getElementById('segmentClock');if(clock)clock.textContent=`本环节 ${Math.floor(state.elapsed[state.chapter]/60)}:${String(state.elapsed[state.chapter]%60).padStart(2,'0')} / 建议 ${chapterPlan()[state.chapter].seconds/60} 分钟`;if(sessionSeconds%5===0)save();}if(englishLoop?.wait!=null&&state.chapter===4){englishLoop.wait-=delta;if(englishLoop.wait<=0){englishLoop.wait=null;englishLoop.round++;voice.currentTime=0;updateEnglishCue();const repeatToken=voiceToken;voice.play().catch(error=>{if(repeatToken!==voiceToken||error.name==='AbortError')return;englishLoop=null;status('点再听一遍，继续这一组声音。');});}}if(autoRemaining!==null&&[0,1,3].includes(state.chapter)&&state.auto!==false){autoRemaining-=delta;if(autoRemaining<=0){autoRemaining=null;if(store.muted&&state.chapter===3&&!state.filmSeen.includes(state.step)){state.filmSeen.push(state.step);save();}storyNext(true);}}},200);
document.addEventListener('visibilitychange',()=>{if(document.hidden){save();if(page==='class'&&!modal)pause();}});
window.addEventListener('pagehide',save);
window.addEventListener('hashchange',()=>route());
function route(){motion.cancel();stopVoice();closeModal();save();const match=location.hash.match(/^#(course|lesson|done)-(\d{2}|A[356]-\d{2})$/);if(match&&activate(match[2])){page=match[1]==='course'?'intro':match[1]==='done'&&state.finished?'summary':'class';}else page=location.hash==='#records'?'records':location.hash==='#ages'?'ages':'home';render(page!=='class');}
window.IslandApp={getState:()=>state,getCourse:()=>course,getStore:()=>store,journeyTarget,ageLessons,englishSteps,englishTasks,storageKey:KEY};
route();
})();
