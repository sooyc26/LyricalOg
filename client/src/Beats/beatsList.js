import React from 'react'
import * as beatService from '../services/beatService'
import * as recordService from '../services/recordService'
import moment from '../../node_modules/moment'
import { Modal } from 'react-bootstrap'
import * as jwt_decode from "jwt-decode";

export default class BeatsList extends React.Component{

    constructor(props){
        super(props)

        this.state={
            beats:[]

            ,id:0
            ,title:''
            ,producer:''
            ,beatUrl:''
            ,file:''

            ,show:false
            ,valid:true
            ,edit:false
            ,isAdmin:false
            ,currUserId:0

        }
        this.getAll=this.getAll.bind(this)
        this.edit = this.edit.bind(this)
    }
    componentDidMount(){
        var userData =JSON.parse(jwt_decode(localStorage.getItem('loginToken')).currUser)
        
        this.setState({
            isAdmin:userData.IsAdmin,
            currUserId:userData.UserId
        })
        this.getAll();
    }

    getAll(){
        
        beatService.getAll()
        .then(response=>{          
            this.setState({beats:response})
        })
    }

    delete =id=>{
        if (window.confirm('Delete the item?')) {
            beatService.deleteById(id)
            .then(() => this.getAll())
          }
    }

    edit = id => {
        this.handleShow()
        beatService.getById(id)
        .then(response=>{       
            this.setState({
                edit:true,
                id:response.Id,
                producer:response.Producer,
                title:response.Title,
                beatUrl:response.BeatUrl,
                vibe:response.Vibe,               
            })
        })
    }
    submit= ()=>{
        let file = this.uploadInput.files[0];

        const data = {
            Id:this.state.id,
            Producer:this.state.producer,
            UploaderId:this.state.currUserId,
            Title:this.state.title,
            LyricsCount:this.state.lyricsCount,
            BeatUrl:this.state.beatUrl,
            Vibe:this.state.vibe,
            ContentType:file ? file.type:''
        }
        if(this.state.edit){//edit mode
            beatService.update(data)
            .then(() => {
                this.getAll()
                this.handleClose()
                this.clearInput()
              })        
            }else{//create
            
            beatService.create(data)
            .then(response => {
                
                if(file) recordService.uploadFile(response, file)
              })
              .then(() => {
                  this.getAll()
                  this.handleClose()
                })
        }
    }

    handleChange = e => {
        this.setState({ [e.target.name]: e.target.value })
        this.submitCheck()
    }

    handleClose = e => {
        this.setState({ show: false, passwordModal: '' });
    }

    handleShow = e => {
        this.setState({ show: true });
    }

    clearInput =()=>{
        this.setState({
            edit:false,
            producer:'',
            title:'',
            beatUrl:'',
            vibe:'',   
        })
    }
    submitCheck = () => {

        if (this.state.producer !== '' && this.state.title !== '' && this.state.vibe &&
            (this.state.beatUrl !== '' || this.uploadInput.files[0])) {
            this.setState({ valid: false })
        }
        else {
            this.setState({ valid: true })
        }
    }

    uploadModal=()=>{
        this.handleShow()
        this.clearInput()
    }
    render() {
        
                /* map beats */
                
        const displayBeats = this.state.beats.map((b, i) => {
            return (
                <tr key={b.Id} className={i % 2 === 0 ? "text-primary" : "table-active text-primary"} >
                    <td>{b.Producer}</td>
                    <td > <a href={"/lyricsForm/"+b.Id}>{b.Title}</a></td>
                    <td>{b.Vibe}</td>
                    <td>{b.LyricsCount}</td>
                    <td>{moment(b.DateCreated).format('MM/DD/YYYY')}</td>
                    {this.state.isAdmin || this.state.currUserId === b.UploaderId ?
                        <td>
                            <span onClick={() => this.edit(b.Id)} className="fas fa-edit"></span>
                            <span onClick={() => this.delete(b.Id)} className="fas fa-trash-alt"></span>
                        </td> : ''
                    }
                </tr>
            )

        })
        return (
            <React.Fragment>

                <div style= {{paddingTop:'5%'}}>
                <h1 className="text-white"  style={{ textAlign: 'center'}}>Beats</h1>
                <div style={{ float: 'right',paddingRight:'2%'}} >
                <button type="button" className="btn btn-outline-warning" onClick={this.uploadModal}>upload</button>

                </div>

                <table className="table table-hover" style={{ textAlign: 'center'}}>
                        <thead>
                            <tr >
                                <th scope="col">Producer</th>
                                <th scope="col">Title</th>
                                <th scope="col">Vibe</th>
                                <th scope="col"># of Lyrics</th>
                                <th scope="col">Upload Date</th>
                                <th scope="col">Action</th>

                            </tr>
                        </thead>
                    <tbody>
                        
                        {displayBeats}
                        
                        {/* <tr className="table-dark">
                            <th scope="row">Dark</th>
                            <td>Column content</td>
                            <td>Column content</td>
                            <td>Column content</td>
                        </tr> */}
                    </tbody>
                </table>
                </div>
                <Modal animation={false} backdropStyle={{ opacity: 0.5 }} style={{ backgroundColor: (0, 0, 0, 0.2), top: "25%" }} show={this.state.show} onHide={this.handleClose} >
            <Modal.Header >
              <Modal.Title id='ModalHeader'>Beat Upload </Modal.Title>
           
              </Modal.Header>
            <Modal.Body>
              <div className="container ">
                <div >
                  <div style={{ padding: "0px 20px" }}>
                  <div>Title:
                  <input name="title" className="form-control" value={this.state.title} onChange={this.handleChange}></input>
              </div>
              <div>Producer:
                  <input name="producer"  className="form-control" value={this.state.producer} onChange={this.handleChange}></input>
              </div> 
              <div>Vibe:
                  <input name="vibe"  className="form-control" value={this.state.vibe} onChange={this.handleChange}></input>
              </div> 
              <div>Url:
                  <input name="beatUrl" className="form-control" value={this.state.beatUrl} onChange={this.handleChange}></input>
              </div>
              <div>Or</div>
              <div>File Upload:
                  <input type="file" name="file" className="form-control" ref={(ref) => { this.uploadInput = ref; }} onChange={this.handleChange}></input>
              </div>
                  </div>
                  <div style={{ margin: 'auto' }}>
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer >
              <button className='btn btn-primary' disabled={this.state.valid} onClick={e => this.submit(e)}> {this.state.edit? "Update":"Upload"} </button>
              <button className='btn btn-default' onClick={() => this.handleClose()}> Close </button>
            </Modal.Footer >
          </Modal>
            </React.Fragment>
        )
    }
}