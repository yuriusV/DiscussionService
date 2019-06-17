import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
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
  state = Object.assign({expanded: false}, this.props.model)

  handleExpandClick = () => {
    this.setState(state => ({ expanded: !state.expanded }));
  };

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

  getPostShortenContent = (content) => {
    return content.substring(0, 120) + (content.length > 120 ? "..." : "");
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
            <PostContent model={this.getPostShortenContent(this.props.model.content)} Kostyle />
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

            <Link href={"/post/" + this.props.model.url}>
                <IconButton>
                    <CommentIcon />
                    <Typography>
                        {this.props.model.countComments}
                    </Typography>
                </IconButton>
                
            </Link>

            <IconButton aria-label="Share">
                <ShareIcon />
            </IconButton>
            
            <Typography><Link href={"/user/" + this.props.model.author.url}>{this.props.model.author.name}</Link> в спільноті <Link href={"/community/" + this.props.model.community.url}>{this.props.model.community.name}</Link></Typography>

            <IconButton
                className={classnames(classes.expand, {
                [classes.expandOpen]: this.state.expanded,
                })}
                onClick={this.handleExpandClick}
                aria-expanded={this.state.expanded}
                aria-label="Show more"
            >
                <ExpandMoreIcon />
            </IconButton>
            
        </CardActions>

        <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
          <CardContent>
                <PostContent model={this.props.model.content} Kostyle />
          </CardContent>
        </Collapse>
      </Card>
    );
  }
}


export default withStyles(styles)(RecipeReviewCard);