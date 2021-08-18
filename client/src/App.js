import React, { useRef, useState, useEffect } from "react";
import { TextField, Button, Typography, Paper } from "@material-ui/core";
import CardList from "./subComp/cardList.js";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
} from "react-router-dom";
import "./App.css";

// function validation(text) {
//   if (text.length === null || text === '') {
//     return Error
//   }
// }

export default function App() {
  const link = useRef("testLink");
  const [newLink, setNewLink] = useState("");
  const [log, setLog] = useState([]);

  // AJAX request to server side on button click.
  const send = (e) => {
    e.preventDefault();
    console.log(link.current.value); // working
    let dataToSend = {
      url: link.current.value,
    };

    fetch(`/new-url`, {
      method: "POST",
      body: JSON.stringify(dataToSend), // stringify is needed to send!!!
      headers: {
        "Content-Type": "application/json", // content type is needed as well!!!
      },
    })
      .then((data) => data.json())
      .then((res) => {
        console.log(res);
        if (res.status === "error") {
          throw new Error(res);
        } else if (res.status === "success") {
          setNewLink(String(window.location.href + "u/" + res.code));
          let newData = {
            originalLink: res.json.originalURL,
            newLink: String(window.location.href + "u/" + res.code),
            id: res.json._id,
          };
          setLog([newData, ...log]);
          console.log(log);
        }
      })
      .catch((err) => {
        setNewLink("Unable to generate a new link");
      });
  };

  return (
    <Router>
      <Paper id="formContainer">
        <Typography variant="h3" color="primary" fontWeight="fontWeightMedium">Short URL</Typography>
        <form noValidate autoComplete="off" id="input-url">
          <TextField
            id="outlined-basic"
            label="your url goes here"
            variant="outlined"
            fullWidth="true"
            inputRef={link}
          />
        </form>
        <Button variant="contained" color="primary" onClick={send}>
          Get Shortened URL
        </Button>
        <Typography variant="caption" fontWeight="fontWeightBold">Links must be fully qualified i.e. including 'https'</Typography>
        <Typography id="message" varant="subtitle1" color="secondary" fontWeight="fontWeightBold">
          {newLink} 
        </Typography>
      </Paper>
      <CardList data={log} />
      <Switch>
        <Route path="/u/:code" children={<Child />} />
      </Switch>
    </Router>
  );
}

/**
 * Function is needed as React controls the window.location property. 
 * Can't navigate to anthoer site using Node Js when react is in place
 * @returns Opens new fully-qualified link
 */
function Child() {
  let { code } = useParams();
  const [status, setStatus] = useState();

  useEffect(() => {
    fetch(`/findCode/${code}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.status === "success") {
          setStatus(res.status);
          window.location.replace(res.content.originalURL);
        }
      })
      .catch((err) => {
        setStatus(err.status);
        console.error(err);
      });
    return () => {
      setStatus(null);
    };
  }, [status]);

  return (
    <>
      <h1>code: {code}</h1>
      <h2>message: {status}</h2>
    </>
  );
}
