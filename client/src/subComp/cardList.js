import React, { useState } from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  IconButton,
  Snackbar,
  Button,
} from "@material-ui/core";
import FileCopyIcon from '@material-ui/icons/FileCopy';
import CloseIcon from '@material-ui/icons/Close';
import './cardList.css'

/**
 *  Code adapted from MUI docs for List items
 *  @param props contains an array of objects for each link shortened by the current user.
 *  @return CardList component
 *  */
export default function CardList(props) {
  const [open, setOpen] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const copyClick = (e) => {
    // console.log("File copy is clicked", e);
    navigator.clipboard.writeText(String(e));
    setOpen(true);
  };

  return (
    <>
      <List id="listContainer">
        <Typography variant="h5" color="primary" align="center">Previous Links:</Typography>
        {props.data.map((obj) => (
          <ListItem key={obj.id}>
            <ListItemText primary={<div className="textOverflow">{obj.originalLink}</div>} secondary={obj.newLink} />
            <ListItemSecondaryAction onClick={() => copyClick(obj.newLink)}>
              <IconButton edge="end" aria-label="copy">
                <FileCopyIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        message="Copied to clipboard"
        action={
          <React.Fragment>
            <Button color="secondary" size="small" onClick={handleClose}>
              UNDO
            </Button>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </>
  );
}
