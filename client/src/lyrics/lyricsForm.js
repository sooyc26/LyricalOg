import React, { Component } from 'react';
import * as lyricService from '../services/lyricService'
class LyricsForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      lyrics: '',
      url: 'https://www.youtube.com/watch?v=VzGpRycgrmM',
      // url: 'https://soundcloud.com/thebandits26/perrier-1',
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
      //if ranked 1st
      if(index===0){
        return (
          <div className="card text-white bg-danger mb-3" key={lyric.Id} style={{width: '500px', textAlign: "center" ,border: '5px solid gold', borderRadius: '5px!important' }}>
          <div class="card-header" style={{ whiteSpace: 'pre-wrap', textAlign: "center", fontSize: '15px' }}>written by:</div>

          <div class="card-body">
              <ul className='card-text' >{lyric.Lyric}</ul>
              <div></div>
              <button id={lyric.Id} onClick={() => this.vote(lyric.Id)} className="btn btn-warning btn-sm">vote Up: {lyric.Votes}</button>
              <button id={lyric.Id} onClick={() => this.edit(lyric.Id)} type="button" className="btn btn-secondary btn-sm">edit</button>
              <button id={lyric.Id} onClick={(e) => this.delete(e, lyric.Id)} className="btn btn-secondary btn-sm">delete</button>
            </div>
        </div>
        )
      }
      return (
        <div className="card text-grey border-primary mb-3" key={lyric.Id} style={{width: '500px', textAlign: "center" ,border: '1px solid black', borderRadius: '5px!important' }}>
          <div class="card-header text-muted" style={{ whiteSpace: 'pre-wrap', textAlign: "center", fontSize: '15px' }}>written by: </div>
          <div class="card-body">
              <ul className='text-muted' >{lyric.Lyric}</ul>
              <div></div>
              <button id={lyric.Id} onClick={() => this.vote(lyric.Id)} className="btn btn-warning btn-sm">vote Up: {lyric.Votes}</button>
              <button id={lyric.Id} onClick={() => this.edit(lyric.Id)} type="button" className="btn btn-secondary btn-sm">edit</button>
              <button id={lyric.Id} onClick={(e) => this.delete(e, lyric.Id)} className="btn btn-secondary btn-sm">delete</button>
            </div>
        </div>
      )
    })

    return (
      <React.Fragment>
        <div className="row">
          <div className="col-3 offset-1">
            <div style={{ fontSize: '20px' }}>write your lyrics  </div>
            <textarea className="form-control" onChange={this.handleChange} value={this.state.lyrics} name='lyrics' style={{ whiteSpace: 'pre-wrap', textAlign:'center', width: '500px', height: '450px' }}></textarea>
            <div>
              <button className="btn btn-primary btn-sm" onClick={this.submit}>{this.state.submitButton}</button>
            </div>
          </div>
          <div className="col-3 offset-2">
            <div style={{ fontSize: '20px' }}>Load Soundcloud or Youtube</div>
            <div>
              <input className="form-control" value={this.state.inputUrl} onChange={this.handleChange} style={{ width: '400px' }} name="inputUrl" />
              <button className="btn btn-primary btn-sm" onClick={() => this.setUrl()}>Load</button>
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
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default LyricsForm;
