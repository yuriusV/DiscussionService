import * as React from 'react';
import {Grid} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import {default as data} from '../appData'
import PostLong from '../components/PostLong'
import CommentTree from '../components/CommentTree'
import api from '../commonApi'

import {Editor, EditorState, convertToRaw} from 'draft-js';
import NewPostWidget from './NewPostWidget';


const post = (data as any).openedPost


const comments = [
    {
        id: 2,
        url: 'test2',
        author: {url: '', id: 1, name: 'Yura', urlPhoto: ''},
        time: new Date().getTime(),
        likes: 130,
        dislikes: 30,
        content: ['first nax'],
        children: [
            {
                id: 2,
                url: 'test2',
                author: {url: '', id: 1, name: 'Yura', urlPhoto: ''},
                time: new Date().getTime(),
                likes: 130,
                dislikes: 30,
                content: ['after first'],
                children: [
                    
                ]
            }
        ]
    },
    {
        id: 4,
        url: 'test2',
        author: {url: '', id: 1, name: 'Yura', urlPhoto: ''},
        time: new Date().getTime(),
        likes: 130,
        dislikes: 30,
        content: ['second nah'],
        children: [
            {
                id: 5,
                url: 'test2',
                author: {url: '', id: 1, name: 'Yura', urlPhoto: ''},
                time: new Date().getTime(),
                likes: 130,
                dislikes: 30,
                content: ['after second'],
                children: [
                    
                ]
            }
        ]
    }
]

class PostWidget extends React.Component<any, any> {
    constructor(props) {
        super(props)
        this.state = {
            editorState: EditorState.createEmpty(),
            communities: [],
            community: 0,
            comments: comments
        }
    }

    getCommunityUrl = () => {
        let parts = location.pathname.split('/')
        if (parts.length > 0) return parts[parts.length - 1]
        return ''
    }

    componentDidMount = () => {
        
    }

    render() {
        return (
            <Grid container spacing={24}>
                <Grid item xs={12}>
                    <NewPostWidget></NewPostWidget>
                </Grid>
                <Grid item xs={12}>
                    <Editor
                        editorState={this.state.editorState}
                        onChange={editorState => this.setState({editorState})}
                    />
                </Grid>
                <Grid item xs={12}>
                    <CommentTree comments={this.state.comments}/>
                </Grid>
            </Grid>
        )
    }
}


export default PostWidget;