import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

import { Chart } from 'chart.js';
declare var $: any;


@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  constructor(private dataService: DataService) {
    this.dataService.componentMethodCalled$.subscribe(
      () => {
        this.populateCharts();
      }
    );
  }
  // chartShown = false;

  chart = new Chart('canvas');
  columns;
  dates;
  data;

  ngOnInit() {
  }

  populateCharts() {
    this.chart.destroy();

    let a = this.dataService.filteredData;
    this.data = a;
    let columns = this.dataService.selectedColumns;
    this.columns = columns;

    var dates = a.map(a => a.Period);
    this.dates = dates;

    var ydata = []
    for (var i = 0; i < columns.length; i++) {
      var dataParameters = {}
      var r = Math.floor(Math.random() * 256);
      var g = Math.floor(Math.random() * 256);
      var b = Math.floor(Math.random() * 256);

      dataParameters["label"] = columns[i];
      dataParameters["data"] = a.map(a => parseInt(a[columns[i]]));
      dataParameters["backgroundColor"] = "rgba(" + r + "," + g + "," + b + ",0.2)";
      dataParameters["borderColor"] = "rgba(" + r + "," + g + "," + b + ",1)";
      dataParameters["borderWidth"] = 1;

      ydata.push(dataParameters);
    }

    var chartData = {
      labels: dates,
      datasets: ydata,
    };

    var timeFormat = 'MM/DD/YYYY';
    var options = {
      spanGaps: true,
      title: {
        text: this.dataService.filename
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'performance'
          }
        }],
        xAxes: [{
          type: 'time',
          time: {
            parser: timeFormat,
            round: 'day',
            tooltipFormat: 'll'
          },
          scaleLabel: {
            display: true,
            labelString: 'Date'
          },
          legend: {
            onClick: null
          },
        }],
      }
    };

    this.chart = new Chart('canvas', {
      type: 'line',
      data: chartData,
      options: options
    });

  }
}
