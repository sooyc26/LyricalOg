import React, { Component } from 'react';
import * as lyricService from '../services/lyricService'
class LyricsForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      lyrics: '',
      url: 'https://www.youtube.com/watch?v=VzGpRycgrmM',
      inputUrl: '',
      displayLyrics: [],
      soundCloud: true

      , submitButton: 'submit'
      , editMode: false
      ,editId:''

    }
    this.handleChange = this.handleChange.bind(this)
    this.submit = this.submit.bind(this)
    this.getAll = this.getAll.bind(this)
    this.setUrl=this.setUrl.bind(this)

    this.edit = this.edit.bind(this)
    this.vote = this.vote.bind(this)
    this.delete = this.delete.bind(this);
  }

  componentDidMount() {
    this.getAll()
  }

  getAll() {
    lyricService.getAll()
      .then(response => {
        this.setState({
          displayLyrics: response
        })
      })
  }

  submit() {
    const data = {
      lyrics: this.state.lyrics
    }
    if (this.state.editMode) {
      lyricService.update(this.state.editId, data)
        .then(() => this.getAll())
        .then(() => {
          this.setState({
            lyrics: '',
            editMode: false
          })
        })
    } else {
      lyricService.create(data)
        .then(() => this.getAll())
        .then(() => {
          this.setState({
            lyrics: '',
            editMode: false
          })
        })
    }
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  delete(e, id) {
    if (window.confirm('Delete the item?')) {
      lyricService.deleteById(id)
        .then(() => this.getAll())
    }
  }

  edit(id) {
    lyricService.getById(id)
      .then(response => {
        this.setState({
          lyrics: response.Lyric,
          editMode: true,
          editId:id,
          submitButton:'edit'
        })
      })
  }

  vote(id) {
    lyricService.vote(id)
    .then(()=>this.getAll())
  }

  setUrl(){
    this.setState({ url: this.state.inputUrl })
  }

  render() {
    let soundCloud = false;
    let youtube = ''
    if (this.state.url.includes('sound')) {
      soundCloud = true;
    } else {
      youtube = this.state.url.split("=").pop();
      soundCloud = false;
    }

    const displayLyrics = this.state.displayLyrics.map((lyric,index) => {
      return (
        <div key={lyric.Id} style={index===0?{width: '500px', textAlign: "center" ,border: '5px solid gold', borderRadius: '5px!important' }:{width: '500px', textAlign: "center" ,border: '1px solid black', borderRadius: '5px!important' }}>
          <div style={{ whiteSpace: 'pre-wrap', textAlign: "center", fontSize: '15px' }}>
            <ul >{lyric.Lyric}</ul>
            <div></div>
           <button id={lyric.Id} onClick={() => this.vote(lyric.Id)} className="btn btn-danger">vote Up: {lyric.Votes}</button>
            <button id={lyric.Id} onClick={() => this.edit(lyric.Id)} type="button" className="btn btn-default">edit</button>
            <button id={lyric.Id} onClick={(e) => this.delete(e, lyric.Id)} className="btn btn-danger">delete</button>
          </div>
        </div>
      )
    })

    return (
      <div>
        <div>
          <div style={{fontSize: '20px' }}>Load Soundcloud or Youtube</div>
          <input value={this.state.inputUrl} onChange={this.handleChange} style={{width: '450px'}} name="inputUrl" />
          <button onClick={() => this.setUrl()}>Load</button>
        </div>
        {soundCloud ?
          <iframe width="500px" height="166" scrolling="no" frameborder="no"
            src={"https://w.soundcloud.com/player/?url=" + this.state.url + "&amp;{ ADD YOUR PARAMETERS HERE }"}>
          </iframe>
          : <iframe width="500px" height="166" src={"https://www.youtube.com/embed/" + youtube}
            frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>}
        <div>
          {displayLyrics}
        </div>
        <p>write your lyrics  </p>
        <textarea className="App" onChange={this.handleChange} value={this.state.lyrics} name='lyrics' style={{ whiteSpace: 'pre-wrap', width: '500px', height: '100px' }}></textarea>
        <div>
          <button onClick={this.submit}>{this.state.submitButton}</button>
        </div>
      </div>
    );
  }
}

export default LyricsForm;
