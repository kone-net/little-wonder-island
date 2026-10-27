/* Fit visual lessons to the real tablet viewport without reloading media or changing progress. */
(()=>{'use strict';
const root=document.getElementById('uMain');if(!root)return;
let frame=0,identity='',observed=[];
const height=e=>e?.getBoundingClientRect().height||0;
const resize=new ResizeObserver(schedule);
function schedule(){if(!frame)frame=requestAnimationFrame(update);}
function set(name,value){if(root.style.getPropertyValue(name)!==value)root.style.setProperty(name,value);}
function update(){frame=0;const app=window.ClassroomApp,n=app?.getNode(),lesson=root.querySelector('.p-lesson');
 const viewport=window.visualViewport,h=viewport&&viewport.scale===1?viewport.height:innerHeight;
 const tablet=innerWidth>=700&&innerWidth<=1400&&h>=500;
 document.body.classList.toggle('u-tablet',tablet);
 if(!lesson||!n)return;
 const next=app.getCourse().id+':'+app.getState().flow.index;
 if(tablet&&next!==identity)window.scrollTo({top:0,behavior:'instant'});
 identity=next;
 const kind=n.kind;lesson.dataset.kind=kind;
 const visual=['story','film','move','ending'].includes(kind);
 lesson.classList.toggle('u-fit-visual',tablet&&visual);
 const head=lesson.querySelector('.p-scene-head'),caption=lesson.querySelector('.p-caption'),dock=lesson.querySelector('.p-dock'),help=lesson.querySelector('.u-video-help');
 const targets=[document.querySelector('.p-header'),root.querySelector('.p-trail'),head,caption,dock,help].filter(Boolean);
 if(targets.length!==observed.length||targets.some((e,i)=>e!==observed[i])){resize.disconnect();targets.forEach(e=>resize.observe(e));observed=targets;}
 if(!tablet||!visual)return;
 const top=lesson.getBoundingClientRect().top+scrollY;
 const room=Math.floor(h-top-height(head)-height(caption)-height(dock)-12);
 // Very short windows keep normal scrolling instead of clipping controls or undersizing a player.
 const videoRoom=room-height(help);
 const safe=room>=220&&(kind!=='film'||!help||videoRoom>=200);
 lesson.classList.toggle('u-fit-visual',safe);
 if(!safe)return;
 set('--u-stage-room',room+'px');set('--u-video-room',Math.floor(videoRoom)+'px');
 const width=Math.min(lesson.clientWidth,videoRoom*16/9);
 set('--u-video-width',Math.floor(width)+'px');
 root.querySelectorAll('.p-art>svg').forEach(svg=>{if(svg.getAttribute('preserveAspectRatio')!=='xMidYMid meet')svg.setAttribute('preserveAspectRatio','xMidYMid meet');});
}
new MutationObserver(schedule).observe(root,{childList:true,subtree:true,characterData:true});
window.addEventListener('resize',schedule);window.addEventListener('orientationchange',schedule);
window.visualViewport?.addEventListener('resize',schedule);window.addEventListener('pageshow',schedule);
schedule();
})();
