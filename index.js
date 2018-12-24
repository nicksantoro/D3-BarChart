// select the svg container first
const svg = d3.select('.canvas')
  .append('svg')
  .attr('width', 600)
  .attr('height', 600);

// create margins & dimensions
const margin = { top: 20, right: 20, bottom: 100, left: 100 };
const graphWidth = 600 - margin.left - margin.right;
const graphHeight = 600 - margin.top - margin.bottom;

const graph = svg.append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// create axes groups
const xAxisGroup = graph.append('g')
  .attr('transform', `translate(0, ${graphHeight})`)

xAxisGroup.selectAll('text')
  .attr('fill', 'orange')
  .attr('transform', 'rotate(-40)')
  .attr('text-anchor', 'end');

const yAxisGroup = graph.append('g');

const y = d3.scaleLinear()
  .range([graphHeight, 0]);

const x = d3.scaleBand()
  .range([0, graphWidth])
  .paddingInner(0.2)
  .paddingOuter(0.2);

// create & call axes
const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y)
  .ticks(3)
  .tickFormat(d => d + ' orders');

const t = d3.transition().duration(1600);

// the update function
const update = (data) => {

  // join the data to circs
  const rects = graph.selectAll('rect')
    .data(data);

  // remove unwanted rects
  rects.exit().remove();

  // update the domains
  y.domain([0, d3.max(data, d => d.orders)]);
  x.domain(data.map(item => item.name));

  // add attrs to rects already in the DOM
  rects.attr('width', x.bandwidth)
    .attr('fill', 'orange')
    .attr('x', d => x(d.name))
    .transition(t)
    .attr("height", d => graphHeight - y(d.orders))
    .attr('y', d => y(d.orders));

  // append the enter selection to the DOM
  rects.enter()
    .append('rect')
    .attr('width', 0)
    .attr("height", d => 0)
    .attr('fill', 'orange')
    .attr('x', (d) => x(d.name))
    .attr('y', d => graphHeight)
    .transition(t)
    .attrTween('width', widthTween)
    .attr("height", d => graphHeight - y(d.orders))
    .attr('y', d => y(d.orders));

  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);

};

var data = [];

db.collection('dishes').onSnapshot(res => {

  res.docChanges().forEach(change => {

    const doc = { ...change.doc.data(), id: change.doc.id };

    switch (change.type) {
      case 'added':
        data.push(doc);
        break;
      case 'modified':
        const index = data.findIndex(item => item.id == doc.id);
        data[index] = doc;
        break;
      case 'removed':
        data = data.filter(item => item.id !== doc.id);
        break;
      default:
        break;
    }

  });

  update(data);

});

// Tweens
const widthTween = (d) => {
  let i = d3.interpolate(0, x.bandwidth());
  return function (t) {

    return i(t);
  }
};




// update pattern 5 steps

// const update = (data) => {

//   // update scales (domains) if they rely on our data
//   y.domain([0, d3.max(data, d => d.orders)]);

//   // join updated data to elements
//   const rects = graph.selectAll('rect').data(data);

//   // reomove unwanted (if any) shapes using the exit selection
//   rects.exit().remove();

//   // update current shapes in the dom
//   rects.attr(...etc);

//   // append the enter selection to the dom
//   rects.enter().append('rect').attr(...etc);

// };