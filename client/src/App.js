import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import LyricsForm from './forms/lyricsForm';
import Header from './layout/Header';
import SideBar from './layout/SideBar';

class App extends Component {

  render() {

    return (
      <div >
        {/* <Header /> */}
        {/* <SideBar /> */}
        <LyricsForm />
      </div>
    );
  }
}

export default App;
