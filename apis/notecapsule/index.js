import {app, Datastore} from 'codehooks-js'
import {crudlify} from 'codehooks-crudlify'
// import { date, object, string, number, boolean} from 'yup';
import jwtDecode from 'jwt-decode';
import * as Yup from 'yup'


// Define the schema for a Todo object using Yup
const noteSchema = Yup.object().shape({
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
})

const options = {
  // Specify the schema type as "yup"
  schema: 'yup',
};

const userAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (authorization) {
      const token = authorization.replace('Bearer ','');
      // NOTE this doesn't validate, but we don't need it to. codehooks is doing that for us.
      const token_parsed = jwtDecode(token);
      req.user_token = token_parsed;
    }
    next();
  } catch (error) {
    next(error);
  } 
}
app.use(userAuth)

// lastest note is on the top
async function getNotesDescSortedByDate(req, res) {
  // const userId = req.user_token.sub;
  // const userId = req.params.userId;
  const userId = "test1"; // for testing
  const conn = await Datastore.open();  
  const query = {"userId": userId};
  const options = {
    filter: query,
    sort: {'createdOn' : 0},
  }  
  conn.getMany('note', options).json(res);  
}

app.get('/getAllNotesDesc', getNotesDescSortedByDate);


// latest note is on the bottonm
async function getNotesAescSortedByDate(req, res) {
  const userId = req.user_token.sub;
  // const userId = req.params.userId;
  // const userId = "test1"; // for testing
  const conn = await Datastore.open();  
  const query = {"userId": userId };
  const options = {
    filter: query,
    sort: {'createdOn' : 1},
  }  
  conn.getMany('note', options).json(res);  
}

app.get('/getAllNotesAesc', getNotesAescSortedByDate);


// Make REST API CRUD operations for the "notes" collection with the Yup schema
crudlify(app, { note: noteSchema, categories: categoriesSchema }, options);

// Export app to a runtime server engine
export default app.init();
