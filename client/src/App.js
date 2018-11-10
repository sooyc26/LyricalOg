import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import LyricsForm from './lyrics/lyricsForm'

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
        <h1>Lyrical OG</h1>

        <LyricsForm />
        </header>
      </div>
    );
  }
}

export default App;
