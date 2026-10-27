(()=>{'use strict';const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const modes={'listen-meaning':'听信息选意思','sentence-build':'听句搭建','cloze':'听音补位'};
const b=(a,label,i)=>'<button class="x-btn" data-e="'+a+'" data-i="'+i+'">'+label+'</button>';
const words=text=>text.replace(/[.!?。]/g,'').split(/\s+/).filter(Boolean);
function model(mode,ts,target){const t=ts[target],w=words(t.text);if(mode==='sentence-build'&&w.length===1)mode='listen-meaning';if(mode==='listen-meaning'){const options=[...new Set([t.meaning,...ts.filter((_,i)=>i!==target).map(t=>t.meaning),'请停下来等待','一起去图书馆'])].filter(Boolean).slice(0,3);return {type:mode,options,answer:0,t};}
if(mode==='sentence-build')return {type:mode,w,t,bank:w.map((word,i)=>({word,i})).reverse()};
if(w.length>1){const gap=Math.min(w.length-1,Math.floor(w.length/2)),answer=w[gap],options=[...new Set([answer,...ts.flatMap(t=>words(t.text)).filter(v=>v!==answer),'not','again'])].slice(0,4);return {type:mode,w,gap,options,answer:0,t};}
const word=w[0],gap=Math.max(0,Math.floor(word.length/2)-1),answer=word.slice(gap,gap+2),shown=word.slice(0,gap)+'__'+word.slice(gap+2),options=[...new Set([answer,'ar','er','oo','in'])].slice(0,4);return {type:mode,shown,options,answer:0,t};}
function render(mode,ts,s,target){if(!modes[mode])return null;const m=model(mode,ts,target),used=s.builds?.[target]||[],help=s.help?.[target];let html='<div class="x-english-task" data-english-family="'+mode+'"><div class="x-toolbar">'+b('replay','♫ 再听这一句',0)+b('help','看看中文提示',0)+'</div>'+(help?'<p class="u-meaning">'+esc(m.t.meaning)+'</p>':'');
if(m.type==='listen-meaning')html+='<p>听到的声音表达哪一项意思？</p><div class="x-case-options">'+m.options.map((v,i)=>({v,i})).reverse().map(({v,i})=>b('meaning',esc(v),i)).join('')+'</div>';
else if(m.type==='sentence-build')html+='<p>按顺序点词块，拼齐就会检查；点已放好的词可以取回。</p><div class="x-process" lang="en">'+used.map((v,i)=>b('undo',esc(m.w[v]),i)).join(' ')+'</div><div class="x-toolbar" lang="en">'+m.bank.filter(x=>!used.includes(x.i)).map(x=>b('word',esc(x.word),x.i)).join('')+'</div>';
else html+='<p>听句子 / 单词，把空缺补完整。</p><div class="x-cloze" lang="en">'+esc(m.shown||m.w.map((v,i)=>i===m.gap?'______':v).join(' '))+'</div><div class="x-toolbar" lang="en">'+m.options.map((v,i)=>({v,i})).reverse().map(({v,i})=>b('gap',esc(v),i)).join('')+'</div>';
return html+'</div>';}
function action(mode,ts,s,target,a,i){const m=model(mode,ts,target);s.builds||={};s.builds[target]||=[];s.help||={};let good=false,error='',replay=false;if(a==='replay')replay=true;if(a==='help')s.help[target]=!s.help[target];if(a==='word'&&!s.builds[target].includes(i))s.builds[target].push(i);if(a==='undo')s.builds[target].splice(i,1);if(a==='check'||(a==='word'&&s.builds[target].length===m.w.length)){good=s.builds[target].length===m.w.length&&s.builds[target].every((n,i)=>m.w[n]===m.w[i]);if(!good)error='词块还可以调整。再听一次，把顺序搭完整。';}if(a==='meaning'||a==='gap'){good=i===m.answer;if(!good)error='这个意思 / 词块还没对应上，原来的尝试保留，再听听。';}return {good,error,replay};}
window.ClassroomEnglish={modes,render,action};
})();
