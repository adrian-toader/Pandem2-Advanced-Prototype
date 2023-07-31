/*
  Copyright Clarisoft, a Modus Create Company, 20/07/2023, licensed under the
  EUPL-1.2 or later. This open-source code is licensed following the Attribution
  4.0 International (CC BY 4.0) - Creative Commons — Attribution 4.0 International
  — CC BY 4.0.

  Following this, you are accessible to:

  Share - copy and redistribute the material in any medium or format.
  Adapt - remix, transform, and build upon the material commercially.

  Remark: The licensor cannot revoke these freedoms if you follow the license
  terms.

  Under the following terms:

  Attribution - You must give appropriate credit, provide a link to the license,
  and indicate if changes were made. You may do so reasonably but not in any way
  that suggests the licensor endorses you or your use.
  No additional restrictions - You may not apply legal terms or technological
  measures that legally restrict others from doing anything the license permits.
*/
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { StrainDataModel } from 'src/app/core/models/variant-data.models';
import { VariantDataService } from 'src/app/core/services/data/variant.data.service';
import { ISource, SourceType } from '../../../../core/models/i-source';

interface NodePoint {
  name: string;
  children?: NodePoint[];
  link?: string;
  color?: string;
  focused?: boolean;
}

@Component({
  selector: 'app-variants-of-concern-tree',
  templateUrl: './variants-of-concern-tree.component.html',
  styleUrls: ['./variants-of-concern-tree.component.less']
})
export class VariantsOfConcernTreeComponent implements OnInit {
  @Input() highlightVariant: string;

  private rootData: StrainDataModel;
  @ViewChild('chart', { static: true }) private chartContainer: ElementRef;

  root: any;
  tree: any;
  treeLayout: any;
  svg: any;

  treeData: any;

  height: number;
  width: number;
  margin: any = { top: 350, bottom: 90, left: 20, right: 90 };
  duration: number = 1;
  nodeWidth: number = 2;
  nodeHeight: number = 2;
  nodeRadius: number = 5;
  horizontalSeparationBetweenNodes: number = 5;
  verticalSeparationBetweenNodes: number = 5;
  nodeTextDistanceY: string = '-5px';
  nodeTextDistanceX: number = 5;
  nodes: any[];
  links: any;
  sources: ISource[] = [];
  SourceType = SourceType;

  constructor(private variantService: VariantDataService) {
  }

  ngOnInit() {
    this.variantService
      .getStrains()
      .subscribe((strainData: StrainDataModel[]) => {
        const root = strainData.find((strain) => !strain.parent_strainId);
        strainData = strainData.filter((strain) => strain.id !== root.id);
        this.appendChildren(root, strainData);
        this.rootData = root;
        this.renderTreeChart();
      });
  }

  appendChildren(parentNode: StrainDataModel, dataList: StrainDataModel[]) {
    if (dataList.length !== 0) {
      const nextNodes = dataList.filter(
        (strain) => strain.parent_strainId === parentNode.id
      );
      dataList = dataList.filter(
        (strain) => strain.parent_strainId !== parentNode.id
      );
      parentNode.children = nextNodes;
      for (const child of nextNodes) {
        if (
          dataList.filter((strain) => strain.parent_strainId !== child.id)
            .length !== 0
        ) {
          this.appendChildren(child, dataList);
        }
      }
    }
  }

  updateTree(variant: string) {
    d3.select('#SVG_ID').remove();
    this.root = d3.hierarchy(this.rootData, (d) => {
      return d.children;
    });
    this.switchVariantFocus(variant, this.rootData);
    this.renderTreeChart();
  }

  switchVariantFocus(variant: string, node: NodePoint) {
    if (node) {
      if (node.name.includes(variant)) {
        node.focused = true;
      } else {
        node.focused = false;
      }
      if (node.children) {
        for (const child of node.children) {
          this.switchVariantFocus(variant, child);
        }
      }
    }
  }

  renderTreeChart() {
    const element: any = this.chartContainer.nativeElement;
    this.width = element.offsetWidth - this.margin.left - this.margin.right;
    this.height = element.offsetHeight;
    this.svg = d3
      .select(element)
      .append('svg')
      .attr('id', 'SVG_ID')
      .attr('width', element.offsetWidth + this.margin.left + this.margin.right)
      .attr('height', element.offsetHeight + this.margin.bottom)
      .append('g')
      .attr('id', 'G_ID')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      )
      .style('overflow', 'auto');
    if (!this.tree) {
      this.tree = d3
        .tree()
        .size([this.height, this.width])
        .nodeSize([
          this.nodeWidth + this.horizontalSeparationBetweenNodes,
          this.nodeHeight + this.verticalSeparationBetweenNodes
        ])
        .separation((a, b) => {
          return a.parent === b.parent ? 5 : 10;
        });
    }
    this.root = d3.hierarchy(this.rootData, (d) => {
      return d.children;
    });
    this.root.x0 = this.height / 2;
    this.root.y0 = 10;

    this.updateChart(this.root);
  }

  click = (d) => {
    if (d.srcElement.__data__.data.url) {
      window.open(d.srcElement.__data__.data.url, '_blank');
    }
  };

  onResize() {
    this.updateChart(this.root);
  }

  updateChart(source) {
    let i = 0;
    this.treeData = this.tree(this.root);
    this.nodes = this.treeData.descendants();
    this.links = this.treeData.descendants().slice(1);
    const element: any = this.chartContainer.nativeElement;
    const constDepth = element.offsetWidth / 5;
    this.nodes.forEach((d) => {
      d.y = d.depth * constDepth;
    });

    const node = this.svg.selectAll('g.node').data(this.nodes, (d) => {
      return d.id || (d.id = ++i);
    });

    const nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (_d) => {
        return 'translate(' + source.y0 + ',' + source.x0 + ')';
      })
      .on('click', this.click);

    nodeEnter
      .append('circle')
      .attr('class', 'node')
      .attr('r', 1e-6)
      .style('fill', (d) => {
        return d._children ? 'lightsteelblue' : '#fff';
      });

    nodeEnter
      .append('text')
      .attr('dy', '-1em')
      .attr('x', '15')
      .attr('text-anchor', 'start')
      .style('color', '#ebebeb')
      .style('font', '12px sans-serif')
      .style('font-weight', (d) => {
        if (d.data.focused) {
          return 'bold';
        }
        return 'normal';
      })
      .style('text-decoration', (d) => {
        if (d.data.url) {
          return 'underline';
        }
        return 'normal';
      })
      .text((d) => {
        return d.data.name;
      });

    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate
      .transition()
      .duration(this.duration)
      .attr('transform', (d) => {
        return 'translate(' + d.y + ',' + d.x + ')';
      });

    nodeUpdate
      .select('circle.node')
      .attr('r', 15)
      .style('stroke-width', '1px')
      .style('stroke', '#CCCCCC')
      .style('fill', (d) => {
        if (d.data.color) {
          return d.data.color;
        }
        return d._children ? 'lightsteelblue' : '#fff';
      })
      .attr('cursor', (d) => {
        if (d.data.url) {
          return 'pointer';
        }
        return '';
      });

    const link = this.svg.selectAll('path.link').data(this.links, (d) => {
      return d.id;
    });

    const linkEnter = link
      .enter()
      .insert('path', 'g')
      .attr('class', 'link')
      .style('fill', 'none')
      .style('stroke', '#ccc')
      .style('stroke-width', '2px')
      .attr('d', function(_d) {
        const o = { x: source.x0, y: source.y0 };
        return diagonal(o, o);
      });

    const linkUpdate = linkEnter.merge(link);

    linkUpdate
      .transition()
      .duration(this.duration)
      .attr('d', (d) => {
        return diagonal(d, d.parent);
      });

    this.nodes.forEach((d) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });

    function diagonal(s, d) {
      return `M ${s.y} ${s.x}
                  C ${(s.y + d.y) / 2} ${s.x},
                  ${(s.y + d.y) / 2} ${d.x},
                  ${d.y} ${d.x}`;
    }
  }
}
