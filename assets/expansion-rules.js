/* Pure rules for the 800 added lessons. */
(()=>{'use strict';function create(){return {version:1,done:false,choice:null,assign:{},selected:null,open:[],matched:[],memory:[],order:[],commands:[],position:null,path:[],observed:[],strokes:[],stones:[],feedback:'先听提示，再试一试。',attempts:0};}
function target(g){if(['word','meaning','investigate'].includes(g.kind))return g.answer;if(g.target!=null&&g.kind!=='shape')return g.target;if(g.kind==='shape')return g.options.indexOf(g.target);return g.options?.indexOf(g.answer)??0;}
function path(g){const q=[[g.start]],seen=new Set([g.start.join(',')]),blocked=new Set(g.walls.map(p=>p.join(',')));while(q.length){const p=q.shift(),last=p.at(-1);if(last.join()===g.goal.join())return p;for(const [dx,dy]of [[1,0],[0,-1],[-1,0],[0,1]]){const n=[last[0]+dx,last[1]+dy],k=n.join(',');if(n[0]<0||n[1]<0||n[0]>=g.size||n[1]>=g.size||seen.has(k)||blocked.has(k))continue;seen.add(k);q.push([...p,n]);}}return [];}
function line(stones,k){for(const [x,y,side]of stones)for(const [dx,dy]of [[1,0],[0,1],[1,1],[1,-1]])if(Array.from({length:k},(_,i)=>stones.some(s=>s[0]===x+i*dx&&s[1]===y+i*dy&&s[2]===side)).every(Boolean))return true;return false;}
function apply(l,s,action,v){s=JSON.parse(JSON.stringify(s));const g=l.game;if(s.done)return s;s.attempts++;s.feedback='再看一看，可以调整。';
if(action==='choose'&&g.kind==='investigate'&&s.observed.length<(l.age<=4?1:2)){s.feedback='先点观察卡看看证据。';return s;}if(action==='choose'){s.choice=v;s.done=v===target(g);s.feedback=s.done?'找到啦！画面和本关的方法对应上了。':'这一个还没对应上。看看图和线索，再选一次。';}
if(action==='select')s.selected=v;
if(action==='bucket'&&s.selected!=null){const cards=g.cards||[];if(cards[s.selected]?.to===v){s.assign[s.selected]=v;s.feedback='这一张放对啦。';s.selected=null;s.done=Object.keys(s.assign).length===cards.length;}else s.feedback='先保留这张，试试另一个位置。';}
if(action==='observe'){if(!s.observed.includes(v))s.observed.push(v);s.feedback=g.evidence;}
if(action==='move'){s.position||=g.start.slice();s.path=s.path.length?s.path:[g.start.slice()];const [x,y]=v,[cx,cy]=s.position;if(Math.abs(x-cx)+Math.abs(y-cy)!==1||g.walls.some(p=>p.join()===v.join())){s.feedback='一次走旁边的一格，树挡住的位置不能走。';return s;}s.position=v;s.path.push(v);s.done=v.join()===g.goal.join();s.feedback=s.done?'到小屋啦！这条路是你找到的。':'这一步走到了。接下来去哪一格？';}
if(action==='command')s.commands.push(v);
if(action==='undo-command')s.commands.pop();
if(action==='run'){s.position=g.start.slice();s.path=[g.start.slice()];for(const [i,cmd]of s.commands.entries()){const [dx,dy]={R:[1,0],L:[-1,0],U:[0,-1],D:[0,1]}[cmd],n=[s.position[0]+dx,s.position[1]+dy];if(n[0]<0||n[1]<0||n[0]>=g.size||n[1]>=g.size||g.walls.some(p=>p.join()===n.join())){s.feedback='第'+(i+1)+'条指令遇到了边界或障碍。修改这一步再试。';return s;}s.position=n;s.path.push(n);}s.done=s.position.join()===g.goal.join();s.feedback=s.done?'指令执行后到达目标。':'指令执行完了，还没到目标，可以继续补充。';}
if(action==='beat'){s.order.push(v);if(s.order.length>=g.pattern.length){s.done=s.order.join()===g.pattern.join();s.feedback=s.done?'节奏的先后对应上了。':'这一段保留在下面，可以重新听示范，再敲一段。';}}
if(action==='clear-beat')s.order=[];if(action==='sequence'){if(!s.order.includes(v))s.order.push(v);if(s.order.length===g.cards.length){s.done=s.order.every((n,i)=>n===i);s.feedback=s.done?'顺序对上了。':'再比较一下先后顺序。';}}if(action==='clear-sequence')s.order=[];
if(action==='flip'){const cards=memoryCards(l);if(s.matched.includes(v)||s.open.includes(v)||s.open.length>=2)return s;s.open.push(v);if(s.open.length===2){if(cards[s.open[0]].key===cards[s.open[1]].key){s.matched.push(...s.open);s.open=[];s.done=s.matched.length===cards.length;s.feedback=s.done?'成对的图片都找到了！':'这一对相同，留下来。';}else s.feedback='这两张不同，记住位置，再试一对。';}}
if(action==='cover')s.open=[];
if(action==='stone'){if([...g.stones,...s.stones].some(p=>p[0]===v[0]&&p[1]===v[1]))return s;s.stones.push([...v,1]);s.done=g.goal==='turn'||line([...g.stones,...s.stones],g.k);s.feedback=s.done?'这一步符合本关棋盘规则。':'再从横、竖、两条斜线找一找。';}
if(action==='participate'){s.done=true;s.feedback='已保存你的创作与参与，不评作品好坏。';}
return s;}
function memoryCards(l){const items=l.game.items||l.english.map(x=>({label:x.picture,html:x.pictureHTML})),cards=items.flatMap((v,i)=>[{key:i,label:typeof v==='object'?v.label:v,html:v.html||''},{key:i,label:typeof v==='object'?v.label:v,html:v.html||''}]);let seed=l.sequence*97+l.age*101;for(let i=cards.length-1;i>0;i--){seed=(seed*1664525+1013904223)>>>0;const j=seed%(i+1);[cards[i],cards[j]]=[cards[j],cards[i]];}return cards;}
window.ExpansionRules={create,apply,path,line,target,memoryCards};})();
