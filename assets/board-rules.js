(function(root){'use strict';
const inside=(x,y,w,h)=>Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<w&&y<h;
const at=(pieces,x,y)=>pieces.find(p=>p.x===x&&p.y===y);
function between(pieces,a,x,y){if(a.x!==x&&a.y!==y)return -1;const dx=Math.sign(x-a.x),dy=Math.sign(y-a.y);let count=0;for(let xx=a.x+dx,yy=a.y+dy;xx!==x||yy!==y;xx+=dx,yy+=dy)if(at(pieces,xx,yy))count++;return count;}
function pseudo(pieces,id,x,y){const p=pieces.find(p=>p.id===id);if(!p||!inside(x,y,9,10)||(p.x===x&&p.y===y))return false;const dest=at(pieces,x,y);if(dest?.side===p.side)return false;const dx=x-p.x,dy=y-p.y,ax=Math.abs(dx),ay=Math.abs(dy),red=p.side==='r';
 switch(p.type){
 case 'R':return (dx===0||dy===0)&&between(pieces,p,x,y)===0;
 case 'C':return (dx===0||dy===0)&&between(pieces,p,x,y)===(dest?1:0);
 case 'H':if(ax===2&&ay===1)return !at(pieces,p.x+Math.sign(dx),p.y);if(ax===1&&ay===2)return !at(pieces,p.x,p.y+Math.sign(dy));return false;
 case 'E':return ax===2&&ay===2&&(red?y>=5:y<=4)&&!at(pieces,p.x+dx/2,p.y+dy/2);
 case 'A':return ax===1&&ay===1&&x>=3&&x<=5&&(red?y>=7:y<=2);
 case 'K':if(dest?.type==='K'&&dx===0&&between(pieces,p,x,y)===0)return true;return ax+ay===1&&x>=3&&x<=5&&(red?y>=7:y<=2);
 case 'P':return (dx===0&&dy===(red?-1:1))||((red?p.y<=4:p.y>=5)&&dy===0&&ax===1);
 default:return false;
 }}
function checked(pieces,side){const k=pieces.find(p=>p.type==='K'&&p.side===side);if(!k)return false;return pieces.some(p=>p.side!==side&&pseudo(pieces,p.id,k.x,k.y));}
function move(pieces,id,x,y,strict=true){const p=pieces.find(p=>p.id===id);if(!p||!pseudo(pieces,id,x,y))return null;const dest=at(pieces,x,y);if(strict&&dest?.type==='K')return null;const next=pieces.filter(q=>q.id!==dest?.id).map(q=>q.id===id?{...q,x,y}:{...q});return strict&&checked(next,p.side)?null:next;}
function legal(pieces,side){const out=[];for(const p of pieces.filter(p=>p.side===side))for(let y=0;y<10;y++)for(let x=0;x<9;x++)if(move(pieces,p.id,x,y,true))out.push({id:p.id,x,y});return out;}
function mate(pieces,side){return checked(pieces,side)&&legal(pieces,side).length===0;}
function attackSquare(pieces,id,x,y){const p=pieces.find(p=>p.id===id);if(!p)return false;const target=at(pieces,x,y),copy=pieces.map(q=>q.id===target?.id?{...q,side:p.side==='r'?'b':'r'}:q);return pseudo(copy,id,x,y);}
function winLine(board,size,side,k=5){for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(board[y*size+x]===side)for(const [dx,dy]of [[1,0],[0,1],[1,1],[1,-1]]){const points=[];for(let i=0;i<k;i++){const xx=x+i*dx,yy=y+i*dy;if(!inside(xx,yy,size,size)||board[yy*size+xx]!==side)break;points.push([xx,yy]);}if(points.length===k)return points;}return null;}
function winningSpots(board,size,side,k=5){const result=[];for(let i=0;i<board.length;i++)if(!board[i]){const copy=board.slice();copy[i]=side;if(winLine(copy,size,side,k))result.push(i);}return result;}
function reply(board,size,side,k=5){const enemy=side===1?2:1,wins=winningSpots(board,size,side,k);if(wins.length)return wins[0];const blocks=winningSpots(board,size,enemy,k);if(blocks.length)return blocks[0];let best=-1,score=-Infinity;for(let i=0;i<board.length;i++)if(!board[i]){const copy=board.slice();copy[i]=side;const threats=winningSpots(copy,size,side,k).length;const center=(size-1)/2,value=threats*100-Math.abs(i%size-center)-Math.abs(Math.floor(i/size)-center);if(value>score){best=i;score=value;}}return best;}
function gomoku(size,stones=[]){const b=Array(size*size).fill(0);for(const [x,y,side]of stones){if(!inside(x,y,size,size)||b[y*size+x])throw Error('Invalid or duplicate stone');b[y*size+x]=side;}return b;}
const api={inside,at,between,pseudo,checked,move,legal,mate,attackSquare,winLine,winningSpots,reply,gomoku};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BoardRules=api;
})(typeof window==='undefined'?globalThis:window);
