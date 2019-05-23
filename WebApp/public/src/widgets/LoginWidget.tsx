import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import { default as data } from '../appData'
import PostLong from '../components/PostLong'
import CommentTree from '../components/CommentTree'
import PostShort from '../components/PostShort'
import { Card, Paper, Typography, ListItem, ListItemText, List, Link, Button, TextField, Input, MenuItem } from '@material-ui/core';
import api from '../commonApi'
import TextEditor from '../components/TextEditor';
import { Editor, EditorState, convertToRaw } from 'draft-js';

const user = (data as any).userPage



const styles = {
    root: {
        fontFamily: '\'Helvetica\', sans-serif',
        padding: 20,
        width: 600,
    },
    editor: {
        border: '1px solid #ccc',
        cursor: 'text',
        minHeight: 80,
        padding: 10,
    },
    button: {
        marginTop: 10,
        textAlign: 'center',
    }
};

class LoginWidget extends React.Component<any, any> {

    constructor(props) {
        super(props)
        this.state = {
            title: '',
            content: '',
            communities: [],
            community: 0,
            unsuccessMessage: null
        }
    }

    componentDidMount = () => {

    }

    showUnsuccessLogin = () => {
        this.setState({ unsuccessMessage: "Invalid login or password" })
    }


    onClickLogin = () => {
        let loginData = {
            login: this.state.login,
            password: this.state.password
        }

        api.login(loginData).then(x => {
            if ((x as any).success) {
                window.location.href = "/"
            } else {
                this.showUnsuccessLogin()
            }
        })
    }

    onClickRegister = () => {
        window.location.href = '/register'
    }

    render = () => {
        return (
            <Grid container>
                <Grid item xs={4} />
                <Grid item xs={4}>
                    <Paper style={{ width: '100%', padding: '30px' }}>
                        <Grid container>
                            <Grid item xs={12}>
                                <TextField
                                    id="login"
                                    label="Login"
                                    style={{ width: '100%'}}
                                    value={this.state.title}
                                    onChange={e => this.setState({ title: e.target.value })}
                                    margin="normal"
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    id="password"
                                    label="Password"
                                    style={{ width: '100%'}}
                                    value={this.state.content}
                                    onChange={e => this.setState({ content: e.target.value })}
                                    margin="normal"
                                    variant="outlined"
                                    multiline={true}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    id="gender"
                                    select
                                    label="Gender"
                                    style={{ width: '100%'}}
                                    value={this.state.community}
                                    onChange={e => this.setState({ community: e.target.value })}
                                    helperText="Select gender"
                                    margin="normal"
                                    variant="outlined"
                                >
                                    <MenuItem key={0} value={0}>
                                        Male
                                </MenuItem>
                                    <MenuItem key={1} value={1}>
                                        Female
                                </MenuItem>
                                </TextField>

                            </Grid>
                            <Grid item xs={6}>
                                <Button 
                                style={{ width: '100%'}}
                                onClick={this.onClickLogin.bind(this)}>Login</Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button 
                                style={{ width: '100%'}}
                                onClick={this.onClickRegister.bind(this)}>Register</Button>
                            </Grid>
                            <Grid item xs={12}>
                                {this.state.unsuccessMessage}
                            </Grid>
                            <Grid item xs={4} />
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item xs={4} />
            </Grid>
        )
    }
}


export default LoginWidget;

/*
<TextField
          id="outlined-adornment-password"
          className={classNames(classes.margin, classes.textField)}
          variant="outlined"
          type={this.state.showPassword ? 'text' : 'password'}
          label="Password"
          value={this.state.password}
          onChange={this.handleChange('password')}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Toggle password visibility"
                  onClick={this.handleClickShowPassword}
                >
                  {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
*/