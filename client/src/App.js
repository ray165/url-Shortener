import React, { useRef, useState, useEffect } from "react";
import { TextField, Button, Typography } from "@material-ui/core";
import CardList from "./subComp/cardList.js"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";

// function validation(text) {
//   if (text.length === null || text === '') {
//     return Error
//   } 
// }

export default function  App() {
  const link = useRef('testLink')
  const [newLink, setNewLink] = useState('')
  const [log, setLog] = useState([])
  
  // AJAX request to server side on button click. 
  const send = (e) => {
    e.preventDefault()
    console.log(link.current.value) // working
    let dataToSend = {
      url: link.current.value
    }

    fetch(`/new-url`, {
      method: "POST",
      body: JSON.stringify(dataToSend), // stringify is needed to send!!!
      headers: {
        "Content-Type": "application/json", // content type is needed as well!!!
      },
    })
    .then((data) => data.json())
    .then((res) => {
      console.log(res)
      if (res.status === "error") {
        throw new Error(res)
      } else if (res.status === "success") {
        setNewLink(String(window.location.href + "u/" + res.code)) 
        let newData = {
          originalLink: res.json.originalURL,
          newLink: String(window.location.href + "u/" + res.code),
          id: res.json._id
        }
        setLog([newData, ...log])
        console.log(log)
      }
    })
    .catch((err) => {
      setNewLink("Unable to generate a new link");
    });
  }


  return (
    <Router>
      <form noValidate autoComplete="off">
        <TextField id="outlined-basic" label="your url goes here" variant="outlined" inputRef={link}/>
      </form>
      <Button variant="contained" color="primary" onClick={send}>
        Get Shortened URL
      </Button>
      <Typography >{newLink}</Typography>
      <CardList data={log}/>
      <Switch>
        <Route path="/u/:code" children={<Child />} />
      </Switch>
    </Router>
  );
}


function Child() {
  let { code } = useParams();
  const [status, setStatus] = useState();

  useEffect(() => {
    fetch(`/findCode/${code}`)
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "success") {
        setStatus(res)
        window.location.replace(res.content.originalURL);
      }
    })
    .catch((err) => {
      setStatus(err)
      console.error(err)
    })
    return () => {
      setStatus(null)
    }
  }, [status])


  return (
    <>
      <h1>code: {code}</h1>
      <h2>message: Redirecting...}</h2>
    </>
  )
}