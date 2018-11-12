import React, { Component } from "react";
import { Route, NavLink } from "react-router-dom";
// import logo from './logo.svg';
import LyricsForm from "../forms/lyricsForm";

export default class Header extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
          <nav className="navbar navbar-inverse navbar-fixed-top">
            <div className="container">
              <div className="navbar-header">
                
              </div>
              <div id="navbar" className="collapse navbar-collapse">
                <ul className="nav navbar-nav">
                  <li>
                    <NavLink to="/lyrics-form">lyrics</NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
          <div style={{ marginTop: "60px" }}>
            <div>
              <Route path="/lyrics-form" component={LyricsForm}/> 
            </div>
          </div>

      </div>
    );
  }
}
