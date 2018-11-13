import React, { Component } from 'react';
import * as lyricService from '../services/lyricService'

class LyricsForm extends Component {
  
  constructor(props){
    super(props);

    this.state={
      lyrics:'',
      url:'https://soundcloud.com/thebandits26/perrier-1',
      inputUrl:'https://soundcloud.com/thebandits26/perrier-1',
      lyricsList:''
    }
    this.handleChange = this.handleChange.bind(this)
    this.submit = this.submit.bind(this)
    this.getLyrics = this.getLyrics.bind(this)

  }

  submit(){
    const data = {
      lyrics:this.state.lyrics
    }
    // lyricService.create(data)
    this.setState({
      lyricsList:this.state.lyrics
    })
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  componentDidMount() {
    //this.getLyrics();
}

getLyrics() {
    // lyricService.getAll()
    //     .then(response => {
    //         this.setState({
    //             items: response.items
    //         })
    //     })
    //     .catch(console.log.error);
}

  render() {
    const url = 'https://soundcloud.com/thebandits26/perrier-1'
    return (
      <div>
        {/* {url? */}
        <iframe width="100%" height="166" scrolling="no" 
          src={"https://w.soundcloud.com/player/?url="+url+"&amp;{ ADD YOUR PARAMETERS HERE }"}>
        </iframe>
        {/*  : null} */}

        <input style={{width:'100px'}} value = {this.state.inputUrl} onChange={this.handleChange} name="inputUrl"/>
        {this.state.lyricsList}
        <button onClick={()=>this.setState({url:this.state.inputUrl})}>Load</button>
        <p>write your lyrics  </p>
        <textarea className="App" onChange={this.handleChange} value={this.state.lyrics} name='lyrics' style={{width:'500px', height:'100px'}}></textarea>
        <div>
          <button onClick={this.submit}>submit</button>
        </div>
      </div>
    );
  }
}
export default LyricsForm;