(()=>{'use strict';
const A=window.StoryArt;
const colors={red:'#d76c61',blue:'#719db6',green:'#8eab7e',gold:'#e8bf77'};
const text=(x,y,t,size=20,color='#44634e')=>`<text x="${x}" y="${y}" text-anchor="middle" fill="${color}" font-family="system-ui, sans-serif" font-size="${size}">${t}</text>`;
const shape=(kind,x,y,size=38,color='green',cls='')=>`<g class="${cls}">${kind==='circle'?`<circle cx="${x}" cy="${y}" r="${size}" fill="${colors[color]||color}" stroke="#53694e" stroke-width="3"/>`:`<rect x="${x-size}" y="${y-size}" width="${size*2}" height="${size*2}" rx="5" fill="${colors[color]||color}" stroke="#53694e" stroke-width="3"/>`}</g>`;
const plate=(x,y)=>`<ellipse cx="${x}" cy="${y}" rx="100" ry="30" fill="#fbf5db" stroke="#bdc59d" stroke-width="5"/><ellipse cx="${x}" cy="${y}" rx="82" ry="20" fill="none" stroke="#e4dbb8" stroke-width="2"/>`;
const basket=(x,y)=>`<g transform="translate(${x} ${y})"><path d="M-50-15q0-80 100 0" fill="none" stroke="#a48250" stroke-width="8"/><path d="M-65-10h130l-15 65h-100Z" fill="#d4b175" stroke="#9b7b4d" stroke-width="4"/><path d="M-55 10h110m-105 20h100m-75-37v55m25-55v55m25-55v55" stroke="#ae8c54" stroke-width="4"/></g>`;
const cat=(x,y,scale=.8)=>`<g transform="translate(${x} ${y}) scale(${scale})"><ellipse cy="22" rx="40" ry="30" fill="#d6b48c"/><path d="M-27-14l-10-35 29 18 25-2 26-18-7 39" fill="#c7a77e" stroke="#947955" stroke-width="2"/><ellipse cy="-9" rx="37" ry="29" fill="#e7cda5"/><path d="M-24-7q7 8 14 0m20 0q7 8 14 0" fill="none" stroke="#5b5747" stroke-width="3"/><path d="M-4 4h8l-4 5Z" fill="#ad8276"/><path d="M27 36q78 4 52-28" fill="none" stroke="#d6b48c" stroke-width="13" stroke-linecap="round"/></g>`;
const umbrella=(x,y)=>`<g transform="translate(${x} ${y})"><path d="M-94 0Q0-136 94 0q-25-20-48 0Q23-20 0 0Q-23-20-47 0Q-71-20-94 0" fill="#7fa5a0" stroke="#527f77" stroke-width="3"/><path d="M0-68V79q0 30-22 17" fill="none" stroke="#7c7350" stroke-width="6" stroke-linecap="round"/></g>`;
const house=(lit=false)=>`<g transform="translate(450 195)"><rect x="-150" y="-25" width="300" height="225" rx="12" fill="#dec79d"/><path d="M-175-25L0-145 175-25Z" fill="#9ca77c" stroke="#6d845e" stroke-width="5"/><path d="M-23 200V100q0-35 46 0v100" fill="#a27f5b"/><circle cx="-80" cy="50" r="42" fill="${lit?'#fbe2a3':'#829883'}" stroke="#80694e" stroke-width="8"/><rect x="40" y="8" width="84" height="84" rx="3" fill="${lit?'#fbe2a3':'#829883'}" stroke="#80694e" stroke-width="8"/></g>`;
function rain(){return Array.from({length:20},(_,i)=>`<path class="rain-drop" style="animation-delay:${-(i%5)*.24}s" d="M${80+i*37} ${45+(i%3)*48}l-8 24" stroke="#8cb3bb" stroke-width="5" stroke-linecap="round"/>`).join('');}
function background(dark=false){return `<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${dark?'#d3dcd6':'#e3eddd'}"/><stop offset="1" stop-color="#fbf6df"/></linearGradient></defs><rect width="900" height="510" fill="url(#sky)"/><circle cx="735" cy="85" r="35" fill="#f0d394"/><path d="M0 340Q180 230 380 325T900 288V510H0Z" fill="#c7d4ad"/><path d="M0 400Q240 320 460 390T900 360V510H0Z" fill="#b4c69b"/>${A.tree(90,420,.9)}${A.tree(850,375,.67)}<path d="M250 510q120-130 360-70l100 70Z" fill="#dce0bb"/><g opacity=".6">${[180,290,700,770].map((x,i)=>`<circle cx="${x}" cy="${450-i*11}" r="4" fill="#f6e7b3"/>`).join('')}</g>`;}
function cast(mode,step,phase,choice){
 let foxX=655,bunnyX=235,scale=.82,extra='';
 if(mode==='shape'){foxX=725;bunnyX=175;scale=.72;}
 if(mode==='position'){foxX=740;bunnyX=160;scale=.7;}
 if(mode==='emotion'){bunnyX=phase==='film'&&step<2?310:520;foxX=665;scale=.78;}
 if(mode==='shadow')return '';
 if(mode==='action'&&(choice?choice==='walk':phase==='game'?false:(phase==='film'?(step===0||step===2):step%2===0)))extra='puppet-walk';
 let fox=A.fox(foxX,342,scale);
 if(mode==='emotion'&&!(phase==='teach'&&step===3)&&phase!=='ending')fox=fox.replace('m0 0q-8 7-14 0m14 0q8 7 14 0','m-14 7q14-14 28 0');
 return `<g class="${extra}">${A.bunny(bunnyX,333,scale)}${fox}</g>`;
}
function share(step,phase,party=false){
 let detail=`<path d="M230 370h440l45 100H185Z" fill="#d6baa0" opacity=".7"/>${plate(310,419)}${plate(600,419)}`;
 if(phase==='teach'){
   if(step===0){detail+=A.apple(310,408,.42)+A.apple(564,400,.42)+A.apple(604,414,.42)+A.apple(641,399,.42);}
   else if(step===1){detail+=A.apple(310,408,.42)+A.apple(564,400,.42)+A.apple(604,414,.42)+A.apple(641,399,.42)+`<path d="M330 390Q440 330 545 390" fill="none" stroke="#718c61" stroke-width="4" stroke-dasharray="8 7"/>`;}
   else if(step===2){for(let i=0;i<4;i++)detail+=`<g class="moving-apple" style="--dx:${i%2?150:-150}px;--dy:125px;--delay:${i*1.1}s">${A.apple(435+(i%2)*34,278,.4)}</g>`;}
   else {detail+=A.apple(280,403,.42)+A.apple(330,415,.42)+A.apple(570,403,.42)+A.apple(620,415,.42);detail+=`<path d="M310 385H600M310 435H600" stroke="#8b9f6a" stroke-width="3" stroke-dasharray="8 8"/>`;}
 }else if(phase==='film'){
   if(step<3){detail+=`<g transform="translate(450 385)"><rect x="-45" width="90" height="65" rx="13" fill="#a88a60"/>${A.apple(0,-25,.57)}${step>0?A.apple(0,-69,.48):''}</g>`;if(step===2)detail+=`<g class="roll-prop">${A.apple(465,440,.5)}</g><path class="soft-wave" d="M700 390q50-50 70-10q-30 36-70 10" fill="#729b64"/>`;}
   else{detail+=basket(445,390);for(let i=0;i<4;i++)detail+=A.apple(405+i*26,365-(i%2)*15,.32);if(step>=4)detail+=`<path d="M365 290q90-65 175 0q-90 45-175 0" fill="#6d945e"/>`;if(step===5)detail+=basket(655,200);}
 }else {detail+=basket(450,375);for(let i=0;i<4;i++)detail+=A.apple(405+i*27,355-(i%2)*12,.32);detail+=`<g transform="translate(525 400)"><path d="M-12-38h24v10l8 12v38h-40v-38l8-12Z" fill="#a9cfd0" stroke="#70949a" stroke-width="3"/></g>`;}
 if(party)detail+=flags();return detail;
}
function flags(){return `<path d="M160 80Q450 190 750 80" fill="none" stroke="#8d9d72" stroke-width="3"/>${[0,1,2,3,4,5,6].map(i=>`<path class="flag-wave" d="M${190+i*80} ${95+Math.sin(i/6*Math.PI)*38}l15 45 26-32Z" fill="${i%2?colors.blue:colors.red}"/>`).join('')}`;}
function partyScene(step,phase){
 let d=flags();
 if(phase==='film'){
  if(step<3)d+=`<g transform="translate(650 240) rotate(${step===0?20:0})"><path d="M-48 0l48-65L48 0Z" fill="#e8c27d" stroke="#a48550" stroke-width="3"/><circle cy="-66" r="9" fill="#c97767"/></g><g transform="translate(${step===2?450:570} ${step===2?406:355}) rotate(${step===1?180:-12})"><rect x="-50" y="-28" width="100" height="56" rx="6" fill="#fff1cb" stroke="#ad986c" stroke-width="3"/>${text(0,11,'→',38)}</g>`;
  if(step>=2)d+=`<path d="M350 430h200m-170 0v60m140-60v60" stroke="#b18a5f" stroke-width="10"/>`;
  if(step>=4)d+=`<rect x="400" y="230" width="100" height="175" rx="44" fill="#7c9d76" stroke="#6e845c" stroke-width="8"/>${step===5?'<path class="door-open" d="M410 250l60 10v145l-60-12Z" fill="#d2bf8d"/><circle cx="452" cy="329" r="4" fill="#90734c"/>':''}`;
 }else{
  d+=plate(310,419)+plate(600,419);
  const count=phase==='ending'?4:phase==='teach'&&step===1?2:0;
  for(let i=0;i<4;i++){const assigned=i<count,x=assigned?(i%2?600:310)+(i>=2?22:-22):410+(i%2)*67,y=assigned?410:280+Math.floor(i/2)*53;d+=shape('square',x,y,22,'gold');d+=text(x,y+8,'✿',23,'#a37945');}
 }
 return d;
}
function colorScene(step,phase){let d=flags();if(phase==='film'&&step<4){d+=`<path class="flag-wave" d="M${step%2?390:570} 210h135v210h-135Z" fill="${step%2?colors.blue:colors.red}" opacity=".92"/>`;if(step===1)d+=`<ellipse cx="450" cy="385" rx="40" ry="20" fill="#6994a4"/>`;if(step===2)d+=A.bird(480,390);}else d+=`<g>${shape('circle',370,390,30,'red')}${shape('square',440,390,30,'red')}${shape('circle',520,390,30,'blue')}${shape('square',590,390,30,'blue')}</g>`;return d;}
function shapeScene(step,phase){let d=house(phase==='ending'||phase==='film'&&step>=4);if(phase==='teach'){d+=`<circle class="draw-outline" cx="370" cy="245" r="45" fill="none" stroke="#f9efc8" stroke-width="8"/>`;if(step>=2)d+=`<rect class="draw-outline" x="490" y="203" width="88" height="88" rx="3" fill="none" stroke="#f9efc8" stroke-width="7"/>`;d+=shape(step>=2?'square':'circle',450,430,31,'green');}if(phase==='film'&&step<4)d+=`<g class="${step<2?'roll-prop':''}"><circle cx="395" cy="430" r="38" fill="none" stroke="#a47f4c" stroke-width="12"/></g>${step>=2?shape('square',550,427,34,'green'):''}`;return d;}
function weatherScene(step,phase,choice){const sunny=phase==='teach'&&step===0||choice==='hat'||choice==='ball';let d=sunny?'':`<defs><mask id="rain-cut"><rect width="900" height="510" fill="white"/>${phase!=='film'?'<rect x="551" y="245" width="188" height="265" fill="black"/>':step>2?'<rect x="155" y="210" width="590" height="300" fill="black"/>':''}</mask></defs><g mask="url(#rain-cut)">${rain()}</g>`;if(phase==='film'){d+=`<path class="soft-wave" d="M320 330q70-80 140 0q-70 35-140 0" fill="#6b9662"/>${step>0?`<path d="M470 380h85l-13 70h-60Z" fill="#b7b8a2" stroke="#7c8a76" stroke-width="3"/><ellipse class="ripple" cx="513" cy="389" rx="30" ry="8" fill="none" stroke="#729da0" stroke-width="3"/>`:''}`;if(step>2)d+=`<path d="M125 210h650l-60-75H195Z" fill="#91a17c"/><path d="M155 210v240m590-240v240" stroke="#8f8060" stroke-width="13"/>`;}else if(!sunny){d+=umbrella(645,245);if(step===2||choice==='coat')d+=`<path d="M190 320l-40 65 30 16 16-25-8 70h94l-8-70 17 25 30-16-41-65Z" fill="#dfc467" stroke="#a5944e" stroke-width="3"/>`;}if(step===3||phase==='ending')d+=`<rect x="365" y="385" width="180" height="65" rx="8" fill="#fff6df"/>${text(450,425,'☂  ☁  ☀',35)}`;return d;}
function positionScene(step,phase,position){let d=`<path d="M310 310h300v24H310Z" fill="#b18b63"/><path d="M330 334v130m260-130v130" stroke="#95734f" stroke-width="18"/>`;const under=position?position==='under':phase==='teach'?step%2===1:phase==='film'?step<4:step%2===0;d+=cat(450,under?410:275);if(phase==='film'&&step<3)d+=`<rect x="321" y="334" width="260" height="120" rx="5" fill="#d2bea0"/><path class="soft-wave" d="M570 425q80 30 63-32" fill="none" stroke="#d6b48c" stroke-width="13" stroke-linecap="round"/>`;if(phase==='teach')d+=`<path class="draw-outline" d="M307 307h306" stroke="#f8e7a6" stroke-width="7"/>`;return d;}
function actionScene(step,phase,choice){let d=`<path d="M270 430h350" stroke="#d1b88b" stroke-width="48" stroke-linecap="round"/><path d="M270 430h350" stroke="#f5e8c6" stroke-width="3" stroke-dasharray="14 12"/>`;if(phase==='film'){if(step<3||step===5)d+=`<g transform="translate(${step===5?490:655} ${step===5?440:step===1?307:255})"><g class="${step===0?'soft-wave':''}"><path d="M-43 0L0-65 43 0Z" fill="#ddbb76" stroke="#aa8850" stroke-width="3"/><path d="M-43 0h86" stroke="#8ba080" stroke-width="11"/></g></g>`;if(step===3||step===4)d+=`<path class="${step===4?'ribbon-fall':'soft-wave'}" d="M350 210Q500 110 680 205q35 30 60-15" fill="none" stroke="#ca8b7c" stroke-width="11" stroke-linecap="round"/>`;}else d+=text(450,275,choice==='stop'||step%2?'✋':'♪',65);return d;}
function patternScene(step,phase){const seq=step===3?['circle','square','circle','square']:['red','blue','red','blue'];return `<g class="${phase==='film'||phase==='ending'?'train-moving':''}"><path d="M220 430h470" stroke="#8b8b65" stroke-width="4"/>${seq.map((v,i)=>`<g>${shape(v==='circle'?'circle':'square',290+i*92,385,34,v==='circle'?'gold':v==='square'?'green':v)}<circle cx="${275+i*92}" cy="430" r="10" fill="#637356"/><circle cx="${307+i*92}" cy="430" r="10" fill="#637356"/></g>`).join('')}</g>${phase==='film'&&step===1?`<g class="ticket-to-nose"><rect x="545" y="285" width="55" height="35" rx="5" fill="#fbf1cd" stroke="#aa9767" stroke-width="2"/></g>`:phase==='film'&&step>=2?`<rect x="644" y="371" width="25" height="16" rx="3" fill="#fbf1cd"/>`:''}`;}
function emotionScene(step,phase,choice){if(phase==='film')return `<path class="${step===1?'soft-wave':''}" d="M480 390h80v15h-80Zm8 15v57m64-57v57" stroke="#aa8d60" stroke-width="8" fill="#c0a578"/><path d="M620 415h90v15h-90Z" fill="#d5b98f"/><path class="${step>=3?'leaf-fall':'soft-wave'}" d="M415 285q50-35 70 0q-35 40-70 0" fill="#8d9f64"/>${step>=2?'<path d="M725 370h65v12h-65Zm8 12v45m50-45v45" stroke="#a78b61" stroke-width="6" fill="#c7ad80"/>':''}`;const fallen=phase==='film'?step<3:phase==='teach'?step<2:choice!=='build';return `<g>${[0,1,2,3].map((_,i)=>shape('square',fallen?380+i*45:460,fallen?420+(i%2)*12:425-i*48,23,i%2?'blue':'gold')).join('')}</g>${phase==='film'||step>1?`<path d="M530 390h80v15h-80Zm8 15v57m64-57v57" stroke="#aa8d60" stroke-width="8" fill="#c0a578"/>`:''}<path d="M653 280q-10-10-20 0m20 0q10-10 20 0" stroke="#805d46" stroke-width="3" fill="none"/>${text(458,236,fallen?'☁':'☀',42)}`;}
function shadowScene(step,phase,choice){
 const inLight=choice?choice!=='out':phase==='teach'?step!==2:phase==='film'?step<5:true;
 const round=choice==='circle'||phase==='teach'&&step===3;
 let d=`<path d="M180 264L700 135V430Z" fill="#f8eac1" opacity=".48"/><rect x="700" y="130" width="155" height="310" rx="9" fill="#fff6d8" stroke="#bdc8ad" stroke-width="4"/><path d="M130 237l60 8v48l-60 8Z" fill="#dcbd73" stroke="#a48c55" stroke-width="4"/><path d="M140 301v110m-30 0h65" stroke="#7f8d71" stroke-width="9" stroke-linecap="round"/>`;
 if(phase==='film'){
   d+=`<g class="${step<5?'shadow-wave':''}">${A.fox(430,330,.65)}${step>=2&&step<5?A.bunny(555,333,.6):''}</g>`;
   if(inLight)d+=`<g class="${step<5?'shadow-wave':''}" filter="url(#silhouette)">${A.fox(770,305,.48)}${step>=2?A.bunny(825,308,.38):''}</g>`;
   if(step===4)d+=A.bird(610,230);
   if(step===5)d+=`<rect x="335" y="388" width="160" height="80" rx="6" fill="#e7dbbc"/>${text(415,440,'影子的画',18)}`;
 }else{
   d+=shape(round?'circle':'square',455,inLight?290:435,34,'green');
   if(inLight)d+=shape(round?'circle':'square',778,302,round?60:55,'#7f8068');
 }
 return d;
}
function render(lesson,phase='opening',step=0,options={}){
 if(lesson?.visual){if(window.AgeScenes)return AgeScenes.render(lesson,phase,step,options);return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 510" role="img" aria-label="分龄动画暂未加载，请刷新" data-scene-unavailable="true"><rect width="900" height="510" fill="#e8efdf"/><text x="450" y="245" text-anchor="middle" font-size="27" fill="#31543d">分龄动画暂未加载，请刷新后重试。</text></svg>`;}
 const mode=lesson?.mode||'party',hero=!lesson;let details='';
 if(mode==='share')details=share(step,phase);
 if(mode==='party')details=partyScene(step,phase);
 if(mode==='color')details=colorScene(step,phase);
 if(mode==='shape')details=shapeScene(step,phase);
 if(mode==='weather')details=weatherScene(step,phase,options.choice);
 if(mode==='position')details=positionScene(step,phase,options.choice);
 if(mode==='action')details=actionScene(step,phase,options.choice);
 if(mode==='pattern')details=patternScene(step,phase);
 if(mode==='emotion')details=emotionScene(step,phase,options.choice);
 if(mode==='shadow')details=shadowScene(step,phase,options.choice);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 510" role="img" aria-label="${hero?'米米和点点在森林等待朋友':lesson.title+'的故事画面'}"><defs><filter id="silhouette"><feColorMatrix type="matrix" values="0 0 0 0 .42 0 0 0 0 .44 0 0 0 0 .34 0 0 0 .8 0"/></filter></defs>${background(mode==='weather')}<g class="film-enter">${mode==='shape'?details:''}${cast(mode,step,phase,options.choice)}${mode!=='shape'?details:''}${mode!=='shadow'?A.bird(740,160):''}</g></svg>`;
}
window.Scenes={render,shape,cat};
})();
