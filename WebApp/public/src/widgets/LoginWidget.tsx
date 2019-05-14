import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import {default as data} from '../appData'
import PostLong from '../components/PostLong'
import CommentTree from '../components/CommentTree'
import PostShort from '../components/PostShort'
import { Card, Paper, Typography, ListItem, ListItemText, List, Link, Button, TextField, Input, MenuItem} from '@material-ui/core';
import api from '../commonApi'
import TextEditor from '../components/TextEditor';
import {Editor, EditorState, convertToRaw} from 'draft-js';

const user = (data as any).userPage



const styles = {
    root: {
      fontFamily: '\'Helvetica\', sans-serif',
      padding: 20,
      width: 600,
    },
    editor: {
      border: '1px solid #ccc',
      cursor: 'text',
      minHeight: 80,
      padding: 10,
    },
    button: {
      marginTop: 10,
      textAlign: 'center',
    }
};

class NewPostWidget extends React.Component<any, any> {
    
    constructor(props) {
        super(props)
        this.state = {
            title: '',
            content: '',
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
            communityId: this.state.community,
            title: this.state.title,
            content: this.state.content
        }).then(x => {

        })
    }

    render = () => {
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
                          variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                          id="content"
                          label="Content"
                          value={this.state.content}
                          onChange={e => this.setState({content: e.target.value})}
                          margin="normal"
                          variant="outlined"
                          multiline={true}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                              id="community"
                              select
                              label="Community"
                              value={this.state.community}
                              onChange={e => this.setState({community: e.target.value})}
                              helperText="Select community which to post"
                              margin="normal"
                              variant="outlined"
                            >
                              {this.state.communities.map(c => (
                                <MenuItem key={c.id} value={c.id}>
                                  {c.name}
                                </MenuItem>
                              ))}
                        </TextField>
                        
                    </Grid>
                    <Grid item xs={4}>
                        <Button onClick={this.onClickCreatePost.bind(this)}>Create post</Button>
                    </Grid>
                </Grid>
            </Paper>
        )
    }
}


export default NewPostWidget;

/*
<TextField
          id="outlined-adornment-password"
          className={classNames(classes.margin, classes.textField)}
          variant="outlined"
          type={this.state.showPassword ? 'text' : 'password'}
          label="Password"
          value={this.state.password}
          onChange={this.handleChange('password')}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Toggle password visibility"
                  onClick={this.handleClickShowPassword}
                >
                  {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
*/