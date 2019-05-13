import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import {default as data} from '../appData'
import PostLong from '../components/PostLong'
import CommentTree from '../components/CommentTree'
import PostShort from '../components/PostShort'
import { Card, Paper, Typography, ListItem, ListItemText, List, Link} from '@material-ui/core';
import api from '../commonApi'

const user = (data as any).communityPage

class PostWidget extends React.Component<any, any> {
    constructor(props) {
        super(props)
        this.state = {
            posts: []
        }
    }

    getCommunityUrl = () => {
        let parts = location.pathname.split('/')
        if (parts.length > 0) return parts[parts.length - 1]
        return ''
    }

    componentDidMount = () => {
        api.getCommuintyPageCardInfo(this.getCommunityUrl()).then(x => {
            this.setState(x[0])
            return api.getCommunityPosts(x[0].id)
        }).then(x => {
            this.setState({posts: x})
        })
    }

    getPosts = (state) => {
        return state.posts.map((x, i) => (
            <Grid item key={i} xs={12}>
                <PostShort model={x} />
            </Grid>
        ))
    }

    getCommunityInfoCard = (state) => {
        return (
            <Paper style={{width: '100%', padding: '30px'}}>
                <Grid container>
                    <Grid item xs={12}>
                        <Typography><h2><b>{state.name}</b></h2></Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <List>
                            <ListItem>
                                <ListItemText>
                                    <b>Users</b> {state.countUsers}
                                </ListItemText>
                            </ListItem>

                            <ListItem>
                                <ListItemText>
                                    <b>Posts</b> {state.countPosts}
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
                        {this.getCommunityInfoCard(this.state)}
                    </Grid>
                </Grid>
                <Grid item xs={2}/>
                <Grid item xs={1}/>
                <Grid item xs={9}>
                    <Grid container spacing={24}>
                        {this.getPosts(this.state)}
                    </Grid>
                </Grid>
            </Grid>
        )
    }
}


export default PostWidget;