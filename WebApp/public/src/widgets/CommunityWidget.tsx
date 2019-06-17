import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import {default as data} from '../appData'
import PostLong from '../components/PostLong'
import CommentTree from '../components/CommentTree'
import PostShort from '../components/PostShort'
import { Card, Paper, Typography, ListItem, ListItemText, List, Link, Button} from '@material-ui/core';
import api from '../commonApi'

const user = (data as any).communityPage

class PostWidget extends React.Component<any, any> {
    constructor(props) {
        super(props)
        this.state = {
            posts: []
        }
    }

    onCommunityEntry = communityId => () => {
        api.enterCommunity(communityId).then(x => location.reload())
    }

    onCommunityGoAway = communityId => () => {
        api.exitCommunity(communityId).then(x => location.reload())
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
                    <Grid item xs={8}>
                        <Typography style={{fontSize: '25px'}}>{state.name}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        {this.state.isMember != 1? (
                            <Button variant="contained" color="primary"  onClick={this.onCommunityEntry(this.state.id)}>Приєднатись</Button>) 
                        : (<Button variant="contained" color="secondary"  onClick={this.onCommunityGoAway(this.state.id)}>Покинути</Button>)}
                    </Grid>
                    <Grid item xs={2}>
                        <b>{state.countUsers}</b> користувачів
                    </Grid>
                    <Grid item xs={2}>
                        <b>{state.countPosts}</b> постів
                    </Grid>
                </Grid>
            </Paper>
        )
    }

    render() {
        return (
            <Grid container spacing={24}>
                <Grid item xs={2}/>
                <Grid item xs={8}>
                    <Grid container spacing={24}>
                        {this.getCommunityInfoCard(this.state)}
                    </Grid>
                </Grid>
                <Grid item xs={2}/>
                <Grid item xs={2}/>
                <Grid item xs={8}>
                    <Grid container spacing={24}>
                        {this.getPosts(this.state)}
                    </Grid>
                </Grid>
                <Grid item xs={2}/>
            </Grid>
        )
    }
}


export default PostWidget;