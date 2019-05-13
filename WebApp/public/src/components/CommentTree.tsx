import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import OneComment from './OneComment'
import { Paper } from '@material-ui/core';

const styles = theme => ({
    root: {
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
});

class CommentTree extends React.Component<any, any> {
    state = Object.assign({}, { comments: this.props.comments })

    onReply = (toCommentId) => {

    }

    render() {
        const { classes } = this.props;

        return (
            <Paper>
                <List component="nav" className={classes.root}>
                    {this.state.comments.map((x, i) => {
                        let commentItem = [(<ListItem key={i}>
                            <OneComment comment={x}
                                onReply={this.onReply} />
                        </ListItem>)];
                        if (i < this.state.comments.length - 1) {
                            commentItem.push(<Divider key={this.state.comments.length + i} />)
                        }

                        return commentItem
                    })}

                </List>
            </Paper>
        );
    }
}


export default withStyles(styles)(CommentTree);