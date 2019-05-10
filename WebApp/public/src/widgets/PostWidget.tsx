import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import {default as data} from '../appData'
import PostLong from '../components/PostLong'


class PostWidget extends React.Component<any, any> {
    render() {
        return (
            <Grid container spacing={24}>
                <Grid item xs={12}>
                    <PostLong model={}/>
                </Grid>
            </Grid>
        )
    }
}


export default PostWidget;