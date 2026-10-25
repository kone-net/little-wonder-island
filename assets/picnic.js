/* One-lesson interaction pilot. Course content and voice files remain shared;
   trial progress is deliberately independent from the published course journey. */
(()=>{
'use strict';
const root=document.getElementById('pMain'),audio=document.getElementById('pVoice'),dialog=document.getElementById('pDialog');
const course=COURSES.lessons.find(c=>c.id==='01'),E=GameEngine,KEY='little-wonder-island-picnic-simple-v1';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(act,label,cls='',extra='')=>`<button type="button" class="p-button ${cls}" data-action="${act}" ${extra}>${label}</button>`;
const nodes=[
 {id:'pack',group:0,type:'pack',clip:'L01-O01',title:'一起准备野餐',caption:'带上盘子和水，一起出发。',hint:'点一下，把它装进篮子。'},
 {id:'invite',group:0,type:'story',phase:'opening',frame:1,clip:'L01-O02',title:'朋友们，出发啦',caption:'你想邀请谁一起去野餐？',hold:4500},
 ...course.teaching.slice(1).map((x,i)=>({id:'teach'+i,group:0,type:'story',phase:'teach',frame:i,clip:x.id,title:i<2?'看看两边，一样多吗？':'一个给你，一个给我',caption:['一个和三个，一样多吗？','两边的苹果，一个一个找朋友。','轮流分：米米一个，点点一个。','每人两个，两边一样多。'][i]})),
 {id:'concept',group:0,type:'story',phase:'teach',frame:3,clip:'L01-K01',title:'这个方法，叫二等分',caption:'二等分：把一组物品分成一样多的两份。'},
 ...[0,1].map(round=>({id:'game'+round,group:1,type:'game',round,clip:`L01-G${round+1}`,title:round?'换成饼干，再试一次':'轮到你分苹果啦',caption:round?'把四块饼干分成一样多的两份。':'把四个苹果分给两位朋友，让两边一样多。',hint:'拖到盘子里；也可以先点物品，再点盘子。'})),
 ...course.film.map((x,i)=>({id:'film'+i,group:2,type:'film',phase:'film',frame:i,clip:x.id,title:'点点的苹果帽子',caption:x.text})),
 ...course.englishPlan.map((x,i)=>({id:'en'+i,group:3,type:'english',plan:x,clip:course.english[x.idx].id,title:x.options?'听一听，找一找':x.practice==='word'?'野餐里的英语朋友':x.practice==='find'?'在身边，也找一找':'跟朋友说一句',caption:x.options?(x.practice==='transfer'?'换位置啦，再听声音找一次。':'听到哪个，就点哪个。'):x.practice==='find'?'在身边指一指，也可以用手势。':x.practice==='dialogue'?'和家人轮流说，也可以先听。':'看亮起来的物品，听一听，跟着说。'})),
 {id:'move',group:4,type:'move',clip:'L01-M1',title:'我们来摘苹果',caption:'离开椅子，和米米伸伸手。',hint:'原地慢慢做，也可以坐着模仿。'},
 {id:'real',group:4,type:'real',clip:'L01-R1',title:'把发现带到生活里',caption:'四块积木、两个盘子，你来分一分。',hint:'分成一样多的两份，就是二等分。'},
 ...course.ending.map((x,i)=>({id:'ending'+i,group:4,type:'ending',phase:'ending',frame:i,clip:x.id,title:'谢谢你，小小野餐家',caption:i?'教教家人，怎样分才能一样多？':'点心分好啦，朋友们都笑了。'})),
 {id:'done',group:5,type:'done'}
];
const fresh=()=>({version:1,index:0,packed:[],games:{},english:{},slow:false,film:'original',finished:false,started:false});
let saved=fresh(),storageOK=true;
try{const v=JSON.parse(localStorage.getItem(KEY)||'null');if(v?.version===1&&Number.isInteger(v.index)&&v.index>=0&&v.index<nodes.length&&Array.isArray(v.packed)&&v.games&&v.english){saved={...saved,...v};for(const n of [0,1]){const g=saved.games[n];if(g&&(!Array.isArray(g.items)||g.items.length!==4||!g.items.every(x=>['left','right',null].includes(x.zone))))delete saved.games[n];}}}catch(_){storageOK=false;}
let screen='welcome',paused=false,serial=0,currentClip=null,packReady=false,quizReady=false,advancing=false,videoPlaying=false,round=0,repeatTotal=0,feedback='',blocked=false,focusBeforeDialog=null,guiding=false;
let timer=null,settler=null,replayTarget=null;
const node=()=>nodes[saved.index],meta=id=>COURSE_AUDIO[id],isCurrent=t=>t===serial&&screen==='lesson';
function persist(){try{localStorage.setItem(KEY,JSON.stringify(saved));storageOK=true;}catch(_){storageOK=false;}}
function stop(){serial++;guiding=false;audio.pause();audio.onended=audio.onerror=null;currentClip=null;quizReady=false;round=repeatTotal=0;blocked=false;advancing=false;clearTimeout(timer?.handle);timer=null;if(settler){const resolve=settler;settler=null;resolve(false);}document.querySelectorAll('.is-speaking').forEach(x=>x.classList.remove('is-speaking'));}
function wait(ms,t){return new Promise(resolve=>{if(!isCurrent(t))return resolve(false);settler=resolve;timer={remaining:ms,due:0,handle:null};const fire=()=>{timer=null;settler=null;resolve(isCurrent(t));};timer.fire=fire;if(!paused){timer.due=performance.now()+ms;timer.handle=setTimeout(fire,ms);}});}
function status(text){const el=document.getElementById('pStatus');if(el)el.textContent=text;}
function updateSpeaking(on){document.querySelectorAll('.p-vocab-card.focus-target').forEach(x=>x.classList.toggle('is-speaking',on));}
function clip(id,t){return new Promise(resolve=>{
 if(!isCurrent(t))return resolve(false);const m=meta(id);currentClip=id;replayTarget=id;settler=resolve;
 const fail=()=>{if(!isCurrent(t))return;blocked=true;settler=null;updateSpeaking(false);status('点“再听”继续声音');const p=document.getElementById('pHint');if(p)p.textContent='声音暂时没播放出来，点下方“再听”重试。';resolve(false);};
 if(!m)return fail();audio.src='assets/'+m.src;audio.defaultPlaybackRate=m.locale?.startsWith('en')&&saved.slow?.85:1;audio.playbackRate=audio.defaultPlaybackRate;
 audio.onended=()=>{if(!isCurrent(t))return;settler=null;updateSpeaking(false);resolve(true);};audio.onerror=fail;
 if(!paused)audio.play().then(()=>{if(isCurrent(t)){updateSpeaking(true);status(node().type==='english'?`第 ${round} / ${repeatTotal} 遍`:'听故事，慢慢来');}}).catch(e=>{if(e.name!=='AbortError')fail();});
 });}
async function sequence(ids,t,gap=450){for(let i=0;i<ids.length;i++){if(!await clip(ids[i],t))return false;if(i<ids.length-1&&!await wait(gap,t))return false;}return isCurrent(t);}
function art(phase='opening',frame=0){return `<div class="p-art">${Scenes.render(course,phase,frame)}</div>`;}
function apple(){return `<svg viewBox="-48 -52 96 96" aria-hidden="true">${StoryArt.apple(0,0,1)}</svg>`;}
function water(){return '<svg viewBox="0 0 120 140" aria-hidden="true"><ellipse cx="60" cy="129" rx="31" ry="6" fill="#789e9820"/><rect x="46" y="8" width="28" height="16" rx="4" fill="#779b85"/><path d="M45 24h30v20l17 17v52q0 13-13 13H41q-13 0-13-13V61l17-17Z" fill="#d8e9e3" stroke="#749b91" stroke-width="3"/><path d="M31 76q15-7 30 0t28 0v36q0 11-12 11H43q-12 0-12-11Z" fill="#a4cfce"/><rect x="33" y="83" width="54" height="25" rx="5" fill="#fff8e4"/><path d="M60 87q-13 14 0 17q13-3 0-17" fill="#87b8bf"/><path d="M37 59v14" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>';}
function cookie(){return '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="51" r="37" fill="#e7ba79" stroke="#c09255" stroke-width="3"/><circle cx="50" cy="50" r="30" fill="none" stroke="#efd0a0" stroke-width="2" stroke-dasharray="2 5"/><g fill="#9b7252"><circle cx="35" cy="39" r="4"/><circle cx="60" cy="33" r="4"/><circle cx="65" cy="61" r="4"/><circle cx="37" cy="65" r="4"/><circle cx="48" cy="50" r="3"/></g></svg>';}
function welcome(){screen='welcome';stop();root.innerHTML=`${!storageOK?'<p class="p-save-warning">本机进度暂时无法保存；请保持页面打开。</p>':''}<section class="p-welcome"><div class="p-welcome-copy"><div class="p-overline">4 岁 · 第 01 关 · 森林野餐开饭啦</div><h1>今天，去森林里<br>分一点<em>快乐。</em></h1><p>米米和点点准备开饭啦。<br>听个故事，分分点心，再学两句英语。</p>${button('start',saved.started&&!saved.finished?'继续上次的野餐　↗':saved.finished?'再去野餐一次　↗':'和朋友一起出发　↗','primary')}<div class="p-materials"><span>◷ 约 20 分钟</span><span>▱ 四件小物 · 两个盘子</span></div></div><div class="p-welcome-art">${Scenes.render(course,'opening',0)}<span>🐰 米米和点点，等你来做客</span></div></section><p class="p-intro-note">这是新交互样板，仅记录本次体验，不改变原课堂进度。<br>故事会自己往下讲，轮到你时会停下来等你。</p>`;}
function trail(){const titles=['听故事','分点心','看短片','说英语','生活里试试'];return `<ol class="p-trail" aria-label="课堂进度">${titles.map((s,i)=>`<li class="${node().group===i?'current':node().group>i?'done':''}" ${node().group===i?'aria-current="step"':''}><i>${node().group>i?'✓':i+1}</i>${s}</li>`).join('')}</ol>`;}
function getGame(){const n=node();return saved.games[n.round]||(saved.games[n.round]=E.create('share',n.round));}
function balance(){const g=getGame(),left=g.items.filter(x=>x.zone==='left').length,right=g.items.filter(x=>x.zone==='right').length;return {left,right,wrong:left+right===4&&left!==right};}
function itemHTML(x){return `<button type="button" class="item-btn ${getGame().selected===x.id?'selected':''}" data-action="item" data-act="selectItem" data-id="${x.id}" aria-label="${node().round?'饼干':'苹果'} ${Number(x.id.slice(-1))+1}" aria-pressed="${getGame().selected===x.id}" ${getGame().checked||guiding?'disabled':''}>${node().round?cookie():apple()}</button>`;}
function gameHTML(){const g=getGame(),b=balance();return `<div class="p-game ${g.checked?'p-success':b.wrong?'p-unbalanced':''}" id="pGame"><div class="p-concept"><b>二等分 · 平均分</b>分成一样多的两份</div>${g.checked?'<span class="p-success-mark" aria-hidden="true">✦</span>':''}<div class="p-source" aria-label="待分的点心">${g.items.filter(x=>!x.zone).map(itemHTML).join('')||`<span class="p-source-label ${b.wrong?'p-comparison':''}">${b.wrong?`米米 ${b.left} 个　≠　点点 ${b.right} 个`:'点心都送出去啦'}</span>`}</div><div class="p-plates">${['left','right'].map((z,i)=>`<div class="drop-zone ${b.wrong?(g.items.filter(x=>x.zone===z).length>2?'p-more':'p-fewer'):''}" data-action="plate" data-zone="${z}"><button class="zone-hit" data-action="plate" data-zone="${z}" aria-label="${i?'点点':'米米'}的盘子，${g.items.filter(x=>x.zone===z).length}个"><span>${i?'🦊':'🐰'}</span>${i?'点点':'米米'}的盘子</button><span class="p-plate-count" aria-hidden="true">${g.items.filter(x=>x.zone===z).length}</span><div class="p-plate-items">${g.items.filter(x=>x.zone===z).map(itemHTML).join('')}</div>${b.wrong?`<span class="p-balance-label">${g.items.filter(x=>x.zone===z).length>2?'多了，分一个出去':'少了，接一个过来'}</span>`:''}</div>`).join('')}</div></div>`;}
function englishHTML(){const n=node(),p=n.plan,answer=saved.english[n.id],keys=p.swap?['water','apple']:['apple','water'];return `<div class="p-english ${p.options?'p-quiz':''}"><span class="p-stage-tag">${p.practice==='word'?'看物品，听名字':p.options?'听音找物品':p.practice==='find'?'到身边找一找':'跟朋友说一句'}</span><div class="p-vocab">${keys.map(key=>`<button type="button" class="p-vocab-card ${!p.options&&p.focus===key?'focus-target':''} ${answer?.done&&answer.choice===key?'correct':''}" data-action="word" data-key="${key}" aria-label="${p.options?'选择'+(key==='apple'?'苹果':'水'):key}" ${p.options&&answer?.done?'disabled':''}>${key==='apple'?apple():water()}<span lang="en">${key==='apple'?'Apple':'Water'}</span></button>`).join('')}</div><div id="pRepeat" class="p-repeat" aria-live="off"></div></div>`;}
function filmAssignment(){const assignment=LESSON_VIDEOS['01'];return ISLAND_SONGS.find(x=>x.id===assignment.videoId);}
function filmHTML(){if(saved.film!=='song')return art('film',node().frame);const song=filmAssignment();return `<div class="p-cinema">${videoPlaying?`<iframe title="${esc(song.title)} 官方视频" src="${esc(IslandVideo.embedURL(song.videoId))}" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`:`<div class="p-video-cover"><span>🎬</span><div class="p-overline">${esc(song.publisher||'Super Simple Songs')}</div><h2>${esc(song.title)}</h2><p>看看朋友怎样一人分一份。</p>${button('playVideo','▶ 播放这一集','primary')}</div>`}</div>`;}
function bodyHTML(){const n=node();if(n.type==='pack')return `${art()}<div class="p-pack">${[['plate','🍽️','盘子'],['water','💧','水']].map(([id,icon,label])=>`<button type="button" data-action="pack" data-key="${id}" class="${saved.packed.includes(id)?'packed':''}" aria-label="装好${label}" aria-pressed="${saved.packed.includes(id)}"><span aria-hidden="true">${icon}</span>${label}</button>`).join('')}</div>`;
 if(n.type==='game')return gameHTML();if(n.type==='english')return englishHTML();if(n.type==='film')return filmHTML();
 if(n.type==='real'||n.type==='move')return `<div class="p-living">${art(n.type==='real'?'home':'move')}<div class="p-real-card"><span aria-hidden="true">${n.type==='real'?'🧱　🍽️':'🌳　🍎'}</span><h2>${n.type==='real'?'四件小物，分给两个人':'伸伸手，摘个苹果'}</h2><p>${n.type==='real'?'用积木、瓶盖都可以。<br>先自己分，再看看两边一样多吗？':'换一只手，再摘一摘。<br>做一棵轻轻摇摆的小树。'}</p></div></div>`;
 return art(n.phase,n.frame);
}
function primary(){const n=node();if(n.type==='game'&&balance().wrong&&!guiding)return button('guideGame','带我分一遍','primary');if(n.type==='real')return button('next','我们分好啦　→','primary');if(n.type==='move')return button('next','我活动好啦　→','primary');if(n.type==='english'&&n.id==='en11')return button('next','我们试过啦　→','primary');if(n.type==='film'&&saved.film==='song'&&videoPlaying)return button('videoDone','看完了，继续　→','primary');return '';}
function lesson(){screen='lesson';const n=node();if(n.type==='done')return complete();feedback='';root.innerHTML=`${!storageOK?'<p class="p-save-warning">本机进度暂时无法保存；请保持页面打开。</p>':''}${trail()}<section class="p-lesson" aria-label="森林野餐课堂"><header class="p-scene-head"><h1><small>4 岁 · 第 1 关 · 森林野餐开饭啦</small>${esc(n.title)}</h1><span class="p-chip">${n.group===1?'二等分':n.group===3?'Apple · Water':'和朋友一起'}</span></header><div class="p-stage" id="pStage">${bodyHTML()}</div><div class="p-caption"><span class="p-guide" aria-hidden="true">🐰</span><div><h2 id="pCaption">${esc(n.caption)}</h2><p id="pHint">${esc(n.hint||(n.type==='film'?'只管看故事，不用答题。':n.type==='english'?'每个词句重复读，留出跟读时间。':'故事会继续，轮到你时等你。'))}</p></div></div><div class="p-dock"><button class="p-tool" type="button" data-action="pause" aria-label="暂停课堂">Ⅱ 暂停</button><button class="p-tool" type="button" data-action="replay">↻ 再听</button>${n.type==='game'?'<button class="p-tool" type="button" data-action="help">? 帮帮我</button>':''}${n.type==='english'?`<button class="p-tool" type="button" data-action="slow" aria-pressed="${saved.slow}">◷ ${saved.slow?'慢速已开':'慢一点'}</button>`:''}<span class="p-status" id="pStatus" role="status"></span>${primary()}</div></section><p class="p-footnote">${n.type==='real'?'不赶时间，准备好了再回来。':'小小奇遇岛 · 你的每一次尝试，都算数。'}</p>`;}
function complete(){screen='complete';saved.finished=true;persist();root.innerHTML=`${trail()}<section class="p-complete"><span class="p-medal" aria-hidden="true">🍎</span><div class="p-overline">森林野餐 · 今天完成啦</div><h1>谢谢你，<br>小小野餐家。</h1><p>今天认识了「二等分」，<br>还和 Apple、Water 交了朋友。<br>下次吃点心，也可以试着分一分。</p>${button('rest','今天先休息','primary')}<small>本关体验已保存 · 学习记录不代表能力测评</small><button type="button" class="p-tool" data-action="again">↻ 再玩一次</button></section>`;}
function refreshGame(){const el=document.getElementById('pGame');if(el)el.outerHTML=gameHTML();const help=root.querySelector('[data-action="help"]');if(help)help.disabled=guiding;root.querySelector('[data-action="guideGame"]')?.remove();const dock=root.querySelector('.p-dock');if(dock)dock.insertAdjacentHTML('beforeend',primary());}
function hintText(text){feedback=text;const el=document.getElementById('pHint');if(el)el.textContent=text;}
function next(){if(paused||screen!=='lesson')return;stop();motion.cancel();saved.index=Math.min(nodes.length-1,saved.index+1);saved.started=true;persist();videoPlaying=false;lesson();run();}
async function advance(t,delay=650){if(!isCurrent(t)||advancing)return;advancing=true;if(await wait(delay,t))next();}
async function run(){
 stop();if(screen!=='lesson')return;const t=serial,n=node();packReady=false;const primaryEl=root.querySelector('.p-dock .primary');if(primaryEl&&['real','move','english'].includes(n.type))primaryEl.disabled=true;
 if(n.type==='pack'){if(await clip(n.clip,t)){packReady=true;status('等你把盘子和水装好');maybePacked(t);}return;}
 if(n.type==='game'){const g=getGame();refreshGame();if(g.checked){await celebrate(t);return;}if(balance().wrong){await explainUnequal(t);return;}if(await clip(n.clip,t))status('轮到你啦，不着急');return;}
 if(n.type==='film'&&saved.film==='song'){status('可以播放本关儿歌');return;}
 if(n.type==='english'){const p=n.plan;repeatTotal=p.repeats||3;for(let i=1;i<=repeatTotal;i++){round=i;updateRepeat();if(!await clip(n.clip,t))return;if(i<repeatTotal){status('轮到你说一说');if(!await wait(p.practice==='word'?1800:3000,t))return;}}
  if(p.options){quizReady=true;status('听到了什么？点物品');if(saved.english[n.id]?.done)await advance(t,900);}
  else if(n.id==='en11'){status('和家人轮流说一说');if(primaryEl)primaryEl.disabled=false;}
  else{status(p.practice==='find'?'在身边找一找':'轮到你说一说');await advance(t,p.practice==='find'?10000:p.practice==='dialogue'?6000:3000);}return;
 }
 if(n.type==='move'){for(let i=0;i<course.movement.length;i++){if(!await clip(course.movement[i].id,t))return;if(i===0&&primaryEl)primaryEl.disabled=false;if(!await wait(i===2?11000:8000,t))return;}status('活动好了，就回来吧');return;}
 if(n.type==='real'){if(await clip(n.clip,t)){if(primaryEl)primaryEl.disabled=false;status('等你动手，准备好再继续');}return;}
 if(n.type==='done')return;
 if(await clip(n.clip,t))await advance(t,n.hold||450);
}
function updateRepeat(){const el=document.getElementById('pRepeat');if(el)el.innerHTML=`${Array.from({length:repeatTotal},(_,i)=>`<i class="${i<round?'on':''}"></i>`).join('')}<span>第 ${round} / ${repeatTotal} 遍 · 留一点时间跟着说</span>`;}
function maybePacked(t=serial){if(isCurrent(t)&&packReady&&saved.packed.includes('plate')&&saved.packed.includes('water')){hintText('盘子和水都带好啦！');advance(t,650);}}
async function celebrate(t){hintText('每人两个，一样多。这就叫二等分！');status('分好啦，故事继续');if(await clip('common-done',t))await advance(t,1800);}
async function explainUnequal(t){const b=balance(),from=b.left>b.right?'米米':'点点',to=b.left>b.right?'点点':'米米';document.getElementById('pCaption').textContent=`米米 ${b.left} 个，点点 ${b.right} 个，还不一样多。`;hintText(`看看哪边多？从${from}的盘子拿一个给${to}。也可以点“带我分一遍”看示范。`);if(await clip('L01-H2',t))status('调整后会自动检查');}
async function guideGame(){stop();const t=serial,g=getGame();guiding=true;g.assisted=true;g.checked=false;g.selected=null;const before=motion.snapshot();g.items.forEach(x=>x.zone=null);persist();refreshGame();motion.settle(before);document.getElementById('pCaption').textContent='一起看示范：一个给你，一个给我。';hintText('轮流分，最后两边都是两个。');status('正在示范');
 if(!await clip('L01-T03',t))return;
 for(let i=0;i<4;i++){if(!await wait(950,t))return;const positions=motion.snapshot(),zone=i%2?'right':'left';E.move(g,g.items[i].id,zone);persist();refreshGame();motion.settle(positions,g.items[i].id,zone);}
 if(!isCurrent(t))return;guiding=false;E.check(g);persist();refreshGame();stop();await celebrate(serial);
}
function moveItem(id,zone,rect){if(screen!=='lesson'||paused||dialog.open||guiding||node().type!=='game'||getGame().checked)return false;const g=getGame(),before=motion.snapshot();if(rect)before.set(id,rect);if(!E.move(g,id,zone))return false;persist();refreshGame();motion.settle(before,id,zone);
 if(g.items.every(x=>x.zone)){const result=E.check(g);persist();stop();const t=serial;refreshGame();motion.settle(before,id,zone);if(result.good){document.getElementById('pCaption').textContent='每人两个，一样多。二等分成功啦！';celebrate(t);}else explainUnequal(t);}else{document.getElementById('pCaption').textContent=node().caption;hintText('送过去啦，再分一个。');}root.querySelector(`.zone-hit[data-zone="${zone}"]`)?.focus({preventScroll:true});return true;}
const motion=IslandMotion.create(root,{enabled:()=>screen==='lesson'&&!paused&&!dialog.open&&!guiding&&node().type==='game'&&!getGame().checked,onDrop:moveItem});
async function chooseWord(key){const n=node(),p=n.plan;if(!p.options){if(key!==p.focus)hintText('现在先听亮起来的这一个，马上轮到另一位朋友。');else run();return;}
 if(saved.english[n.id]?.done||advancing)return;if(!quizReady){hintText('可以先听完，也可以现在选。');}
 const el=root.querySelector(`[data-key="${key}"]`);if(key!==p.answer){el?.classList.remove('wrong');void el?.offsetWidth;el?.classList.add('wrong');hintText('再听声音，看看是苹果，还是水。');if(quizReady){stop();const t=serial;repeatTotal=1;round=1;updateRepeat();await clip(n.clip,t);if(isCurrent(t))quizReady=true;}return;}
 saved.english[n.id]={done:true,choice:key};persist();stop();const t=serial;el?.classList.add('correct');root.querySelectorAll('.p-vocab-card').forEach(x=>x.disabled=true);hintText('找到了，声音和物品对应上啦！');status('你找到啦');await advance(t,1600);
}
function freeze(){if(paused)return;paused=true;motion.cancel();audio.pause();if(timer){clearTimeout(timer.handle);timer.remaining=Math.max(0,timer.due-performance.now());}updateSpeaking(false);document.body.classList.add('p-paused');
 if(videoPlaying){videoPlaying=false;root.querySelector('iframe')?.remove();const stage=document.getElementById('pStage');if(stage)stage.innerHTML=filmHTML();root.querySelector('[data-action="videoDone"]')?.remove();}
}
function thaw(){if(!paused)return;paused=false;document.body.classList.remove('p-paused');if(timer){timer.due=performance.now()+timer.remaining;timer.handle=setTimeout(timer.fire,timer.remaining);}else if(settler&&audio.src&&!audio.ended&&!blocked)audio.play().then(()=>updateSpeaking(true)).catch(()=>{blocked=true;const resolve=settler;settler=null;status('点“再听”继续声音');resolve?.(false);});}
function showDialog(kind){focusBeforeDialog=document.activeElement;freeze();const parent=kind==='parent';dialog.innerHTML=`<h2 id="pDialogTitle">${parent?'给陪伴的大人':'小小休息一下。'}</h2><p>${parent?'新交互样板：故事自动衔接，游戏分对后自动继续。英语保留原 Heart 慢速音频，中文使用 Cherry 复刻。':'故事和活动都在等你。准备好了，再一起回去。'}</p>${button('resume','▶ 继续野餐','primary')}${parent?`<div class="p-parent-options">${button('toggleFilm',saved.film==='song'?'短片：英文儿歌 · 换回原创故事':'短片：原创故事 · 换成本关英文儿歌','secondary')}${button('parentSkip','这一小步留到稍后','secondary')}${button('exit','保存并回到体验首页','secondary')}</div><details><summary>查看或回到一个环节</summary><div class="p-chapters">${[['pack','故事'],['game0','分点心'],['film0','短片'],['en0','英语'],['move','生活练习']].map(([id,s])=>`<button type="button" data-action="jump" data-node="${id}">${s}</button>`).join('')}</div></details><details><summary>这段旁白的完整文字</summary><div class="p-transcript">${esc(meta(currentClip||replayTarget||node().clip)?.text||'点击开始后，旁白会出现在这里。')}</div></details><details><summary>视频无法播放时</summary><p>英文儿歌来自官方 YouTube，可能受登录、网络或地区限制。可以换回本地原创故事继续上课。暂停课堂会关闭外部播放器，再次播放会重新开始。</p><a href="https://www.youtube.com/watch?v=${filmAssignment().videoId}" target="_blank" rel="noopener">打开官方原片 ↗</a></details>${button('restart','重新体验这一关','secondary')}`:button('exit','保存，今天先休息','secondary')}`;if(!dialog.open)dialog.showModal();}
function closeDialog(){dialog.close();thaw();if(focusBeforeDialog?.isConnected)focusBeforeDialog.focus();}
function restart(){dialog.close();paused=false;document.body.classList.remove('p-paused');stop();saved=fresh();persist();welcome();}
document.getElementById('parentOpen').addEventListener('click',()=>showDialog('parent'));
document.addEventListener('click',e=>{if(motion.consumeClick(e))return;const el=e.target.closest('[data-action]');if(!el||el.disabled)return;const a=el.dataset.action;
 if(a==='start'){if(saved.finished)saved=fresh();saved.started=true;persist();screen='lesson';lesson();run();return;}
 if(a==='resume'){closeDialog();return;}if(a==='exit'){dialog.close();paused=false;document.body.classList.remove('p-paused');stop();persist();welcome();return;}
 if(a==='pause'){showDialog('pause');return;}if(a==='restart'){dialog.innerHTML=`<h2 id="pDialogTitle">从头去一次野餐？</h2><p>只重置这份样板的体验进度，原课堂记录保留。</p>${button('confirmRestart','从头开始','primary')}${button('resume','保留进度，继续','secondary')}`;return;}if(a==='confirmRestart'||a==='again'){restart();return;}
 if(a==='toggleFilm'){saved.film=saved.film==='song'?'original':'song';persist();if(node().type==='film'&&screen==='lesson'){stop();videoPlaying=false;saved.index=nodes.findIndex(n=>n.id==='film0');lesson();run();}showDialog('parent');return;}
 if(a==='jump'){dialog.close();paused=false;document.body.classList.remove('p-paused');stop();saved.index=nodes.findIndex(n=>n.id===el.dataset.node);saved.started=true;persist();lesson();run();return;}
 if(a==='parentSkip'){dialog.close();paused=false;document.body.classList.remove('p-paused');if(screen==='lesson'){stop();saved.index=node().type==='film'?nodes.findIndex(n=>n.id==='en0'):Math.min(nodes.length-1,saved.index+1);persist();lesson();run();}else welcome();return;}
 if(a==='rest'){welcome();return;}
 if(paused||screen!=='lesson')return;
 if(a==='pack'){if(!saved.packed.includes(el.dataset.key))saved.packed.push(el.dataset.key);el.classList.add('packed');el.setAttribute('aria-pressed','true');persist();maybePacked();return;}
 if(a==='item'){if(getGame().checked||guiding)return;getGame().selected=getGame().selected===el.dataset.id?null:el.dataset.id;refreshGame();if(getGame().selected)hintText('选好啦，现在点另一个盘子的空白处，把它送过去。');root.querySelector(`[data-id="${el.dataset.id}"]`)?.focus({preventScroll:true});return;}
 if(a==='plate'){if(getGame().selected)moveItem(getGame().selected,el.dataset.zone);else hintText('先选一个点心，再点盘子；也可以直接拖过来。');return;}
 if(a==='replay'){run();return;}
 if(a==='guideGame'){guideGame();return;}
 if(a==='help'){stop();clip('L01-H3',serial);hintText('先给米米一个，再给点点一个。分过的点心，还能搬到另一个盘子里。');return;}
 if(a==='word'){chooseWord(el.dataset.key);return;}
 if(a==='slow'){saved.slow=!saved.slow;persist();el.setAttribute('aria-pressed',String(saved.slow));el.textContent='◷ '+(saved.slow?'慢速已开':'慢一点');audio.defaultPlaybackRate=saved.slow?.85:1;audio.playbackRate=audio.defaultPlaybackRate;return;}
 if(a==='next'){next();return;}
 if(a==='playVideo'){videoPlaying=true;document.getElementById('pStage').innerHTML=filmHTML();root.querySelector('.p-dock').insertAdjacentHTML('beforeend',primary());status('看一集就好');return;}
 if(a==='videoDone'){saved.index=nodes.findIndex(n=>n.id==='en0')-1;next();return;}
});
dialog.addEventListener('cancel',e=>{e.preventDefault();closeDialog();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.open&&screen==='lesson')showDialog('pause');});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&screen==='lesson'&&!dialog.open)showDialog('pause');});
window.addEventListener('pagehide',persist);
window.PicnicPilot={getState:()=>structuredClone(saved),getNode:()=>({...node()}),storageKey:KEY};
welcome();
})();
