import React from 'react'
import * as userService from '../services/userService'
import * as jwt_decode from "jwt-decode";
import moment from '../../node_modules/moment'
import { withRouter } from 'react-router-dom';

class UserProfile extends React.Component{

    constructor(props){
        super(props)

        this.state = {
            name: '',
            email: '',
            password: '',
            dateCreated:'',
            dateModified:'',
            emailVerified:'',
            isAdmin:'',
            lyricsList:[],
            beatList:[],

        }
    }

    componentDidMount=()=>{
        this.getUserProfile()
    }

    getUserProfile=()=>{
        var userData = JSON.parse(jwt_decode(localStorage.getItem('loginToken')).currUser)
        
        var id = this.props.match.params.id ? this.props.match.params.id : 0

        userService.getUserProfile(id)
        .then(r=>{
            
            this.setState({
                id:r.Id,
                name : r.Name,
                email:r.Email,
                password:r.Password,
                dateCreated:r.DateCreated,
                dateModified:r.DateModified,
                emailVerified:r.EmailVerified,
                isAdmin:r.IsAdmin,
                lyricsList:r.UserLyricsList,
                beatList:r.UserBeatsList               
            })
        })

    }    

    render(){
        const { match, location, history } = this.props

        const mapLyrics = this.state.lyricsList.map((l,i)=>{
            return(
                <tr key={l.Id} className="text-warning" >
                <td>{l.Producer}</td>
                <td > <a className="text-warning" href={"/lyricsForm/" + l.BeatId}>{l.Title}</a></td>
                <td>{moment(l.UploadDate).format('MM/DD/YYYY')}</td>

                {/* {this.state.isAdmin || this.state.currUserId === b.UploaderId ?
                    <td>
                        <input type="checkbox" className="custom-checkbox " defaultChecked={b.Visible} onClick={() => this.toggleVisibility(b.Id)} ></input>
                    </td> : ''
                } */}
            </tr>
            )
        })

        const mapBeats = this.state.beatList.map((b,i)=>{
            return(
                <tr key={b.Id} className="text-primary" >
                <td>{b.Producer}</td>
                <td > <a href={"/lyricsForm/" + b.Id}>{b.Title}</a></td>
                <td>{moment(b.UploadDate).format('MM/DD/YYYY')}</td>

                {/* {this.state.isAdmin || this.state.currUserId === b.UploaderId ?
                    <td>
                        <input type="checkbox" className="custom-checkbox " defaultChecked={b.Visible} onClick={() => this.toggleVisibility(b.Id)} ></input>
                    </td> : ''
                } */}
            </tr>
            )
        })
        return (
            <React.Fragment>
                <div style={{ paddingTop: '5%' }}>

                    <div className="row">
                        <div className="col-6 ">
                            <div className="container">

                                <div class="jumbotron" style={{ width: '90%' }}>
                                    <h1 class="display-6">Name: {this.state.name}</h1>
                                    <p class="lead">Email: {this.state.email}</p>
                                    <div>Uploaded Lyrics Count: {(this.state.lyricsList).length}</div>
                                    <div>Uploaded Beats Count: {(this.state.beatList).length}</div>

                                    <hr class="my-4" />
                                    <p>Member Since: {moment(this.state.dateCreated).format('MM/DD/YYYY')}</p>                                    
                                    <p class="lead">
                                        <a class="btn btn-primary btn-lg" href="#" role="button">Edit</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 ">
                            <div className="container">
                                <h3 className="text-warning" style={{ textAlign: 'center' }}> Lyrics List</h3>
                                <table className="table table-hover" style={{ textAlign: 'center' }}>
                                    <thead>
                                        <tr >
                                            <th scope="col">Producer</th>
                                            <th scope="col">Title</th>

                                            <th scope="col">Upload Date</th>
                                            {/* <th> Visibility</th> */}
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {mapLyrics}

                                    </tbody>
                                </table>
                            </div>
                            <div className="container">
                                <h3 className="text-primary" style={{ textAlign: 'center' }}> Beats List</h3>
                                <table className="table table-hover" style={{ textAlign: 'center' }}>
                                    <thead>
                                        <tr >
                                            <th scope="col">Producer</th>
                                            <th scope="col">Title</th>

                                            <th scope="col">Upload Date</th>
                                            {/* <th> Visibility</th> */}
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {mapBeats}

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </React.Fragment>
        )
    }
}
export default withRouter(UserProfile)