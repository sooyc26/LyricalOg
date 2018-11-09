import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import LyricsForm from './forms/lyricsForm';

class App extends Component {
  
  constructor(props){
    super(props);

    this.state={
      lyrics:''
    }
    this.handleChange = this.handleChange.bind(this)
    this.submit = this.submit.bind(this)
  }

  submit(){
    
  }

  handleChange(e){
    this.setState({[e.target.name]:e.target.value})
  }
  render() {

    return (
      <div className="App">
        <header className="App-header">
          <LyricsForm></LyricsForm>
        </header>
      </div>
    );
  }
}

export default App;
