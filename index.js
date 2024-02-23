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

let kpisPerCompanyPerMonth, companiesAndDepartments;

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
  //   const objKey = [
  //     "company",
  //     "department",
  //     "numberEmployees",
  //     "overtimeHours",
  //     "overtimeCosts",
  //     "avgOvertimeCostsPerHour",
  //     "avgOvertimeHoursPerEmployee",
  //     "avgOvertimeDaysPerEmployee",
  //     "avgOvertimeCostsPerEmployee",
  //     "overtimeDays",
  //     "leaveDays",
  //     "leaveCosts",
  //     "avgLeaveDaysPerEmployee",
  //     "avgLeaveCostsPerEmployee",
  //     "sicknessDays",
  //     "sicknessCosts",
  //     "avgSicknessDaysPerEmployee",
  //     "avgSicknessCostsPerEmployee",
  //   ];

  const workbook = xlsx.readFile(filePath);
  const sheet1Name = workbook.SheetNames[0];
  const sheet2Name = workbook.SheetNames[1];
  const sheet3Name = workbook.SheetNames[2];

  const sheet1 = workbook.Sheets[sheet1Name];
  const sheet2 = workbook.Sheets[sheet2Name];
  const sheet3 = workbook.Sheets[sheet3Name];

  kpisPerCompanyPerMonth = xlsx.utils.sheet_to_json(sheet2, {
    header: 0, // Use the second row as the header
    blankrows: false, // Exclude blank rows
    defval: "", // Use an empty string for empty cells
    raw: false, // Return formatted values
  });
  companiesAndDepartments = xlsx.utils.sheet_to_json(sheet3, {
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
  kpisPerCompanyPerMonth = standardFormatData(kpisPerCompanyPerMonth)
  companiesAndDepartments = standardFormatData(companiesAndDepartments)
  console.log(companiesAndDepartments);
  sql(companiesAndDepartments, kpisPerCompanyPerMonth);
  // Write data to JSON file
  const kpisPerCompanyPerMonthJson = JSON.stringify(kpisPerCompanyPerMonth, null, 2);
  const companiesAndDepartmentsJson = JSON.stringify(companiesAndDepartments, null, 2);
  fs.writeFileSync('kpisPerCompanyPerMonth.json', kpisPerCompanyPerMonthJson);
  fs.writeFileSync('companiesAndDepartments.json', companiesAndDepartmentsJson);
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

app.get("/kpisPerCompanyPerMonth", (req, res) => {
  const filePath = path.join(__dirname, 'kpisPerCompanyPerMonth.json');
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

app.get("/companiesAndDepartments", (req, res) => {
  const filePath = path.join(__dirname, 'companiesAndDepartments.json');
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
