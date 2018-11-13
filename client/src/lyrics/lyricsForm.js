import React, { Component } from 'react';
import * as lyricService from '../services/lyricService'
class LyricsForm extends Component {
  
  constructor(props){
    super(props);

    this.state={
      lyrics:'',
      url:'',
      inputUrl:'',
      displayLyrics:[]
    }
    this.handleChange = this.handleChange.bind(this)
    this.submit = this.submit.bind(this)
  }

  submit(){
    const data = {
      lyrics:this.state.lyrics
    }
   // lyricService.create(data)
   this.setState({displayLyrics:[...this.state.displayLyrics,this.state.lyrics]})

  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }
  render() {
   const url = 'https://soundcloud.com/metroboomin/no-complaints-feat-offset'

    const displayLyrics = this.state.displayLyrics.map(lyric => {
      return (
        <div style={{ border: '1px solid black', borderRadius: '5px!important' }}>
          <div style={{ whiteSpace: 'pre-wrap' }}>
            <ul >{lyric}</ul>
          </div>
        </div>
      )
    })
    return (

      <div>
        {url?
          <iframe width="100%" height="166" scrolling="no" frameborder="no"
            src={"https://w.soundcloud.com/player/?url=" + url + "&amp;{ ADD YOUR PARAMETERS HERE }"}>
          </iframe> 
           : null} 
        <div>
          <input value={this.state.inputUrl} onChange={this.handleChange} name="inputUrl" />
        <button onClick={() => this.setState({ url: this.state.inputUrl })}>Load</button>
        </div>
        <div>
          {displayLyrics}
        </div>
        <p>write your lyrics  </p>
        <textarea className="App" onChange={this.handleChange} value={this.state.lyrics} name='lyrics' style={{ width: '500px', height: '100px' }}></textarea>
        <div>
          <button onClick={this.submit}>submit</button>
        </div>
      </div>
    );
  }
}

export default LyricsForm;
