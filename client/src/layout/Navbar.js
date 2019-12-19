import React from 'react'
import {connect} from 'react-redux'
import {store} from '../store'
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
    // this.props.history.push('/userProfile/'+userData.UserId)
  }

  signOut=()=> {
    localStorage.removeItem("loginToken");
    
    //this.props.history.push("/")
  }

  render() {
    const profImgStyle={
      //.profileImage {
        width: '100%',
        height: '100%',
        radius: "50%",
        background: '#512DA8',
        font: '90px',
        color: '#fff',
        textAlign: 'center',
        lineHeight: '90px',
        margin: '20px 0',
      //}
    }

    return (

      <React.Fragment>

        <div className="navbar fixed-top" style={{ backgroundColor: "#282c34", opacity: 0.8 }}>
          <div>
            <a href="../" className="navbar-brand text-primary" style={{ float: 'left', }}>LYRICAL OG</a>
          </div>

          <div className="" style={{ float: 'right' }}>
            <ul className="nav ml-auto">
            <li className="nav-item">
                <a className="nav-link float-left text-primary" href="/beatsList">Beats</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-primary" href="https://bootswatch.com/minty/" >bootstrap</a>
              </li>

              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Dropdown</a>
                <div className="dropdown-menu" >
                  <a className="dropdown-item" href="#">Action</a>
                  <a className="dropdown-item" href="#">Another action</a>
                  <a className="dropdown-item" href="#">Something else here</a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href="#">Separated link</a>
                </div>
              </li>
              {store.getState().authed ? 
                <li className="nav-item" >
                  <a className="nav-link" href={"/userProfile/"+this.props.user.UserId} onClick={this.userProfile}>
                    {this.props.user.ImageUrl? 
                    <img className="img-responsive" height='auto' width="34" src={this.props.user.ImageUrl} ></img>:
                    "User Profile"
                    }</a>
                </li>:''
              }
              {store.getState().authed ? 
                <li className="nav-item">
                  <a className="nav-link text-danger" href="/" onClick={this.signOut}>Signout</a>
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
    user:state.user,
    authed:state.authed
  }
  
}
export default (connect(mapStateToProps)(Navbar));