import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Editor, EditorState} from 'draft-js';
import { Grid, Button, TextField} from '@material-ui/core';

class TextEditor extends React.Component<any, any> {
    state = {content: ''}
    
    onChange = (editorState) => {
        this.setState({editorState})
    }

    onSave = () => {
        this.props.onSave && this.props.onSave(this.state.content);
    }

    onCancel = () => {
        this.props.onCancel && this.props.onCancel();
    }

    render = () => {

        return (
            <Grid container>
                <Grid item xs={12}>
                    <TextField
                        id="outlined-bare"
                        defaultValue=""
                        margin="normal"
                        variant="outlined"
                        inputProps={{ 'aria-label': 'bare' }}
                        style={{width: '100%'}}
                        multiline
                        onChange={e => this.setState({content: e.target.value})}
                    />
                </Grid>
                <Grid item xs={8}/>
                <Grid item xs={2}>
                    <Button onClick={this.onSave}>Save</Button>
                </Grid>
                <Grid item xs={2}>
                    <Button onClick={this.onCancel}>Cancel</Button>
                </Grid>
            </Grid>
        )
    }
  
}

export default TextEditor