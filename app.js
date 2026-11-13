/* Six D3 comparison prototypes using locally saved NASA MODIS imagery. See README. */
(() => {
  'use strict';
  const W=960,H=640;
  const cases=[
    {id:'dixie',title:'Dixie Fire · California, 2021',summary:'Compare a forested region before and later in the 2021 fire season. NASA documented multiple burn scars in its September 21 MODIS image; the later view can include effects from more than one fire.',source:'https://earthobservatory.nasa.gov/images/148913/a-multi-dimensional-fire-challenge',before:0,later:2,dates:[
      {iso:'2021-07-10',short:'Jul 10',label:'July 10, 2021',note:'Earlier image, before the Dixie Fire started in mid-July.'},
      {iso:'2021-08-15',short:'Aug 15',label:'August 15, 2021',note:'During the fire season; smoke obscures much of this view.'},
      {iso:'2021-09-21',short:'Sep 21',label:'September 21, 2021',note:'NASA documented multiple recent burn scars, including the Dixie Fire, on this date.'},
      {iso:'2021-10-10',short:'Oct 10',label:'October 10, 2021',note:'A later observation. Differences may include effects of more than one fire and changes in conditions.'}]},
    {id:'pakistan',title:'Indus River floods · Pakistan, 2012',summary:'Compare the Indus River region as heavy rain and flooding developed. NASA published a MODIS comparison using September 1 and September 13.',source:'https://earthobservatory.nasa.gov/images/79171/flooding-in-pakistan',before:0,later:2,dates:[
      {iso:'2012-09-01',short:'Sep 1',label:'September 1, 2012',note:'Earlier conditions in the comparison published by NASA.'},
      {iso:'2012-09-08',short:'Sep 8',label:'September 8, 2012',note:'Clouds obscure much of the landscape in this sample.'},
      {iso:'2012-09-13',short:'Sep 13',label:'September 13, 2012',note:'During the flooding; NASA used this date to show inundated conditions.'},
      {iso:'2012-09-20',short:'Sep 20',label:'September 20, 2012',note:'A later observation during the broader flood period; cloud and water appearance differ by date.'}]},
    {id:'kenya',title:'Mount Kenya wildfire · Kenya, 2019',summary:'Explore the 2019 wildfire on Mount Kenya’s eastern slopes. NASA reported first satellite detections on February 23 and documented the fire on February 27.',source:'https://earthobservatory.nasa.gov/images/144615/fire-on-mount-kenya',before:1,later:4,dates:[
      {iso:'2019-02-15',short:'Feb 15',label:'February 15, 2019',note:'Before first reported satellite detections; clouds partly obscure the area.'},
      {iso:'2019-02-20',short:'Feb 20',label:'February 20, 2019',note:'Before the first reported satellite detections on February 23.'},
      {iso:'2019-02-23',short:'Feb 23',label:'February 23, 2019',note:'NASA reports first satellite detections on this date. Clouds obscure much of the view.'},
      {iso:'2019-02-27',short:'Feb 27',label:'February 27, 2019',note:'NASA documented the active fire and a burn scar in MODIS imagery on this date.'},
      {iso:'2019-03-15',short:'Mar 15',label:'March 15, 2019',note:'A later observation after the fire began; cloud cover is still present.'}]}
  ];
  const img=(c,date,type='false')=>`assets/${c.id==='kenya'?'':c.id+'-'}${date}-${type}.jpg`;
  const svg=selection=>selection.append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('role','img');
  const image=(parent,url)=>parent.append('image').attr('href',url).attr('width',W).attr('height',H).attr('preserveAspectRatio','none');
  const badge=(parent,text,right=false)=>parent.append('div').attr('class',`badge${right?' right':''}`).text(text);
  function frame(parent,label,c,date,type='false'){
    const f=parent.append('div').attr('class','frame');
    const s=svg(f).attr('aria-label',`${label}; ${c.title}; MODIS ${type==='false'?'false color':'natural color'}`);
    image(s,img(c,date,type));badge(f,label);return{f,s};
  }
  let timer=null;
  function stop(){if(timer){timer.stop();timer=null;}d3.select('#play').text('▶ Play sequence');}
  function render(c){
    stop(); const early=c.dates[c.before], late=c.dates[c.later];
    d3.select('#case-title').text(c.title);d3.select('#case-summary').text(c.summary);d3.select('#case-source').attr('href',c.source);
    ['#pair','#swipe','#blend','#timeline-image','#timeline-buttons','#spectral','#linked'].forEach(id=>d3.select(id).selectAll('*').remove());
    d3.select('#spectral-date').selectAll('*').remove();
    const pair=d3.select('#pair');frame(pair,`EARLIER · ${early.short.toUpperCase()}`,c,early.iso);frame(pair,`LATER · ${late.short.toUpperCase()}`,c,late.iso);
    const sw=d3.select('#swipe');const swSvg=svg(sw).attr('aria-label',`Swipe comparison for ${c.title}`);
    const clip=swSvg.append('defs').append('clipPath').attr('id','before-clip').append('rect').attr('width',W/2).attr('height',H);
    image(swSvg,img(c,late.iso));image(swSvg,img(c,early.iso)).attr('clip-path','url(#before-clip)');
    const handle=swSvg.append('g').style('cursor','ew-resize');
    handle.append('line').attr('y1',0).attr('y2',H).attr('stroke','white').attr('stroke-width',4);
    handle.append('circle').attr('cy',H/2).attr('r',30).attr('fill','#172d25').attr('stroke','white').attr('stroke-width',3);
    handle.append('text').attr('y',H/2+8).attr('text-anchor','middle').attr('fill','white').attr('font-size',25).text('↔');
    const range=d3.select('#swipe-range');
    function setSwipe(p){p=Math.max(0,Math.min(100,p));const x=W*p/100;clip.attr('width',x);handle.attr('transform',`translate(${x},0)`);range.property('value',p);}
    range.on('input',event=>setSwipe(+event.target.value));swSvg.call(d3.drag().on('start drag',event=>setSwipe(event.x/W*100)));setSwipe(50);
    badge(sw,`EARLIER · ${early.short.toUpperCase()}`);badge(sw,`LATER · ${late.short.toUpperCase()}`,true);
    const bl=d3.select('#blend');const blSvg=svg(bl).attr('aria-label',`Opacity blend for ${c.title}`);
    image(blSvg,img(c,early.iso));const overlay=image(blSvg,img(c,late.iso)).attr('opacity',.55);
    d3.select('#blend-range').property('value',55).on('input',event=>overlay.attr('opacity',+event.target.value/100));badge(bl,'FALSE COLOR · 7-2-1');
    const ti=d3.select('#timeline-image');const tiSvg=svg(ti);const tiImage=image(tiSvg,img(c,early.iso));const tiBadge=badge(ti,'');let active=c.before;
    const buttons=d3.select('#timeline-buttons').selectAll('button').data(c.dates).join('button').attr('type','button').text(d=>d.short).on('click',(_,d)=>{stop();show(c.dates.indexOf(d));});
    function show(i){active=i;const d=c.dates[i];tiImage.attr('href',img(c,d.iso));tiSvg.attr('aria-label',`MODIS false color observation ${d.label}, ${c.title}`);tiBadge.text(d.label.toUpperCase());d3.select('#timeline-date').text(d.label);d3.select('#timeline-note').text(d.note);buttons.classed('active',(_,j)=>j===i).attr('aria-pressed',(_,j)=>j===i?'true':'false');}
    d3.select('#play').on('click',()=>{if(timer){stop();return;}d3.select('#play').text('❚❚ Pause sequence');timer=d3.interval(()=>show((active+1)%c.dates.length),1500);});show(active);
    const selector=d3.select('#spectral-date');selector.selectAll('option').data(c.dates).join('option').attr('value',d=>d.iso).text(d=>d.label);selector.property('value',late.iso);
    const sp=d3.select('#spectral');const natural=frame(sp,'NATURAL COLOR',c,late.iso,'true');const falseColor=frame(sp,'FALSE COLOR · 7-2-1',c,late.iso,'false');
    selector.on('change',event=>{const date=event.target.value;natural.s.select('image').attr('href',img(c,date,'true'));falseColor.s.select('image').attr('href',img(c,date,'false'));natural.s.attr('aria-label',`Natural color MODIS image on ${date}`);falseColor.s.attr('aria-label',`False color MODIS image on ${date}`);});
    const lk=d3.select('#linked');const left=frame(lk,`EARLIER · ${early.short.toUpperCase()}`,c,early.iso);const right=frame(lk,`LATER · ${late.short.toUpperCase()}`,c,late.iso);
    const groups=[left,right].map(v=>{const im=v.s.select('image');const g=v.s.append('g');g.node().appendChild(im.node());return g;});
    const zoom=d3.zoom().scaleExtent([1,4]).translateExtent([[0,0],[W,H]]).extent([[0,0],[W,H]]).on('zoom',event=>{groups.forEach(g=>g.attr('transform',event.transform));[left.s.node(),right.s.node()].forEach(node=>{node.__zoom=event.transform;});});
    [left,right].forEach(v=>v.s.style('cursor','grab').call(zoom).on('dblclick.zoom',null));
    d3.select('#zoom-in').on('click',()=>left.s.call(zoom.scaleBy,1.5,[W/2,H/2]));d3.select('#zoom-out').on('click',()=>left.s.call(zoom.scaleBy,1/1.5,[W/2,H/2]));d3.select('#zoom-reset').on('click',()=>left.s.call(zoom.transform,d3.zoomIdentity));
  }
  const select=d3.select('#case-select');select.selectAll('option').data(cases).join('option').attr('value',d=>d.id).text(d=>d.title);
  select.on('change',event=>render(cases.find(d=>d.id===event.target.value)));render(cases[0]);
})();
