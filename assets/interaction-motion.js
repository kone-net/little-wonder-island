/* Pointer-following drag and layout transitions. Game rules stay in GameEngine. */
(()=>{
'use strict';
function create(root,{enabled,onDrop}){
 let drag=null,lastDrop=null;
 const animations=new Set(),reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function animate(el,frames,options){
  if(reduced()||!el.animate)return null;
  const animation=el.animate(frames,options);animations.add(animation);
  animation.finished.catch(()=>{}).finally(()=>animations.delete(animation));return animation;
 }
 function snapshot(){return new Map([...root.querySelectorAll('.item-btn[data-id]')].map(el=>[el.dataset.id,el.getBoundingClientRect()]));}
 function settle(before,id,zone){
  for(const el of root.querySelectorAll('.item-btn[data-id]')){
   const from=before.get(el.dataset.id),to=el.getBoundingClientRect();if(!from||!to.width||!to.height)continue;
   const dx=from.x+from.width/2-to.x-to.width/2,dy=from.y+from.height/2-to.y-to.height/2;
   if(Math.abs(dx)+Math.abs(dy)<1&&Math.abs(from.width-to.width)<1)continue;
   const moved=el.dataset.id===id;
   animate(el,[{transform:`translate(${dx}px,${dy}px) scale(${from.width/to.width},${from.height/to.height})`},{transform:'translate(0,0) scale(1)'}],{duration:moved?420:260,easing:'cubic-bezier(.22,1,.36,1)'});
  }
  const target=[...root.querySelectorAll('.drop-zone')].find(el=>el.dataset.zone===zone);
  if(target){target.classList.add('is-landed');setTimeout(()=>target.classList.remove('is-landed'),550);}
 }
 function clearDrag(){
  const old=drag;drag=null;if(!old)return null;
  old.source.classList.remove('drag-source');old.over?.classList.remove('drag-over');root.classList.remove('is-dragging');
  if(root.hasPointerCapture?.(old.pointer))root.releasePointerCapture(old.pointer);
  return old;
 }
 function returnHome(old){
  if(!old?.ghost)return;
  const home=old.source.getBoundingClientRect();
  const animation=animate(old.ghost,[{transform:old.ghost.style.transform},{transform:`translate(${home.x-old.rect.x}px,${home.y-old.rect.y}px) scale(.98)`}],{duration:240,easing:'cubic-bezier(.22,1,.36,1)'});
  if(animation){old.source.classList.add('drag-source');animation.finished.catch(()=>{}).finally(()=>{old.ghost.remove();old.source.classList.remove('drag-source');});}
  else old.ghost.remove();
 }
 function cancel(){const old=clearDrag();old?.ghost?.remove();for(const a of animations)a.cancel();animations.clear();}
 function consumeClick(event){
  if(!lastDrop||event.detail===0||performance.now()-lastDrop.time>350)return false;
  if(Math.hypot(event.clientX-lastDrop.x,event.clientY-lastDrop.y)>3)return false;
  lastDrop=null;event.preventDefault();return true;
 }
 root.addEventListener('pointerdown',event=>{
  const source=event.target.closest('.item-btn[data-id]');
  if(drag||!source||source.disabled||event.button!==0||!event.isPrimary||!enabled())return;
  drag={source,id:source.dataset.id,pointer:event.pointerId,x:event.clientX,y:event.clientY,rect:source.getBoundingClientRect(),ghost:null,over:null};
 });
 root.addEventListener('pointermove',event=>{
  if(!drag||drag.pointer!==event.pointerId)return;
  if(!enabled()){cancel();return;}
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
  if(!drag.ghost&&Math.hypot(dx,dy)<10)return;
  event.preventDefault();
  if(!drag.ghost){
   const ghost=drag.source.cloneNode(true);ghost.removeAttribute('data-act');ghost.removeAttribute('data-id');ghost.removeAttribute('aria-pressed');ghost.setAttribute('aria-hidden','true');ghost.tabIndex=-1;
   ghost.className='item-btn drag-ghost';Object.assign(ghost.style,{left:drag.rect.x+'px',top:drag.rect.y+'px',width:drag.rect.width+'px',height:drag.rect.height+'px'});
   document.body.append(ghost);drag.ghost=ghost;drag.source.classList.add('drag-source');root.classList.add('is-dragging');root.setPointerCapture?.(event.pointerId);
  }
  drag.ghost.style.transform=`translate(${dx}px,${dy-5}px) scale(1.04)`;
  const over=document.elementFromPoint(event.clientX,event.clientY)?.closest('.drop-zone');
  if(over!==drag.over){drag.over?.classList.remove('drag-over');over?.classList.add('drag-over');drag.over=over;}
 },{passive:false});
 root.addEventListener('pointerup',event=>{
  if(!drag||drag.pointer!==event.pointerId)return;
  const old=clearDrag();if(!old.ghost)return;
  event.preventDefault();lastDrop={x:event.clientX,y:event.clientY,time:performance.now()};
  const zone=document.elementFromPoint(event.clientX,event.clientY)?.closest('.drop-zone'),rect=old.ghost.getBoundingClientRect();
  // Commit the game state once, then let the destination fly from the release point.
  if(zone&&enabled()&&onDrop(old.id,zone.dataset.zone,rect)){old.ghost.remove();return;}
  returnHome(old);
 });
 root.addEventListener('pointercancel',event=>{if(drag?.pointer===event.pointerId)returnHome(clearDrag());});
 // Touch starts with implicit capture on the pressed child. Its capture loss is
 // expected when the root takes over; only a loss from the root cancels a drag.
 root.addEventListener('lostpointercapture',event=>{if(event.target===root&&drag?.pointer===event.pointerId)returnHome(clearDrag());});
 window.addEventListener('blur',cancel);
 return {snapshot,settle,cancel,consumeClick};
}
window.IslandMotion={create};
})();
