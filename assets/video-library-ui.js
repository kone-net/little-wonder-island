(()=>{
'use strict';
const data=window.VIDEO_LIBRARY,$=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let limit=30;
$('catalogIntro').textContent=`40 关各预选一集，共 ${data.videos.length} 条短视频记录。核对日期：${data.checkedAt}。`;
for(const [id,values] of [['channel',[...new Set(data.videos.map(v=>v.publisher))].sort()],['topic',[...new Set(data.videos.flatMap(v=>v.tags))].sort()]])for(const value of values){const o=document.createElement('option');o.value=value;o.textContent=value;$(id).append(o);}
function render(){const query=$('search').value.trim().toLocaleLowerCase(),age=+$('age').value,channel=$('channel').value,topic=$('topic').value,max=+$('duration').value,review=$('review').value;const list=data.videos.filter(v=>(!age||v.suggestedAges.includes(age))&&(!channel||v.publisher===channel)&&(!topic||v.tags.includes(topic))&&(!max||v.durationSeconds<=max)&&(!review||v.status===review)&&(!query||[v.title,v.publisher,v.topic,...v.tags].join(' ').toLocaleLowerCase().includes(query)));
 $('resultCount').textContent=`找到 ${list.length} 条，已显示 ${Math.min(limit,list.length)} 条。`;
 $('catalogResults').innerHTML=list.slice(0,limit).map(v=>`<article class="video-resource"><div class="eyebrow">${esc(v.publisher)} · ${esc(v.duration)} · ${esc(v.kind)}</div><h2>${esc(v.title)}</h2><p>${esc(v.tags.join(' · '))}</p><p class="muted">${esc(v.status)} · 建议 ${v.suggestedAges.join('/')} 岁 · ${esc(v.englishLoad)}</p>${v.status==='已配课'?`<p>${esc(v.cue)}</p>`:''}<details><summary>审核记录</summary><p>${esc(v.review)}</p><p>${esc(v.playbackStatus)}</p></details><div class="controls"><a class="btn small" href="watch.html?song=${encodeURIComponent(v.id)}" target="_blank" rel="noopener">预览本集 ↗</a><a href="${esc(v.source)}" target="_blank" rel="noopener">官方原片 ↗</a></div></article>`).join('')||'<p>暂时没有匹配的视频，试着减少筛选条件。</p>';
 $('more').hidden=limit>=list.length;
}
$('videoFilters').addEventListener('submit',e=>e.preventDefault());$('videoFilters').addEventListener('input',()=>{limit=30;render();});$('more').addEventListener('click',()=>{limit+=30;render();});
$('longVideos').innerHTML=data.extensions.map(v=>`<p><a href="${esc(v.source)}" target="_blank" rel="noopener">${esc(v.title)} ↗</a> · ${Math.floor(v.durationSeconds/60)}:${String(v.durationSeconds%60).padStart(2,'0')} · 拓展待复核</p>`).join('');
$('unavailableVideos').innerHTML=data.unavailableVideos.map(v=>`<p><a href="${esc(v.source)}" target="_blank" rel="noopener">${esc(v.title)} ↗</a> · ${esc(v.publisher)} · 本次嵌入受限</p>`).join('');render();
})();
