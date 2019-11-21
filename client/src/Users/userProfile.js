import React from 'react'
import * as userService from '../services/userService'
import * as jwt_decode from "jwt-decode";
import moment from '../../node_modules/moment'

export default class UserProfile extends React.Component{

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
        
        userService.getUserProfile(userData.UserId)
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
                                    <h1 class="display-3">{this.state.name}</h1>
                                    <p class="lead">{this.state.email}</p>
                                    <hr class="my-4" />
                                    <p>It uses utility classes for typography and spacing to space content out within the larger container.</p>
                                    <p class="lead">
                                        <a class="btn btn-primary btn-lg" href="#" role="button">Learn more</a>
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