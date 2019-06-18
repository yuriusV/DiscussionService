import * as React from 'react';
import { Grid, Checkbox, Chip} from '@material-ui/core';
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
            community: 0,
            voteEnabled: false,
            voteTitle: "",
            voteVariants: ""
        }
    }

    componentDidMount = () => {
        api.getUserCommunities().then(x => {
            this.setState({communities: x})
        })
    }


    getCommunities = (communities) => {
        return communities.map(x => (
            <Link href={"/community/" + x.url}>{x.name}</Link>
        ))
    }

    onClickCreatePost = () => {
        api.createPost({
            communityId: this.state.community,
            title: this.state.title,
            content: this.state.content
        }).then(x => {
            console.log('p', x)
        })
    }

    renderVariants = () => {
        return this.state.voteVariants.split('\n').map(x => (<Chip label={x} style={{margin: '4px'}} />))
    }

    render = () => {
        return (
            <Grid container>
                <Grid item xs={3}/>

                <Grid item xs={6}>
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
                                style={{ width: '100%'}}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                id="content"
                                label="Content"
                                rows="10"
                                rowsMax="20"
                                value={this.state.content}
                                onChange={e => this.setState({content: e.target.value})}
                                margin="normal"
                                variant="outlined"
                                multiline={true}
                                style={{ width: '100%'}}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    id="community"
                                    select
                                    label="Спільнота"
                                    value={this.state.community}
                                    onChange={e => this.setState({community: e.target.value})}
                                    helperText="Select community which to post"
                                    margin="normal"
                                    variant="outlined"
                                    style={{ width: '100%'}}
                                    >
                                    {this.state.communities.map(c => (
                                        <MenuItem key={c.id} value={c.id}>
                                        {c.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <Checkbox
                                    checked={this.state.voteEnabled}
                                    onChange={e => this.setState({voteEnabled: !this.state.voteEnabled})}
                                    
                                    inputProps={{
                                        'aria-label': 'primary checkbox',
                                    }}
                                >Додати опитування</Checkbox>
                                <div style={{display: this.state.voteEnabled ? "block": "none"}}>
                                <br/>
                                <br/>
                                <TextField
                                    id="pollTitle"
                                    label="Тема опитування"
                                    value={this.state.voteTitle}
                                    onChange={e => this.setState({voteTitle: e.target.value})}
                                    margin="normal"
                                    variant="outlined"
                                    style={{ width: '100%'}}
                                />
                                <br/>
                                <br/>
                                <TextField
                                    id="content"
                                    label="Варіанти відповіді"
                                    rows="5"
                                    rowsMax="20"
                                    value={this.state.voteVariants}
                                    onChange={e => this.setState({voteVariants: e.target.value})}
                                    margin="normal"
                                    variant="outlined"
                                    multiline={true}
                                    style={{ width: '100%'}}
                                />
                                <br/>
                                {this.renderVariants()}
                                </div>
                            </Grid>
                            <Grid item xs={4}>
                                <Button onClick={this.onClickCreatePost.bind(this)}>Опублікувати</Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid item xs={3}/>
            </Grid>
        )
    }
}


export default NewPostWidget;