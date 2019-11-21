import React, { Component } from 'react';
import * as lyricService from '../services/lyricService'
import * as beatService from '../services/beatService'
import * as userService from '../services/userService'
import * as recordService from '../services/recordService'
import { ReactMic } from 'react-mic';
// import {store} from '../store'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import * as jwt_decode from "jwt-decode";
import './lyrics.css'

class LyricsForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      lyrics: '',
      displayLyrics: []

      , submitButton: 'submit'
      , editMode: false
      , editId: ''
      , record: false

      , editData: {}
      , lyricModal: ''

      , BeatId: 0     //load on click
      , isAdmin: false
      , currUserId: 0
      , title: ''
      , producer: ''

      , description: ''
      , beatImg: null
    }
    this.submit = this.submit.bind(this)
  }

  componentDidMount() {
    var userData = JSON.parse(jwt_decode(localStorage.getItem('loginToken')).currUser)
    this.setState({
      isAdmin: userData.IsAdmin,
      currUserId: userData.UserId
    })
    this.getAll()
  }

  getAll() {
    var id = this.props.match.params.id ? this.props.match.params.id : 0

    beatService.getById(id)
      .then(response => {

        this.setState({
          url: response.BeatUrl,
          title: response.Title,
          producer: response.Producer,
          description: response.Description,
          beatImg: response.ImgUrl
        })
      })
    lyricService.getByBeatId(id)
      .then(response => {
        this.setState({
          displayLyrics: response
        })
      })
  }

  submit() {

    //const userData = store.getState().user; 
    //userData.UserId = store.getState().user? store.getState().user.UserId:4;
    var userData = JSON.parse(jwt_decode(localStorage.getItem('loginToken')).currUser)
    if (window.uploadFile) {

      const lyricData = {     //lyric insert data
        UserId: parseInt(userData.UserId, 10),
        Lyrics: this.state.lyrics,
        BeatId: this.props.match.params.id,
        AudioFile: window.uploadFile,
        ContentType: window.uploadFile.type,
      }

      lyricService.create(lyricData)
        .then(response => {
          recordService.uploadFile(response.SignedUrl, window.uploadFile)

        })
        .then(() => this.getAll())
        .then(() => {
          this.setState({
            lyrics: '',
            editMode: false
          })
        })
    } else window.alert('no recording')
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  delete = (e, id) => {
    if (window.confirm('Delete the item?')) {
      lyricService.deleteById(id)
        .then(() => this.getAll())
    }
  }

  // edit = id => {
  //   userService.getById(id)
  //     .then(response => {

  //       this.setState({
  //         editData: response,

  //         lyricModal: response.Lyrics,
  //         editMode: true,
  //         submitButton: 'edit'
  //       })
  //     })
  //   this.handleShow();
  // }

  upVote = lyricId => {
    const data = {
      VoterId: this.state.currUserId,
      LyricsId: lyricId
    }
    lyricService.vote(data)
      .then(() => this.getAll())
  }

  downVote = lyricId => {
    const data = {
      VoterId: this.state.currUserId,
      LyricsId: lyricId
    }
    lyricService.deleteByVoteId(data)
      .then(() => this.getAll())
  }

  // setUrl = () => {
  //   this.setState({ url: this.state.inputUrl })
  // }

  startRecording = () => {
    this.refs['s3Player'].currentTime = 0;
    this.refs['s3Player'].play()
    this.setState({ record: true })
  }

  ////recording functions /////
  stopRecording = () => {
    this.setState({ record: false })
    this.refs['s3Player'].pause()

  }

  onData(recordedBlob) {
    console.log('chunk of real-time data is: ', recordedBlob);
  }

  convertBlobToMp3 = blob => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', blob.blobURL, true);
    xhr.responseType = 'blob';
    xhr.onload = function (e) {
      if (this.status === 200) {
        window.uploadFile = this.response;
      }
    }
    xhr.send();
  }

  onStop = (recordedBlob) => {

    console.log('recordedBlob is: ', recordedBlob);

    window.blobURL = recordedBlob.blobURL
    // window.blob = recordedBlob
    this.convertBlobToMp3(recordedBlob)
  }

  playBack = id => {
    //this.refs['s3Player'].currentTime = 0;
    if (id) {
      this.refs[id].currentTime = this.refs['s3Player'].currentTime
      this.refs['s3Player'].play()
        .then(this.refs[id].play())
    }

    // if (!id && window.blobURL) {
    //   this.refs['s3Player'].currentTime = 0;
    //   this.refs['s3Player'].play()
    //     .then(this.audio.play())
    // }
  }

  togglePlay = e => {

    //if end of record
    if (this.refs[e.target.id].currentTime >= this.refs[e.target.id].duration) {
      this.refs['s3Player'].currentTime = 0;
      this.refs[e.target.id].currentTime = 0;
    }

    if (e.target.className == "fas fa-stop") {
      e.target.className = "fas fa-play"
      this.pauseUrl(e.target.id)
    } else {
      e.target.className = "fas fa-stop"
      this.playBack(e.target.id)
    }
  }

  togglePlayRecord = e => {

    if (window.blobURL) {

      const audio = new Audio(window.blobURL)

      if (e.target.className == "fas fa-stop") {
        e.target.className = "fas fa-play"
        this.refs['s3Player'].pause()
        audio.pause()

      } else {
        e.target.className = "fas fa-stop"

        this.refs["s3Player"].currentTime = 0;
        this.refs['s3Player'].play()
          .then(audio.play())

      }
    } else {
      window.alert("please record first before playing")
    }
  }

  playUrl = id => {
    this.refs[id].currentTime = 0;
    this.refs[id].play()
  }

  pauseUrl = id => {
    this.refs['s3Player'].pause()

    if (id) {
      this.refs[id].pause()
    }
  }

  // pauseAudio = () =>{

  //   if (window.blobURL) {
  //     this.audio.pause();
  //   }    
  // }

  _onReady = event => {
    event.target.currentTime = 0;

    this.setState({ mediaEvent: event })
    //event.target.pauseVideo();
    // event.target.play()
    //console.log(this.refs['s3Player'].currentTime)
  }
  handleClose = e => {
    this.setState({ show: false, passwordModal: '' });
  }

  handleShow = e => {
    this.setState({ show: true });
  }

  render() {

    let beatPlayer =
    <div style={{verticalAlign:"middle"}}>
    <h2 className="text-primary" >{this.state.title} <span className="text-white">(prod.{this.state.producer})</span></h2>
        <div className="row" style={{margin:'auto'}}>
        <img  src={this.state.beatImg} width="160" height="160"></img>
          <video controls
            //onPlay={this.beatPlay}
            controlsList="nodownload"
            key={this.state.url}
            //poster={this.state.beatImg}
            ref={'s3Player'} name="media" width="334" height="160"
            onLoadedMetadata={this._onReady}
          // onPlaying={this.state.s3Url ? () => this.playUrl(this.state.audioId) : (window.blobURL ? () => audio.play() : () => this.setState({ record: true }))}
          > <source ref={'s3Player'} src={this.state.url} type="audio/mp3"></source>

          </video>
        </div>
      </div>
    // </iframe>


    //const { record } = this.state;

    const displayLyrics = this.state.displayLyrics.map((lyric, index) => {

      //if ranked 1st
      if (index === 0) {
        return (
          <div key={lyric.Id}>
            <div style={{ textAlign: 'center' }}>
              <label className="text-white" style={{ textAlign: 'center', fontSize: '20px' }}>
                <span className="fas fa-bolt" style={{ color: "yellow" }}></span>
                {' '}Top Vote
              </label>
            </div>

            <div className="card text-white mb-3 text-primary" key={lyric.Id}
              style={{
                backgroundColor: 'rgba(73,81,95,0.5)', color: "white", borderColor: 'rgba(120,194,173,0.9)', whiteSpace: 'pre-wrap',
                textAlign: 'center',
                fontSize: '15px'
              }}
            >
              <div className="card-header badge badge-dark" style={{ whiteSpace: 'pre-wrap', textAlign: "center", fontSize: '18px' }}>By: {lyric.User.Name}</div>
              <div className="card-body">
                <div>

                  <audio ref={`${lyric.Id}`} id={lyric.Id}
                    // onPlay={() => this.playBack(lyric.Id)} 
                    controls="" style={{ height: '50px', width: '200px' }} src={lyric.S3SignedUrl}></audio>
                </div>
                <ul className='' style={{ whiteSpace: 'pre-wrap', fontSize: '18px' }}>{lyric.Lyric}</ul>
              </div>
              <div className="card-footer">

                {lyric.VoterList.includes(this.state.currUserId) ?
                  <button id={lyric.Id} onClick={() => this.downVote(lyric.Id)}
                    className="btn btn-success">{lyric.VoteCount} <i className="fas fa-chevron-up"></i>
                  </button>
                  : <button id={lyric.Id} onClick={() => this.upVote(lyric.Id)}
                    className="btn btn-outline-success">{lyric.VoteCount} <i className="fas fa-chevron-up"></i>
                  </button>
                }

                {
                  lyric.UserId === this.state.currUserId || this.state.isAdmin ?
                    <button id={lyric.Id} onClick={(e) => this.delete(e, lyric.Id)} className="btn btn-outline-secondary">Delete</button>
                    : ''
                }
                <button className="btn btn-outline-danger"  >
                  <span id={lyric.Id} className="fas fa-play" onClick={e => this.togglePlay(e)}></span>
                </button>
              </div>

            </div>

            {/* sorted high -> low */}
            <div style={{ textAlign: 'center' }}>
              <label className="text-white" style={{ textAlign: 'center', fontSize: '20px' }}>
                <span style={{ color: 'gray' }} className="fas fa-cloud" > </span>
                {' '}Chasers
              </label>
            </div>
          </div>
        )
      }
      return (
        <div key={lyric.Id}>
          <div className="card border-warning mb-3 text-white" key={lyric.Id}
            // style={{ opacity: 0.95, width: '500px', margin:'auto', border: '1px solid black', borderRadius: '5px!important' }}
            style={{
              backgroundColor: 'rgba(73,81,95,0.5)', color: "white", borderColor: 'rgba(120,194,173,0.9)', whiteSpace: 'pre-wrap',
              fontSize: '15px'
            }} >

            <div className="card-header">

              <span className="badge badge-pill badge-light" style={{ textAlign: "center", fontSize: '15px' }}> by: {lyric.User.Name}</span>

            </div>

            <div className="card-body">
              <div>

                <audio ref={`${lyric.Id}`} id={lyric.Id} onPlay={() => this.playBack()} controls="" style={{ height: '50px', width: '200px' }} src={lyric.S3SignedUrl}></audio>
              </div>
              <ul className='' style={{ whiteSpace: 'pre-wrap', textAlign: "center", fontSize: '15px' }} >{lyric.Lyric}</ul>


            </div>
            <div className="card-footer">
              {lyric.VoterList.includes(this.state.currUserId) ?
                <button id={lyric.Id} onClick={() => this.downVote(lyric.Id)}
                  className="btn btn-warning">{lyric.VoteCount} <i className="fas fa-chevron-up"></i>
                </button>
                : <button id={lyric.Id} onClick={() => this.upVote(lyric.Id)}
                  className="btn btn-outline-warning">{lyric.VoteCount} <i className="fas fa-chevron-up"></i>
                </button>
              }
              {
                lyric.UserId === this.state.currUserId || this.state.isAdmin ?
                  <button id={lyric.Id} onClick={(e) => this.delete(e, lyric.Id)} className="btn btn-outline-secondary">Delete</button>
                  : ''
              }
              <button className="btn btn-outline-danger"  >
                <span id={lyric.Id} className="fas fa-play" onClick={e => this.togglePlay(e)}></span>
              </button>
            </div>
          </div>
        </div>

      )
    })

    return (
      <React.Fragment>
        {/* <h1 style={{ textAlign: 'center', fontSize: '55px', color: 'white' }}>LYRICAL OG</h1> */}
        <div style={{ paddingTop: '5%' }}>
          <h1 className="text-white" style={{ textAlign: 'center' }}>Lyrics</h1>
          <div className="row" >
            <div className="col-4 offset-1" >

              {/* MEDIA PLAYER */}

              {beatPlayer}

              <label className="text-white" style={{ textAlign: 'left' }}> Description</label>
              <div>{this.state.description}</div>

              <label className='text-white' style={{ textAlign: 'center', fontSize: '20px' }}>Write your lyrics  </label>
              <textarea className="form-control" onChange={this.handleChange} value={this.state.lyrics} name='lyrics' placeholder="lyrics here"
                style={{
                  backgroundColor: 'rgba(73,81,95,0.5)', color: "white", borderColor: 'rgba(120,194,173,0.9)', whiteSpace: 'pre-wrap',
                  textAlign: 'center', width: '500px', height: '200px',
                  fontSize: '15px'
                }}>
              </textarea>
              <div style={{ paddingTop: "15px" }}>
                <label className='text-white' style={{ textAlign: 'center', fontSize: '20px' }}>Record </label>
                <div className='container'>

                  {/* RECORD BUTTON */}
                  <div className="row">
                    <button className="btn btn-outline-danger" onClick={this.state.record ? this.stopRecording : this.startRecording} type="button" >
                      <i className={this.state.record ? "fas fa-square" : "fas fa-microphone"} style={{ color: "red" }} />
                    </button>

                    <audio ref={"recorded"}
                      //id={lyric.Id} 
                      // onPlay={() => this.playBack(lyric.Id)} 
                      src={window.blobURL}
                      type="audio/webm"></audio>

                    <ReactMic
                      record={this.state.record}
                      className="sound-wave"
                      height={30}
                      width={250}
                      onStop={this.onStop}
                      onData={this.onData}
                      onSave={this.onSave}
                      audioBitsPerSecond={192000}
                      strokeColor="rgba(120,194,173,0.9)"
                      visualSetting='sinewave'
                      backgroundColor="#49515f" />

                    {/* PLAY BUTTON */}
                    <button className="btn btn-outline-danger"  >
                      <span className="fas fa-play" onClick={(e) => this.togglePlayRecord(e)}></span>
                    </button>
                    <div style={{ marginLeft: '15%' }}>
                      <button className="btn btn-outline-primary text-grey" style={{ float: 'right' }} onClick={this.submit}>Submit</button>
                    </div>
                  </div>
                </div>
              </div>
              <div>
              </div>
            </div>
            {/* Load Lyrics */}
            <div className="col-4 offset-2" style={{ textAlign: 'center' }}>
              <div>
                {displayLyrics}
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
const mapStateToProps = (state, props) => {
  return {
    user: state.user
  }

}
export default withRouter(connect(mapStateToProps)(LyricsForm));
