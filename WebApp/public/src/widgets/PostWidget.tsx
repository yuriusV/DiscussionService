import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import {default as data} from '../appData'
import PostLong from '../components/PostLong'
import CommentTree from '../components/CommentTree'
import api from '../commonApi'
import Poll from 'react-polls';
import { makeCommentTree } from '../commentLogic'

const post = (data as any).openedPost

class PostWidget extends React.Component<any, any> {
    constructor(props) {
        super(props)
        this.state = {
            post: {
                author: {},
                community: {},
                content: ''
            },
            comments: []
        }
    }

    getCommunityUrl = () => {
        let parts = location.pathname.split('/')
        if (parts.length > 0) return parts[parts.length - 1]
        return ''
    }

    componentDidMount = () => {
        api.getPostData(this.getCommunityUrl()).then(x => {
            this.setState({post: x[0]})
            return api.getPostComments(x[0].id)
        }).then(x => {
            this.setState({
                comments: x
            })
        })
    }

    render() {
        return (
            <Grid container spacing={24}>
                <Grid item xs={1}/>
                <Grid item xs={10}>
                    <PostLong model={this.state.post}/>
                </Grid>
                <Grid item xs={1}/>
                <Grid item xs={1}/>
                <Grid item xs={10}>
                    <CommentTree comments={makeCommentTree(this.state.comments)}/>
                </Grid>
            </Grid>
        )
    }
}


export default PostWidget;