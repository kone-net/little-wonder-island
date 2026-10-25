/* Supplied classroom case material, all simulated. */
(()=>{'use strict';const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cases={
'P05-02':{type:'clues',cards:['耳朵长','常吃草','会跳']},
'P05-04':{type:'clues',cards:['小船摇呀摇，小鸟瞧一瞧','小车走，云朵白']},
'P08-07':{type:'evidence',cards:['通知：周六上午9点集合','地点：阅读角，参加换书','装饰建议：招牌可用金色'],required:[0,1],instruction:'点出别人按通知来参加时必须知道的信息。'},
'P08-14':{type:'evidence',cards:['点点把最后一块饼干留给迟到的朋友','点点戴着蓝色帽子','桌子有四条腿'],required:[0],instruction:'标出能支持关心朋友这一判断的动作。'},
'P09-14':{type:'evidence',cards:['海报已经完整','又加无关文字，遮住了主题','海报用普通白纸制作'],required:[0,1],instruction:'标出前后变化中能帮助判断成语的部分。'},
'P10-04':{type:'variables',cards:['杯子的形状与大小','开始时的水量','通风条件'],required:[0,0,1],instruction:'把比较方案先设计出来：哪些固定，哪项改变？'},
'P11-07':{type:'evidence',cards:['文字：参加总数20人','图表：A栏8人，B栏15人','版面：蓝色标题配绿色边框'],required:[0,1],instruction:'标出存在数量或口径冲突、需要回到来源确认的材料。'},
'P12-07':{type:'evidence',cards:['模拟报告甲：秋季登记；乙：春季调查','甲只含低年级；乙包含全校','甲按登记人数40统计；乙按问卷人数62统计','两份报告用了不同的封面颜色'],required:[0,1,2],instruction:'并排核对两份模拟资料，标出应该先核实的差异。'},
'P12-11':{type:'evidence',cards:['覆盖不同年级','纳入篮球社以外的学生','覆盖不同运动偏好的学生','只多问几次同一个篮球社'],required:[0,1,2],instruction:'给调查方案补样本，选择改善覆盖面的做法。'}
};
function render(id,d){const t=cases[id];if(!t)return '';let html='<section class="x-source x-case-material" data-case-type="'+t.type+'"><b>'+(t.type==='clues'?'观察 / 请大人慢读':'模拟材料与操作台')+'</b><p>'+esc(t.instruction||'点开一条线索，再把几条线索连起来。')+'</p>';
if(t.type==='variables')html+='<div class="x-variable-controls">'+t.cards.map((v,i)=>'<article><h3>'+esc(v)+'</h3>'+['固定','改变'].map((l,j)=>'<button class="x-btn '+(d.caseVariables?.[i]===j?'selected':'')+'" data-x="caseVariable" data-v="'+i+','+j+'">'+l+'</button>').join('')+'</article>').join('')+'</div>';
else html+='<div class="x-case-clues">'+t.cards.map((v,i)=>'<button class="x-btn '+(d.caseMarks?.includes(i)?'selected':'')+'" data-x="caseMark" data-v="'+i+'">'+(t.type==='clues'&&!d.caseMarks?.includes(i)?'线索 '+(i+1)+' · 点开':esc(v))+'</button>').join('')+'</div>';return html+'</section>';}
function validate(id,d){const t=cases[id];if(!t||t.type==='clues')return '';if(t.type==='variables')return t.required.every((v,i)=>d.caseVariables?.[i]===v)?'':'先核对比较条件：只改变通风，杯子和水量保持一致。';const selected=d.caseMarks||[];return selected.length===t.required.length&&t.required.every(i=>selected.includes(i))?'':'先在材料台标出相关依据；装饰或无关细节不能代替证据，可以改选。';}
window.ClassroomCases={render,validate};
})();
