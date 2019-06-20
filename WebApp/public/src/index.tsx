import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';

import IndexWidget from './widgets/IndexWidget';
import CommunityWidget from './widgets/CommunityWidget';
import PostWidget from './widgets/PostWidget';
import UserWidget from './widgets/UserWidget';

import CommunityList from './widgets/CommunityList';
import UsersList from './widgets/UsersList';
import NewPostWidget from './widgets/NewPostWidget';
import LoginWidget from './widgets/LoginWidget';
import NewCommunityWidget from './widgets/NewCommunityWidget';

import Header from './components/Header';


ReactDOM.render (
    <BrowserRouter>
        <Header></Header>
        <br />
        <Route exact path="/" component={IndexWidget}/>
        <Route path="/community/:communityname" component={CommunityWidget} />
        <Route path="/post/:postname" component={PostWidget} />
        <Route path="/post/create" component={PostWidget} />
        <Route path="/profile" component={UserWidget} />
        <Route path="/user/:username" component={UserWidget} />

        <Route path="/communities" component={CommunityList} />
        <Route path="/users" component={UsersList} />
        <Route path="/newPost" component={NewPostWidget} />
        <Route path="/newPostCommunity/:communityId" component={NewPostWidget} />
        <Route path="/newCommunity" component={NewCommunityWidget} />
        <Route path="/login" component={LoginWidget} />
    </BrowserRouter>,
  document.getElementById('root')
);
