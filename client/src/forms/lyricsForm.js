import React, { Component } from 'react';

class LyricsForm extends Component {
  
  constructor(props){
    super(props);

    this.state={
      lyrics:'',
      url:''
    }
    this.handleChange = this.handleChange.bind(this)
    this.submit = this.submit.bind(this)
  }

  submit(){

  }
  onPlay() {
    console.log('playing');
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }
  render() {
    const url = 'https://soundcloud.com/thebandits26/dry'
    // https://soundcloud.com/officialpandaeyes/letsfly
    return (
      <div>
        {this.state.url?
        <iframe width="100%" height="166" scrolling="no" frameborder="no"
          src={"https://w.soundcloud.com/player/?url="+this.state.url+"&amp;{ ADD YOUR PARAMETERS HERE }"}>
        </iframe>: <input value = {this.state.url} onChange={this.handleChange} name="url"></input>}
        <p>write your lyrics  </p>
        <textarea onChange={this.handleChange} value={this.state.lyrics} name='lyrics' style={{width:'500px', height:'100px'}}></textarea>
        <div>
          <button onSubmit={this.submit}>submit</button>
        </div>
      </div>
    );
  }
}

export default LyricsForm;
