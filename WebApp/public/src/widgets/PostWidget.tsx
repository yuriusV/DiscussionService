import * as React from 'react';
import {Grid, Paper} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import {default as data} from '../appData'
import PostLong from '../components/PostLong'
import CommentTree from '../components/CommentTree'
import OneComment from '../components/OneComment'
import api from '../commonApi'
import Poll from 'react-polls';
import DoneIcon from '@material-ui/icons/Done';
import { makeCommentTree, getBetterCommentOrNone } from '../commentLogic'

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
            comments: [],
            tags: [],
            bestAnswer: null
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
                comments: x,
                bestAnswer: getBetterCommentOrNone(x)
            })

            api.getPostTags(this.state.post.id).then(x => {
                this.setState({tags: x.map(z => z.tag)})
            })
        })
        
    }

    render() {
        return (
            <Grid container spacing={24}>
                <Grid item xs={2}/>
                <Grid item xs={8}>
                    <PostLong tags={this.state.tags} model={this.state.post}/>
                </Grid>
                <Grid item xs={2}/>

                {!!this.state.bestAnswer ? [
                    <Grid item xs={2}/>,
                    <Grid item xs={8}>
                        <Paper style={{padding: '30px'}}>
                            <DoneIcon/>&nbsp;&nbsp;
                            <span style={{fontSize: '22px', margin: '10px'}}>Кращий коментар</span>
                            <br/>
                            <br/>
                            <OneComment model={this.state.bestAnswer}/>
                        </Paper>
                    </Grid>,
                    <Grid item xs={2}/>
                 ] : []}
                <Grid item xs={2}/>
                <Grid item xs={8}>
                    <CommentTree comments={makeCommentTree(this.state.comments)}/>
                </Grid>
            </Grid>
        )
    }
}


export default PostWidget;