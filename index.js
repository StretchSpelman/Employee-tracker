const inquirer = require("inquirer");
const mysql = require("mysql2");
const { table } = require("table");
const ascii = require("ascii-art");

const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1Sparkie1",
  database: "employment_db",
});

function viewAllDepartments() {
  connection.query(
    { sql: "SELECT name FROM department", rowsAsArray: true },
    (err, results) => {
      if (err) throw err;
      results.unshift(["Name"]);
      console.log(table(results));
      mainMenu();
    }
  );
}

function viewAllRoles() {
  connection.query(
    { sql: "SELECT title, salary FROM roles", rowsAsArray: true },
    (err, results) => {
      if (err) throw err;
      results.unshift(["Title", "Salary"]);
      console.log(table(results));
      mainMenu();
    }
  );
}

function viewAllEmployees() {
  connection.query(
    {
      sql: `SELECT e.id, e.first_name, e.last_name, r.title, d.name, r.salary, CONCAT(m.first_name , ' ' , m.last_name) AS manager_name
      FROM employee e 
      LEFT JOIN roles r ON r.id = e.role_id 
      LEFT JOIN department d ON d.id = r.department_id 
      LEFT JOIN employee m ON m.id = e.manager_id`,
      rowsAsArray: true,
    },
    (err, employees) => {
      if (err) throw err;
      employees.unshift([
        "ID",
        "First Name",
        "Last Name",
        "Title",
        "Department",
        "Salary",
        "Manager",
      ]);
      console.log(table(employees));
      mainMenu();
    }
  );
}

function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "departmentName",
        message: "Enter the name of the department:",
      },
    ])
    .then((answers) => {
      connection.query(
        "INSERT INTO department SET ?",
        { name: answers.departmentName },
        (err) => {
          if (err) throw err;

          console.log("Department added successfully.");
          mainMenu();
        }
      );
    });
}

function addRole() {
  connection.query("SELECT * FROM department", (err, department) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          type: "input",
          name: "roleName",
          message: "Enter the name of the role:",
        },
        {
          type: "input",
          name: "salary",
          message:
            "Enter the salary for this role (use only 2 decimal points and no commas):",
          validate: function (value) {
            const valid =
              !isNaN(parseFloat(value)) && Number.isFinite(parseFloat(value));
            return valid || "Please enter a valid salary.";
          },
        },
        {
          type: "list",
          name: "departmentId",
          message: "Select the department for the role:",
          choices: department.map((department) => ({
            name: department.name,
            value: department.id,
          })),
        },
      ])
      .then((answers) => {
        connection.query(
          "INSERT INTO roles SET ?",
          {
            title: answers.roleName,
            salary: answers.salary,
            department_id: answers.departmentId,
          },
          (err) => {
            if (err) throw err;

            console.log("Role added successfully.");
            mainMenu();
          }
        );
      });
  });
}

function addEmployee() {
  connection.query("SELECT * FROM roles", (err, roles) => {
    if (err) throw err;
    connection.query("SELECT * FROM employee", (err, employee) => {
      if (err) throw err;
      inquirer
        .prompt([
          {
            type: "input",
            name: "firstName",
            message: "Enter the first name of the employee:",
          },
          {
            type: "input",
            name: "lastName",
            message: "Enter the last name of the employee:",
          },
          {
            type: "list",
            name: "roleId",
            message: "Select the role for the employee:",
            choices: roles.map((role) => ({
              name: role.title,
              value: role.id,
            })),
          },
          {
            type: "list",
            name: "managerId",
            message: "Select the manager for the employee:",
            choices: [
              { name: "None", value: null },
              ...employee.map((employee) => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id,
              })),
            ],
          },
        ])
        .then((answers) => {
          connection.query(
            "INSERT INTO employee SET ?",
            {
              first_name: answers.firstName,
              last_name: answers.lastName,
              role_id: answers.roleId,
              manager_id: answers.managerId,
            },
            (err) => {
              if (err) throw err;

              console.log("Employee added successfully.");
              mainMenu();
            }
          );
        });
    });
  });
}

function updateEmployeeRole() {
  connection.query("SELECT * FROM employee", (err, employee) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Select the employee to update:",
          choices: employee.map((employee) => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id,
          })),
        },
      ])
      .then((employeeAnswer) => {
        connection.query("SELECT * FROM roles", (err, roles) => {
          if (err) throw err;
          inquirer
            .prompt([
              {
                type: "list",
                name: "roleId",
                message: "Select the new role for the employee:",
                choices: roles.map((role) => ({
                  name: role.title,
                  value: role.id,
                })),
              },
            ])
            .then((roleAnswer) => {
              connection.query(
                "UPDATE employee SET role_id = ? WHERE id = ?",
                [roleAnswer.roleId, employeeAnswer.employeeId],
                (err) => {
                  if (err) throw err;
                  console.log("Employee role updated successfully.");
                  mainMenu();
                }
              );
            });
        });
      });
  });
}
async function generateTitle() {
  const titleText = "The Employee Tracker!";

  return new Promise((resolve, reject) => {
    ascii.font(titleText, "doom", (err, rendered) => {
      if (err) {
        reject(err);
      } else {
        console.log(rendered);
        resolve();
        try {
          mainMenu();
        } catch (error) {
          console.error("There was an error that occurred in mainMenu:", error);
        }
      }
    });
  });
}

async function mainMenu() {
  try {
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          "Add a department",
          "View all departments",
          "Add a role",
          "View all roles",
          "Add an employee",
          "View all employees",
          "Update an employee role",
          "Exit",
        ],
      },
    ]);

    switch (answers.action) {
      case "View all departments":
        viewAllDepartments();
        break;
      case "View all roles":
        viewAllRoles();
        break;
      case "View all employees":
        viewAllEmployees();
        break;
      case "Add a department":
        addDepartment();
        break;
      case "Add a role":
        addRole();
        break;
      case "Add an employee":
        addEmployee();
        break;
      case "Update an employee role":
        updateEmployeeRole();
        break;
      case "Exit":
        connection.end();
        console.log("Goodbye!");
        break;
      default:
        console.log("Invalid choice. Please try again.");
        mainMenu();
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
generateTitle();
