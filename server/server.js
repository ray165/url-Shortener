const PORT = process.env.PORT || 8000; // 3001 for react
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");
const credentials = fs.readFileSync("./cert.pem");
const url = "mongodb+srv://cluster0.obfdv.mongodb.net/projectsDB?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority"
// IMPORT SCHEMAS
const myModels = require("./models/schema.js");
const path = require("path");
const { createHash } = require("crypto");

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

// mongoose.connect comes first
async function connectToDB() {
  try {
    await mongoose.connect(url, {
      sslKey: credentials,
      sslCert: credentials,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.error(err);
  }
}
connectToDB();

const db = mongoose.connection;
// line code 22-25 retrieved from https://www.mongoosejs.com/docs/

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("mongoose running");
});


function randomNumber() {
    var numb = 0;
    var run = true
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


app.post("/new-url", async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    console.log("body", req.body)
    console.log("Requested URL", req.body.url);

    // ASCII 97-122 lowercase
    // ASCII 65-90 uppercase 
    // 50 possible characters, assume we use 4 digits 
    // 50^4
    const limit97 = 97
    const limit122 = 122
    const limit65 = 65
    const limit90 = 90

    function randChars() {
        var myArray = [];
        for (let index = 0; index < 4; index++) {
            myArray.push(randomNumber());
            console.log(myArray)
        }
        console.log(String.fromCharCode(...myArray))
        return String.fromCharCode(...myArray);
    }

    var newURL = randChars()
    console.log("new url: ", newURL)
    res.send({ status: "success", msg: `post created ${newURL}` });
});

app.get("/:hash", function (req, res) {
  console.log("Call to server for user's name successful");
  async function getData() {
    let response = await db
      .collection("users")
      .findOne({ hash: req.params.hash });
    console.log("Returned document: " + response);
    res.send(response);
  }
  getData();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
