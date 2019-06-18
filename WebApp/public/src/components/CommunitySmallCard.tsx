import * as React from 'react';
import { withStyles, Theme } from '@material-ui/core/styles';
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
import PeopleIcon from '@material-ui/icons/People';
import classnames from 'classnames';

import PostContent from './PostContent'
import { Button, Badge } from '@material-ui/core';

const styles = theme => ({
  card: {
    width: '90%',
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

const StyledBadge = withStyles((theme: Theme) => ({
    badge: {
      top: '50%',
      right: 1,
      border: `2px solid ${
        theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[900]
      }`,
    },
  }))(Badge);

class RecipeReviewCard extends React.Component<any, any> {
  state = Object.assign({expanded: false}, this.props.model)


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
            avatar={
                <PeopleIcon/>
            }
            title={this.props.model.name}
            subheader={this.props.model.countUsers + " учасників, " + this.props.model.countPosts + " постів"}
            onClick={() => {location.href = "/community/" + this.props.model.url}}
        />

        <CardContent style={{fontSize: '22px'}}>
            {this.props.model.description}
        </CardContent>
        <CardActions className={classes.actions} disableActionSpacing>

            {this.props.model.isMember != 1? (
                <IconButton>
                <Button variant="contained" color="primary"  onClick={this.props.onEntryClick(this.props.model.id)}>Приєднатись</Button>
                </IconButton>) 
            : (this.props.model.isMember == 1 ? (
                <Button variant="contained" color="secondary"  onClick={this.props.onGoAwayClick(this.props.model.id)}>Покинути</Button>)
            : <div/>)}
            
        </CardActions>
      </Card>
    );
  }
}


export default withStyles(styles)(RecipeReviewCard);