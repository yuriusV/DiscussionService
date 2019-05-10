import * as React from 'react';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import PostShort from '../components/PostShort'
import {default as data} from '../appData'


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
    componentDidMount = () => {
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
                    <Grid item xs={1}>

                    </Grid>
                    <Grid item xs={9}>
                        <Grid container spacing={24}>
                            {this.getPosts((data as any).feedPosts)}
                        </Grid>
                    </Grid>
                    <Grid item xs={2}>
                        
                    </Grid>
                </Grid>
            </div>
        )
    }
}


export default withStyles(styles)(IndexWidget);