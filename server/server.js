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
// IMPORT SCHEMAS
const myModels = require("./models/schema.js");
const path = require("path");

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

// bodyParser.urlencoded is deprecated as its included in express
// Instead uses 'express.urlencoded and .json'
app.use(cors()); // Hopefully to fix post requests coming from netlify to heroku
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


/**
 * Init DOMPurify + JSDOM
 */
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)

// mongoose.connect comes first
// async function connectToDB() {
//   try {
//     await mongoose.connect(url, {
//       sslKey: credentials,
//       sslCert: credentials,
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//   } catch (err) {
//     console.error(err);
//   }
// }
// connectToDB();

mongoose.connect(url, {
  sslKey: credentials,
  sslCert: credentials,
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to DB"))
.catch(err => console.error(err));

const db = mongoose.connection;
// line code 22-25 retrieved from https://www.mongoosejs.com/docs/

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
          // create() returns a promsie with the mongodb data if successful. Success if creationDate is not null.
          // console.log("res.ok line", response);
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
        if (e.code === 11000) {
          // 11000 is duplicate URL code...
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
  // res.setHeader("Content-Type", "application/json");
  let cleanCode = DOMPurify.sanitize(req.params.code);
  console.log("Params: ", cleanCode);
  async function getData() {
    // try {
    //   let response = await db
    //     .collection("URL")
    //     .findOne({ codeURL: req.params.code })
    //     .catch( (error) =>
    //       res.send({status: "error", msg: error})
    //     );
    //   console.log("Returned document: " + response);
    //   res.send(response); // send response here should be a then.
    // } catch (error) {
    //   console.error(error);
    //   res.send({ status: "error", msg: `unable to find on mongodb` });
    // }

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
          // res.redirect(String(data.originalURL)) // this is being executed on the original URL! need to fix..
        } else {
          throw new Error(data)
        }
      }) // literally null since it doesnt exist yet. Check for if null then redirect to 404
      .catch((error) => {
        console.error(error)
        // sebd a response that it didn't work. redirect to 404
        res.status(404).send({status: error})
      });
    console.log("Returned document: " + response);
    // res.send(response); // send response here should be a then.
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
