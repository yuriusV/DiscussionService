import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import { default as data } from '../appData'
import PostLong from '../components/PostLong'
import CommentTree from '../components/CommentTree'
import PostShort from '../components/PostShort'
import { Card, Paper, Typography, ListItem, ListItemText, List, Link, Button, TextField, Input, MenuItem, InputAdornment, IconButton, InputLabel } from '@material-ui/core';
import api from '../commonApi'
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

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
        api.login({
            login: this.state.login,
            password: this.state.password
        }).then(x => {
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
                            <Grid item xs={12} style={{margin: '20px'}}>
                            <InputLabel htmlFor="adornment-login">Логін</InputLabel>
                                <Input
                                    id="adornment-login"
                                    type="text"
                                    value={this.state.login}
                                    style={{ width: '100%'}}
                                    onChange={e => this.setState({ login: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} style={{margin: '20px'}}>
                                <InputLabel htmlFor="adornment-password">Пароль</InputLabel>
                                <Input
                                    id="adornment-password"
                                    type={this.state.showPassword ? 'text' : 'password'}
                                    value={this.state.password}
                                    style={{ width: '100%'}}
                                    onChange={e => this.setState({ password: e.target.value })}
                                    endAdornment={
                                        <InputAdornment position="end">
                                        <IconButton aria-label="Toggle password visibility" onClick={e => this.setState({ showPassword: !this.state.showPassword })}>
                                            {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                        </InputAdornment>
                                    }
                                />
                            </Grid>
                            <Grid item xs={5}>
                                <Button
                                variant="contained" 
                                color="primary"
                                style={{ width: '100%'}}
                                onClick={this.onClickLogin.bind(this)}>Вхід</Button>
                            </Grid>
                            <Grid item xs={2}/>
                            <Grid item xs={5}>
                                <Button
                                variant="outlined" 
                                color="primary"
                                style={{ width: '100%'}}
                                onClick={this.onClickRegister.bind(this)}>Реєстрація</Button>
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