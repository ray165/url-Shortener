import React, { useRef, useState, useLayoutEffect } from "react";
import { TextField, Button, Typography, Paper } from "@material-ui/core";
import  {
  createMuiTheme,
  responsiveFontSizes,
  ThemeProvider,
} from "@material-ui/core/styles";
import CardList from "./subComp/cardList.js";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams,
} from "react-router-dom";
import DOMPurify from 'dompurify';
import "./App.css";

let theme = createMuiTheme();
theme = responsiveFontSizes(theme);

export default function App() {
  const link = useRef("testLink");
  const [newLink, setNewLink] = useState("");
  const [log, setLog] = useState([]);

  const send = (e) => {
    e.preventDefault();
    let clean = DOMPurify.sanitize(link.current.value);
    let valid = false;
    let regexURL =  /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-/]))?/


    //Check if its a fully qualified link. Throw error otherwise
    let string = String(clean);
    if (!regexURL.test(string)) {
      setNewLink("Your link does not contain 'http://' or 'https://' ! OR is not valid");
    } else {
      valid = true;
    }

    if (valid) {
      let dataToSend = {
        url: clean,
      };

      fetch(`https://url-shortener-4grx.onrender.com/new-url`, {
        method: "POST",
        body: JSON.stringify(dataToSend), 
        headers: {
          "Content-Type": "application/json", 
        },
      })
        .then((data) => data.json())
        .then((res) => {
          if (res.status === "error") {
            throw new Error("Unable to generate a new link");
          } else if (res.status === "success") {
            setNewLink(String(window.location.origin + "/u/" + res.code));
            let newData = {
              originalLink: res.json.originalURL,
              newLink: String(window.location.origin + "/u/" + res.code),
              id: res.json._id,
            };
            setLog([newData, ...log]);
            console.log(log);
          }
        })
        .catch((err) => {
          console.error(err);
          setNewLink(err);
        });
    }
  };

  return (
    <Router>
      <Paper id="formContainer">
        <Typography variant="h3" color="primary" fontWeight="fontWeightMedium">
          Short URL
        </Typography>
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
        <ThemeProvider theme={theme}>
          <Typography
            className="textStyle"
            variant="h6"
            fontWeight="fontWeightBold"
          >
            Please wait for Render to start... app may buffer on first use!
          </Typography>
          <Typography
            className="textStyle"
            variant="caption"
            fontWeight="fontWeightBold"
          >
            Links must be fully qualified i.e. including 'https' or 'http'
          </Typography>
          <Typography
            id="message"
            varant="subtitle1"
            color="secondary"
            fontWeight="fontWeightBold"
          >
            {newLink}
          </Typography>
        </ThemeProvider>
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

  // useLayoutEffect render content first, but before painting it onto the screen, it'll execute the functions. Prevents flicker.
  useLayoutEffect(() => {
    fetch(`https://url-shortener-4grx.onrender.com/findCode/${code}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.status === "success") {
          window.location.replace(res.content.originalURL);
          setStatus(res.status);
        }
      })
      .catch((err) => {
        setStatus(err.status);
        console.error(err);
      });
    return () => {
      setStatus(null);
    };
  }, [status, code]);

  return (
    <>
      <div id="redirectMsg">
        <h4>code: {code}</h4>
        {/* <h4>message: {status}</h4> */}
      </div>
    </>
  );
}
