import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Subject';

import { map } from 'rxjs/operators';
declare var d3: any;
declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // Observable string sources
  private componentMethodCallSource = new Subject<any>();

  // Observable string streams
  componentMethodCalled$ = this.componentMethodCallSource.asObservable();

  // Service message commands
  callComponentMethod() {
    this.componentMethodCallSource.next();
  }

  file;
  filename;
  filteredData;
  data;
  columns;
  selectedColumns;
  dates;

  constructor() { }
  upload(csv, filename) {
    this.file = csv;
    // Parse CSV
    this.data = d3.csvParse(csv)
    this.filename = filename;
    this.cleanData();
    this.selectedColumns = this.columns;
    this.filteredData = this.data;
    this.callComponentMethod();
  }

  cleanData() {
    // Remove Invalid Data
    var dates = [];
    for (var i = 0; i < this.data.length; i++) {
      if (this.data[i] == "" || !this.formatDate(this.data[i].Period)) {
        this.data.splice(i, 1);
        i--;
      } else {
        this.data[i].Period = this.formatDate(this.data[i].Period);
        dates.push(this.data[i].Period);
      }
    }
    this.dates = dates;

    // Get column names
    this.columns = this.data.columns;
    // Remove "Period from columns"
    this.columns = this.columns.filter(function (item) {
      return !(item == "Period");
    });

    // Sort data by ascending
    this.data = this.data.sort(this.sortByDateAscending);
  }

  /*-------------------------------------------------------------------------|
  | -- formatDate()                                                          |
  |--------------------------------------------------------------------------|
  | Checks to see if input date is valid and returns a date object.          |
  |-------------------------------------------------------------------------*/
  formatDate(date) {
    var dt = new Date(date);
    if (isNaN(dt.getTime())) {
      return false;
    } else {
      return dt;
    }
  }

  /*-------------------------------------------------------------------------|
  | -- sortByDateAscending(a, b)                                             |
  |--------------------------------------------------------------------------|
  | Sort function to sort dates in ascending order                           |
  |-------------------------------------------------------------------------*/
  sortByDateAscending(a, b) {
    return a.Period - b.Period;
  }

  applyToggles() {
    var selectedColumns = $('#select-toggle').val();
    this.selectedColumns = selectedColumns;

    // Date Filter
    var startDate = new Date($('#start-date').val());
    var endDate = new Date($('#end-date').val());

    var dates = this.data.map(a => "" + a.Period);

    var startDateIndex = dates.indexOf("" + startDate);
    var endDateIndex = dates.indexOf("" + endDate)
    console.log(startDate);

    this.filteredData = this.data.slice(startDateIndex, endDateIndex + 1);

    this.callComponentMethod();
  }

}
