import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import {default as data} from '../appData'
import PostLong from '../components/PostLong'
import CommentTree from '../components/CommentTree'
import PostShort from '../components/PostShort'
import { Card, Paper, Typography, ListItem, ListItemText, List, Link, Button, TextField} from '@material-ui/core';
import api from '../commonApi'
import TextEditor from '../components/TextEditor';
import {Editor, EditorState, convertToRaw} from 'draft-js';

const user = (data as any).userPage

class NewPostWidget extends React.Component<any, any> {
    
    constructor(props) {
        super(props)
        this.state = {
            editorState: EditorState.createEmpty(),
            communities: [],
            community: 0
        }
    }

    componentDidMount = () => {
        api.getCurrentUserCommunities().then(x => {
            this.setState({communities: x})
        })
    }


    getCommunities = (communities) => {
        return communities.map(x => (
            <Link href={"/communities/" + x.url}>{x.name}</Link>
        ))
    }

    onClickCreatePost = () => {
        api.createPost({
            communityId: 1, // Kostyle
            title: this.state.title || '',
            content: "CONTENT" //kostyle convertToRaw(this.state.editorState.getCurrentContent())
        }).then(x => {

        })
    }

    render() {
        return (
            <Paper style={{width: '100%', padding: '30px'}}>
                <Grid container>

                    <Grid item xs={12}>
                    <TextField
                        id="title"
                        label="Title"
                        value={this.state.title}
                        onChange={e => this.setState({title: e.target.value})}
                        margin="normal"
                        />
                    </Grid>
                    <hr/>
                    <Grid item xs={12}>
                        Content:
                        <br/>
                        <Editor
                            
                            editorState={this.state.editorState}
                            onChange={editorState => this.setState({editorState})}
                        />
                    </Grid>
                    <hr/>
                    <Grid item xs={4}>
                        <Button onClick={this.onClickCreatePost}>Create post</Button>
                    </Grid>
                </Grid>
            </Paper>
        )
    }
}


export default NewPostWidget;