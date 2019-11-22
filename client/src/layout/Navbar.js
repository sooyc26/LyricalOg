import React from 'react'
import {connect} from 'react-redux'
import {store} from '../store'
//import {Route,BrowserRouter, Switch} from '../../node_modules/react-router-dom'
//import Header from '../layout/Header'
//import Login from '../login/Login'
import * as jwt_decode from "jwt-decode";

class Navbar extends React.Component {
  constructor(props){
    super(props);

    this.state={
      id:''
    }
  }

  userProfile=()=>{
    var userData = JSON.parse(jwt_decode(localStorage.getItem('loginToken')).currUser)
    this.setState({id:userData.UserId})
    //this.props.history.push("/userProfile/"+userData.UserId)
  }

  signOut=()=> {
    //this.props.history.push("")
    localStorage.removeItem("loginToken");
    
  }

  render() {

    return (

      <React.Fragment>

        <div className="navbar fixed-top" style={{ backgroundColor: "#282c34", opacity: 0.8 }}>
          <div>
            <a href="../" className="navbar-brand text-primary" style={{ float: 'left', }}>LYRICAL OG</a>
          </div>
          {/* <div className="container "> */}


          <div style={{ float: 'right' }}>
            <ul className="nav ml-auto">
            <li className="nav-item">
                <a className="nav-link float-left text-primary" href="/beatsList">Beats</a>
              </li>
              {/* <li className="nav-item">
                <a className="nav-link float-left text-primary" href="/lyricsForm">Write Lyrics</a>
              </li> */}
              <li className="nav-item">
                <a className="nav-link text-primary" href="https://bootswatch.com/minty/" >bootstrap</a>
              </li>

              {store.getState().authed ? 
                <li className="nav-item">
                  <a className="nav-link text-warning" onClick={this.userProfile}>User Profile</a>
                </li>:''
              }
              {store.getState().authed ? 
                <li className="nav-item">
                  <a className="nav-link text-danger" href="" onClick={this.signOut}>Signout</a>
                </li>:''
              }

            </ul>
          </div> 
        </div>
        {/* </div> */}
        {/* <BrowserRouter>
            <Switch>
                <Route path="/Login" render={props => <Login {...props} />} />
                <Route exact path="/"render={props => <Header {...props}  />}/> 
            </Switch>
        </BrowserRouter> */}
      </React.Fragment>
    )
  }
}
const mapStateToProps = (state,props)=> {
  console.log(state)
  return{
    authed:state.authed
  }
  
}
export default connect(mapStateToProps)(Navbar);