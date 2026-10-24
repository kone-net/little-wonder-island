/* Shared original SVG cast and scenery. */
(()=>{
'use strict';
let svgCount=0;
  function apple(x=0,y=0,size=1,cls=''){
    return `<g transform="translate(${x} ${y}) scale(${size})"><g class="${cls}"><path d="M0-18q-6-15 2-24" fill="none" stroke="#6a5538" stroke-width="5" stroke-linecap="round"/><path d="M2-30q19-19 29-5q-12 18-29 5" fill="#5b8d54"/><path d="M0-18C-38-40-43-5-30 17C-23 33-9 35 0 29C10 35 26 30 34 12C48-15 23-35 0-18Z" fill="#df6550" stroke="#a64f3d" stroke-width="2"/><path d="M-21-11q-7 9-2 18" fill="none" stroke="#f69a7c" stroke-width="5" stroke-linecap="round"/></g></g>`;
  }
  function bunny(x,y,scale=1,cls='bunny-bob'){
    const id='mimi'+(++svgCount);
    return `<g transform="translate(${x} ${y}) scale(${scale})" class="mimi-character">${characterDefs(id,'#fffef7','#e4d6bd','#c69c5f')}<ellipse cy="102" rx="60" ry="9" fill="#3c59382b"/><g class="${cls}"><g class="cast-breathe">
      <ellipse cx="-31" cy="85" rx="23" ry="16" fill="url(#${id}fur)"/><ellipse cx="29" cy="85" rx="23" ry="16" fill="url(#${id}fur)"/><ellipse cy="49" rx="44" ry="48" fill="url(#${id}cloth)"/><path d="M-22 15v27h44V15" fill="none" stroke="#fff0c7" stroke-width="6"/><path d="M-22 56q22 10 44 0v19q-22 10-44 0Z" fill="#dbb375"/><circle cx="-20" cy="39" r="3" fill="#82613f"/><circle cx="20" cy="39" r="3" fill="#82613f"/>
      <ellipse cx="-44" cy="42" rx="14" ry="23" transform="rotate(-22 -44 42)" fill="url(#${id}fur)"/><ellipse cx="44" cy="39" rx="14" ry="23" transform="rotate(28 44 39)" fill="url(#${id}fur)"/>
      <g class="cast-head"><g class="cast-ear"><ellipse cx="-26" cy="-76" rx="18" ry="47" transform="rotate(-14 -26 -76)" fill="url(#${id}fur)"/><ellipse cx="-26" cy="-77" rx="8" ry="32" transform="rotate(-14 -26 -77)" fill="#eab3ad"/><ellipse cx="-28" cy="-80" rx="3" ry="24" transform="rotate(-14 -28 -80)" fill="#f6d6cd"/></g><ellipse cx="25" cy="-79" rx="18" ry="46" transform="rotate(10 25 -79)" fill="url(#${id}fur)"/><ellipse cx="25" cy="-79" rx="8" ry="31" transform="rotate(10 25 -79)" fill="#eab3ad"/>
      <path d="M-50-24Q-55-59-23-66l-4-8 16 7 6-10 10 10 14-6-1 9Q53-56 54-22l6 4-6 7 5 7-7 2Q48 28 0 31Q-48 28-52 1l-6-3 5-8-7-5Z" fill="url(#${id}fur)" stroke="#cbbba0" stroke-width="1"/>
      <ellipse cx="-33" cy="1" rx="13" ry="8" fill="url(#${id}blush)"/><ellipse cx="33" cy="1" rx="13" ry="8" fill="url(#${id}blush)"/>
      ${characterEyes(-20,-18,id)+characterEyes(20,-18,id)}<path d="M-29-36q9-5 16-1m26 0q8-4 16 1" fill="none" stroke="#c2a88c" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="-9" cy="9" rx="12" ry="9" fill="#fffaf0"/><ellipse cx="9" cy="9" rx="12" ry="9" fill="#fffaf0"/><path d="M-5 0Q0-5 5 0Q1 8-5 0" fill="#c88e8a"/><path d="M0 5v6m0 0q-7 7-12 0m12 0q7 7 12 0" fill="none" stroke="#8d7161" stroke-width="1.5" stroke-linecap="round"/><ellipse class="cast-mouth" cy="14" rx="4" ry="3" fill="#a26f68"/>
      <path d="M-45-1l9 2m-8 5 8-1m72-3 9-2m-9 6 8 1M-31-46l5-4m52 4 5 3" fill="none" stroke="#ded0b8" stroke-width="1.5" stroke-linecap="round"/></g>
      <path d="M-14 25l14 9 14-9-3 15-11-4-11 4Z" fill="#6d9879"/><circle cy="34" r="3" fill="#527e61"/>
    </g></g></g>`;
  }
  function fox(x,y,scale=1){
    const id='diandian'+(++svgCount);
    return `<g transform="translate(${x} ${y}) scale(${scale})" class="fox-character">${characterDefs(id,'#f5b46e','#c6743f','#89a68d')}<ellipse cy="102" rx="74" ry="9" fill="#3c59382b"/><g class="fox-bob"><g class="cast-breathe">
      <g class="cast-tail"><path d="M27 68Q94 10 115 33Q139 82 68 98l-32-4Z" fill="url(#${id}fur)" stroke="#c38650" stroke-width="1"/><path d="M102 29q18-2 18 18l-10 2 4 10-12-3 1 10-12-2 2 10-14-3 3-13Z" fill="#fff2dc"/></g>
      <ellipse cy="48" rx="44" ry="48" fill="url(#${id}cloth)"/><ellipse cx="-26" cy="85" rx="22" ry="15" fill="url(#${id}fur)"/><ellipse cx="25" cy="85" rx="22" ry="15" fill="url(#${id}fur)"/><path d="M-19 33v36q19 10 38 0V33" fill="#b6c7ad" opacity=".6"/><path d="M-15 40h30v21h-30Z" fill="#9ab397"/><circle cx="-19" cy="31" r="3" fill="#5d7d66"/><circle cx="19" cy="31" r="3" fill="#5d7d66"/>
      <ellipse cx="-44" cy="43" rx="14" ry="22" transform="rotate(-13 -44 43)" fill="url(#${id}fur)"/><ellipse cx="44" cy="43" rx="14" ry="22" transform="rotate(19 44 43)" fill="url(#${id}fur)"/>
      <g class="cast-head"><path d="M-47-25Q-59-94-42-86l29 27q13-5 27 0l29-27q17-8 5 61Q65-4 50 13l7 3-12 5 3 5-13 2Q0 55-35 28l-13-2 3-5-12-5 7-3Q-65-4-47-25Z" fill="url(#${id}fur)" stroke="#c38650" stroke-width="1"/>
      <path d="M-40-40l-4-32 23 23M23-49l23-23-4 32" fill="#a97764"/><path d="M-39-47l-2-17 13 13M30-52l13-12-2 17" fill="#e3ac94"/>
      <path d="M-50-8Q-26-20-4 9L0 15l4-6Q26-20 50-8l-6 6 5 5-8 2 4 5Q25 35 0 37Q-25 35-45 10l4-5-8-2 5-5Z" fill="#fff2df"/>
      ${characterEyes(-22,-15,id)+characterEyes(22,-15,id)}<ellipse cx="-35" cy="9" rx="10" ry="6" fill="url(#${id}blush)"/><ellipse cx="35" cy="9" rx="10" ry="6" fill="url(#${id}blush)"/>
      <path d="M-7 9Q0 3 7 9Q4 19 0 19Q-4 19-7 9" fill="#5d4539"/><ellipse cx="-2" cy="9" rx="2.5" ry="1.3" fill="#c8ada0"/><path d="M0 19v4m0 0q-8 7-14 0m14 0q8 7 14 0" fill="none" stroke="#916c53" stroke-width="1.5" stroke-linecap="round"/><ellipse class="cast-mouth" cy="28" rx="4" ry="3" fill="#a26f68"/><path d="M-10-48l5-5 5 5 5-5 6 6" fill="none" stroke="#fbd397" stroke-width="2" stroke-linecap="round"/></g>
      <path d="M-23 19l23 9 23-9-6 20-17-4-17 4Z" fill="#f1c06f"/><path d="M0 28l-7 22 14-5-3-12" fill="#df9d4e"/>
    </g></g></g>`;
  }
  function characterEyes(x,y,id){return `<g transform="translate(${x} ${y})"><g class="cast-eyes"><ellipse rx="8" ry="10.5" fill="#654d3d"/><ellipse cy="-1" rx="6" ry="8" fill="#352f28"/><ellipse cx="-2.5" cy="-4" rx="2.7" ry="3.2" fill="#fffdf5"/><circle cx="3" cy="3" r="1.4" fill="#e9dac2"/></g></g>`;}
  function characterDefs(id,light,dark,cloth){return `<defs><radialGradient id="${id}fur" cx=".35" cy=".23" r=".8"><stop stop-color="${light}"/><stop offset=".65" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></radialGradient><linearGradient id="${id}cloth" x2=".8" y2="1"><stop stop-color="${cloth}"/><stop offset="1" stop-color="${dark}"/></linearGradient><radialGradient id="${id}blush"><stop stop-color="#e7a397" stop-opacity=".65"/><stop offset="1" stop-color="#e7a397" stop-opacity="0"/></radialGradient></defs><style>.cast-breathe{transform-box:fill-box;transform-origin:50% 95%;animation:castBreathe 4s ease-in-out infinite}.cast-eyes{transform-box:fill-box;transform-origin:center;animation:castBlink 5.8s infinite}.fox-character .cast-eyes{animation-delay:1.7s}.cast-tail{transform-box:fill-box;transform-origin:10% 75%;animation:castTail 3.2s ease-in-out infinite}.cast-ear{transform-box:fill-box;transform-origin:50% 90%;animation:castEar 7s ease-in-out infinite}.cast-mouth{opacity:0}.speaking .cast-mouth{opacity:1;transform-box:fill-box;transform-origin:center;animation:castTalk .4s ease-in-out infinite alternate}@keyframes castBreathe{50%{transform:scale(1.012,1.018)}}@keyframes castBlink{0%,42%,46%,100%{transform:scaleY(1)}44%{transform:scaleY(.08)}}@keyframes castTail{50%{transform:rotate(8deg)}}@keyframes castEar{0%,65%,100%{transform:rotate(0)}70%{transform:rotate(-5deg)}75%{transform:rotate(2deg)}}@keyframes castTalk{to{transform:scaleY(.4)}}@media(prefers-reduced-motion:reduce){.cast-breathe,.cast-eyes,.cast-tail,.cast-ear,.cast-mouth{animation:none!important}}</style>`;}
  function tree(x,y,scale=1,fruits=false){
    return `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-17 15l8-188 23 2 14 186" fill="#aa8658"/><path d="M-2-68l-43-56M6-94l47-60" stroke="#aa8658" stroke-width="13" stroke-linecap="round"/><g class="leaf-sway"><path d="M-107-117C-174-168-116-238-70-219C-85-297 44-309 67-238C146-272 171-175 112-145C145-76 47-47 12-92C-17-34-119-58-107-117Z" fill="#88a16b"/><path d="M-87-194q-4-46 40-40M42-253q39-4 45 29M79-114q29-6 30-24" fill="none" stroke="#a9bd86" stroke-width="12" stroke-linecap="round" opacity=".6"/></g>${fruits?apple(-69,-178,.56)+apple(17,-231,.56)+apple(88,-178,.56)+apple(-21,-126,.56)+apple(61,-101,.56):''}</g>`;
  }
  function bird(x,y){return `<g transform="translate(${x} ${y})"><g class="party-bird"><ellipse rx="20" ry="13" fill="#e5b85e"/><path class="wing" d="M-4 0q-24-43-32-6q13 20 32 6" fill="#ba934d"/><path d="M18-2l13 6-13 4" fill="#ac7744"/><circle cx="10" cy="-4" r="2.3" fill="#425343"/></g></g>`;}
  function world(view='orchard', focus='meet', options={}){
    const id='sky'+(++svgCount),sunset=view==='sunset',picnic=view==='picnic'||sunset,bridge=view==='bridge';
    const shapes=focus==='shapes',wood=focus==='wood'||focus==='sign';
    let details='';
    if(bridge){
      details+=`<path d="M0 389Q300 303 491 377T1000 351V540H0Z" fill="#91bbc0"/><path d="M0 437Q278 371 482 430T1000 404M220 490q170-50 310-4" fill="none" stroke="#b7d4ce" stroke-width="5" opacity=".7"/>
      <g transform="translate(280 315) rotate(-2)"><rect width="430" height="63" rx="13" fill="#b39165" stroke="#8f7754" stroke-width="4"/>${[15,95,175,255,335,415].map(x=>`<path d="M${x} 2v57" stroke="#8f7754" stroke-width="3"/>`).join('')}<ellipse cx="250" cy="32" rx="28" ry="25" fill="${options.repaired?'#e5c07e':'#91bbc0'}" stroke="${options.repaired?'#c49e62':'#796c50'}" stroke-width="4"/>${options.repaired?'<path d="M236 32l10 10 19-21" fill="none" stroke="#6b8654" stroke-width="5" stroke-linecap="round"/>':''}<path d="M0 0v-50M430 0v-50M0-45h430" fill="none" stroke="#9d8059" stroke-width="9" stroke-linecap="round"/></g>`;
      if(focus==='circle')details+=`<g class="shape-roll"><circle cx="655" cy="233" r="47" fill="#d9bb83" stroke="#9b7e52" stroke-width="4"/><path d="M637 211q20-14 35 3m-42 19q27-12 48 2" fill="none" stroke="#b79662" stroke-width="4"/></g>`;
      if(shapes)details+=`<g transform="translate(410 153)"><circle cx="0" cy="30" r="44" fill="#e5b56b" stroke="#b18b54" stroke-width="3"/><path d="M140-18l51 88H89Z" fill="#dd9677" stroke="#b9745e" stroke-width="3"/><rect x="231" y="-14" width="85" height="85" rx="7" fill="#8caa91" stroke="#648775" stroke-width="3"/></g>`;
      if(wood){details+=`<g transform="translate(670 278)"><rect x="-70" y="-125" width="165" height="138" rx="20" fill="#fff2ce" stroke="#a48e64" stroke-width="4"/><path d="M15 12v78" stroke="#a48e64" stroke-width="13"/><g class="morph-tree">${tree(10,4,.43)}</g><text class="morph-word" x="12" y="-22" text-anchor="middle" font-family="KaiTi,serif" font-size="115" fill="#50764d">木</text></g>`;}
    }
    if(picnic){
      details+=`<g transform="translate(335 346)"><path d="M-72-15h345l97 125H-145Z" fill="#ead3a0" stroke="#cfb681" stroke-width="3"/><path d="M-115 68h448M-93 28h396M-8-14l-24 122M82-14l9 122M177-14l42 122M259-14l76 122" fill="none" stroke="#e2b283" stroke-width="13" opacity=".65"/></g>`;
      if(['four','meet','party','memory'].includes(focus))details+=apple(420,386,.6)+apple(467,386,.6)+apple(514,386,.6)+apple(561,386,.6);
      if(['sharing','equal','party','memory'].includes(focus))details+=`<ellipse cx="370" cy="411" rx="62" ry="19" fill="#fff6dd" stroke="#c0ae88" stroke-width="2"/><ellipse cx="646" cy="411" rx="62" ry="19" fill="#fff6dd" stroke="#c0ae88" stroke-width="2"/><g class="share-apple">${apple(352,395,.48)+apple(388,395,.48)}</g><g class="share-apple">${apple(628,395,.48)+apple(664,395,.48)}</g>`;
      if(['equal','sharing'].includes(focus))details+=`<g font-size="42" font-weight="700" fill="#456b4d"><text x="352" y="330">2</text><text x="629" y="330">2</text></g>`;
      if(focus==='clean')details+=`<path d="M425 353h78l-9 94h-60Z" fill="#b4bc92" stroke="#7d8d68" stroke-width="3"/><path d="M439 354q-3-44 24-41t26 41" fill="none" stroke="#7d8d68" stroke-width="6"/>`;
      if(focus==='bye')details+=`<path d="M235 460Q460 370 610 419T1000 420V540H230Z" fill="#d5be8c"/>`;
    }
    if(!picnic&&!bridge&&['red','count','english','basket'].includes(focus)){
      const showCount=focus==='count';
      details+=`<g transform="translate(420 367)"><rect x="-126" y="-39" width="278" height="116" rx="29" fill="#fff7dc" stroke="#b4bf8c" stroke-width="3"/>${apple(-67,14,.7,'fruit-pulse')+apple(13,14,.7,'fruit-pulse')+apple(93,14,.7,'fruit-pulse')}${showCount?`<g font-weight="800" font-size="29" fill="#57804d"><text class="count-number" x="-77" y="-53">1</text><text class="count-number n2" x="3" y="-53">2</text><text class="count-number n3" x="83" y="-53">3</text></g>`:''}${focus==='english'?`<text x="12" y="-57" text-anchor="middle" font-family="Georgia,serif" font-size="51" fill="#476a48">apple</text>`:''}</g>`;
    }
    return `<svg viewBox="0 0 1000 540" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${bridge?'森林里的小木桥':picnic?'米米和点点的森林野餐':'米米来到红苹果树下'}"><defs><linearGradient id="${id}" x2="0" y2="1"><stop stop-color="${sunset?'#ebc4a2':'#dfead4'}"/><stop offset="1" stop-color="${sunset?'#f2dfb1':'#f1edcc'}"/></linearGradient></defs>
      <rect width="1000" height="540" fill="url(#${id})"/><g class="scene-camera">
      <circle class="sun-glow" cx="${sunset?754:785}" cy="${sunset?209:98}" r="48" fill="#fff0b5"/><circle cx="${sunset?754:785}" cy="${sunset?209:98}" r="65" fill="#fff5c4" opacity=".28"/>
      <g class="cloud-drift" fill="#fffbed" opacity=".7"><path d="M200 99q-25-28-52-3q-22-1-28 16h119q-5-18-39-13"/><path d="M557 73q-22-25-46-3q-19-1-24 14h103q-4-15-33-11"/></g>
      <path d="M-100 335Q125 141 389 302Q600 143 1100 309V540H-100Z" fill="${sunset?'#a4b58c':'#b5c497'}"/>
      <path d="M-100 361Q270 222 554 365Q808 253 1100 362V540H-100Z" fill="${sunset?'#849d73':'#9fb584'}"/>
      <path d="M0 409Q420 324 1000 390V540H0Z" fill="${sunset?'#92aa7e':'#c1cb94'}"/>
      ${tree(95,410,1.18)}${tree(917,391,.97,!picnic&&!bridge&&!options.harvest)}${tree(833,368,.7)}
      <path d="M0 488q230-40 470 5t530-4v65H0" fill="#b3c48d" opacity=".7"/>
      ${details}
      ${bunny(picnic?270:bridge?210:230,picnic?342:bridge?287:361,picnic?.85:bridge?.78:.9)}
      ${fox(picnic?731:bridge?820:665,picnic?348:bridge?297:370,picnic?.86:bridge?.78:.83)}
      ${!bridge?`<g transform="translate(123 476)"><path d="M0 0v-21m0 9l-14-10m14 16l13-13" stroke="#6d8d53" stroke-width="3"/><circle cy="-27" r="8" fill="#e5b469"/></g><g transform="translate(870 470)"><path d="M0 0v-21m0 9l-14-10m14 16l13-13" stroke="#6d8d53" stroke-width="3"/><circle cy="-27" r="8" fill="#e4a28c"/></g>`:''}
      ${bird(picnic?570:480,180)}<g class="sparkle" fill="#fff7c7"><path d="M370 190l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"/><circle cx="793" cy="281" r="3"/><circle cx="163" cy="263" r="3"/></g>
      </g></svg>`;
  }
  function icon(name){
    let content='';
    if(name==='apple')content=apple(50,49,1);
    else if(name==='carrot')content='<path d="M43 25Q71 21 69 46L26 88Z" fill="#e6a055" stroke="#a97a48" stroke-width="2"/><path d="M50 25L46 9m11 14L66 8m-7 21L79 17" stroke="#769362" stroke-width="7" stroke-linecap="round"/><path d="M42 49l10 4m-17 12l10 5" stroke="#bf8748" stroke-width="3"/>';
    else if(name==='banana')content='<path d="M20 19Q20 69 76 60L88 48Q76 95 39 86Q4 73 12 28Z" fill="#edc868" stroke="#b1934d" stroke-width="3"/><path d="M17 29Q12 81 76 70" fill="none" stroke="#f6e29d" stroke-width="4"/>';
    else if(name==='circle')content='<circle cx="50" cy="50" r="36" fill="#d5b583" stroke="#a08358" stroke-width="3"/><path d="M30 36q18-9 37 3M26 56q25-12 48 2" fill="none" stroke="#bd9c69" stroke-width="3"/>';
    else if(name==='square')content='<rect x="15" y="15" width="70" height="70" rx="6" fill="#94ae96" stroke="#708e75" stroke-width="3"/>';
    else if(name==='triangle')content='<path d="M50 12L93 85H7Z" fill="#dfa17f" stroke="#b67d61" stroke-width="3"/>';
    else if(name==='heart')content='<path d="M50 85Q-5 51 15 25Q34 5 50 32Q68 5 85 25Q104 52 50 85Z" fill="#d99783"/><path d="M30 28q-9-1-10 9" stroke="#f5cabc" stroke-width="5" stroke-linecap="round" fill="none"/>';
    else if(name==='cookie')content='<circle cx="50" cy="50" r="36" fill="#dcb678" stroke="#b69258" stroke-width="3"/><g fill="#95754d"><circle cx="35" cy="34" r="5"/><circle cx="65" cy="40" r="5"/><circle cx="43" cy="65" r="5"/><circle cx="67" cy="67" r="4"/></g>';
    else if(name==='cloud')content='<path d="M25 72q-25-8-13-31q8-11 21-8q8-30 32-16q14 8 12 24q23-2 19 18q-2 15-22 14Z" fill="#aabcb5"/><path d="M36 56h5m18 0h5" stroke="#667d72" stroke-width="4" stroke-linecap="round"/>';
    return `<svg viewBox="0 0 100 100" aria-hidden="true">${content}</svg>`;
  }


window.StoryArt={apple,bunny,fox,tree,bird,world,icon};
})();
