import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import {Typography, Grid, ListItem, Divider, List, Link} from '@material-ui/core';

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
        api.voteComment({
            commentId: this.props.model.id,
            vote: 1
        }).then(x => {
            this.setState({likes: x.likes, dislikes: x.dislikes, myVote: x.user})
        })
  
    }

    makeDislike = () => {
        api.voteComment({
            commentId: this.props.model.id,
            vote: -1
        }).then(x => {
            this.setState({likes: x.likes, dislikes: x.dislikes, myVote: x.user})
        })
    }

    makeReply = () => {
        // handle only in this component
        //this.props.onReply(this.props.comment.id);
        this.setState({ expanded: true })
    }

    onReplySave = (content) => {
        api.makeComment({
            parentCommentId: this.props.model.id,
            content: content,
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

        return ([
            <div style={{width: '100%'}}>
                

            <ExpansionPanel
                square
                expanded={this.state.expanded}
            >
                <ExpansionPanelSummary>
                    <Grid container>
                        <Grid item xs={12}>
                        <Link underline='none' style={{color: 'black', fontSize: '22px'}} href={'/user/' + this.props.model.author.url}>
                            <b>{this.props.model.author.name}
                            </b></Link>
                        <span>&nbsp;&nbsp;&nbsp;&nbsp;{new Date(this.props.model.time).toLocaleTimeString()}</span>
                        <br/>
                        </Grid>

                        <Grid item xs={12} style={{margin: '20px'}}>
                                <PostContent model={this.props.model.content} />
                        </Grid>
                        <Grid item xs={12}>
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
                                    Відповісти
                                </Typography>
                            </IconButton>
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
                <div style={{marginLeft: "30px"}}>
                    {this.renderSubComments()}
                </div>
            </div>
            ]
        );
    }

    renderSubComments = () => {
        let subs = this.props.model.children;
        return subs.map((x, i) => {
                    let commentItem = [(<ListItem key={i}>
                        <OneComment model={x} />
                    </ListItem>)];
                    if (i < subs.length - 1) {
                        commentItem.push(<Divider key={subs.length + i} />)
                    }

                    return commentItem
                })
        
    }
}

export default withStyles(styles)(OneComment);