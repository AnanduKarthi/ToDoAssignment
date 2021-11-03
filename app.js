const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasCategoryAndStatus = (requestQuery) => {
  return (
    (requestQuery.category !== undefined) & (requestQuery.status !== undefined)
  );
};

const hasCategoryAndPriority = (requestQuery) => {
  return (
    (requestQuery.category !== undefined) &
    (requestQuery.priority !== undefined)
  );
};

const hasCategory = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const convertTable = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status, category } = request.query;

  switch (true) {
    // priority and status
    case hasPriorityAndStatusProperties(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodosQuery = `
            SELECT
                *
            FROM
                todo 
            WHERE
                todo LIKE '%${search_q}%'
                AND status = '${status}'
                AND priority = '${priority}';`;
          data = await database.all(getTodosQuery);
          response.send(data.map((eachItem) => convertTable(eachItem)));
        } else {
          response.status = 400;
          response.send("Invalid Todo Status");
        }
      } else {
        response.status = 400;
        response.send("Invalid Todo Priority");
      }
      break;

    // category and status
    case hasCategoryAndStatus(request.body):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodosQuery = `
                SELECT
                    *
                FROM
                    todo 
                WHERE
                    category = '%${category}%'
                    AND status = '${status}';`;
          data = await database.all(getTodosQuery);
          response.send(data.map((eachItem) => convertTable(eachItem)));
        } else {
          response.status = 400;
          response.send("Invalid Todo Status");
        }
      } else {
        response.status = 400;
        response.send("Invalid Todo Category");
      }
      break;

    // category and Priority
    case hasCategoryAndPriority(request.body):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          getTodosQuery = `
                SELECT
                    *
                FROM
                    todo 
                WHERE
                    category = '%${category}%'
                    AND priority = '${priority}';`;
          data = await database.all(getTodosQuery);
          response.send(data.map((eachItem) => convertTable(eachItem)));
        } else {
          response.status = 400;
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status = 400;
        response.send("Invalid Todo Category");
      }
      break;
    // priority only
    case hasPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}';`;
        data = await database.all(getTodosQuery);
        response.send(data.map((eachItem) => convertTable(eachItem)));
      } else {
        response.status = 400;
        response.send("Invalid Todo Priority");
      }
      break;
    //status only
    case hasStatusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}';`;
        data = await database.all(getTodosQuery);
        response.send(data.map((eachItem) => convertTable(eachItem)));
      } else {
        response.status = 400;
        response.send("Invalid Todo Status");
      }
      break;
    // category only
    case hasCategory(request.body):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        category = '%${category}%';`;
        data = await database.all(getTodosQuery);
        response.send(data.map((eachItem) => convertTable(eachItem)));
      } else {
        response.status = 400;
        response.send("Invalid Todo Category");
      }
      break;
    default:
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
  }
});
