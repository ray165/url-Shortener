import React, { useRef } from "react";
import { TextField, Button } from "@material-ui/core";

export default function  App() {
  const link = useRef('testLink')
  // AJAX request to server side on button click. 
  const send = (e) => {
    e.preventDefault()
    console.log(link.current.value) // working

    fetch()
  }


  return (
    <>
      <form noValidate autoComplete="off">
        <TextField id="outlined-basic" label="your url goes here" variant="outlined" inputRef={link}/>
      </form>
      <Button variant="contained" color="primary" onClick={send}>
        Get Shortened URL
      </Button>
    </>
  );
}
