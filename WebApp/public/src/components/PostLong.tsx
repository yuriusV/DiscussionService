import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import { Avatar, Button } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import red from '@material-ui/core/colors/red';


import FavoriteIcon from '@material-ui/icons/Favorite';
import CommentIcon from '@material-ui/icons/Comment';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ShareIcon from '@material-ui/icons/Share';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import classnames from 'classnames';
import api from '../commonApi'
import TextEditor from './TextEditor'

import PostContent from './PostContent'

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

class RecipeReviewCard extends React.Component<any, any> {
    state = Object.assign({}, this.props.model)

    makeLike = () => {
        api.votePost({
            postId: this.props.model.id,
            vote: 1
        }).then(x => {
            this.setState({likes: x.likes, dislikes: x.dislikes, myVote: x.user})
        })

    }

    makeDislike = () => {
        api.votePost({
            postId: this.props.model.id,
            vote: -1
        }).then(x => {
            this.setState({likes: x.likes, dislikes: x.dislikes, myVote: x.user})
        })
    }

    clickComment = () => {
        this.setState(state => ({commentExpanded: !state.commentExpanded}))
    }

    commentPush = (content) => {
        api.makeComment({
            parentCommentId: 0,
            content: content,
            postId: this.props.model.id
        }).then(x => {
            location.reload()
        })
    }

    render() {
        const { classes } = this.props;

        return (
            <Card className={classes.card}>
                <CardHeader
                    action={
                        <IconButton>
                            <MoreVertIcon />
                        </IconButton>
                    }
                    title={this.props.model.title}
                    subheader={new Date(this.props.model.time).toLocaleTimeString()}

                />

                <CardContent>
                    <PostContent model={this.props.model.content} />
                </CardContent>
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

                    <IconButton>
                        <CommentIcon />
                        <Typography>
                            {this.props.model.countComments}
                        </Typography>
                    </IconButton>


                    <IconButton aria-label="Share">
                        <ShareIcon />
                    </IconButton>

                    <Typography><Link href={"/user/" + this.props.model.author.url}>{this.props.model.author.name}</Link> in community <Link href={"/community/" + this.props.model.community.url}>{this.props.model.community.name}</Link></Typography>
                    <Button onClick={this.clickComment}>Comment</Button>
                </CardActions>

                <Collapse in={this.state.commentExpanded} timeout="auto" unmountOnExit>
                    <CardContent>
                            <TextEditor 
                            content=''
                            onSave={this.commentPush} 
                            onCancel={() => this.setState({commentExpanded: false})} />
                    </CardContent>
                </Collapse>
            </Card>
        );
    }
}


export default withStyles(styles)(RecipeReviewCard);