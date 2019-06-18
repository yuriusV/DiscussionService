import * as React from 'react';

import { Grid, Paper, Button, List, ListItem, Link, ListItemText, ListItemIcon } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import PostShort from '../components/PostShort'
import {default as data} from '../appData'
import PeopleIcon from '@material-ui/icons/People';
import api from '../commonApi'

const styles = theme => ({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing.unit * 2,
      textAlign: 'center' as 'center',
      color: theme.palette.text.secondary,
    },
  });

class IndexWidget extends React.Component<any, any> {

    constructor(props) {
        super(props)
        this.state ={
            posts: [],
            communities: []
        }
    }

    componentDidMount = () => {
        api.getUserFeed().then(x => {
            this.setState({posts: x})
        })
        api.getUserCommunities().then(x => {
            this.setState({communities: x})
        })
    }

    getPosts = (posts) => {
        return posts.map(x => (
            <Grid key={x.id} item xs={12}>
                <PostShort model={x}></PostShort>
            </Grid>
        ));
    }

    getPopularToday = (popularComments) => {

    }

    getCommunities = () => {

    }

    render = () => {
        const {classes} = this.props

        return (
            <div className={classes.root}>
                <Grid container spacing={24}>
                    <Grid item xs={2}>

                    </Grid>
                    <Grid item xs={8}>
                        <Grid container spacing={24}>
                            {this.getPosts(this.state.posts)}
                        </Grid>
                    </Grid>
                    <Grid item xs={2}>
                        <Grid container>
                            <Grid item xs={12}>
                                <Paper style={{padding: '30px', marginBottom: '20px'}}>
                                    <Button 
                                        variant="contained" 
                                        color="primary"
                                        onClick={e => location.href = '/newPost'}>Створити пост</Button> <br/><br/>
                                    <Button 
                                        variant="contained"
                                        color="primary"
                                        onClick={e => location.href = '/newCommunity'}>Створити спільноту</Button>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper style={{padding: '30px'}}>
                                    <b style={{fontSize: '20xp'}}>Ваші спільноти</b>
                                    <br/>
                                    <br/>
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
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        )
    }
}


export default withStyles(styles)(IndexWidget);