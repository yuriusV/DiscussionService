import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import {default as data} from '../appData'
import PostLong from '../components/PostLong'
import CommentTree from '../components/CommentTree'
import PostShort from '../components/PostShort'
import PeopleIcon from '@material-ui/icons/People';

import { Card, Paper, Typography, ListItem, ListItemText, List, Link, Button, ListItemIcon} from '@material-ui/core';
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
        if (this.getIsProfile()) {
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
            api.getCommunitiesOfUser(this.getUserUrl())
                .then(x => {
                    this.setState({communities: x})
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
    
    getIsProfile = () => {
        return location.pathname === "/profile";
    }

    getCommunities = (communities) => {
        return communities.map(x => (
            <Link href={"/communities/" + x.url}>{x.name}</Link>
        ))
    }

    createPostAction = () => {
        location.href = "/newPost"
    }

    createCommunityAction = () => {
        location.href = "/newCommunity"
    }

    renderUserCommunities = () => {
        return [
            <b style={{fontSize: '22px'}}>Спільноти</b>,
            <br/>,
            <List>
                {this.state.communities.map(x => (
                    <ListItem>
                            <ListItemIcon>
                                <PeopleIcon/>
                            </ListItemIcon>
                            <ListItemText>
                                <Link href={"/community/" + x.url}>{x.name}</Link>
                            </ListItemText>
                    </ListItem>
                ))}
            </List>
        ]
    }

    getUserInfoCard = (state) => {
        return (
            <Paper style={{width: '100%', padding: '30px'}}>
                <Grid container>
                    <Grid item xs={6}>
                        <Typography><h2><b>{state.nick}</b></h2></Typography>
                    </Grid>
                    <Grid item xs={6}>
                        {location.pathname === "/profile" ? (
                            <Grid container>
                                <Grid item xs={6}>
                                    <Button variant="contained" color="primary" onClick={this.createPostAction}>Створити пост</Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button variant="contained" color="primary" onClick={this.createCommunityAction}>Створити спільноту</Button>
                                </Grid>
                            </Grid>
                        ) : this.renderUserCommunities()}

                    </Grid>
                    <Grid item xs={12}>
                        <Typography style={{fontSize: '22px'}}><b>Ім'я</b> {state.name}</Typography>
                    </Grid>
                    

                    <Grid item xs={12}>
                        <Grid container>
                            <Grid item xs={3} style={{fontSize: '22px'}}>
                                    <b>{state.pluses}</b> плюсів
                            </Grid>

                            <Grid item xs={3} style={{fontSize: '22px'}}>
                                    <b>{state.minuses}</b> мінусів
                            </Grid>

                            <Grid item xs={3} style={{fontSize: '22px'}}>
                                    <b>{state.countPosts}</b> постів
                            </Grid>

                            <Grid item xs={3} style={{fontSize: '22px'}}>
                                    <b>{state.countComments}</b>  коментарів
                            </Grid>
                        </Grid>
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
                        {this.getUserInfoCard(this.state)}
                    </Grid>
                </Grid>
                <Grid item xs={2}/>
                <Grid item xs={2}/>
                <Grid item xs={8}>
                    <Grid container spacing={24}>
                        {this.getUserPosts(this.state)}
                    </Grid>
                </Grid>
            </Grid>
        )
    }
}


export default PostWidget;