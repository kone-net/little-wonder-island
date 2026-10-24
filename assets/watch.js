(()=>{
'use strict';
const id=new URLSearchParams(location.search).get('song'),song=window.ISLAND_SONGS.find(s=>s.id===id)||window.ISLAND_SONGS[0];
const muted=new URLSearchParams(location.search).get('muted')==='1';
const slot=document.getElementById('watchPlayer'),status=document.getElementById('watchStatus'),play=document.getElementById('watchAgain');
document.getElementById('videoPublisher').textContent=(song.publisher||'Super Simple Songs')+' · '+(song.kind||'官方原版视频')+(song.duration?' · '+song.duration:'');
document.title=song.title+' · 小小奇遇岛';document.getElementById('songTitle').textContent=song.title;document.getElementById('songCue').textContent=song.cue;
document.getElementById('originalLink').href='https://www.youtube.com/watch?v='+song.videoId;document.getElementById('sourceLink').href=song.source;
function showCover(){slot.replaceChildren();const cover=document.createElement('div');cover.className='song-cover';const icon=document.createElement('span');icon.textContent='🎵';const name=document.createElement('h3');name.textContent=song.topic;cover.append(icon,name);slot.append(cover);}
function start(){
 const src=IslandVideo.embedURL(song.videoId,{muted});showCover();
 if(!src){const link=document.createElement('a');link.className='btn primary';link.href=IslandVideo.watchURL(song.id,location,{muted});link.target='_blank';link.rel='noopener';link.textContent='▶ 打开在线播放器';slot.firstChild.append(link);play.hidden=true;status.textContent='这份文件在电脑本地打开，请用在线播放器观看视频。';return;}
 const frame=document.createElement('iframe');frame.title=song.title+' 官方视频';frame.referrerPolicy='strict-origin-when-cross-origin';frame.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';frame.allowFullscreen=true;frame.src=src;slot.replaceChildren(frame);status.textContent='如果没有自动开始，请点一下视频中的播放按钮。';
}
play.addEventListener('click',start);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&slot.querySelector('iframe')){showCover();status.textContent='视频已停止。回来后可点“播放 / 重新播放”。';}});
if(!IslandVideo.canEmbed()||new URLSearchParams(location.search).get('play')==='1')start();else{showCover();status.textContent='准备好后，点击播放。';}
})();
