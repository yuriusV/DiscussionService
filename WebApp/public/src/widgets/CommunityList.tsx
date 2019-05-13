import * as React from 'react';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import CommunitySmallCard from '../components/CommunitySmallCard'
import {default as data} from '../appData'
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
        this.state = {
            communities: []
        }
    }

    componentDidMount = () => {
        api.getListCommunities().then(x => {
            this.setState({communities: x})
        })
    }

    getCommunities = (coms) => {
        return coms.map(x => (
            <Grid key={x.id} item xs={12}>
                <CommunitySmallCard model={x}></CommunitySmallCard>
            </Grid>
        ));
    }

    getPopularToday = (popularComments) => {

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
                            {this.getCommunities(this.state.communities)}
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