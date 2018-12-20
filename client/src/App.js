import React, { Component } from 'react';
import './App.css';
import LyricsForm from './lyrics/lyricsForm'
import LyricsList from './lyrics/lyricsList';
import Background from './cloudLightning.png';
import Navbar from './layout/Navbar';
import Login from './login/Login';

class App extends Component {
  constructor(props) {
    super(props)

  }

  componentDidMount() {

  }
  render() {

    return (
      <div>
        <Navbar />
        <header className="App-header" style={{ opacity: 0.8 }}>
          <div style={{ lineHeight: '200px' }}>
            <h1 className="text-primary" style={{ paddingTop: "40px", fontSize: "30px" }}>Lyrical OG</h1>
          </div>
        </header>
        <div >
          <LyricsForm />
        </div>
      </div>
    );
  }
}

export default App;
