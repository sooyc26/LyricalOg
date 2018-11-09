import React, { Component } from 'react';

class LyricsForm extends Component {
  
  constructor(props){
    super(props);

    this.state={
      lyrics:'',
      url:'',
      inputUrl:''
    }
    this.handleChange = this.handleChange.bind(this)
    this.submit = this.submit.bind(this)
  }

  submit(){

  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }
  render() {
    return (
      <div>
        {this.state.url?
        <iframe width="100%" height="166" scrolling="no" frameborder="no"
          src={"https://w.soundcloud.com/player/?url="+this.state.url+"&amp;{ ADD YOUR PARAMETERS HERE }"}>
        </iframe>: null}

        <input value = {this.state.inputUrl} onChange={this.handleChange} name="inputUrl"/>
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
