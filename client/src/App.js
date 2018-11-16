import React, { Component } from 'react';
import './App.css';
import LyricsForm from './lyrics/lyricsForm'
import LyricsList from './lyrics/lyricsList';
import Background from './cloudLightning.png';
import Navbar from './layout/Navbar';

class App extends Component {
  render() {



    return (
      <div>

        <div className="Mint">
        <Navbar></Navbar>
          <header className="App-header">
          
            <h1>Lyrical OG</h1>
          </header>
          
          <div >
            <LyricsForm />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
