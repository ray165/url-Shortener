import React, { useRef, useState } from "react";
import { Typography, List, ListItem, ListItemAvatar, ListItemIcon, ListItemSecondaryAction, ListItemText, IconButton  } from "@material-ui/core";
import FileCopyIcon from '@material-ui/icons/FileCopy';



/**
 *  Code adapted from MUI docs for List items 
 *  @param props contains an array of objects for each link shortened by the current user.
 * 
 *  */
export default function CardList(props) {

    // function generate(element) {
    //     return props.map((obj) => 
    //         React.cloneElement(element, {
    //             key: obj,
    //         })
    //     );
    // }
    const copyClick = (e) => {
        e.preventDefault

        console.log("File copy is clicked", e)

    }

    return(
        <>
            <List>
                {props.map((obj) =>
                    <ListItem>
                        <ListItemText
                            primary={obj.originalLink}
                            secondary={obj.newLink}
                        />
                        <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="copy">
                                <FileCopyIcon onClick={() => copyClick(obj.newLink)}/>
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                )}
            </List>
        </>
    )
}