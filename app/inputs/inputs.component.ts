import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

declare var $: any;

@Component({
  selector: 'app-inputs',
  templateUrl: './inputs.component.html',
  styleUrls: ['./inputs.component.css']
})
export class InputsComponent implements OnInit {

  constructor(private dataService: DataService) { }

  columns;
  dates;
  startDate;
  endDate;

  ngOnInit() {
    var parent = this;
    // Create event when key is pressed for toggle dropdown
    $("#select-toggle").keypress(function () {
      parent.showSeriesToggle();
    });
  }

  /*-------------------------------------------------------------------------|
  | -- loadCsvClick    ()                                                    |
  |--------------------------------------------------------------------------|
  | Simulates a click event on the file input element                        |
  |-------------------------------------------------------------------------*/
  loadCsvClick(elemId) {
    var elem = document.getElementById(elemId);
    if (elem && document.createEvent) {
      var evt = document.createEvent("MouseEvents");
      evt.initEvent("click", true, false);
      elem.dispatchEvent(evt);
    }
  }

  /*-------------------------------------------------------------------------|
  | -- handleFileSelect(event)                                               |
  |--------------------------------------------------------------------------|
  | Creates a new FileReader object to handle selected input CSV.            |
  |-------------------------------------------------------------------------*/
  handleFileSelect(event) {
    var f = event.srcElement.files[0];
    var reader = new FileReader();
    var parent = this;
    reader.onload = function (event) {
      var upload = <FileReader>event.target;
      parent.dataService.upload(upload.result, f.name);
      $("#file-name").text(f.name);
      parent.columns = parent.dataService.columns;

      var dates = []
      for (var i in parent.dataService.dates) {
        var dd = parent.dataService.dates[i].getDate();
        var mm = parent.dataService.dates[i].getMonth() + 1;
        var yyyy = parent.dataService.dates[i].getFullYear();
        dates.push(mm + '/' + dd + '/' + yyyy);
      }
      parent.dates = dates;

    };
    // Read in the file as a data URL.
    reader.readAsText(f);
    this.startDate = Number.MIN_VALUE;
    this.endDate = Number.MAX_VALUE;
    $('#toggle-series').css('pointer-events', 'auto');


  }

  /*-------------------------------------------------------------------------|
  | -- showSeriesToggle()                                                    |
  |--------------------------------------------------------------------------|
  | Toggles visibility of toggle dropdown when triggered. When hidden,       |
  | series toggles are applied and data is refreshed.                        |
  |-------------------------------------------------------------------------*/
  showSeriesToggle() {
    if ($("#select-toggle").is(':visible')) {
      $("#select-toggle").hide();
      this.applyToggles();
    } else {
      $("#select-toggle").show();
    }
  }

  applyToggles() {
    this.startDate = new Date($('#start-date').val());
    this.endDate = new Date($('#end-date').val());

    this.dataService.applyToggles();
  }

  newDate(date) {
    return new Date(date);
  }






}
