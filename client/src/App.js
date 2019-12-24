import './App.css';
import React, { Component } from 'react';
import { Route, BrowserRouter,Redirect,Switch } from 'react-router-dom';
import {connect} from 'react-redux'

import BeatsList from './Beats/beatsList'
import Navbar from './layout/Navbar';
import Login from './login/Login';
import Register from './login/Register';
import Header from './layout/Header'
import LyricsForm from './lyrics/lyricsForm'
import UserProfile from './Users/userProfile';
import PasswordResetRequest from './Users/passwordResetRequest';
import ResetPassword from './Users/resetPassword'
import ValidateAccount from './login/validateAccount'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {     
      authed: false
    }
  }

  // componentDidMount() {

  //   if(this.props.authed !=null){
      
  //    this.setState({
  //      authed:true
  //    }) 
  //   }

  // }

  render() {
    
    function PrivateRoute ({component: Component, authed,...rest}) {  
      return (
        <Route
          {...rest}
          render={props => authed ===true ? 
          <Component {...props} />: 
            <Redirect to={{pathname: '/Login', state: {from: props.location}}} />}
        />
      )
    }

    return (
      <div>
        <BrowserRouter history={this.history}>
          <div>
              <Navbar />
            <Switch>

              <Route exact path="/" render={props => <Header {...props} />} />
              <PrivateRoute path="/beatsList" authed={this.props.authed} component={BeatsList} />
              <PrivateRoute path="/lyricsForm/:id?" authed={this.props.authed} component={LyricsForm} />
              <PrivateRoute path="/userProfile/:id?" authed={this.props.authed} component={UserProfile} />
              
              <Route path="/Login" render={props => <Login {...props} />} />
              <Route path="/Register" render={props => <Register {...props} />} />
              <Route path="/passwordResetRequest" render={props => <PasswordResetRequest {...props} />} />
              <Route path="/password-reset/:key" render={props => <ResetPassword {...props} />} />
              <Route path="/account-verification/:key" render={props => <ValidateAccount {...props} />} />

              {/* <Route path="/userProfile/:id?" render={props => <UserProfile {...props} />} /> */}
              {/* <Route exact path="/beatsList" render={props => <BeatsList {...props} />} /> */}
              {/* <Route exact path="/lyricsForm/:id"render={props => <LyricsForm {...props} />}  /> */}

            </Switch>
          </div>
        </BrowserRouter>

        

      </div>

    );
  }


}
const mapStateToProps = (state,props)=> {
  return{
    user:state.user,
    authed:state.authed
  }  
}



export default (connect(mapStateToProps)(App));
