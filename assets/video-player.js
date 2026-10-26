/* Official manual-play embeds. Use a real HTTP(S) enclosing page and Referer. */
(()=>{
'use strict';
const published='https://kone-net.github.io/little-wonder-island/';
// Preserve the supplied share parameter only for the video it belongs to.
const officialShares={hoFhVdYsmPg:'iUeW9l5eK7cRu5Cq'};
function canEmbed(loc=location){return /^https?:$/.test(loc.protocol)&&loc.origin!=='null';}
function watchURL(song,loc=location,{muted=false}={}){const url=new URL('watch.html',canEmbed(loc)?loc.href:published);url.hash='';url.search='';url.searchParams.set('song',song);url.searchParams.set('play','1');if(muted)url.searchParams.set('muted','1');return url.href;}
function embedURL(id,{muted=false,autoplay=false}={},loc=location){
 if(!canEmbed(loc))return null;
 if(!/^[\w-]{11}$/.test(id))throw Error('Invalid official video ID');
 const url=new URL('https://www.youtube.com/embed/'+id);
 if(officialShares[id])url.searchParams.set('si',officialShares[id]);
 // Defaults match the official share snippet. No forced autoplay or synthetic origin.
 if(autoplay)url.searchParams.set('autoplay','1');
 if(muted)url.searchParams.set('mute','1');
 return url.href;
}
window.IslandVideo={canEmbed,watchURL,embedURL};
})();
