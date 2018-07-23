import { Component, OnInit } from '@angular/core';
declare var jquery: any;
declare var $: any;
declare var d3: any;

@Component({
  selector: 'app-linechart',
  templateUrl: './linechart.component.html',
  styleUrls: ['./linechart.component.css']
})
export class LinechartComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    $("#line-chart-svg").attr("width", window.innerWidth - 100);
  }

}
