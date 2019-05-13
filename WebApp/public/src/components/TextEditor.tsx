import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Editor, EditorState} from 'draft-js';
import { Grid, Button} from '@material-ui/core';

class TextEditor extends React.Component<any, any> {
    state = {editorState: EditorState.createEmpty()}
    onChange = (editorState) => {
        this.setState({editorState})
    }

    onSave = () => {
        this.props.onSave && this.props.onSave(this.state.editorState);
    }

    onCancel = () => {
        this.props.onCancel && this.props.onCancel();
    }

    render = () => {

        return (
            <Grid container>
                <Grid item xs={12}>
                    <Editor
                    editorState={this.state.editorState}
                    onChange={editorState => this.onChange(editorState)}
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