import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import LyricsForm from './forms/lyricsForm';
import Header from './layout/Header';
import SideBar from './layout/SideBar';

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
      <div >
        <Header />
        <SideBar />
        {/* <LyricsForm /> */}
      </div>
    );
  }
}

export default App;
