import React, { Component } from 'react';
import './App.css';
import LyricsForm from './lyrics/lyricsForm'
import BeatsList from './Beats/beatsList'
// import LyricsList from './lyrics/lyricsList';
// import Background from './cloudLightning.png';
import Navbar from './layout/Navbar';
import Login from './login/Login';
import { Route, BrowserRouter,Redirect,Switch } from 'react-router-dom';
import Header from './layout/Header'

import {connect} from 'react-redux'
//import updateUser from './actions/userActions'
//import {bindActionsCreators, bindActionCreators} from 'redux'
import {store} from './store'

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
    if(this.props.user||localStorage.getItem('loginToken') !=null){
     this.setState({
       authed:true
     }) 
    }
  }
  authenticate(){
    this.setState({
      authed: true
    })
    this.props.history.push("/lyricsForm");

  }

  render() {
    
    function PrivateRoute ({component: Component, authed,...rest}) {  
      return (
        <Route
          {...rest}
          render={props => authed ===true
            ? <Component {...props} />
            : <Redirect to={{pathname: '/Login', state: {from: props.location}}} />}
        />
      )
    }

    return (
      <div>
        <BrowserRouter>
          <div>
            <Switch>

              <Route exact path="/" render={props => <Header {...props} />} >
              </Route>
              <PrivateRoute path="/beatsList" authed={store.getState().authed} component={BeatsList} />
              <Route path="/Login" render={props => <Login {...props} />} />
              <Route path="/beatsList" render={props => <BeatsList {...props} />} />
              <Route exact path="/lyricsForm/:id"render={props => <LyricsForm {...props} />}  />

            </Switch>
          </div>
        </BrowserRouter>
        <Navbar />

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


export default connect(mapStateToProps)(App);
