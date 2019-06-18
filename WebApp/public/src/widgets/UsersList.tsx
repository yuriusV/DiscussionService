import * as React from 'react';

import { Grid, ListItem, List, ListItemIcon, Divider, ListItemText, Paper, Typography, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import UserSmallCard from '../components/UserSmallCard'
import {default as data} from '../appData'
import api from '../commonApi'

import VerifiedUserIcon from '@material-ui/icons/AccountCircle';
import SortIcon from '@material-ui/icons/Sort';


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
        this.state = {
            users: [],
            sortByPosts: true
        }
    }

    componentDidMount = () => {
        api.getListUsers(1).then(x => {
            this.setState({users: x})
        })
    }

    getUsers = (coms) => {
        return coms.map((x, i) => {
            let els = [(
                <ListItem 
                onClick={this.openUserPage(x.url)}
                style={{padding: '20px'}}
                button
                key={x.id}>
                    <ListItemIcon>
                        <VerifiedUserIcon/>
                    </ListItemIcon>
                    <ListItemText>
                        <span style={{fontSize: '22px'}}>{x.name}</span>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span><b>{x.countCommunities}</b> спільнот</span>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span><b>{x.countPosts}</b> постів</span>
                    </ListItemText>
                </ListItem>
            )]

            if (i != coms.length - 1) {
                els.push(<Divider/>);
            }

            return els;
        });
    }

    openUserPage = (url) => () => {
        location.href = "/user/" + url;
    }

    sortBy = type => () => {
        api.getListUsers(this.state.sortByPosts ? 1 : 0).then(x => {
            this.setState({users: x, sortByPosts: !this.state.sortByPosts})
        })
    }


    render = () => {
        const {classes} = this.props    

        return (
            <div className={classes.root}>
                <Grid container spacing={24}>
                    <Grid item xs={2}/>
                    <Grid item xs={8}>
                        <Paper style={{padding: '30px'}}>
                            <Typography variant="h5" component="h3">
                             Список користувачів
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={2}/>
                    <Grid item xs={2}/>
                    <Grid item xs={8}>
                        <Paper style={{padding: '30px'}}>
                            <span><SortIcon/></span>
                            &nbsp;&nbsp;&nbsp;<Button
                                disabled={this.state.sortByPosts}
                                variant={this.state.sortByPosts ? "outlined" : "flat"}
                                onClick={this.sortBy('posts')}>За постами</Button>
                            &nbsp;&nbsp;&nbsp;<Button
                                disabled={!this.state.sortByPosts}
                                variant={this.state.sortByPosts ? "flat" : "outlined"}
                                onClick={this.sortBy('rating')}>За рейтингом</Button>
                        </Paper>
                    </Grid>
                    <Grid item xs={2}/>
                    <Grid item xs={2}/>
                    <Grid item xs={8}>
                        <Paper style={{padding: '30px'}}>
                            <List>
                                {this.getUsers(this.state.users)}
                            </List>
                        </Paper>
                    </Grid>
                    <Grid item xs={2}>
                        
                    </Grid>
                </Grid>
            </div>
        )
    }
}


export default withStyles(styles)(IndexWidget);