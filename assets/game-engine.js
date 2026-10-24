(function(root){
'use strict';
const rounds={share:2,party:1,color:3,shape:3,weather:3,position:3,action:4,pattern:4,emotion:3,shadow:3};
const item=(id,color,shape)=>({id,color,shape,zone:null});
function create(mode,round=0,config=null){
 const s={mode,round,selected:null,choice:null,checked:false,attempts:0,hints:0};
 if(config){s.config=config;const t=config.tasks[round];if(t.items)s.items=t.items.map(x=>({...x,zone:x.zone??null}));if(['shape','assemble'].includes(t.kind))s.windows=Object.fromEntries(t.zones.map(z=>[z,null]));if(t.kind==='route'){s.position=[...t.start];s.visited=[s.position.join(',')];}if(t.kind==='sequence')s.order=[];if(t.kind==='experiment')s.observed=[];if(t.kind==='counter')s.counter=t.start;return s;}
 if(['share','party'].includes(mode))s.items=[0,1,2,3].map(i=>item('item'+i,'red',mode==='party'?'cake':round?'cookie':'apple'));
 if(mode==='color'){s.items=(round===0?[item('r','red','circle'),item('b','blue','circle')]:[item('rc','red','circle'),item('bs','blue','square'),item('rs','red','square'),item('bc','blue','circle')]);if(round===2)s.items.forEach((x,i)=>x.zone=i===0?'blue':x.color);}
 if(mode==='shape'){s.items=[item('c','green','circle'),item('s','green','square')];if(round===1)s.items.push(item('c2','gold','circle'),item('s2','blue','square'));s.windows={circle:round===2?'s':null,square:round===2?'c':null};}
 return s;
}
function task(s){
 if(s.config)return s.config.tasks[s.round];
 const r=s.round;
 if(s.mode==='share'||s.mode==='party')return {prompt:s.mode==='party'?'四份点心，两位朋友。你想怎样分？先自己试一试。':r?'换成四块饼干。刚才的办法还能用吗？':'把四个苹果分给两位朋友，让两边一样多。',kind:'distribute',zones:['left','right']};
 if(s.mode==='color')return {prompt:r===2?'只有一件放错了，找一找，给它换个颜色小屋。':'先看颜色，再选相同颜色的小屋。形状可以不一样。',kind:'distribute',zones:['red','blue']};
 if(s.mode==='shape')return {prompt:r===2?'两扇窗片放反了。看着边，把它们换回来。':'沿着窗洞的边看一看。拿歪的方片也能转过来。',kind:'shape',zones:['circle','square']};
 if(s.mode==='weather')return {prompt:['画里在下雨。什么能帮玩偶挡住雨？','太阳出来啦。选一样适合晴天出门的东西。','今天先在屋里玩。你想和朋友做什么？'][r],kind:'choices',options:[[['umbrella','雨伞','☂️'],['coat','雨衣','🧥'],['ball','皮球','⚽']],[['hat','遮阳帽','👒'],['ball','皮球','⚽'],['coat','雨衣','🧥']],[['draw','一起画画','🖍️'],['blocks','搭积木','🧱'],['rain','去淋雨','🌧️']]][r],answers:[['umbrella','coat'],['hat','ball'],['draw','blocks']][r]};
 if(s.mode==='position')return {prompt:['把小猫放到桌子下面。先找到桌面。','现在，请小猫来到桌子上面。','换成小凳子。把小猫放到凳面下面。'][r],kind:'position',answers:[r===1?'on':'under']};
 if(s.mode==='action')return {prompt:['让玩偶听见 Walk 后走起来。','听见 Stop，让玩偶慢慢停下来。','再听一次 Walk，选一个动作。','再听一次 Stop，玩偶会怎么做？'][r],kind:'choices',options:[['walk','走起来','🚶'],['stop','停下来','✋']],answers:[r%2?'stop':'walk'],english:r%2?'Stop.':'Walk.'};
 if(s.mode==='pattern')return {prompt:r===3?'最后一节车厢站错了，保留前面三节，修好最后一节。':'看看重复的小队。接下来是哪一节？',kind:'pattern',sequence:r===2?['circle','square','circle','square']:r===1?['red','blue','red','blue','red']:r===3?['red','blue','red']:['red','blue','red','blue'],wrongTail:r===3?'red':null,options:r===2?[['circle','圆车厢','●'],['square','方车厢','■']]:[['red','红车厢','🔴'],['blue','蓝车厢','🔵']],answers:[r===2?'circle':r===0?'red':'blue']};
 if(s.mode==='emotion')return {prompt:['小塔倒了。点点说：“我有点难过。”哪张图和他说的感受相同？','朋友难过的时候，你想怎样回应？可以有不同办法。','点点说：“我想安静坐一会儿。”现在怎样陪他？'][r],kind:'choices',options:r===0?[['sad','塔倒了，有点难过','🧱 ☁️'],['happy','作品搭好，很开心','🏡 ☀️']]:r===1?[['ask','问问：你想要什么帮助？','💬'],['sit','在旁边陪一会儿','🪑'],['build','问他要不要一起重搭','🧱'],['force','马上笑，不许难过','🙅']]:[['sit','安静陪坐，给他一点时间','🪑'],['force','强拉着他马上玩','🙅']],answers:r===0?['sad']:r===1?['ask','sit','build']:['sit']};
 if(s.mode==='shadow')return {prompt:['灯和纸不动，把积木放进光路，看纸面有什么变化。','只移开积木，再看看纸上的暗区。','换一个圆形物体挡住光，看看影子有没有变化。'][r],kind:'shadow',options:r===2?[['circle','换成圆片','●'],['block','保留方块','■']]:[['in','放进光路','🧱'],['out','移出光路','↗']],answers:[r===0?'in':r===1?'out':'circle']};
 throw Error('Unknown mode '+s.mode);
}
function move(s,id,zone){
 if(s.checked)return false;
 if(!s.items?.some(x=>x.id===id))return false;
 const t=task(s);if(!t.zones?.includes(zone))return false;
 if(s.windows){
   for(const z of Object.keys(s.windows))if(s.windows[z]===id)s.windows[z]=null;
   s.windows[zone]=id;
 }else s.items.find(x=>x.id===id).zone=zone;
 s.selected=null;return true;
}
function check(s){
 s.attempts++;
 let good=false,reason='choice';
 if(s.config){
  const t=task(s);
  if(t.kind==='distribute'){good=s.items.every(x=>x.zone!==null);reason=good?'arrangement':'remaining';if(t.zoneCounts)good=good&&t.zones.every((z,i)=>s.items.filter(x=>x.zone===z).length===t.zoneCounts[i]);else good=good&&s.items.every(x=>x.zone===x.answerZone);}
  else if(t.kind==='shape'||t.kind==='assemble'){good=t.zones.every(z=>s.items.find(x=>x.id===s.windows[z])?.shape===t.expected[z]);reason='shape';}
  else if(t.kind==='sequence'){good=(t.validOrders||[t.answer]).some(order=>order.join(',')===s.order.join(','));reason='sequence';}
  else if(t.kind==='route'){good=s.position.join(',')===t.goal.join(',')&&(t.required||[]).every(p=>s.visited.includes(p.join(',')));reason='route';}
  else if(t.kind==='counter'){good=s.counter===t.target;reason='count';}
  else if(t.kind==='experiment'){if(t.options.some(x=>x[0]===s.choice)){if(!s.observed.includes(s.choice))s.observed.push(s.choice);good=t.options.every(x=>s.observed.includes(x[0]));reason='observe';}else reason='choice';}
  else good=t.answers.includes(s.choice);
  s.checked=good;return {good,reason:good?'done':reason};
 }
 if(['share','party'].includes(s.mode)){const left=s.items.filter(x=>x.zone==='left').length,right=s.items.filter(x=>x.zone==='right').length;good=left===2&&right===2;reason=left+right<4?'remaining':'unequal';}
 else if(s.mode==='color'){good=s.items.every(x=>x.zone===x.color);reason=s.items.some(x=>x.zone===null)?'remaining':'color';}
 else if(s.mode==='shape'){good=Object.entries(s.windows).every(([zone,id])=>s.items.find(x=>x.id===id)?.shape===zone);reason='shape';}
 else good=task(s).answers.includes(s.choice);
 s.checked=good;return {good,reason:good?'done':reason};
}
function roundCount(s){return s.config?s.config.tasks.length:rounds[typeof s==='string'?s:s.mode];}
function next(s){return s.checked&&s.round+1<roundCount(s)?create(s.mode,s.round+1,s.config):null;}
function walk(s,direction){const t=task(s);if(t.kind!=='route'||s.checked)return false;const delta={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[direction];if(!delta)return false;const p=s.position.map((v,i)=>v+delta[i]);if(p[0]<0||p[1]<0||p[0]>=t.cols||p[1]>=t.rows||(t.blocked||[]).some(b=>b.join(',')===p.join(',')))return false;s.position=p;if(!s.visited.includes(p.join(',')))s.visited.push(p.join(','));return true;}
function hint(s){s.hints++;return task(s).hint||(task(s).kind==='distribute'?'把物品选中，再点一个位置。分过的物品也能再搬动。':s.mode==='shape'?'先沿着窗洞的边走一圈。圆片没有角，方片有四个角。':s.mode==='pattern'?'用手框住两个一组的小队，再看看下一组。':s.mode==='shadow'?'灯在左边，纸在右边。看看中间的物体有没有挡住光。':'先看画面，听听角色的请求，再试一种办法。');}
const api={create,task,move,check,next,hint,rounds,roundCount,walk};if(typeof module!=='undefined')module.exports=api;root.GameEngine=api;
})(typeof window==='undefined'?globalThis:window);
