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
import red from '@material-ui/core/colors/red';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import classnames from 'classnames';

class PostContent extends React.Component<any, any> {
    renderPost = (postModel, start = 0) => {
        return postModel.map((x, i) => {
            if (typeof x === "string") {
                return this.renderText(x, start + i)
            } else if (x.length) {
                return this.renderPost(x, start + i)
            } else if (x.imageUrl) {
                return this.renderImage(x, start + i);
            }
        });
    }

    renderText = (text, i) => {
        return (<Typography key={i}>{text}</Typography>)
    }

    renderImage = (image, i) => {
        return (<CardMedia
            key={i}
            image={image.imageUrl}
            title={image.title}
        />)
    }

    render = () => {
        return this.renderPost(this.props.model)
    }
}

export default PostContent