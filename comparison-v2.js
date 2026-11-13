/* Interactive comparison of locally saved NASA MODIS imagery. */
(() => {
  'use strict';
  const W = 960, H = 640;
  const events = [
    {id:'dixie', title:'Dixie Fire · California, 2021', summary:'NASA documented multiple burn scars in the September 21 image, including the Dixie Fire.', source:'https://earthobservatory.nasa.gov/images/148913/a-multi-dimensional-fire-challenge', left:0, right:2, dates:[
      ['2021-07-10','July 10, 2021','Earlier image, before the Dixie Fire started in mid-July.'],
      ['2021-08-15','August 15, 2021','Smoke obscures much of this view.'],
      ['2021-09-21','September 21, 2021','NASA documented multiple recent burn scars on this date.'],
      ['2021-10-10','October 10, 2021','A later observation; differences may include effects of more than one fire.']]},
    {id:'pakistan', title:'Indus River floods · Pakistan, 2012', summary:'NASA published a MODIS comparison using September 1 and September 13.', source:'https://earthobservatory.nasa.gov/images/79171/flooding-in-pakistan', left:0, right:2, dates:[
      ['2012-09-01','September 1, 2012','Earlier conditions in NASA’s comparison.'],
      ['2012-09-08','September 8, 2012','Clouds obscure much of the landscape.'],
      ['2012-09-13','September 13, 2012','During flooding; NASA used this date to show inundated conditions.'],
      ['2012-09-20','September 20, 2012','A later observation during the broader flood period.']]},
    {id:'kenya', title:'Mount Kenya wildfire · Kenya, 2019', summary:'NASA reported first satellite detections on February 23 and documented the fire on February 27.', source:'https://earthobservatory.nasa.gov/images/144615/fire-on-mount-kenya', left:1, right:4, dates:[
      ['2019-02-15','February 15, 2019','Before first reported satellite detections; clouds partly obscure the area.'],
      ['2019-02-20','February 20, 2019','Before the first reported satellite detections.'],
      ['2019-02-23','February 23, 2019','First reported satellite detections; clouds obscure much of the view.'],
      ['2019-02-27','February 27, 2019','NASA documented the active fire and a burn scar.'],
      ['2019-03-15','March 15, 2019','A later observation; cloud cover is still present.']]}
  ];
  const eventSelect = d3.select('#event'), leftSelect = d3.select('#earlier'), rightSelect = d3.select('#later');
  d3.select('#viewer .fallback').remove();
  const svg = d3.select('#viewer').append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('role','img');
  const clip = svg.append('defs').append('clipPath').attr('id','left-clip').append('rect').attr('height',H);
  const scene = svg.append('g');
  const rightImage = scene.append('image').attr('width',W).attr('height',H);
  // The clipping region stays in screen coordinates while both images pan and zoom together.
  const leftLayer = svg.append('g').attr('clip-path','url(#left-clip)').append('g');
  const leftImage = leftLayer.append('image').attr('width',W).attr('height',H);
  const handle = svg.append('g').attr('class','handle').attr('aria-hidden','true');
  handle.append('line').attr('y2',H);
  handle.append('circle').attr('cy',H/2).attr('r',28);
  handle.append('text').attr('y',H/2+8).attr('text-anchor','middle').text('↔');
  const range = d3.select('#divider');
  let current = events[0];
  const zoom = d3.zoom().scaleExtent([1,4]).extent([[0,0],[W,H]]).translateExtent([[0,0],[W,H]])
    .filter(event => event.type === 'wheel' || event.type === 'touchstart' || (event.type === 'mousedown' && event.shiftKey))
    .on('zoom', event => {scene.attr('transform',event.transform); leftLayer.attr('transform',event.transform);});
  svg.call(zoom).on('dblclick.zoom',null);
  const drag = d3.drag().filter(event => !event.shiftKey && event.type !== 'touchstart').on('start drag', event => setDivider(d3.pointer(event.sourceEvent, svg.node())[0] / W * 100));
  svg.call(drag);
  function setDivider(value) {
    const p = Math.max(0,Math.min(100,value));
    clip.attr('width',W*p/100); handle.attr('transform',`translate(${W*p/100},0)`);
    range.property('value',p).attr('aria-valuetext',`${Math.round(p)}% left image`);
  }
  function file(date, band) { return `assets/${current.id === 'kenya' ? '' : current.id+'-'}${date}-${band}.jpg`; }
  function refresh() {
    const left = current.dates.find(d => d[0] === leftSelect.property('value'));
    const right = current.dates.find(d => d[0] === rightSelect.property('value'));
    const band = d3.select('input[name="bands"]:checked').property('value');
    leftImage.attr('href',file(left[0],band)); rightImage.attr('href',file(right[0],band));
    d3.select('#left-label').text(`LEFT · ${left[1]}`); d3.select('#right-label').text(`RIGHT · ${right[1]}`);
    d3.select('#earlier-note').text(left[2]); d3.select('#later-note').text(right[2]);
    svg.attr('aria-label',`${current.title}: left image ${left[1]}, right image ${right[1]}, ${band === 'true' ? 'natural color' : 'false color bands 7-2-1'}.`);
    d3.select('#band-description').text(band === 'true' ? 'Natural color imagery uses visible light.' : 'False color combines shortwave infrared, near infrared, and red light (bands 7-2-1). Colors do not have the same meaning as in natural color.');
  }
  function selectEvent(id) {
    current = events.find(e => e.id === id);
    d3.select('#event-title').text(current.title); d3.select('#event-summary').text(current.summary); d3.select('#source').attr('href',current.source);
    [leftSelect,rightSelect].forEach(select => select.selectAll('option').data(current.dates).join('option').attr('value',d=>d[0]).text(d=>d[1]));
    leftSelect.property('value',current.dates[current.left][0]); rightSelect.property('value',current.dates[current.right][0]);
    svg.call(zoom.transform,d3.zoomIdentity); setDivider(50); refresh();
  }
  eventSelect.selectAll('option').data(events).join('option').attr('value',d=>d.id).text(d=>d.title);
  eventSelect.on('change',event=>selectEvent(event.target.value));
  leftSelect.on('change',refresh); rightSelect.on('change',refresh);
  d3.selectAll('input[name="bands"]').on('change',refresh);
  range.on('input',event=>setDivider(+event.target.value));
  d3.select('#swap').on('click',() => {const a=leftSelect.property('value'); leftSelect.property('value',rightSelect.property('value')); rightSelect.property('value',a); refresh();});
  d3.select('#zoom-in').on('click',()=>svg.call(zoom.scaleBy,1.5,[W/2,H/2]));
  d3.select('#zoom-out').on('click',()=>svg.call(zoom.scaleBy,1/1.5,[W/2,H/2]));
  d3.select('#zoom-reset').on('click',()=>svg.call(zoom.transform,d3.zoomIdentity));
  selectEvent(events[0].id);
})();
