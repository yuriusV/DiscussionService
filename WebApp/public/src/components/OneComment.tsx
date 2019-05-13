import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import {Typography, Grid} from '@material-ui/core';

import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';

import red from '@material-ui/core/colors/red';


import FavoriteIcon from '@material-ui/icons/Favorite';
import CommentIcon from '@material-ui/icons/Comment';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ShareIcon from '@material-ui/icons/Share';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import TextEditor from './TextEditor'
import classnames from 'classnames';

import PostContent from './PostContent'
import { Card } from '@material-ui/core';
import api from '../commonApi'


const ExpansionPanel = withStyles({
    root: {
        border: '1px solid rgba(0,0,0,.125)',
        boxShadow: 'none',
        '&:not(:last-child)': {
            borderBottom: 0,
        },
        '&:before': {
            display: 'none',
        },
        width: '100%'
    },
    expanded: {
        margin: 'auto',
    },
})(MuiExpansionPanel);

const styles = theme => ({
    card: {
        width: '100%',
    },
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    },
    actions: {
        display: 'flex',
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    avatar: {
        backgroundColor: red[500],
    },
});

const ExpansionPanelSummary = withStyles({
    root: {
        backgroundColor: 'rgba(0,0,0,.03)',
        borderBottom: '1px solid rgba(0,0,0,.125)',
        marginBottom: -1,
        minHeight: 56,
        '&$expanded': {
            minHeight: 56,
        },
    },
    content: {
        '&$expanded': {
            margin: '12px 0',
        },
    },
    expanded: {},
})(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles(theme => ({
    root: {
        padding: theme.spacing.unit * 2,
    },
}))(MuiExpansionPanelDetails);

class OneComment extends React.Component<any, any> {
    state = Object.assign({}, this.props.model, { expanded: false })

    makeLike = () => {
        api.votePost({
            postId: this.props.model.id,
            vote: 1
        }).then(x => {
            this.setState(state => ({likes: state.likes + 1}))
        })
  
    }

    makeDislike = () => {
        api.votePost({
            postId: this.props.model.id,
            vote: -1
        }).then(x => {
            this.setState(state => ({dislikes: state.dislikes + 1}))
        })
    }

    makeReply = () => {
        // handle only in this component
        //this.props.onReply(this.props.comment.id);
        this.setState({ expanded: true })
    }

    onReplySave = (content) => {
        api.makeCommment({
            parentCommentId: this.props.model.id,
            content: "comment", //content, Kostyle
            postId: this.props.model.postId
        }).then(x => {
            location.reload()
        })
        this.setState({ expanded: false })
    }

    onReplyCancel = () => {
        this.setState({ expanded: false })
    }

    render() {
        const { classes } = this.props;

        return (
            <ExpansionPanel
                square
                expanded={this.state.expanded}
            >
                <ExpansionPanelSummary>
                    <Grid container>
                        <Grid item xs={12}>
                            <CardHeader
                                action={
                                    <IconButton>
                                        <MoreVertIcon />
                                    </IconButton>
                                }
                                title={this.props.model.author.name}
                                subheader={new Date(this.props.model.time).toLocaleTimeString()}

                            />
                        </Grid>

                        <Grid item xs={12}>
                            <CardContent>
                                <PostContent model={this.props.model.content} />
                            </CardContent>
                        </Grid>
                        <Grid item xs={12}>
                        <CardActions className={classes.actions} disableActionSpacing>

                            <IconButton onClick={this.makeLike}>
                                <ThumbUpIcon />
                                <Typography>
                                    {this.state.likes}
                                </Typography>
                            </IconButton>
                            <IconButton onClick={this.makeDislike}>
                                <ThumbDownIcon />
                                <Typography>
                                    {this.state.dislikes}
                                </Typography>
                            </IconButton>

                            <IconButton onClick={this.makeReply}>
                                <CommentIcon />
                                <Typography>
                                    Reply
                        </Typography>
                            </IconButton>

                        </CardActions>
                        </Grid>
                    </Grid>
                </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <TextEditor
                    content=''
                    onSave={this.onReplySave}
                    onCancel={this.onReplyCancel}>
                </TextEditor>
            </ExpansionPanelDetails>
            </ExpansionPanel >
        );
    }
}

export default withStyles(styles)(OneComment);