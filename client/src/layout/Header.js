import React, { Component } from "react";
//import { Route, NavLink } from "react-router-dom";
// import logo from './logo.svg';
// import LyricsForm from "../forms/lyricsForm";

class Header extends Component {
  constructor(props) {
    super(props);

    this.toLogin = this.toLogin.bind(this);
  }

  toLogin() {
    this.props.history.push("/Login")
  }
  render() {
    return (
      <React.Fragment>
        <header className="App-header" style={{ opacity: 0.8 }}>
          <form>
            <div style={{ lineHeight: '200px' }}>
              <h1 className="text-primary" style={{ paddingTop: "40px", fontSize: "30px" }}>Lyrical OG</h1>
            </div>
            {localStorage.getItem('loginToken') !=null?
            <div  style={{ textAlign: 'center',position:"relative" }} >
              <button type="button" onClick={() => this.props.history.push("/beatsList")} className="btn btn-outline-warning">Begin OG</button>
            </div>
              :
              <span>
                <button type="button" onClick={() => this.props.history.push("/Register")} className="btn btn-outline-primary">Register</button>
                <button type="button" onClick={() => this.toLogin()} className="btn btn-outline-secondary">Login</button>
              </span>
            }
          </form>
        </header>
      </React.Fragment>
    );
  }
}
export default (Header)