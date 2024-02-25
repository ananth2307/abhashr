const chokidar = require("chokidar");
const xlsx = require("xlsx");
const fs = require("fs");
// const lodash = require("lodash");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');

const filePath = "/Users/gmc-ananthprasad.n1/Documents/abashr/data.xlsx";

const watcher = chokidar.watch(filePath, {
  persistent: true,
});

const sql = require('./sql');

let mainChart, drillDownChart;

const convertToCamelCase = (str) => {
  return str.replace(/\s(.)/g, function (match) {
      return match.toUpperCase();
  }).replace(/\s/g, '').replace(/^(.)/, function (match) {
      return match.toLowerCase();
  });
};

function removeSpecialChars(str) {
  return str.replace(/[^\w\s]/gi, '');
}

const standardFormatData = (data) => data.map(obj => {
  const newObj = {};
  for (let key in obj) {
      const newKey = convertToCamelCase(key.trim());
      newObj[newKey] = obj[key].trim();
  }
  return newObj;
});

watcher.on("change", (path) => {
  console.log(`File ${path} has been changed`);

  const workbook = xlsx.readFile(filePath);
  const sheet1Name = workbook.SheetNames[0];
  const sheet2Name = workbook.SheetNames[1];

  const sheet1 = workbook.Sheets[sheet1Name];
  const sheet2 = workbook.Sheets[sheet2Name];

  mainChart = xlsx.utils.sheet_to_json(sheet1, {
    header: 0, // Use the second row as the header
    blankrows: false, // Exclude blank rows
    defval: "", // Use an empty string for empty cells
    raw: false, // Return formatted values
  });
  console.log("----------------------------",mainChart)
  console.log("----------------------------")

  drillDownChart = xlsx.utils.sheet_to_json(sheet2, {
    header: 0, // Use the second row as the header
    blankrows: false, // Exclude blank rows
    defval: "", // Use an empty string for empty cells
    raw: false, // Return formatted values
  });

  //   const output = sheet1.map((arr, index) => {
  //     if (index !== 0) {
  //       const obj = {};
  //       arr.forEach((value, index) => {
  //         obj[objKey[index]] = value;
  //       });
  //       return obj;
  //     } else {
  //       return {};
  //     }
  //   });
  //   const filteredData = output.filter((arr) => !lodash.isEmpty(arr));
  mainChart = standardFormatData(mainChart)
  drillDownChart = standardFormatData(drillDownChart)
  // console.log(mainChart);
  // sql(drillDownChart, mainChart);
  // Write data to JSON file
  const mainChartJson = JSON.stringify(mainChart, null, 2);
  const drillDownChartJson = JSON.stringify(drillDownChart, null, 2);
  fs.writeFileSync('mainChart.json', mainChartJson);
  fs.writeFileSync('drillDownChart.json', drillDownChartJson);
});

watcher.on("error", (error) => {
  console.error(`Watcher error: ${error}`);
});

//EXPRESS

const app = express();
// support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());
const port = 8023;

app.get("/mainChart", (req, res) => {
  const filePath = path.join(__dirname, 'mainChart.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

app.get("/drillDownChart", (req, res) => {
  const filePath = path.join(__dirname, 'drillDownChart.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
