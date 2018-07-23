import { Component, OnInit } from '@angular/core';
declare var jquery: any;
declare var $: any;
declare var d3: any;

@Component({
  selector: 'app-inputs',
  templateUrl: './inputs.component.html',
  styleUrls: ['./inputs.component.css']
})
export class InputsComponent implements OnInit {
  columns;
  data;
  dates;

  constructor() { }
  ngOnInit() {
    var parent = this;
    // Create event when key is pressed for toggle dropdown
    $("#select-toggle").keypress(function () {
      parent.showSeriesToggle()
    });
  }

  /*-------------------------------------------------------------------------|
  | -- applyToggles    ()                                                    |
  |--------------------------------------------------------------------------|
  | Refreshes chart and table with new toggled filters                       |
  |-------------------------------------------------------------------------*/
  applyToggles() {
    this.populateChart(this.data);
    this.populateTable(this.data);
  }

  /*-------------------------------------------------------------------------|
  | -- formatDate()                                                          |
  |--------------------------------------------------------------------------|
  | Checks to see if input date is valid and returns a date object.          |
  |-------------------------------------------------------------------------*/
  formatDate(date) {
    var dt = new Date(date);
    var parseTime = d3.timeParse("%Y%m%d");
    if (isNaN(dt.getTime())) {
      return false;
    } else {
      return dt;
    }
  }

  /*-------------------------------------------------------------------------|
  | -- formatValue(value)                                                    |
  |--------------------------------------------------------------------------|
  | Checks to see if input values are valid                                  |
  |-------------------------------------------------------------------------*/
  formatValue(value) {
    var output = +value;
    if (Number.isNaN(output) || value == "") {
      output = null;
    }
    return output;
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
      parent.loadD3(upload.result);
      $("#file-name").text(f.name);
    };
    // Read in the file as a data URL.
    reader.readAsText(f);
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
  | -- loadD3(fileHandler)                                                   |
  |--------------------------------------------------------------------------|
  | Parses and prepares data from CSV for d3.js                              |
  |-------------------------------------------------------------------------*/
  loadD3(fileHandler) {
    var parsedCsv = d3.csvParse(fileHandler);

    // Add columns to filters
    this.columns = parsedCsv.columns;
    this.columns = this.columns.filter(function (item) {
      return !(item == "Period");
    });

    // Remove Invalid Data
    var dates = [];
    for (var i = 0; i < parsedCsv.length; i++) {
      if (parsedCsv[i] == "" || !this.formatDate(parsedCsv[i].Period)) {
        parsedCsv.splice(i, 1);
        i--;
      } else {
        parsedCsv[i].Period = this.formatDate(parsedCsv[i].Period);
        dates.push(parsedCsv[i].Period);
      }
    }
    this.dates = dates;

    // Sort data by date
    parsedCsv = parsedCsv.sort(this.sortByDateAscending);
    this.data = parsedCsv;

    var parent = this;
    setTimeout(function () {
      parent.populateChart(parsedCsv);
      parent.populateTable(parsedCsv);

    }, 500);
  };

  /*-------------------------------------------------------------------------|
  | -- populateChart(data)                                                   |
  |--------------------------------------------------------------------------|
  | Populates a line chart with given parsed CSV and filters.                |
  |-------------------------------------------------------------------------*/
  populateChart(data) {
    // Clear graph
    $("#line-chart-svg").empty();

    // Apply Series filters
    var toggles = $('#select-toggle').val();
    toggles.unshift("Period");
    data.columns = toggles;

    // Date Filter
    var startDate = new Date($('#start-date').val());
    var endDate = new Date($('#end-date').val());

    // Initialize D3 Objects
    var svg = d3.select("svg");
    var margin = { top: 20, right: 80, bottom: 30, left: 50 };
    var width = svg.attr("width") - margin.left - margin.right;
    var height = svg.attr("height") - margin.top - margin.bottom;
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    var z = d3.scaleOrdinal(d3.schemeCategory10);

    var line = d3.line()
      .curve(d3.curveBasis)
      .defined(function (d) { return d.performance != null; })
      .x(function (d) { return x(d.period); })
      .y(function (d) { return y(d.performance); });

    // Map values 
    var parent = this;
    var mappedValues = data.columns.slice(1).map(function (id) {
      return {
        id: id,
        values: data.map(function (d) {
          return {
            period: (d.Period),
            performance: parent.formatValue(d[id])
          };
        })
      };
    });

    // X Axis
    x.domain([startDate, endDate]);
    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "axis axis--x")
      .call(d3.axisBottom(x));

    y.domain([
      d3.min(mappedValues, function (c) { return d3.min(c.values, function (d) { return d.performance; }); }),
      d3.max(mappedValues, function (c) { return d3.max(c.values, function (d) { return d.performance; }); })
    ]);

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Performance ($)");

    z.domain(mappedValues.map(function (c) { return c.id; }));

    var group = g.selectAll(".group")
      .data(mappedValues)
      .enter().append("g")
      .attr("class", "group");

    // Create line for data
    group.append("path")
      .attr("class", "line")
      .attr("d", function (d) {
        return line(d.values);
      })
      .style("stroke", function (d) {
        return z(d.id);
      })
      .style("fill", "none");
    // Create label for data
    group.append("text")
      .datum(function (d) {
        return {
          id: d.id,
          value:
            d.values[d.values.length - 1]
        };
      })
      .attr("transform", function (d) { return "translate(" + x(d.value.period) + "," + y(d.value.performance) + ")"; })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function (d) { return d.id; });


  }


  /*-------------------------------------------------------------------------|
  | -- populateTable(data)                                                   |
  |--------------------------------------------------------------------------|
  | Populates a table with given parsed CSV and filters.                     |
  |-------------------------------------------------------------------------*/
  populateTable(data) {
    // Clear table
    $("#table-card").empty();

    // Apply Series filters
    var columns = $('#select-toggle').val();
    columns.unshift("Period");
    data.columns = columns;
    // Date Filter
    var startDate = new Date($('#start-date').val());
    var endDate = new Date($('#end-date').val());

    var table = d3.select('#table-card').append('table');
    var thead = table.append('thead');
    var tbody = table.append('tbody');

    thead.append('tr')
      .selectAll('th')
      .data(columns).enter()
      .append('th')
      .text(function (column) {
        return column;
      });

    var rows = tbody.selectAll('tr')
      .data(data)
      .enter()
      .append('tr');

    var cells = rows.selectAll('td')
      .data(function (row) {
        return columns.map(function (column) {
          if (row.Period < startDate || row.Period > endDate) {
            return false;
          } else {
            return { column: column, value: row[column] };
          }
        });
      })
      .enter()
      .append('td')
      .text(function (d) {
        return d.value;
      });
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

  /*-------------------------------------------------------------------------|
  | -- sortByDateAscending(a, b)                                             |
  |--------------------------------------------------------------------------|
  | Sort function to sort dates in ascending order                           |
  |-------------------------------------------------------------------------*/
  sortByDateAscending(a, b) {
    return a.Period - b.Period;
  }


}
