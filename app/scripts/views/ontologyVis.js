/*global define, d3 */
define(
  [
    'flight/lib/component',
    'jquery',
    'd3',
    'd3chart'
  ],

  function(defineComponent)  {
    'use strict';

    function ontologyVis() {
      var w    = 400
        , h    = 500
        , vis;

      var force = d3.layout.force()
        .size([w, h]);

      function initView(el) {
        vis = d3.select(el).append('svg')
          .attr('width', w)
          .attr('height', h);

        vis.append('rect')
          .attr('width', w)
          .attr('height', h)
          .attr('stroke', 'black')
          .attr('fill', 'none');
      }

      function dumpJSON(evt, d) {
        var x = JSON.parse(d.text);
        updateVis(x);
      }

      function updateVis(d) {
        d.edges.map(function (d) {
          d.source = parseInt(d._inV);
          d.target = parseInt(d._outV);
        });

        force.stop();

        // TODO this is inefficient. Comment it out and figure out how to update properly
        vis.selectAll('.link').remove();
        vis.selectAll('.node').remove();

        force
          .linkDistance(75)
          .charge(-400)
          .links(d.edges)
          .nodes(d.vertices);

        var link = vis.selectAll('.link')
          .data(force.links())
          .enter().append('line')
          .attr('class', 'link')
          .style('stroke-width', 1)
          .style('stroke', 'black');

        var node = vis.selectAll('.node')
          .data(force.nodes(), function(d) { return d.name; });

        var g = node.enter().append('g')
          .attr('class', 'node');

          g.append('circle')
            .attr('r', 5)
            .style('fill', 'steelblue')
            .call(force.drag)
            .append('title')
              .text(function(d) { return d._id; });

          g.append("text")
          .attr("class", "linktext")
          .attr("x", 12)
          .attr("dy", ".35em")
          .text(function(d) { return d.name; });

        node.exit().remove();
        
        force.on('tick', function() {
          vis.selectAll('.link')
            .attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });

          vis.selectAll(".node .linktext")
            .attr("dx", function(d) { return d.x; })
            .attr("dy", function(d) { return d.y; });

          vis.selectAll('.node circle')
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; });
        });

        force.start();
      }

      this.after('initialize', function() {
        initView(this.node);
        this.on('#ontologyText', 'textChange', dumpJSON);
      });

    }

    return defineComponent(ontologyVis);
  }
);
