const PORT = process.env.PORT || 8000; // 3001 for react
const express = require("express");
const mongoose = require("mongoose");
const createDOMPurify = require('dompurify');
const rateLimit = require("express-rate-limit");
const { JSDOM } = require('jsdom');
const app = express();
const fs = require("fs");
const cors = require('cors');
const bodyParser = require("body-parser");
const credentials = process.env.credentials; //fs.readFileSync("./cert.pem") 
const url =
  "mongodb+srv://cluster0.obfdv.mongodb.net/projectsDB?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority";
const myModels = require("./models/schema.js");
const path = require("path");

const MONGODB_DUPLICATE_ERROR = 11000;

/**
 * Rate Limiter for spam prevention... for all API routes
 */
 app.set('trust proxy', 1); // reccomended by docs using reverse proxy w/ heroku
 const limiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 100 // 100 reqs per IP every 15 mins
 });
app.use(limiter)

// Fix for deprecation warning 'collection.ensureIndex'
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);


app.use(cors({ origin: '*' })); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


/**
 * Init DOMPurify + JSDOM
 */
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)

mongoose.connect(url, {
  sslKey: credentials,
  sslCert: credentials,
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to DB"))
.catch(err => console.error(err));

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("mongoose running");
});

/**
 * Generates a code for mongodb
 * @returns 4 letter code
 */
function randomNumber() {
  var numb = 0;
  var run = true;
  while (run) {
    numb = Math.floor(Math.random() * 55) + 65;
    if (numb > 90 && numb < 97) {
      continue;
    } else {
      run = false;
      return numb;
    }
  }
}

app.get('/', (req, res) => {
  res.send("Server connected!")
})

app.post("/new-url", async function (req, res) {
  res.setHeader("Content-Type", "application/json");
  console.log("body", req.body);
  let clean = DOMPurify.sanitize(req.body.url);
  console.log("Requested URL", clean);

  // ASCII 97-122 lowercase
  // ASCII 65-90 uppercase
  // 50 possible characters, assume we use 4 digits
  // 50^4 permutations

  function randChars() {
    var myArray = [];
    for (let index = 0; index < 4; index++) {
      myArray.push(randomNumber());
      console.log(myArray);
    }
    return String.fromCharCode(...myArray);
  }

  var newURL = randChars();
  var newData = new myModels.URL({
    originalURL: clean,
    codeURL: newURL,
  });

  function createDoc() {
    myModels.URL.create(newData)
      .then((response) => {
        if (response.creationDate !== null) {
          return res.send({
            status: "success",
            msg: `post created ${newURL}`,
            code: newURL,
            json: response
          });
        } else {
          throw new Error(response); // mongoDB error
        }
      })
      .catch((e) => {
        console.error("Error:", e, "error code", e.code);
        if (e.code === MONGODB_DUPLICATE_ERROR) {
          newData.codeURL = randChars();
          createDoc(); 
        } else {
          res.send({ status: "error", msg: `Unable to generate data ${e}` });
        }
      });
  }
  createDoc();

  console.log("new url: ", newURL);
});

app.get("/findCode/:code", function (req, res) {
  let cleanCode = DOMPurify.sanitize(req.params.code);
  console.log("Params: ", cleanCode);
  async function getData() {
    let response = await db
      .collection("urls")
      .findOne({ codeURL: cleanCode })
      .then((data) => {
        console.log("Res from mongo:", data)
        if (data.creationDate !== null) {
          res.send({
            status: "success",
            content: data,
          })
        } else {
          throw new Error(data)
        }
      }) 
      .catch((error) => {
        console.error(error)
        res.status(404).send({status: error})
      });
    console.log("Returned document: " + response);
  }

  try {
    getData()
  } catch (error) {
    console.err(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
