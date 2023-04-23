import { app, Datastore } from 'codehooks-js';
import { crudlify } from 'codehooks-crudlify';
// import { date, object, string, number, boolean} from 'yup';
import jwtDecode from 'jwt-decode';
import * as Yup from 'yup';

// Define the schema for a Todo object using Yup
const noteSchema = Yup.object({
  userId: Yup.string().required('User ID is required'), // User ID
  title: Yup.string().required('Note title is required'), // note title
  content: Yup.string().required('Note content is required'), // note content
  category: Yup.string().nullable(), // note category (optional)
  createdOn: Yup.date().default(() => new Date()),
});

// Define the schema for a Category object using Yup
// Todo: add category schema

const categoriesSchema = Yup.object({
  userId: Yup.string().required(),
  name: Yup.string().required(),
  createdOn: Yup.date().default(() => new Date()),
});

// const idx = await conn.createIndex('notes', ['title', 'content', 'category']);

const options = {
  // Specify the schema type as "yup"
  schema: 'yup',
};

const userAuth = async (req, res, next) => {
  // console.log(req.headers);
  
  try {
    const { authorization } = req.headers;
    // console.log('in userAuth req header \n', req.headers);
    // console.log('in userAuth \n', authorization);
    if (authorization) {
      const token = authorization.replace("Bearer ", "");
      // NOTE this doesn't validate, but we don't need it to. codehooks is doing that for us.
      const token_parsed = jwtDecode(token);
      req.user_token = token_parsed;
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(400);
    res.json(error).end();
    next();
  }
};
app.use(userAuth);

app.use("/note", (req, res, next) => {
  if (req.method === "POST") {
    // always save authenticating user Id token.
    // note -- were not enforcing uniqueness which isn't great.
    // we don't currently have a great way to do this -- one option would be to
    // have a user collection track which collections have been filled
    // It's a limitation for sure, but I'll just make that a front-end problem...
    req.body.userId = req.user_token.sub;
  } else if (req.method === "GET") {
    // on "index" -- always check for authentication.
    req.query.userId = req.user_token.sub;
  }
  next();
});

app.use("/categories", (req, res, next) => {
  if (req.method === "POST") {
    // always save authenticating user Id token.
    // note -- were not enforcing uniqueness which isn't great.
    // we don't currently have a great way to do this -- one option would be to
    // have a user collection track which collections have been filled
    // It's a limitation for sure, but I'll just make that a front-end problem...
    req.body.userId = req.user_token.sub;
  } else if (req.method === "GET") {
    // on "index" -- always check for authentication.
    req.query.userId = req.user_token.sub;
  }
  next();
});


// Make REST API CRUD operations for the "notes" collection with the Yup schema

// search the note table by keyword
// show results by date desc order
async function getSearchRes(req, res) {

  const userId = req.user_token.sub;
  const searchKey = req.params.searchInput;
  console.log('search for ', searchKey);
  const conn = await Datastore.open();
  const query = {
    userId: userId,
    $or: [
      { title: { $regex: searchKey, $options: 'gi' } },
      { content: { $regex: searchKey, $options: 'gi' } },
      { category: { $regex: searchKey, $options: 'gi' } },
      { createdOn: { $regex: searchKey, $options: 'gi' } },
    ],
  };
  const options = {
    sort: { createdOn: 1 },
    filter: query,
  };
  conn.getMany("note", options).json(res);
}

async function getAllNotes(req, res) {
  const userId = req.user_token.sub;
  const conn = await Datastore.open();
  
  const options = {
    filter: { "userId": userId },
  };
  conn.getMany("note", options).json(res);
}

// get note by id
async function getNote(req, res){
  const id = req.params.id;
  const userId = req.user_token.sub;
  const conn = await Datastore.open();
  try{
    const doc = await conn.getOne("note", id);
    if(doc.userId != userId){
      res.status(403).end();
      return;
    } else{
      res.json(doc);
    }
  } catch(e){
    res.status(404).end(e);
    return;
  }
}

// edit the note
// {
//   "category": "health",
//   "content": "new content for note 2",
//   "title": "updated local note 2",
//   "userId": "user_2OXeugjSSeqp4tDieMufwv8kUGO"
// }
async function editNote(req, res) {
  const userId = req.user_token.sub;
  const conn = await Datastore.open();
  if(req.body.userId == userId){
    req.body.createdOn = new Date();
    req.body._id = req.params.id;
    const data = await conn.updateOne('note', req.params.id, req.body);
    res.json(data);
  } else{
    res.status(403).end();
    return;
  }
}

// has req.body.userId already inserted, don't have to pass userId
// {
//   "title": "local note 4",
//   "content": "new content for note 4",
//   "category": "health"
// }
// async function createNote(req, res) {
//   const conn = await Datastore.open();
//   req.body.createdOn = new Date();
//   const data = conn.insertOne("note", req.body);
//   console.log(JSON.stringify(data));
//   res.status(201).json(req.body);
//   // console.log(res.json());
// }

// desceding: sort 0, asc: 1
async function getNotesSortedByDate(req, res) {
  const userId = req.user_token.sub;
  const sortByDesc = req.params.sortCrit === "true";
  console.log('sort');
  const conn = await Datastore.open();
  const options = {
    filter: { userId : userId },
    sort: { createdOn : 0} // Use 0 for descending sort order and 1 for ascending sort order
  };
  conn.getMany("note", options).json(res);
}

// get notes by category
async function getNoteByCat(req, res){
  const userId = req.user_token.sub;
  const conn = await Datastore.open();
  const options = {
    filter: { category: req.params.cat, userId: userId },
  };
  conn.getMany("note", options).json(res);
}


app.get('/note', getAllNotes); // get all notes under curr user
app.get("/note/:id", getNote); // get a note by note _id
app.get("/note/category/:cat", getNoteByCat);
app.put("/note/:id", editNote); // update note by _id with new json
// app.post("/note", createNote);  // add a new note to curr user
app.get("/note/sort/:sortCrit", getNotesSortedByDate);
app.get("/note/getSearchRes/:searchInput", getSearchRes);


// for categories 

async function getAllCats(req, res) {
  const userId = req.user_token.sub;
  const conn = await Datastore.open();
  
  const options = {
    filter: { "userId": userId },
  };
  conn.getMany("categories", options).json(res);
}

// get note by id
async function getCat(req, res){
  const id = req.params.id;
  const userId = req.user_token.sub;
  const conn = await Datastore.open();
  try{
    const doc = await conn.getOne("categories", id);
    if(doc.userId != userId){
      res.status(403).end();
      return;
    } else{
      res.json(doc);
    }
  } catch(e){
    res.status(404).end(e);
    return;
  }
}

// edit the category
// {
//   "name": "",
//   "userId": ""
// }
async function editCat(req, res) {
  const userId = req.user_token.sub;
  const conn = await Datastore.open();
  if(req.body.userId == userId){
    req.body.createdOn = new Date();
    req.body._id = req.params.id;
    const data = await conn.updateOne('categories', req.params.id, req.body);
    res.json(data);
  } else{
    res.status(403).end();
    return;
  }
}

// has req.body.userId already inserted, don't have to pass userId
// {
//   "name": "local note 4",
// }
// async function createCat(req, res) {
//   const conn = await Datastore.open();
//   req.body.createdOn = new Date();
//   const data = conn.insertOne("categories", req.body);
//   console.log("data is", data);
//   res.status(201).json(data);
//   // console.log("res is", res.json());
// }


app.get('/categories', getAllCats); // get all notes under curr user
app.get("/categories/:id", getCat); // get a note by note _id
app.put("/categories/:id", editCat); // update note by _id with new json
// app.post("/categories", createCat);  // add a new note to curr user

// Make REST API CRUD operations for the "notes" collection with the Yup schema
crudlify(app, { note: noteSchema, categories: categoriesSchema }, options);

// Export app to a runtime server engine
export default app.init();
