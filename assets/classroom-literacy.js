/* Optional Chinese picture/character association inside the existing hands-on stage. */
(()=>{'use strict';
const data=window.CLASSROOM_LITERACY_DATA,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function items(c){return (data.courses[c.id]||[]).map(k=>data.words[k]);}
function start(c,flow){if(!items(c).length||flow.literacy?.done)return false;flow.literacy||={version:1,index:0,phase:'model',seen:[],feedback:''};flow.literacy.active=true;return true;}
function render(c,s){const list=items(c),t=list[s.index];if(s.phase==='done')return '<section class="l-unit"><span class="p-stage-tag">语文 · 认字小发现</span><h2>今天看见了这些字</h2><div class="l-results">'+list.map(t=>'<span><i>'+t.picture+'</i><b>'+t.char+'</b></span>').join('')+'</div><p>指一指、听一听，也是一次发现。</p></section>';
 const order=list.map((_,i)=>(i+c.sequence+s.index)%list.length);
 return '<section class="l-unit" data-literacy-phase="'+s.phase+'"><span class="p-stage-tag">语文 · 认字小发现</span><h2>'+(s.phase==='model'?'看图，听一听这个字':'听声音，找这个字')+'</h2><div class="l-model"><i>'+t.picture+'</i>'+(s.phase==='model'?'<b class="focus-target">'+t.char+'</b>':'')+'</div>'+(s.phase==='find'?'<div class="l-choices">'+order.map(i=>'<button data-literacy="choose" data-index="'+i+'" class="'+(s.selected===i?'l-tried':'')+'" aria-label="汉字'+list[i].char+'">'+list[i].char+'</button>').join('')+'</div>':'<p>声音和图片连起来，再看一看字的样子。</p>')+'<p class="l-feedback" role="status">'+esc(s.feedback||'')+'</p><button class="p-button secondary" data-literacy="replay">♫ 再听这个字</button></section>';
}
function action(c,s,a,i){if(a==='replay')return {replay:true};if(a==='continue')return {finish:true};if(a==='choose'&&s.phase==='find'){s.selected=i;if(i!==s.index){s.feedback='看看图片，再听一遍。不着急。';return {wrong:true};}if(!s.seen.includes(items(c)[s.index].char))s.seen.push(items(c)[s.index].char);s.index++;s.selected=null;s.feedback='找到了！';if(s.index>=items(c).length){s.phase='done';return {complete:true};}s.phase='model';return {advance:true};}return {};}
window.ClassroomLiteracy={items,start,render,action,active:flow=>!!flow.literacy?.active,clip:(c,s)=>items(c)[Math.min(s.index,items(c).length-1)]?.clip};
})();
