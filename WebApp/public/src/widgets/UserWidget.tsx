import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import {default as data} from '../appData'
import PostLong from '../components/PostLong'
import CommentTree from '../components/CommentTree'
import PostShort from '../components/PostShort'
import { Card, Paper, Typography, ListItem, ListItemText, List, Link, Button} from '@material-ui/core';
import api from '../commonApi'

const user = (data as any).userPage

class PostWidget extends React.Component<any, any> {
    
    constructor(props) {
        super(props)
        this.state = {
            posts: [],
            communities: []
        }
    }

    getUserUrl = () => {
        if (location.pathname === '/profile') return '';
        let parts = location.pathname.split('/')
        if (parts.length > 0) return parts[parts.length - 1]
        return ''
    }

    componentDidMount = () => {
        let userUrl = this.getUserUrl()
        if (userUrl === '') {
            api.getCurrentUserInfo().then(x => {
                this.setState(x[0])
                return api.getUserPosts(x[0].id)
            }).then(x => {
                this.setState({posts: x})
            })
        } else {
            api.getUserCardInfo(this.getUserUrl()).then(x => {
                this.setState(x[0])
                return api.getUserPosts(x[0].id)
            }).then(x => {
                this.setState({posts: x})
            })
        }
    }

    getUserPosts = (state) => {
        return state.posts.map((x, i) => (
            <Grid item key={i} xs={12}>
                <PostShort model={x} />
            </Grid>
        ))
    }

    getCommunities = (communities) => {
        return communities.map(x => (
            <Link href={"/communities/" + x.url}>{x.name}</Link>
        ))
    }

    createPostAction = () => {
        location.href = "/newPost"
    }

    getUserInfoCard = (state) => {
        return (
            <Paper style={{width: '100%', padding: '30px'}}>
                <Grid container>

                    <Grid item xs={12}>
                        <Typography><h2><b>{state.nick}</b></h2></Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography><b>Name</b> {state.name}</Typography>
                        <Typography><b>Communities</b> {this.getCommunities(state.communities)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Button onClick={this.createPostAction}>Create post</Button>
                        
                    </Grid>

                    <Grid item xs={12}>
                        <List>
                            <ListItem>
                                <ListItemText>
                                    <b>Pluses</b> {state.pluses}
                                </ListItemText>
                            </ListItem>

                            <ListItem>
                                <ListItemText>
                                    <b>Minuses</b> {state.minuses}
                                </ListItemText>
                            </ListItem>

                            <ListItem>
                                <ListItemText>
                                    <b>Posts</b> {state.countPosts}
                                </ListItemText>
                            </ListItem>

                            <ListItem>
                                <ListItemText>
                                    <b>Comments</b> {state.countComments}
                                </ListItemText>
                            </ListItem>
                        </List>
                    </Grid>
                </Grid>
            </Paper>
        )
    }

    render() {
        return (
            <Grid container spacing={24}>
                <Grid item xs={1}/>
                <Grid item xs={9}>
                    <Grid container spacing={24}>
                        {this.getUserInfoCard(this.state)}
                    </Grid>
                </Grid>
                <Grid item xs={2}/>
                <Grid item xs={1}/>
                <Grid item xs={9}>
                    <Grid container spacing={24}>
                        {this.getUserPosts(this.state)}
                    </Grid>
                </Grid>
            </Grid>
        )
    }
}


export default PostWidget;