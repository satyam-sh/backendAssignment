const express = require("express");
const connector = require("sqlite3");
const { open } = require("sqlite");
const app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "test.db");
let myDb = null;

const initializeDb_Server = async () => {
  try {
    myDb = await open({ filename: dbPath, driver: connector.Database });
    app.listen(3000, () => {
      console.log("Server Running!");
    });
  } catch (e) {
    console.log(`DB Err:: ${e.message}`);
    process.exit(1);
  }
};

initializeDb_Server();

//ALL USERS LIST
app.get("/api/users", async (req, res) => {
  const { page = 1, limit = 5, sort = "", name = "" } = req.query;
  let sortValue;
  let sortingOrder = "ASC";
  if (sort === "") sortValue = "id";
  else if (sort[0] === "-")
    (sortingOrder = "DESC"), (sortValue = sort.substr(1));

  console.log(sortValue, sortingOrder);

  const ListAllUsersQuery = `SELECT * FROM mytable 
                                WHERE first_name LIKE '%${name.toLowerCase()}%' 
                                OR last_name LIKE '%${name.toLowerCase()}%'
                                 ORDER BY ${sortValue} ${sortingOrder}
                                 LIMIT '${limit}'
                                ;
                                `;

  const result = await myDb.all(ListAllUsersQuery);
  res.send(result);
});

//CREATE USER
app.post("/api/users", async (req, res) => {
  //      const latestId = `SELECT max(id) FROM mytable
  //  ;`;
  //   const idOf = await myDb.get(latestId);

  const {
    id,
    first_name,
    last_name,
    company_name,
    city,
    state,
    zip,
    email,
    web,
    age,
  } = req.body;

  console.log(idOf);

  const PostUserQuery = `INSERT INTO mytable
                             (id,first_name,last_name,company_name,city,state,zip,email,web,age)
                             VALUES (
                                 ${id},'${first_name}','${last_name}','${company_name}', '${city}', '${state}',
                                 ${zip} , '${email}' , '${web}', ${age}
                             )
                             ;`;
  const result = await myDb.run(PostUserQuery);
  res.send({});
});

//GET PARTICULAR USER
app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const getUserDetailQuery = `SELECT * FROM mytable WHERE id= ${id};`;
  const result = await myDb.get(getUserDetailQuery);
  if (result !== undefined) res.status(200).send(result);
  else res.status(401).send("Bad Request");
});

//UPDATE USER INFORMATION
app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, age } = req.body;
  console.log(age);

  const editUserDetails = `UPDATE mytable 
                                SET first_name = '${first_name}',
                                    last_name = '${last_name}',
                                    age = ${age}
                                    WHERE id = ${id};`;
  const result = await myDb.run(editUserDetails);
  if (id === "" || result === undefined) res.status(401).send("Bad Request");
  else res.status(200).send({});
});

//DELETE USER
app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  const deleteUserQuery = `DELETE FROM mytable WHERE id =${id};`;
  const result = myDb.run(deleteUserQuery);

  if (result === undefined) res.status(401).send("Bad Request");
  else res.status(200).send({});
});

//SEARCH BASED ON CITY
app.get("/api/users/city/:city_name", async (req, res) => {
  const { city_name } = req.params;

  const getUserDetailOnCity = `SELECT * FROM mytable WHERE LOWER(city) LIKE '%${city_name.toLowerCase()}%';`;
  const result = await myDb.all(getUserDetailOnCity);
  if (result === undefined) res.send(401);
  else res.send(result);
});

//RESULT ON STATE
app.get("/api/users/state/:state", async (req, res) => {
  const { state } = req.params;
  const stateBasedUserQuery = `SELECT * FROM mytable WHERE LOWER(state) LIKE '${state.toLowerCase()}';`;
  const result = await myDb.all(stateBasedUserQuery);
  if (result === undefined) res.status(401).send("Bad Request");
  res.send(result);
});

//RESULT ON EMAILPROVIDER
app.get("/api/users/email/:provider", async (req, res) => {
  const { provider } = req.params;

  console.log(provider);
  const Query = `SELECT * FROM mytable WHERE LOWER(email) LIKE '%${provider}%';`;
  const result = await myDb.all(Query);
  res.send(result);
});
