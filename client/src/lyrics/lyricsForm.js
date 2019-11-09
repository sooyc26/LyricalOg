import React, { Component } from 'react';
import * as lyricService from '../services/lyricService'
import * as beatService from '../services/beatService'
import * as userService from '../services/userService'
import * as recordService from '../services/recordService'
import { ReactMic } from 'react-mic';
import Youtube from 'react-youtube'
import { Modal, HelpBlock } from 'react-bootstrap'
import {store} from '../store'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import * as jwt_decode from "jwt-decode";

class LyricsForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      lyrics: '',
      url: '',
      //url: 'http://soundcloud.com/thebandits26/warm-water-zone',
      inputUrl: '',
      displayLyrics: [],
      soundCloud: true

      , submitButton: 'submit'
      , editMode: false
      , editId: ''

      , record: false
      , autoPlay: 0
      , mediaEvent: ''

      , name: ''
      , password: ''
      , email: ''

      , s3Url: false
      , audioId: ''

      , editData: {}
      , lyricModal: ''
      
      ,BeatId:0     //load on click
      ,isAdmin:false
      ,currUserId:0
      ,title:''
      ,producer:''
    }
  }

  componentDidMount() {
    var userData =JSON.parse(jwt_decode(localStorage.getItem('loginToken')).currUser)
    this.setState({
        isAdmin:userData.IsAdmin,
        currUserId:userData.UserId
    })
    this.getAll()
  }

  getAll() {
    var id = this.props.match.params.id? this.props.match.params.id:1

    beatService.getById(id)
    .then(response=>{  
      this.setState({
        url: response.BeatUrl,
        title:response.Title,
        producer:response.Producer
      })
    })
    lyricService.getByBeatId(id)
      .then(response => {
        this.setState({
          displayLyrics: response
        })
      })
  }

  submit = () => {

    //const userData = store.getState().user; 
    //userData.UserId = store.getState().user? store.getState().user.UserId:4;
    var userData = JSON.parse(localStorage.getItem('loginToken'));
    if (window.uploadFile) {

      const lyricData = {     //lyric insert data
        userId: parseInt(userData.UserId, 10),
        lyrics : this.state.lyrics,
        BeatId:this.props.match.params.id,
        AudioFile: window.uploadFile,
        ContentType: window.uploadFile.type
      }

      lyricService.create(lyricData)
        .then(response => {

          recordService.uploadFile(response, window.uploadFile)
        })

        .then(() => this.getAll())
        .then(() => {
          this.setState({
            lyrics: '',
            name: '',
            password: '',
            email: '',
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

  edit = id => {
    userService.getById(id)
      .then(response => {

        this.setState({
          editData: response,

          lyricModal: response.Lyrics,
          editMode: true,
          submitButton: 'edit'
        })
      })
    this.handleShow();
  }

  vote = id => {
    lyricService.vote(id)
      .then(() => this.getAll())
  }

  setUrl = () => {
    this.setState({ url: this.state.inputUrl })
  }

  startRecording = () => {
    this.setState({
      autoPlay: true,
    });
    this.state.mediaEvent.target.seekTo(0).playVideo();
  }

  ////recording functions /////
  stopRecording = () => {
    this.setState({
      autoPlay: false,
      record: false,
    });
    this.state.mediaEvent.target.pauseVideo();
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
    debugger
    console.log('recordedBlob is: ', recordedBlob);

    window.blobURL = recordedBlob.blobURL
    window.blob = recordedBlob
    this.convertBlobToMp3(recordedBlob)
  }

  playBack = id => {
    debugger
    this.state.mediaEvent.target.seekTo(0).playVideo()

    if (id) {
      this.setState({
        audioId: id,
        s3Url: true
      })
    }

    this.setState({ record: false })

  }

  onPlayerStateChange = () => {
    debugger
    if (window.blobObject) {
      this.audio.play();
    } else {
      this.setState({ record: true })
    }
  }

  _onReady = event => {
    
    this.setState({ mediaEvent: event })
    event.target.pauseVideo();
  }

  playUrl = id => {
    debugger
    this.refs[id].play()
  }

  handleClose = e => {
    this.setState({ show: false, passwordModal: '' });
  }

  handleShow = e => {
    this.setState({ show: true });
  }

  render() {

    const opts = {
      height: '166',
      width: '500',
      playerVars: {
        autoplay: this.state.autoPlay
      }
    }
    let audio = new Audio(window.blobURL);

    let soundCloud = false;
    let youtube = ''
    if (this.state.url.includes('sound')) {
      soundCloud = true;
    } else {
      youtube = this.state.url.split("=").pop();
      soundCloud = false;
    }

    let beatPlayer;
    if(this.state.url.includes('sound')){//load soundcloud iframe
      beatPlayer = <iframe title="soundcloud" width="500px" height="166" onChange={this.onPlayerStateChange} scrolling="no" frameborder="no"
                src={"http://w.soundcloud.com/player/?url=" + this.state.url + "&amp;auto_play=" + 0 + "enablejsapi=1"}>
              </iframe>     
    }else if(this.state.url.includes('youtube')){//load youtube iframe
      youtube = this.state.url.split("=").pop();
      beatPlayer = <Youtube width="500px" height="166" onReady={this._onReady} videoId={youtube} opts={opts}
      onPlay={this.state.s3Url ? () => this.playUrl(this.state.audioId) : (window.blobURL ? () => audio.play() : () => this.setState({ record: true }))} />
    }else{//load wp iframe
      beatPlayer =  <iframe src={this.state.url} width="500px" height="166"></iframe>
    }

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

            <div className="card text-white mb-3" key={lyric.Id} style={{ borderColor: 'rgba(137, 196, 244, 1)', backgroundColor: 'rgba(120,194,173,0.9)', width: '500px', margin:'auto' }}>
              <div className="card-header" style={{ whiteSpace: 'pre-wrap', textAlign: "center", fontSize: '18px' }}>{lyric.Votes} Votes written by: {lyric.User.Name}</div>
              <div className="card-body">
                <div>

                  <audio ref={`${lyric.Id}`} id={lyric.Id} onPlay={() => this.playBack()} controls="" style={{ height: '50px', width: '200px' }} src={lyric.S3SignedUrl}></audio>
                </div>
                <ul className='text-white' style={{ whiteSpace: 'pre-wrap', textAlign: "center", fontSize: '18px' }}>{lyric.Lyric}</ul>
                <div></div>
                <button id={lyric.Id} onClick={() => this.vote(lyric.Id)} className="btn btn-warning">vote Up: {lyric.Votes}</button>
                {/* <button id={lyric.Id} onClick={() => this.edit(lyric.Id)} type="button" className="btn btn-secondary ">edit</button> */}
                {
                  lyric.UserId === this.state.currUserId || this.state.isAdmin ?
                    <button id={lyric.Id} onClick={(e) => this.delete(e, lyric.Id)} className="btn btn-secondary">Delete</button>
                    : ''
                }
                <button className="btn btn-circle" style={{ backgroundColor: "#49515f", color: "rgba(120,194,173,0.9)" }} onClick={e => this.playBack(lyric.Id)}><span className="fas fa-play"></span></button>
              </div>
            </div>

            {/* TOP RATED */}
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
        <div  key={lyric.Id}>
          <div className="card border-light mb-3" key={lyric.Id} style={{ opacity: 0.95, width: '500px', margin:'auto', border: '1px solid black', borderRadius: '5px!important' }}>
            <div className="card-header text-muted" style={{ whiteSpace: 'pre-wrap', textAlign: "center", fontSize: '15px' }}>{lyric.Votes} Votes written by: {lyric.User.Name} </div>
            <div className="card-body">
              <div>

                <audio ref={`${lyric.Id}`} id={lyric.Id} onPlay={() => this.playBack()} controls="" style={{ height: '50px', width: '200px' }} src={lyric.S3SignedUrl}></audio>
              </div>
              <ul className='text-muted' style={{ whiteSpace: 'pre-wrap', textAlign: "center", fontSize: '15px' }} >{lyric.Lyric}</ul>
              <div></div>

              <button id={lyric.Id} onClick={() => this.vote(lyric.Id)} className="btn btn-outline-warning text-muted">vote Up: {lyric.Votes}</button>
              {/* <button id={lyric.Id} onClick={() => this.edit(lyric.Id)} type="button" className="btn btn-outline-secondary text-muted">edit</button> */}
              {
                  lyric.UserId === this.state.currUserId || this.state.isAdmin ?
                    <button id={lyric.Id} onClick={(e) => this.delete(e, lyric.Id)} className="btn btn-secondary">Delete</button>
                    : ''
                }              <button className="btn btn-circle" style={{ backgroundColor: "#49515f", color: "rgba(120,194,173,0.9)" }} onClick={e => this.playBack(lyric.Id)}><span className="fas fa-play"></span></button>
            </div>
          </div>
        </div>

      )
    })

    return (
      <React.Fragment>
        {/* <h1 style={{ textAlign: 'center', fontSize: '55px', color: 'white' }}>LYRICAL OG</h1> */}
        <div style= {{paddingTop:'5%'}}>
        <h1 className="text-white" style={{ textAlign: 'center'}}>Lyrics</h1>
        <div className="row" >
          <div className="col-4 offset-1" >

            {/* <label className='text-white ' style={{ textAlign: 'center', fontSize: '20px' }}><div style={{ textAlign: 'center', fontSize: '20px' }}>Load Soundcloud or Youtube</div></label>
            <div className='input-group' >
              <input className="form-control" value={this.state.inputUrl} onChange={this.handleChange} style={{ backgroundColor: 'rgba(73,81,95,0.5)' }} name="inputUrl" />
              <div className='input-group-append'>
                <button className="btn btn-primary" onClick={() => this.setUrl()}>Load</button>
              </div>
            </div> */}

            {/* MEDIA PLAYER */}
            <h2 className="text-white" style={{ textAlign: 'left'}}>{this.state.title} - {this.state.producer}</h2>

            {beatPlayer}

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
                  <button className="btn btn-outline-primary"  onClick={() => this.playBack()}><span className="fas fa-play"></span></button>
                  <div style={{marginLeft:'15%'}}>
                  <button className="btn btn-primary text-grey" style={{ float:'right' }} onClick={this.submit}>Submit</button>
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

          <Modal animation={false} backdropStyle={{ opacity: 0.5 }} style={{ backgroundColor: (0, 0, 0, 0.2), top: "25%" }} show={this.state.show} onHide={this.handleClose} >
            <Modal.Header >
              <Modal.Title id='ModalHeader'>Edit Lyrics </Modal.Title>
              <div>password: <input className={this.state.editData.Password === this.state.passwordModal ? "form-control is-valid" : "form-control is-invalid"}
                name="passwordModal" type="password" value={this.state.passwordModal} onChange={this.handleChange}></input>
                {/* <button>checkPW</button> */}
                <HelpBlock>{this.state.editData.Password === this.state.passwordModal ? "" : "enter valid password"}</HelpBlock>
              </div>
              <p>{this.state.editData.Id},{this.state.editData.Name}</p>
            </Modal.Header>
            <Modal.Body>
              <div className="container">
                <div className="row">
                  <div style={{ padding: "0px 20px" }}>
                    <textarea
                      className="form-control"
                      style={{
                        margin: 'auto',
                        backgroundColor: 'rgba(73,81,95,0.5)', color: "white", borderColor: 'rgba(120,194,173,0.9)', whiteSpace: 'pre-wrap',
                        textAlign: 'center', width: '450px', height: '200px',
                        fontSize: '15px'
                      }} disabled={this.state.editData.Password === this.state.passwordModal ? false : true} name="lyricModal" value={this.state.lyricModal} onChange={this.handleChange}></textarea>
                  </div>
                  <div style={{ margin: 'auto' }}>
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer >
              <button id={this.state.editId} className='btn btn-primary' disabled={this.state.editData.Password === this.state.passwordModal ? false : true} onClick={e => this.submit(e)}> Edit </button>
              <button className='btn btn-default' onClick={() => this.handleClose()}> Close </button>
            </Modal.Footer >
          </Modal>

        </div>
        </div>
      </React.Fragment>
    );
  }
}
const mapStateToProps = (state,props)=> {
  return{
    user:state.user
  }
  
}
export default withRouter(connect(mapStateToProps)(LyricsForm));
