import * as React from 'react';
import { Grid, Checkbox, Chip, FormControlLabel} from '@material-ui/core';
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
            votes: [],
            tags: ""
        }
    }

    componentDidMount = () => {
        api.getUserCommunities().then(x => {
            this.setState({communities: x})
        })
    }

    onAddVote = () => {
        this.setState({votes: [...this.state.votes, {
            title: "",
            variants: ""
        }]})
    }

    removeVote = i => () => {
        this.state.votes.splice(i, 1)
        this.setState({votes: this.state.votes})
    }

    renderVotesFields = () => {
        return this.state.votes.map((vote, index) => (<div>
        <br/>
        <br/>
        <TextField
            id="pollTitle"
            label="Тема опитування"
            value={vote.title}
            onChange={e => {
                vote.title = e.target.value
                this.setState({votes: this.state.votes})
            }}
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
            value={vote.variants}
            onChange={e => {
                vote.variants = e.target.value
                this.setState({votes: this.state.votes})
            }}
            margin="normal"
            variant="outlined"
            multiline={true}
            style={{ width: '100%'}}
        />
        <br/>
        {this.renderVariants('\n')(vote.variants)}
        <br/>
        <Button variant="outlined" onClick={e => this.onAddVote()}>Додати ще</Button>
        <Button variant="outlined" onClick={this.removeVote(index)}>Видалити</Button>
        </div>))
    }

    getCommunities = (communities) => {
        return communities.map(x => (
            <Link href={"/community/" + x.url}>{x.name}</Link>
        ))
    }

    onClickCreatePost = () => {
        const votes = this.state.voteEnabled ? this.state.votes: []

        api.createPost({
            communityId: this.state.community,
            title: this.state.title,
            content: this.state.content,
            votes: votes,
            tags: this.state.tags
        }).then(x => {
            location.href = "/post/" + x
        })
    }

    renderVariants = delimiter => vars => {
        return vars.split(delimiter).filter(x => !!x && x!= '').map(x => (<Chip label={x} style={{margin: '4px'}} />))
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
                                    defaultValue={this.state.communityId}
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
                                <TextField
                                    id="tags"
                                    label="Теги"
                                    value={this.state.tags}
                                    onChange={e => this.setState({tags: e.target.value})}
                                    helperText="Введитіть теги через пробіл"
                                    margin="normal"
                                    variant="outlined"
                                    style={{ width: '100%'}}
                                    />
                                    <br/>
                                    {this.renderVariants(' ')(this.state.tags)}
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    label="Додати опитування"
                                    control={
                                    <Checkbox
                                        checked={this.state.voteEnabled}
                                        onChange={e => {
                                                if(this.state.votes.length == 0) this.onAddVote();
                                                this.setState({voteEnabled: !this.state.voteEnabled})
                                            }
                                        }
                                        title="Додати опитування"
                                        inputProps={{
                                            'aria-label': 'primary checkbox',
                                        }}
                                    >Додати опитування</Checkbox>
                                }/>
                                {this.state.voteEnabled? this.renderVotesFields(): []}
                            </Grid>
                            <Grid item xs={4}>
                                <Button variant="contained" color="primary" onClick={this.onClickCreatePost.bind(this)}>Опублікувати</Button>
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