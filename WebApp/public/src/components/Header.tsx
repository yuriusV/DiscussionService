import * as React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Badge from '@material-ui/core/Badge';
import MenuItem from '@material-ui/core/MenuItem';
import { Menu, Link, Tab, Tabs, Button } from '@material-ui/core';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { withStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MoreIcon from '@material-ui/icons/MoreVert';
import compose from 'recompose/compose';
import * as utilities from '../utilities';
import { withRouter } from 'react-router-dom';

import commonApi from '../commonApi'

const styles = theme => ({
    root: {
        width: '100%',
    },
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
    title: {
        display: 'none',
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    search: {
        position: 'relative' as 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginRight: theme.spacing.unit * 2,
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing.unit * 3,
            width: 'auto',
        },
    },
    searchIcon: {
        width: theme.spacing.unit * 9,
        height: '100%',
        position: 'absolute' as 'absolute',
        pointerEvents: 'none' as 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
        width: '100%',
    },
    inputInput: {
        paddingTop: theme.spacing.unit,
        paddingRight: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
        paddingLeft: theme.spacing.unit * 10,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: 300,
        },
    },
    sectionDesktop: {
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'flex',
        },
    },
    sectionMobile: {
        display: 'flex',
        [theme.breakpoints.up('md')]: {
            display: 'none',
        },
    },
});

class PrimarySearchAppBar extends React.Component<any, any> {
    state = {
        anchorEl: null,
        mobileMoreAnchorEl: null,
    };

    handleProfileMenuOpen = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleMenuClose = name => () => {
        switch (name) {
            case 'profile': location.href = "/profile"; break;
            case 'settings': location.href = "/settings"; break;
            case 'logout': commonApi.logout().then(x => location.reload()); break;
            case 'login': location.href = "/login"; break;
            case 'register': location.href = "/register"; break;
            default: break;
        }
        this.setState({ anchorEl: null });
        this.handleMobileMenuClose();
    };

    handleMobileMenuOpen = event => {
        this.setState({ mobileMoreAnchorEl: event.currentTarget });
    };

    handleMobileMenuClose = () => {
        this.setState({ mobileMoreAnchorEl: null });
    };

    mapPathToTabNumber = (path) => {
        if (path === "/") return 0;
        if (path.indexOf("/communit") !== -1) return 1;
        if (path.indexOf("/user") !== -1) return 2;
        return 0;
    }

    performSearch = (text) => {
        commonApi.searchInSite(text).then(x => {

        })
    }

    render() {

        const { anchorEl, mobileMoreAnchorEl } = this.state;
        const { classes } = this.props;
        const isMenuOpen = Boolean(anchorEl);
        const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

        const user = utilities.getCook('fullName')

        const renderMenu = (
            <Menu
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={isMenuOpen}
                onClose={this.handleMenuClose('')}
            >
                {
                    user ?
                    (
                        [<MenuItem onClick={this.handleMenuClose('profile')}>Профіль</MenuItem>,
                        <MenuItem onClick={this.handleMenuClose('settings')}>Налаштування</MenuItem>,
                        <MenuItem onClick={this.handleMenuClose('logout')}>Вихід</MenuItem>]
                    ) :
                    (
                        [<MenuItem onClick={this.handleMenuClose('login')}>Вхід</MenuItem>,
                        <MenuItem onClick={this.handleMenuClose('register')}>Реєстрація</MenuItem>]
                    )
                }
            </Menu>
        );

        const renderMobileMenu = (
            <Menu
                anchorEl={mobileMoreAnchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={isMobileMenuOpen}
                onClose={this.handleMenuClose}
            >
                <MenuItem onClick={this.handleProfileMenuOpen}>
                    <IconButton color="inherit">
                        <AccountCircle />
                    </IconButton>
                    <p>Profile</p>
                </MenuItem>
            </Menu>
        );

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography className={classes.title} variant="h6" noWrap>
                            <Link underline='none' style={{color: 'white'}} href="/">Дискус online</Link>
                        </Typography>
                        <div className={classes.search}>
                            <div className={classes.searchIcon}>
                                <SearchIcon />
                            </div>
                            <InputBase
                                placeholder="Пошук постів, користувачів, спільнот..."
                                classes={{
                                    root: classes.inputRoot,
                                    input: classes.inputInput,
                                }}
                                onChange={e => this.performSearch(e.target.value)}
                            />
                        </div>
                        <div className={classes.grow} />
                        <Tabs value={this.mapPathToTabNumber(this.props.location.pathname)}>
                            <Tab href="/" label="Стрічка" />
                            <Tab href="/communities" label="Спільноти" />
                            <Tab href="/users" label="Користувачі" />
                        </Tabs>
                        <div className={classes.sectionDesktop}>
                            {user ? 
                                (<Typography className={classes.title} noWrap style={{color: 'white', paddingTop: '10%'}}>
                                    {user}
                                </Typography>)
                                : 
                                    (<Button style={{color: 'white'}} onClick={this.handleMenuClose('login')}>
                                    Вхід
                                    </Button>)}
                            <IconButton
                                aria-owns={isMenuOpen ? 'material-appbar' : undefined}
                                aria-haspopup="true"
                                onClick={this.handleProfileMenuOpen}
                                color="inherit"
                            >
                                <AccountCircle />
                            </IconButton>

                        </div>
                        <div className={classes.sectionMobile}>
                            <IconButton aria-haspopup="true" onClick={this.handleMobileMenuOpen} color="inherit">
                                <MoreIcon />
                            </IconButton>
                        </div>
                    </Toolbar>
                </AppBar>
                {renderMenu}
                {renderMobileMenu}
            </div>
        );
    }
}

export default compose(withRouter, withStyles(styles))(PrimarySearchAppBar);
