/* Use a real HTTP(S) embedding page; a URL parameter cannot create a Referer. */
(()=>{
'use strict';
const published='https://kone-net.github.io/little-wonder-island/';
function canEmbed(loc=location){return /^https?:$/.test(loc.protocol)&&loc.origin!=='null';}
function watchURL(song,loc=location,{muted=false}={}){const url=new URL('watch.html',canEmbed(loc)?loc.href:published);url.hash='';url.search='';url.searchParams.set('song',song);url.searchParams.set('play','1');if(muted)url.searchParams.set('muted','1');return url.href;}
function embedURL(id,{muted=false,autoplay=true}={},loc=location){
 if(!canEmbed(loc))return null;
 if(!/^[\w-]{11}$/.test(id))throw Error('Invalid official video ID');
 const url=new URL('https://www.youtube-nocookie.com/embed/'+id);
 for(const [key,value]of Object.entries({autoplay:autoplay?'1':'0',rel:'0',playsinline:'1',mute:muted?'1':'0',origin:loc.origin}))url.searchParams.set(key,value);
 return url.href;
}
window.IslandVideo={canEmbed,watchURL,embedURL};
})();
