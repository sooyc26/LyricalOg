import React, { Component } from 'react';
import './App.css';
import LyricsForm from './lyrics/lyricsForm'
import BeatsList from './Beats/beatsList'
// import LyricsList from './lyrics/lyricsList';
// import Background from './cloudLightning.png';
import Navbar from './layout/Navbar';
import Login from './login/Login';
import Register from './login/Register';
import { Route,Router, BrowserRouter,Redirect,Switch,withRouter } from 'react-router-dom';
import Header from './layout/Header'

import {connect} from 'react-redux'
//import updateUser from './actions/userActions'
//import {bindActionsCreators, bindActionCreators} from 'redux'
import {store} from './store'
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
    this.authenticate = this.authenticate.bind(this)
    this.updateUser= this.updateUser.bind(this)
  }

  updateUser(){
    this.props.updateUser('Sammy')

  }
  componentDidMount() {
    
    if(this.props.authed !=null){
      
     this.setState({
       authed:true
     }) 
    }

  }
  authenticate(){
    // this.setState({
    //   authed: true
    // })
    // this.props.history.push("/beatsList");

  }

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
              <Route path="/Login" render={props => <Login {...props} />} />
              <Route path="/Register" render={props => <Register {...props} />} />
              <Route path="/passwordResetRequest" render={props => <PasswordResetRequest {...props} />} />
              <Route path="/userProfile/:id" render={props => <UserProfile {...props} />} />
              <Route path="/password-reset/:key" render={props => <ResetPassword {...props} />} />
              <Route path="/account-verification/:key" render={props => <ValidateAccount {...props} />} />

              <Route exact path="/beatsList" render={props => <BeatsList {...props} />} />
              <Route exact path="/lyricsForm/:id"render={props => <LyricsForm {...props} />}  />

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
