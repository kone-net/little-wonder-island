(function(root){'use strict';const B=typeof module!=='undefined'&&module.exports?require('./board-rules.js'):root.BoardRules;
const clone=x=>JSON.parse(JSON.stringify(x));
function create(t){const s={done:false,feedback:'',attempts:0,selected:null,choice:null,order:[],assign:{},values:(t.fields||[]).map(f=>f.start??f.min??0),observed:[],marks:[],strokes:[],text:'',reported:false,commands:[],repeat:1,history:[],moves:0,replies:0,tried:[],turn:1};if(t.kind==='circuit'){s.wires=[true,true,false,true];s.switchClosed=false;s.powerStates=[false];}if(t.kind==='sequence')s.order=t.cards.map((_,i)=>i).reverse();if(t.kind==='route'||t.kind==='program'){s.position=t.start.slice();s.path=[t.start.slice()];}if(t.kind==='board'){s.board=B.gomoku(t.size,t.stones);s.pieces=clone(t.pieces||[]);s.selected=t.pieceId||null;}return s;}
function assess(t,s){if(s.done)return {ok:true,text:s.feedback};
 switch(t.kind){
 case 'choice':return {ok:(t.answers||[]).includes(s.choice),text:s.choice==null?'先作一个选择。':(t.explanations?.[s.choice]||((t.answers||[]).includes(s.choice)?t.success:t.hint))};
 case 'number':{const targets=t.fields.map(f=>f.target);let ok=s.values.every((v,i)=>v===targets[i]);if(t.rule==='linear')ok=s.values[1]===2*s.values[0]+1&&s.tried.length>=2;return {ok,text:ok?t.success:'再看每一项的数量、单位和题目条件。'+t.hint};}
 case 'sort':{const wrong=t.cards.filter((c,i)=>s.assign[i]!==c.to);return {ok:!wrong.length,text:wrong.length?'还有 '+wrong.length+' 项需要检查。'+t.hint:t.success};}
 case 'sequence':return {ok:s.order.every((n,i)=>n===i),text:s.order.every((n,i)=>n===i)?t.success:t.hint};
 case 'experiment':return {ok:s.observed.length>=(t.minimum||2)&&(t.answers||[]).includes(s.choice),text:s.observed.length<(t.minimum||2)?'先记录至少两种条件，再比较。':(t.explanations?.[s.choice]||((t.answers||[]).includes(s.choice)?t.success:t.hint))};
 case 'studio':return {ok:!!(s.reported||s.text.trim()||s.strokes.length),reported:true,text:s.reported||s.text.trim()||s.strokes.length?'已保存你的作品或动手记录；可以用下面的观察点和家人交流。':'可以画、写，也可以完成口述或真实动作后点“我已口述／动手”。'};
 case 'circuit':return {ok:!!(s.wires?.every(Boolean)&&s.switchClosed&&s.powerStates.includes(true)&&s.powerStates.includes(false)),text:s.wires?.every(Boolean)&&s.switchClosed?t.success:'回路还没闭合，检查导线缺口与开关。'};
 case 'route':return {ok:s.position.join()===t.target.join()&&(!t.via||s.path.some(p=>p.join()===t.via.join())),text:s.position.join()!==t.target.join()?'还没到目标。'+t.hint:t.via&&!s.path.some(p=>p.join()===t.via.join())?'还需要先经过取件点。':t.success};
 case 'program':return {ok:!!(s.ran&&s.position.join()===t.target.join()&&s.commands.length===t.unitLength&&s.repeat===t.repetitions),text:s.ran?'比较终点、重复单元和次数，符合任务才完成。':'先安排重复单元和次数，再运行。'};
 case 'rhythm':return {ok:s.order.join()===t.pattern.join(),text:s.order.join()===t.pattern.join()?t.success:t.hint};
 case 'debug':return {ok:!!(s.flags?.wall&&s.flags?.edge&&[0,1,2].every(i=>s.testRuns?.[i]==='11')),text:s.flags?.wall&&s.flags?.edge?'启用两条规则后，复测正常、障碍和边界三种情境。':'检查“先判断障碍”和“先判断边界”两条规则。'};
 case 'board':{
 if(t.mode==='mark'){const expected=t.candidates.filter(p=>B.pseudo(t.pieces,t.pieceId,p[0],p[1])).map(p=>p.join());return {ok:expected.length===s.marks.length&&expected.every(p=>s.marks.includes(p)),text:t.hint};}
 if(t.game==='xiangqi'){const goal=t.goal;let ok=false;if(s.moves){if(goal==='safe')ok=!B.checked(s.pieces,'r');else if(goal==='mate')ok=B.mate(s.pieces,'b');else if(goal==='protect')ok=B.attackSquare(s.pieces,'r',2,7)&&B.attackSquare(s.pieces,'r',8,6);else ok=s.pieces.some(p=>p.id===t.pieceId&&p.x===t.target[0]&&p.y===t.target[1]);}return {ok,text:ok?t.success:t.hint};}
 const own=B.winLine(s.board,t.size,1,t.k||5),enemyWins=B.winningSpots(s.board,t.size,2,t.k||5);
 if(t.goal==='turn')return {ok:s.moves>=t.count,text:s.moves>=t.count?t.success:'轮流再放几枚，已经放了 '+s.moves+' 枚。'};
 if(t.goal==='align'){const ones=s.board.map((v,i)=>v===1?[i%t.size,Math.floor(i/t.size)]:null).filter(Boolean),line=ones.length===3&&(ones.every(p=>p[0]===ones[0][0])||ones.every(p=>p[1]===ones[0][1]));return {ok:line,text:line?t.success:t.hint};}
 if(t.goal==='family')return {ok:!!B.winLine(s.board,t.size,1,t.k)||!!B.winLine(s.board,t.size,2,t.k)||s.board.every(Boolean),text:t.success};
 if(t.goal==='defend')return {ok:s.moves===1&&(!!own||enemyWins.length===0),text:enemyWins.length?'对方还有一个立即连五的位置，试着检查四个方向。':t.success};
 if(t.goal==='win2')return {ok:s.moves>=2&&s.replies>=1&&!!own,text:own?t.success:t.hint};
 if(t.goal==='fork')return {ok:s.moves>0&&B.winningSpots(s.board,t.size,1,t.k||5).length>=2,text:t.hint};
 return {ok:!!own,text:own?t.success:t.hint};
 }
 default:return {ok:false,text:'任务配置需要检查。'};
 }}
function apply(t,state,action,value){const s=clone(state);if(s.done&&action!=='undo')return s;
 if(action==='choose')s.choice=Number(value);
 if(action==='select')s.selected=Number(value);
 if(action==='assign'&&s.selected!=null){s.assign[s.selected]=Number(value);s.selected=null;}
 if(action==='value'){const [i,delta]=value;s.values[i]=Math.min(t.fields[i].max,Math.max(t.fields[i].min,s.values[i]+delta));s.values[i]=Math.round(s.values[i]*100)/100;if(i===0&&!s.tried.includes(s.values[0]))s.tried.push(s.values[0]);}
 if(action==='reorder'){const [i,d]=value,j=i+d;if(j>=0&&j<s.order.length)[s.order[i],s.order[j]]=[s.order[j],s.order[i]];}
 if(action==='observe'){const i=Number(value);s.currentTrial=i;if(!s.observed.includes(i))s.observed.push(i);if(t.kind==='debug'){s.testRuns||={};s.testRuns[i]=(s.flags?.wall?'1':'0')+(s.flags?.edge?'1':'0');}}
 if(action==='reported')s.reported=true;
 if(action==='wire'){s.wires[Number(value)]=!s.wires[Number(value)];}
 if(action==='switch')s.switchClosed=!s.switchClosed;
 if(t.kind==='circuit'&&['wire','switch'].includes(action)){const on=s.wires.every(Boolean)&&s.switchClosed;if(!s.powerStates.includes(on))s.powerStates.push(on);}
 if(action==='text')s.text=String(value).slice(0,3000);
 if(action==='stroke'){if(s.strokes.length>=60)s.feedback='画板已达60笔，先下载作品或撤销一笔再继续。';else s.strokes.push(value.slice(0,90));}
 if(action==='undo'){s.done=false;if(t.kind==='studio')s.strokes.pop();else if(t.kind==='board'&&s.history.length){const past=s.history.slice(0,-1),snapshot=s.history.at(-1);Object.assign(s,snapshot);s.history=past;}else if(t.kind==='rhythm')s.order.pop();}
 if(action==='move'){const [dx,dy]=value,x=s.position[0]+dx,y=s.position[1]+dy;if(B.inside(x,y,t.width,t.height)&&!(t.walls||[]).some(p=>p[0]===x&&p[1]===y)){s.position=[x,y];if(!s.path.some(p=>p[0]===x&&p[1]===y))s.path.push([x,y]);s.feedback='到了第 '+(y+1)+' 行、第 '+(x+1)+' 列。';}else s.feedback='这里不能通过，当前位置保留。';}
 if(action==='command'){s.commands.push(value);s.commands=s.commands.slice(0,6);}
 if(action==='repeat')s.repeat=Math.max(1,Math.min(5,s.repeat+Number(value)));
 if(action==='run'){s.position=t.start.slice();s.path=[t.start.slice()];s.ran=true;for(let n=0;n<s.repeat;n++)for(const c of s.commands){const [dx,dy]=({R:[1,0],D:[0,1],L:[-1,0],U:[0,-1]})[c];const x=s.position[0]+dx,y=s.position[1]+dy;if(B.inside(x,y,t.width,t.height)){s.position=[x,y];s.path.push([x,y]);}else{s.feedback='指令走出了边界，修改后可重新运行。';s.ran=false;break;}}}
 if(action==='tap'){s.order.push(Number(value));s.order=s.order.slice(0,t.pattern.length);}
 if(action==='flag'){s.flags||={};s.flags[value]=!s.flags[value];}
 if(action==='board'){
 const [x,y]=value;if(t.mode==='mark'){if(t.candidates.some(p=>p[0]===x&&p[1]===y)){const p=[x,y].join(),i=s.marks.indexOf(p);if(i>=0)s.marks.splice(i,1);else s.marks.push(p);}return s;}
 if(t.game==='xiangqi'){const p=B.at(s.pieces,x,y);if(p?.side==='r'){s.selected=p.id;return s;}const moved=B.move(s.pieces,s.selected,x,y,t.strict!==false);if(moved){s.history.push({...clone(s),history:[]});s.pieces=moved;s.moves++;s.feedback='这一步符合当前规则。';}else s.feedback='这一步不合法：检查走法、阻挡、己方棋子，以及是否让己方将帅受攻击。';}
 else if(!s.board[y*t.size+x]){if(t.goal==='win2'&&s.moves>s.replies){s.feedback='先看对方回应，再走自己的下一步。';return s;}if(['win','defend','fork'].includes(t.goal)&&s.moves>=1){s.feedback='这是一步观察题，撤销或重置后比较另一种选择。';return s;}s.history.push({...clone(s),history:[]});s.board[y*t.size+x]=t.goal==='align'?1:s.turn;s.moves++;if(['family','turn'].includes(t.goal))s.turn=s.turn===1?2:1;s.feedback='已落子。';}else s.feedback='这里已有棋子，换一个空位置。';
 }
 if(action==='reply'&&t.kind==='board'&&t.game!=='xiangqi'&&!B.winLine(s.board,t.size,1,t.k||5)){const i=B.reply(s.board,t.size,2,t.k||5);if(i>=0&&s.replies<s.moves){s.board[i]=2;s.replies++;s.feedback='对方已按直接获胜、阻挡威胁的次序回应，现在再看自己的机会。';}}
 if(t.kind==='board'&&t.goal==='family'&&(B.winLine(s.board,t.size,1,t.k)||B.winLine(s.board,t.size,2,t.k)||s.board.every(Boolean))){s.done=true;s.feedback='本局出现连线或满盘和棋，已经结束；可以重置再玩。';}
 if(s.history.length>20)s.history=s.history.slice(-20);
 if(action==='check'){s.attempts++;const result=assess(t,s);s.done=result.ok;s.reportedResult=result.reported||false;s.feedback=result.text||(result.ok?t.success:t.hint);}
 return s;
}
const api={create,apply,assess};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AcademyEngine=api;
})(typeof window==='undefined'?globalThis:window);
