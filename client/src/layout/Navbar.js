import React from 'react'
import {connect} from 'react-redux'
import {store} from '../store'
//import {Route,BrowserRouter, Switch} from '../../node_modules/react-router-dom'
//import Header from '../layout/Header'
//import Login from '../login/Login'

class Navbar extends React.Component {


  signOut() {
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
                  <a className="nav-link text-warning" href="/userProfile" >User Profile</a>
                </li>:''
              }
              {store.getState().authed ? 
                <li className="nav-item">
                  <a className="nav-link text-danger" href="" onClick={this.signOut.bind(this)}>Signout</a>
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
  return{
    authed:state.authed
  }
  
}
export default connect(mapStateToProps)(Navbar);