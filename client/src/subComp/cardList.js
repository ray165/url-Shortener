import React, { useRef, useState } from "react";
import { Typography, List, ListItem, ListItemAvatar, ListItemIcon, ListItemSecondaryAction, ListItemText, IconButton  } from "@material-ui/core";
import FileCopyIcon from '@material-ui/icons/FileCopy';



/**
 *  Code adapted from MUI docs for List items 
 *  @param props contains an array of objects for each link shortened by the current user.
 *  @return CardList component
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

        console.log("File copy is clicked", e)

    }

    return(
        <>
            <List>
                <p>Testing</p>
                {(props.data).map((obj) => (
                    <ListItem key={obj.id}>
                        <ListItemText
                            primary={obj.originalLink}
                            secondary={obj.newLink}
                        />
                        <ListItemSecondaryAction onClick={() => copyClick(obj.newLink)}>
                            <IconButton edge="end" aria-label="copy">
                                <FileCopyIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
        </>
    )
}