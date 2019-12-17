import React from 'react'
import * as beatService from '../services/beatService'
import * as recordService from '../services/recordService'
import moment from '../../node_modules/moment'
import { Modal } from 'react-bootstrap'
import {connect } from 'react-redux'

class BeatsList extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            beats: []

            , id: 0
            , title: ''
            , producer: ''
            , description: ''
            , file: ''

            , show: false
            , valid: true
            , edit: false
            , isAdmin: false
            , currUserId: 0

        }
        this.getAll = this.getAll.bind(this)
        this.edit = this.edit.bind(this)
    }
    componentDidMount() {
        var userData = this.props.user

        if(!userData.IsVerified){
            window.alert("Your account is not yet validated. Please validate your account in User Profile Page to have write access.")
        }
        this.setState({
            isAdmin: userData.IsAdmin,
            currUserId: userData.UserId
        })
        this.getAll();
    }

    getAll() {

        beatService.getAll()
            .then(response => {
                this.setState({ beats: response })
            })
    }

    delete = id => {
        if (window.confirm('Delete the item?')) {
            beatService.deleteById(id)
                .then(() => this.getAll())
        }
    }

    edit = id => {
        this.handleShow()
        beatService.getById(id)
            .then(response => {
                this.setState({
                    edit: true,
                    id: response.Id,
                    producer: response.Producer,
                    title: response.Title,
                    description: response.Description,
                    vibe: response.Vibe,
                })
            })
    }

    toggleVisibility = id => {

        beatService.toggleVisibility(id)
            .then(() => this.getAll())

    }

    submit = () => {
        let beat = this.beatInput.files[0];
        let img = this.imgInput.files[0];

        const data = {
            Id: this.state.id,
            Producer: this.state.producer,
            UploaderId: this.state.currUserId,
            Title: this.state.title,
            LyricsCount: this.state.lyricsCount,
            Description: this.state.description,
            Vibe: this.state.vibe,
            BeatFileType: beat ? beat.type : null,
            ImgFileType: img ? img.type : null

        }
        if (this.state.edit) {//edit mode
            beatService.update(data)
                .then(() => {
                    this.getAll()
                    this.handleClose()
                    this.clearInput()
                })
        } else {//create

            beatService.create(data)
                .then(response => {

                    recordService.uploadFile(response.BeatSignedUrl, beat)
                        .then(() => {
                            if (img) recordService.uploadFile(response.ImgSignedUrl, img)
                        })
                        .then(() => {
                            this.getAll()
                            this.handleClose()
                        })

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
        this.submitCheck()
        this.setState({ show: true });
    }

    clearInput = () => {
        this.setState({
            edit: false,
            producer: '',
            title: '',
            description: '',
            vibe: '',
        })
    }

    submitCheck = () => {
        if (this.state.producer !== '' && this.state.title !== '' && this.state.vibe &&
            (this.state.description !== '' || this.beatInput.files[0])) {
            this.setState({ valid: false })
        }
        else {
            this.setState({ valid: true })
        }
    }

    uploadModal = () => {
        this.handleShow()
        this.clearInput()
    }
    render() {

        /* map beats */

        const displayBeats = this.state.beats.map((b, i) => {
            if (this.state.isAdmin || b.Visible) {
                return (

                    <tr key={b.Id} className={b.Visible ? "text-primary" : "text-grey"} >
                        <td>{b.Producer}</td>
                        <td > {b.Visible ? <a href={"/lyricsForm/" + b.Id}>{b.Title}</a> : b.Title}</td>
                        <td>{b.Vibe}</td>
                        <td>{b.LyricsCount}</td>
                        <td>{moment(b.DateCreated).format('MM/DD/YYYY')}</td>
                        {this.state.isAdmin || this.state.currUserId === b.UploaderId ?
                            <td>
                                <span onClick={() => this.edit(b.Id)} className="fas fa-edit"></span>
                                <span onClick={() => this.delete(b.Id)} className="fas fa-trash-alt"></span>

                            </td> : ''
                        }
                        
                        {this.state.isAdmin || this.state.currUserId === b.UploaderId ?
                            <td>
                                <input type="checkbox" className="custom-checkbox " defaultChecked={b.Visible} onClick={() => this.toggleVisibility(b.Id)} ></input>
                            </td> : ''
                        }
                    </tr>
                )
            }
            return null
        })
        return (
            <React.Fragment>

                <div style={{ paddingTop: '5%' }}>
                    <h1 className="text-white" style={{ textAlign: 'center' }}>Beats</h1>
                    <div style={{ float: 'right', paddingRight: '2%' }} >
                        {this.props.user.IsVerified ?
                            <button type="button" className="btn btn-outline-warning" onClick={this.uploadModal}>upload</button>
                            : null
                        }

                    </div>

                    <table className="table table-hover" style={{ textAlign: 'center' }}>
                        <thead>
                            <tr >
                                <th scope="col">Producer</th>
                                <th scope="col">Title</th>
                                <th scope="col">Vibe</th>
                                <th scope="col"># of Lyrics</th>
                                <th scope="col">Upload Date</th>
                                <th scope="col">Action</th>
                                <th> Visibility</th>
                            </tr>
                        </thead>
                        <tbody>

                            {displayBeats}

                        </tbody>
                    </table>
                </div>
                <Modal animation={false} backdropStyle={{ opacity: 0.5 }} style={{ position: "fixed", backgroundColor: (0, 0, 0, 0.2), top: "10%" }} show={this.state.show} onHide={this.handleClose} >
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
                  <input name="producer" className="form-control" value={this.state.producer} onChange={this.handleChange}></input>
                                    </div>
                                    <div>Vibe:
                  <input name="vibe" className="form-control" value={this.state.vibe} onChange={this.handleChange}></input>
                                    </div>
                                    <div>Description:
                  <textarea name="description" style={{ height: '80px', whiteSpace: 'pre-wrap' }} className="form-control" value={this.state.description} onChange={this.handleChange}></textarea>
                                    </div>
                                    <div>Image Upload:
              <input type="file" name="image" className="form-control" ref={(ref) => { this.imgInput = ref; }} onChange={this.handleChange}></input>

                                    </div>
                                    <div>Beat Upload:
                  <input type="file" name="audio" className="form-control" ref={(ref) => { this.beatInput = ref; }} onChange={this.handleChange}></input>
                                    </div>
                                </div>
                                <div style={{ margin: 'auto' }}>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer >
                        <button className='btn btn-primary' disabled={this.state.valid} onClick={e => this.submit(e)}> {this.state.edit ? "Update" : "Upload"} </button>
                        <button className='btn btn-secondary' onClick={() => this.handleClose()}> Close </button>
                    </Modal.Footer >
                </Modal>
            </React.Fragment>
        )
    }
}

const mapStateToProps = state=> ({
    user:state.user,
});
export default (connect(mapStateToProps)(BeatsList));