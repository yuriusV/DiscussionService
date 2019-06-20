import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import {default as data} from '../appData'
import PostLong from '../components/PostLong'
import CommentTree from '../components/CommentTree'
import PostShort from '../components/PostShort'
import AccountIcon from '@material-ui/icons/AccountCircle';
import { Card, Paper, Typography, ListItem, ListItemText, List, Link, Button, ListItemIcon} from '@material-ui/core';
import api from '../commonApi'
import SortIcon from '@material-ui/icons/Sort';
import {getCook} from '../utilities'

const user = (data as any).communityPage

class PostWidget extends React.Component<any, any> {
    constructor(props) {
        super(props)
        this.state = {
            posts: [],
            users: []
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
        }).then(x => {
            api.getCommunityUsers(this.state.id).then(x => {
                this.setState({users: x})
            })
        })
    }

    getPosts = (state) => {
        return state.posts.map((x, i) => (
            <Grid item key={i} xs={12}>
                <PostShort model={x} />
            </Grid>
        ))
    }

    renderCommunitiyUsers = () => {
        return [
            <b style={{fontSize: '22px'}}>Користувачі</b>,
            <br/>,
            <List>
                {this.state.users.map(x => (
                    <ListItem>
                            <ListItemIcon>
                                <AccountIcon/>
                            </ListItemIcon>
                            <ListItemText>
                                <Link href={"/user/" + x.name}>{x.fullName}</Link>
                            </ListItemText>
                    </ListItem>
                ))}
            </List>
        ]
    }

    onCommunityDelete = (communityId) => e => {
        api.deleteCommunity(communityId).then(x => {
            if (x) location.href = "/"
        })
    }

    getCommunityInfoCard = (state) => {
        return (
            <Paper style={{width: '100%', padding: '30px'}}>
                <Grid container>
                    <Grid item xs={8}>
                        <Typography style={{fontSize: '25px'}}>{state.name}</Typography>
                        <br/>
                        <br/>
                        {this.renderCommunitiyUsers()}
                    </Grid>
                    <Grid item xs={4}>
                        {this.state.isMember != 1? (
                            <Button variant="contained" color="primary"  onClick={this.onCommunityEntry(this.state.id)}>Приєднатись</Button>) 
                        : [
                            <Button variant="contained" color="primary"  
                                onClick={e => location.href = "/newPostCommunity/" + state.id}>Створити пост</Button>,
                            <br/>,
                            <br/>,
                            <br/>,
                            <Button variant="outlined" color="secondary"  
                                onClick={this.onCommunityGoAway(this.state.id)}>Покинути</Button>
                        ]}
                        {this.state.isOwner > 0 ? [
                            <br/>,
                            <br/>,
                            <br/>,
                            <Button variant="contained" color="secondary"  
                                onClick={this.onCommunityDelete(this.state.id)}>Видалити спільноту</Button>
                        ] : []}
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

    sortBy = type => e => {

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
                        <Paper style={{padding: '30px'}}>
                            <span><SortIcon/></span>
                            &nbsp;&nbsp;&nbsp;<Button
                                disabled={this.state.sortByTime}
                                variant={this.state.sortByTime ? "outlined" : "flat"}
                                onClick={this.sortBy('posts')}>За часом</Button>
                            &nbsp;&nbsp;&nbsp;<Button
                                disabled={!this.state.sortByTime}
                                variant={this.state.sortByTime ? "flat" : "outlined"}
                                onClick={this.sortBy('rating')}>За рейтингом</Button>
                        </Paper>
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