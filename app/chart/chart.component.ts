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


        this.newData = this.dataService.filteredData;

        this.populateCharts();
      }
    );
  }

  chart = new Chart('canvas');
  columns;
  dates;
  data;

  newData;

  ngOnInit() {

  }


  editCell(element, event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.updateDataFromTable();
    }
  }

  updateDataFromTable() {
    var newData = [];
    var headers = [];
    $('#my-table th').each(function (index, item) {
      headers[index] = $(item).html();
    });
    $('#my-table tr').has('td').each(function () {
      var cell = {};
      $('td', $(this)).each(function (index, item) {
        cell[headers[index]] = $(item).html();
      });
      newData.push(cell);
    });
    this.newData = newData;
    this.dataService.data = newData;

    this.populateCharts();
  }

  populateCharts() {

    $('.data-cards').css('display', 'block');
    $('#fab').css('display', 'block');
    let a = this.newData;
    this.data = a;
    this.chart.destroy();


    let columns = this.dataService.selectedColumns;
    this.columns = columns;

    var dates = a.map(a => new Date(a.Period));
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
      animation: false,
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

  isDataValid(data) {
    return isNaN(+data);
  }

  saveCsv() {
    this.dataService.saveCsv();
  }
}
