/* Resolve the one-tap sequential entry without changing course progress. */
(function(root){
'use strict';
function started(s){return !!s&&(s.started||s.chapter>0||s.step>0||s.elapsed?.some(n=>n>0)||s.game?.attempts>0||Object.keys(s.english||{}).length>0);}
function target(lessons,store){
 const progress=store.courses||{},cursor=lessons.findIndex(l=>l.id===store.journeyCourseId);
 if(cursor>=0){
  const current=lessons[cursor],s=progress[current.id];
  if(s&&!s.finished)return {id:current.id,resume:!!started(s),completed:false};
  if(s?.finished){const next=lessons.slice(cursor+1).find(l=>!progress[l.id]?.finished);if(next)return {id:next.id,resume:!!started(progress[next.id]),completed:false};}
 }else{
  // Migrate existing V2 progress: resume the last actually used course, not a preview.
  const recent=lessons.filter(l=>!progress[l.id]?.finished&&started(progress[l.id])).sort((a,b)=>(progress[b.id].updated||0)-(progress[a.id].updated||0));
  if(recent.length)return {id:recent[0].id,resume:true,completed:false};
 }
 const first=lessons.find(l=>!progress[l.id]?.finished);
 return first?{id:first.id,resume:!!started(progress[first.id]),completed:false}:{id:lessons[0].id,resume:false,completed:true};
}
const api={target,started};if(typeof module!=='undefined')module.exports=api;root.Journey=api;
})(typeof window==='undefined'?globalThis:window);
