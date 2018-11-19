import React, { Component } from 'react';
import * as lyricService from '../services/lyricService'
import { ReactMic, AudioPlayer } from 'react-mic';

class LyricsForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      lyrics: '',
      url: 'https://www.youtube.com/watch?v=8EfITcCqauc',
      // url: 'https://soundcloud.com/thebandits26/perrier-1',
      inputUrl: '',
      displayLyrics: [],
      soundCloud: true

      , submitButton: 'submit'
      , editMode: false
      , editId: ''

      , record: false
      , blobObject: ''

    }
    this.handleChange = this.handleChange.bind(this)
    this.submit = this.submit.bind(this)
    this.getAll = this.getAll.bind(this)
    this.setUrl = this.setUrl.bind(this)

    this.edit = this.edit.bind(this)
    this.vote = this.vote.bind(this)
    this.delete = this.delete.bind(this);

    this.startRecording = this.startRecording.bind(this)
    this.stopRecording = this.stopRecording.bind(this)

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
          editId: id,
          submitButton: 'edit'
        })
      })
  }

  vote(id) {
    lyricService.vote(id)
      .then(() => this.getAll())
  }

  setUrl() {
    this.setState({ url: this.state.inputUrl })
  }

  startRecording = () => {
    this.setState({
      record: true
    });
  }

  ////recording functions /////
  stopRecording = () => {
    this.setState({
      record: false
    });
  }

  onData(recordedBlob) {
    console.log('chunk of real-time data is: ', recordedBlob);
  }

  onStop = (recordedBlob) => {
    console.log('recordedBlob is: ', recordedBlob);

    this.setState({ blobObject: recordedBlob.blobURL })
  }

  onSave = (recordedBlob) => {
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

    const { record } = this.state;


    const displayLyrics = this.state.displayLyrics.map((lyric, index) => {
      //if ranked 1st
      if (index === 0) {
        return (
          <div>
            <p></p>
            {/* TOP RATED */}
            <div style={{ textAlign: 'center' }}>
              <label className="text-white" style={{ textAlign: 'center', fontSize: '20px' }}>
                <span class="glyphicon glyphicon-flash" style={{ color: "yellow" }}></span>
                Highest Vote<span class="glyphicon glyphicon-flash" style={{ color: "yellow" }}></span>
              </label>
            </div>
            <div className="card text-white bg-primary mb-3" key={lyric.Id} style={{ opacity: 0.95, width: '500px', textAlign: "center" }}>
              <div class="card-header" style={{ whiteSpace: 'pre-wrap', textAlign: "center", fontSize: '18px' }}>{lyric.Votes} Votes written by:</div>

              <div class="card-body">
              <div>
                  <audio ref="audioSource" controls="controls" style={{height:'50px',width:'150px' ,opacity: 0.9}} src={this.state.blobObject}></audio>
                </div>
                <ul className='text-white' style={{ whiteSpace: 'pre-wrap', textAlign: "center", fontSize: '18px' }}>{lyric.Lyric}</ul>
                <div></div>
                <button id={lyric.Id} onClick={() => this.vote(lyric.Id)} className="btn btn-warning">vote Up: {lyric.Votes}</button>
                <button id={lyric.Id} onClick={() => this.edit(lyric.Id)} type="button" className="btn btn-secondary ">edit</button>
                <button id={lyric.Id} onClick={(e) => this.delete(e, lyric.Id)} className="btn btn-secondary">delete</button>
              </div>
            </div>
          </div>
        )
      }
      return (
        <div className="card border-light mb-3" key={lyric.Id} style={{ opacity: 0.95, width: '500px', textAlign: "center", border: '1px solid black', borderRadius: '5px!important' }}>
          <div class="card-header text-muted" style={{ whiteSpace: 'pre-wrap', textAlign: "center", fontSize: '15px' }}>{lyric.Votes} Votes written by: </div>
          <div class="card-body">
          <div>
              <audio ref="audioSource" controls="controls" style={{height:'50px',width:'150px'}} src={this.state.blobObject}></audio>
            </div>
            <ul className='text-muted' style={{ whiteSpace: 'pre-wrap', textAlign: "center", fontSize: '15px' }} >{lyric.Lyric}</ul>
            <div></div>

            <button id={lyric.Id} onClick={() => this.vote(lyric.Id)} className="btn btn-outline-warning">vote Up: {lyric.Votes}</button>
            <button id={lyric.Id} onClick={() => this.edit(lyric.Id)} type="button" className="btn btn-outline-secondary ">edit</button>
            <button id={lyric.Id} onClick={(e) => this.delete(e, lyric.Id)} className="btn btn-outline-danger">delete</button>
          </div>
        </div>
      )
    })

    return (
      <React.Fragment>
        <h1 style={{ textAlign: 'center', fontSize: '60px', color: 'white' }}>LYRICAL OG</h1>
        <div className="row" >
          <div className="col-4 offset-1" >
            <p></p>

            <label className='text-white ' style={{ textAlign: 'center', fontSize: '20px' }}>Load Soundcloud or Youtube</label>
            <div className='input-group' >
              <input className="form-control" value={this.state.inputUrl} onChange={this.handleChange} style={{ opacity: 0.6, width: '90%' }} name="inputUrl" />
              <div className='input-group-append'>
                <button className="btn btn-primary" onClick={() => this.setUrl()}>Load</button>
              </div>
            </div>

            {soundCloud ?
              <iframe width="500px" height="166" scrolling="no" frameborder="no"
                src={"https://w.soundcloud.com/player/?url=" + this.state.url + "&amp;{ ADD YOUR PARAMETERS HERE }"}>
              </iframe>
              : <iframe width="500px" height="166" src={"https://www.youtube.com/embed/" + youtube}
                frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen>
              </iframe>}
            {/* LYRICS TEXT AREA */}

            <label className='text-white' style={{ textAlign: 'center', fontSize: '20px' }}>write your lyrics  </label>
            <textarea className="form-control" onChange={this.handleChange} value={this.state.lyrics} name='lyrics'
              style={{
                backgroundColor: 'rgba(242,242,242,0.5)', borderColor: 'rgba(0, 0, 0, 0)', whiteSpace: 'pre-wrap',
                textAlign: 'center', width: '500px', height: '350px',
                fontSize: '15px'
              }}>
            </textarea>

            <div>
              <div className='row'>
                <ReactMic
                  record={this.state.record}
                  className="sound-wave"
                  height={50}
                  width={100}
                  onStop={this.onStop}
                  onData={this.onData}
                  onSave={this.onSave}
                  audioBitsPerSecond={192000}
                  strokeColor="#000000"
                  visualSetting='sinewave'
                  backgroundColor="#55b298" />
                <button onClick={this.startRecording} type="button" style={{ height: 50, width: 50 }}>
                  <span class="glyphicon glyphicon-record" style={{ color: "red" }} />
                </button>
                <button onClick={this.stopRecording} type="button" style={{ height: 50, width: 50 }}>
                  <span class="glyphicon glyphicon-stop" />
                </button>
              </div>
            </div>
            {/* Audio Playback */}
            <div>
              <audio ref="audioSource" controls="controls" src={this.state.blobObject}></audio>
            </div>
            <div>
              <button className="btn btn-primary btn-lg" onClick={this.submit}>{this.state.submitButton}</button>
            </div>
          </div>
          
          {/* Media LOAD */}
          <div className="col-4 offset-2" style={{ textAlign: 'center' }}>
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
