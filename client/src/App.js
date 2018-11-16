import React, { Component } from 'react';
import './App.css';
import LyricsForm from './lyrics/lyricsForm'
import Header from './layout/Header';
import LyricsList from './lyrics/lyricsList';
import Background from './cloudLightning.png';

class App extends Component {
  render() {



    return (
      <div>
        {/* <Header></Header> */}
        <div className="Mint">
          <header className="App-header">
            <h1>Lyrical OG</h1>
            {/* <LyricsList/> */}
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
