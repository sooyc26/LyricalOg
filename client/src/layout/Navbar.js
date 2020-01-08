import React from 'react'
import {connect} from 'react-redux'
import {store} from '../store'
import * as jwt_decode from "jwt-decode";

class Navbar extends React.Component {
  constructor(props){
    super(props);

    this.state={
      id:'',
      dropdown:false
    }
  }

  userProfile=()=>{
    var userData = JSON.parse(jwt_decode(localStorage.getItem('loginToken')).currUser)
    this.setState({id:userData.UserId})
  }

  toggleDropdown = () => {
      this.setState({ dropdown: !this.state.dropdown })
  }

  signOut=()=> {
    localStorage.removeItem("loginToken");
    
    //this.props.history.push("/")
  }

  render() {
    const profImgStyle={
        width: '100%',
        height: '100%',
        radius: "50%",
        background: '#512DA8',
        font: '90px',
        color: '#fff',
        textAlign: 'center',
        lineHeight: '90px',
        margin: '20px 0',
    }
    const menuClass = `dropdown-menu${this.state.dropdown ? " show" : ""}`;

    return (

      <React.Fragment>

        <div className="navbar fixed-top" style={{ backgroundColor: "#282c34", opacity: 0.8 }}>
          <div>
            <a href="/beatsList" className="navbar-brand text-primary" style={{ float: 'left', }}>LYRICAL OG</a>
          </div>

          <div className="" style={{ float: 'right' }}>
            <ul className="nav ml-auto">
            <li className="nav-item">
                <a className="nav-link float-left text-primary" href="/beatsList">Beats</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-primary" href="https://bootswatch.com/minty/" >bootstrap</a>
              </li>
              {store.getState().authed ?
                <li className="nav-item dropdown">
                  <div onClick={this.toggleDropdown}>
                    <a className="nav-link dropdown dropdown-toggle text-warning" data-toggle="dropdown" href="#" role="button" aria-haspopup="true">
                      {this.props.user.ImageUrl ?
                        <img className="img-responsive" height='auto' width="34" src={this.props.user.ImageUrl} ></img>
                        : ''} <span>&nbsp;&nbsp;</span>
                      {this.props.user.Name}</a>
                    <div className={menuClass}
                      style={{ position: 'absolute', transform: 'translate3d(0px, 40px, 0px)', top: '0px', left: '0px', willChange: 'transform' }}
                      xplacement="bottom-start">
                      <a className="dropdown-item" href={"/userProfile/" + this.props.user.UserId} onClick={this.userProfile}>Profile</a>
                      <div className="dropdown-divider"></div>
                      <a className="dropdown-item text-danger" href="/" onClick={this.signOut}>Signout</a>

                    </div>
                  </div>
                </li> : ''}

            </ul>
          </div> 
        </div>

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