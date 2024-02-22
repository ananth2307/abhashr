const mysql = require("mysql");
// json1 is companiesAndDepartmentsJson, json2 is kpisPerCompanyPerMonthJson
const sql = (json1, json2) => {
  console.log("called");
  const connection = mysql.createConnection({
    host: "sql6.freemysqlhosting.net",
    user: "sql6685697",
    password: "jB52mZYYYp",
    database: "sql6685697",
    port: "3306",
  });
  // Connect to the database
  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to database:", err);
      return;
    }
    console.log("Connected to database");
  });
  // Define the SQL queries to insert data into each table
  const insertQueries = {
    company: "INSERT INTO companies (name) VALUES (?)",
    employee:
      "INSERT INTO employees (name, company_id, department_id) VALUES (?, ?, ?)",
    data: "INSERT INTO employee_data (month, employee_id, overtime_hours, overtime_costs, leave_days, leave_costs, sickness_days, sickness_costs, total_absence_days) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  };

  connection.query("DELETE FROM employee_data", () => {
    connection.query("DELETE FROM employees", () => {
      connection.query("DELETE FROM departments", () => {
        connection.query("DELETE FROM companies", () => {
          connection.query(
            insertQueries.company,
            [json1[0].company],
            (err, result) => {
              if (err) {
                console.error("Error inserting company: " + err.stack);
                return;
              }
              const companyId = result.insertId;
              console.log("Inserted company: " + companyId);
              json1Func(companyId);
            }
          );
        });
      });
    });
  });

  const json1Func = (companyId) => {
    // Loop through JSON 1 to insert data into the company, department, and employee tables
    json1.forEach((data) => {
      connection.query(
        `INSERT INTO departments (name, company_id, numberEmployees, overtime_hrs, overtimeCosts, avg_OTCostsPerHour, avg_OvertimeHoursPerEmployee, avg_OvertimeDaysPerEmployee, avg_OvertimeCostsPerEmployee_ANG, overtimeDays, leaveDays, leaveCosts, avg_LeaveDaysPerEmployee, avg_LeaveCostsPerEmployee_ANG, sicknessDays, sicknessCosts_ANG, avg_SicknessDaysPerEmployee, avg_SicknessCostsPerEmployee_ANG, totalAbsenceDays) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.department,
          companyId,
          data.numberEmployees,
          data["overtimehrs"],
          data.overtimeCosts,
          data["avgCostsPerHour"],
          data["avgOvertimeHoursPerEmployee"],
          data["avgOvertimeDaysPerEmployee"],
          data["avgOvertimeCostsPerEmployeeANG"],
          data["overtimeDays"],
          data["leaveDays"],
          data["leaveCosts"],
          data["avgLeaveDaysPerEmployee"],
          data["avgLeaveCostsPerEmployeeNaf"],
          data["sicknessDays"],
          data["sicknessCosts"],
          data["avgSicknessDaysPerEmployee"],
          data["avgSicknessCostsPerEmployee"],
          data["totalAbsenceDays"],
        ],
        (err, result) => {
          if (err) {
            console.error("Error inserting employee: " + err.stack);
            return;
          }
        }
      );
    });
  };

  // Loop through JSON 2 to insert data into the company, department, and employee tables
  //   json2.forEach((data) => {
  //     connection.query(insertQueries.company, [data.company], (err, result) => {
  //       if (err) {
  //         console.error("Error inserting company: " + err.stack);
  //         return;
  //       }
  //       const companyId = result.insertId;
  //       connection.query(
  //         insertQueries.department,
  //         [data.department],
  //         (err, result) => {
  //           if (err) {
  //             console.error("Error inserting department: " + err.stack);
  //             return;
  //           }
  //           const departmentId = result.insertId;
  //           connection.query(
  //             insertQueries.employee,
  //             [data.company, companyId, departmentId],
  //             (err, result) => {
  //               if (err) {
  //                 console.error("Error inserting employee: " + err.stack);
  //                 return;
  //               }
  //               const employeeId = result.insertId;
  //               // Insert data into the data table
  //               connection.query(
  //                 insertQueries.data,
  //                 [
  //                   data.month,
  //                   employeeId,
  //                   data.overtimeHours,
  //                   data.overtimeCosts,
  //                   data.leaveDays,
  //                   data.leaveCosts,
  //                   data.sicknessDays,
  //                   data.sicknessCosts,
  //                   data.totalAbsenceDays,
  //                 ],
  //                 (err, result) => {
  //                   if (err) {
  //                     console.error("Error inserting data: " + err.stack);
  //                     return;
  //                   }
  //                   console.log("Inserted data for employee " + employeeId);
  //                 }
  //               );
  //             }
  //           );
  //         }
  //       );
  //     });
  //   });
};
module.exports = sql;
