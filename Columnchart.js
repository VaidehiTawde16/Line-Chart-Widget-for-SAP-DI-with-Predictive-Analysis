var getScriptPromisify = (src) => {
  return new Promise((resolve) => {
    $.getScript(src, resolve)
  })
}

(function () {
  const prepared = document.createElement('template')
  prepared.innerHTML = `
        <style>
        </style>
        <div id="root" style="width: 100%; height: 100%;">
        </div>
      `
  class ColumnSamplePrepped extends HTMLElement {
    constructor() {
      super()

      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(prepared.content.cloneNode(true))

      this._root = this._shadowRoot.getElementById('root')

      this._props = {}

      this.render("notResized")
    }

    //The below function extracts dimensions and measures from metadata and structures them into arrays and maps.
    parseMetadata = metadata => {
      const { dimensions: dimensionsMap, mainStructureMembers: measuresMap } = metadata
      const dimensions = []
      for (const key in dimensionsMap) {
        const dimension = dimensionsMap[key]
        dimensions.push({ key, ...dimension })
      }
      const measures = []
      for (const key in measuresMap) {
        const measure = measuresMap[key]
        measures.push({ key, ...measure })
      }
      return { dimensions, measures, dimensionsMap, measuresMap }
    }

    addYearToLabels = (data) => {
      data.forEach(item => {
        if (item.dimensions_0.label !== "(all)" && !item.dimensions_0.parentId.includes("All")) {
          let year = item.dimensions_0.id.match(/\d{4}/)[0] || item.dimensions_0.parentId.match(/\d{4}/)[0];
          if (year) {
            item.dimensions_0.label = year + " - " + item.dimensions_0.label;
          }
        }
      });
      return data;
    }

    addOneDayToISO = (dateString) => {
      const date = new Date(dateString);
      date.setDate(date.getDate() + 1);
      return date.toISOString().split('T')[0];
    }

    isValidDate = (dateString) => {
      let date = new Date(dateString);
      return !isNaN(date.getTime());
    }

    string2Array = (inputString) => {
      const regex = /\[(.*?)\]/g;
      const result = [];
      let match;

      while ((match = regex.exec(inputString)) !== null) {
        result.push(match[1]);
      }

      return result;
    }

    getMonthdetails = (label) => {
      const months = [
        { month: "01", name: "Jan", quarter: "1" },
        { month: "02", name: "Feb", quarter: "1" },
        { month: "03", name: "Mar", quarter: "1" },
        { month: "04", name: "Apr", quarter: "2" },
        { month: "05", name: "May", quarter: "2" },
        { month: "06", name: "Jun", quarter: "2" },
        { month: "07", name: "Jul", quarter: "3" },
        { month: "08", name: "Aug", quarter: "3" },
        { month: "09", name: "Sep", quarter: "3" },
        { month: "10", name: "Oct", quarter: "4" },
        { month: "11", name: "Nov", quarter: "4" },
        { month: "12", name: "Dec", quarter: "4" }
      ];

      let nextMonthDetails = "";

      months.forEach((element, index) => {
        if (element.name === label) {
          if (label === "Dec") {
            nextMonthDetails = months[0];
          }
          else {
            nextMonthDetails = months[index + 1];
          }
        }
      });
      return nextMonthDetails;
    }

    //Calls render when the widget is resized.
    onCustomWidgetResize(width, height) {
      this.render("resized")
    }
    //Calls render when the widget is updated.
    onCustomWidgetAfterUpdate(changedProps) {
      this.render("notResized")
    }

    predictedOutput = 0;

    checkLevel1 = (obj) => {
      let count = 0;
      const prop = obj.dimensions_0.id;
      const arr = this.string2Array(prop);
      arr.forEach(element => {
        if (element === "(all)" || element === "All") {
          count++;
        }
      });
      if (count > 1) {
        return true
      }
      else {
        return false
      }
    }

    checkLevel2 = (obj) => {
      let found = false
      const prop = obj.dimensions_0.id;
      const arr = this.string2Array(prop);
      arr.forEach(element => {
        if (element === "Date.YEAR") {
          found = true;
        }
      });
      let newYear = arr[arr.length - 1]
      newYear = parseInt(newYear) + 1
      const returnObj = {
        "dimensions_0": {
          "id": "[Date].[YHQMD].[Date.YEAR].[" + newYear + "]",
          "label": newYear.toString(),
          "parentId": "[Date].[YHQMD].[All].[(all)]",
          "isNode": true,
          "isCollapsed": true
        },
        "measures_0": {
          "raw": this.predictedOutput,
          "formatted": this.predictedOutput.toString(),
          "unit": "USD"
        }
      }
      if (found)
        return returnObj;
      else
        return null;

    }

    checkLevel3 = (obj) => {
      let found = false
      const prop = obj.dimensions_0.id;
      const arr = this.string2Array(prop);
      let newYear = arr[arr.length - 2];
      let newHalf = "";
      arr.forEach(element => {
        if (element === "H1" || element === "H2") {
          found = true;
          if (element === "H1") {
            newHalf = "H2";
          }
          else if (element === "H2") {
            newYear = parseInt(newYear) + 1
            newHalf = "H1";
          }
        }
      });
      const returnObj = {
        "dimensions_0": {
          "id": "[Date].[YHQMD].[(all)].[" + newYear + "].[" + newHalf + "]",
          "label": newYear + " - " + newHalf,
          "parentId": "[Date].[YHQMD].[Date.YEAR].[" + newYear + "]",
          "isNode": true,
          "isCollapsed": true
        },
        "measures_0": {
          "raw": this.predictedOutput,
          "formatted": this.predictedOutput.toString(),
          "unit": "USD"
        }
      }
      if (found)
        return returnObj;
      else
        return null;
    }

    checkLevel4 = (obj) => {
      let found = false;
      let prop = obj.dimensions_0.id;
      let arr = this.string2Array(prop);
      arr.forEach(element => {
        if (element === "Date.CALQUARTER") {
          found = true;
        }
      });

      let label = ""
      if (obj.dimensions_0.label.indexOf('-') > -1) {
        label = obj.dimensions_0.label.split('-')[1].trim()
      }
      else
        label = obj.dimensions_0.label

      let currentYear = obj.dimensions_0.parentId.match(/\d+/)[0]
      let newYear = ""
      let newHalf = ""
      let newQuarter = ""
      if (found) {
        if (label == "Q1") {
          label = "Q2"
          newQuarter = currentYear + "2"
          newHalf = "H1"
          newYear = currentYear
        }
        else if (label == "Q2") {
          label = "Q3"
          newQuarter = currentYear + "3"
          newHalf = "H2"
          newYear = currentYear
        }
        else if (label == "Q3") {
          label = "Q4"
          newQuarter = currentYear + "4"
          newHalf = "H2"
          newYear = currentYear
        }
        else if (label == "Q4") {
          label = "Q1"
          newQuarter = (parseInt(currentYear) + 1) + "1"
          newHalf = "H1"
          newYear = parseInt(currentYear) + 1 + ""
        }
      }
      let returnObj = {
        "dimensions_0": {
          "id": "[Date].[YHQMD].[Date.CALQUARTER].[" + newQuarter + "]",
          "label": newYear + " - " + label,
          "parentId": "[Date].[YHQMD].[(all)].[" + newYear + "].[" + newHalf + "]",
          "isNode": true,
          "isCollapsed": true
        },
        "measures_0": {
          "raw": this.predictedOutput,
          "formatted": this.predictedOutput.toString(),
          "unit": "USD"
        }
      }
      if (found)
        return returnObj;
      else
        return null;
    }

    checkLevel5 = (obj) => {
      let found = false;
      let prop = obj.dimensions_0.id;
      let arr = this.string2Array(prop);
      arr.forEach(element => {
        if (element === "Date.CALMONTH") {
          found = true;
        }
      });

      let label = ""
      if (obj.dimensions_0.label.indexOf('-') > -1) {
        label = obj.dimensions_0.label.split('-')[1].trim()
      }
      else
        label = obj.dimensions_0.label

      let year = obj.dimensions_0.id.match(/\d{4}/)[0];
      let currentMonth = ""
      let currentQuarter = ""

      if (found) {

        let nextMonthDetails = this.getMonthdetails(label);
        label = nextMonthDetails.name;
        let nextMonth = nextMonthDetails.month;
        let nextQuarter = nextMonthDetails.quarter;

        if (label === "Jan") {
          year = (parseInt(year) + 1).toString();
        }

        currentMonth = year + nextMonth;
        currentQuarter = year + nextQuarter;

      }

      let returnObj = {
        "dimensions_0": {
          "id": "[Date].[YHQMD].[Date.CALMONTH].[" + currentMonth + "]",
          "label": year + " - " + label,
          "parentId": "[Date].[YHQMD].[Date.CALQUARTER].[" + currentQuarter + "]",
          "isNode": true,
          "isCollapsed": true
        },
        "measures_0": {
          "raw": this.predictedOutput,
          "formatted": this.predictedOutput.toString(),
          "unit": "USD"
        }
      };
      if (found)
        return returnObj;
      else
        return null;
    }

    checkLevel6 = (obj) => {
      let found = false;
      let prop = obj.dimensions_0.id;
      let arr = this.string2Array(prop);
      if (this.isValidDate(arr[2])) {
        found = true;
      }

      let newDate, newMonthString, newDay, newYear;
      if (found) {
        newDate = this.addOneDayToISO(arr[2])
        newMonthString = newDate.split('-')[0] + newDate.split('-')[1]
        newDay = newDate.split('-')[2]
        newYear = newDate.split('-')[0]
      }

      let returnObj = {
        "dimensions_0": {
          "id": "[Date].[YHQMD].&[" + newDate + "]",
          "label": newYear + " - " + newDay,
          "parentId": "[Date].[YHQMD].[Date.CALMONTH].[" + newMonthString + "]"
        },
        "measures_0": {
          "raw": this.predictedOutput,
          "formatted": this.predictedOutput.toString(),
          "unit": "USD"
        }
      }
      if (found)
        return returnObj;
      else
        return null;
    }

    //This function performs linear regression on the input data and returns a predicted value for a given newInput.
    lr = (data, newInput) => {
      var _data = []

      data.forEach((element) => {
        _data.push([element['index'], element["measures_0"].raw]);
      });

      const x = _data.map(d => d[0]);
      const y = _data.map(d => d[1]);

      const linearRegression = ss.linearRegression(_data);
      const linearRegressionLine = ss.linearRegressionLine(linearRegression);

      this.predictedOutput = linearRegressionLine(newInput);

      let result = this.checkLevel2(data[data.length - 1])
      if (result) {
        result["index"] = data.length + 1;
        return result;
      }
      result = this.checkLevel3(data[data.length - 1])
      if (result) {
        result["index"] = data.length + 1;
        return result;
      }
      result = this.checkLevel4(data[data.length - 1])
      if (result) {
        result["index"] = data.length + 1;
        return result;
      }
      result = this.checkLevel5(data[data.length - 1])
      if (result) {
        result["index"] = data.length + 1;
        return result;
      }
      result = this.checkLevel6(data[data.length - 1])
      if (result) {
        result["index"] = data.length + 1;
        return result;
      }

    }

    async render(actOn) {
      const dataBinding = this.dataBinding
      if (!dataBinding || dataBinding.state !== 'success') { return }

      await getScriptPromisify(
        "https://cdnjs.cloudflare.com/ajax/libs/echarts/5.0.0/echarts.min.js"
      )

      await getScriptPromisify(
        "https://cdnjs.cloudflare.com/ajax/libs/simple-statistics/7.8.1/simple-statistics.min.js"
      )

      let { data, metadata } = dataBinding

      let changeColorDataPoint = data.length

      data = this.addYearToLabels(data);

      data.forEach((element, index) => {
        element['index'] = index + 1
      });

      let generatedDataPoints = 4;
      let dataLength = data.length;
      if (actOn == "notResized") {
        let result = this.checkLevel1(data[data.length - 1])
        if (!result) {
          for (let i = 1; i <= generatedDataPoints; i++) {
            let b = this.lr(data, i + dataLength)
            data.push(b)
            dataLength = data.length;
          }
        }
      }

      const { dimensions, measures } = this.parseMetadata(metadata)
      // dimension
      const categoryData = []

      // measures
      const series = measures.map(measure => {
        return {
          data: [],
          key: measure.key,
          type: 'bar',
          smooth: true
        }
      })

      data.forEach(row => {
        // dimension
        categoryData.push(dimensions.map(dimension => {
          return row[dimension.key].label
        }).join('/'))
        // measures
        series.forEach(series => {
          series.data.push(row[series.key].raw)
        })
      })

      const myChart = echarts.init(this._root, 'main')
      const option = {
        xAxis: {
          type: 'category',
          data: categoryData
        },
        yAxis: {
          type: 'value'
        },
        tooltip: {
          trigger: 'axis'
        },
        visualMap: {
          show: false,
          dimension: 0,
          pieces: [
            {
              lte: changeColorDataPoint,
              color: 'blue'
            },
            {
              gt: changeColorDataPoint,
              lte: changeColorDataPoint + generatedDataPoints,
              color: 'orange'
            }
          ]
        },
        series
      }
      myChart.setOption(option)
    }
  }

  customElements.define('com-sap-sample-echarts-column-chart-vaidehi', ColumnSamplePrepped)
})()
