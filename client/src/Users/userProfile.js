import React from 'react'
import * as userService from '../services/userService'
import moment from '../../node_modules/moment'
import { withRouter } from 'react-router';

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

            emailEdit:'',
            nameEdit:'',
            isEdit:false,
            
            resetPassword:false,
            newPassword:'',
            currentPassword:'',
            confirmPassword:'',
            passwordAlert:''
        }
    }

    componentDidMount=()=>{
        this.getUserProfile()
    }

    handleChange =e=>{
        this.setState({[e.target.name]:[e.target.value]})
    }
    getUserProfile=()=>{        
        var id = this.props.match.params.id ? this.props.match.params.id : 0

        userService.getUserProfile(id)
        .then(r=>{
            this.setState({
                id:r.Id,
                name : r.Name,
                nameEdit:r.Name,
                emailEdit:r.Email,
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

    changePassword=()=>{
       
        const data = {
            Id:this.state.id,
            Password:this.state.currentPassword,
            NewPassword:this.state.newPassword
        }
        if(this.changePasswordVerify()){
            userService.updatePassword(data)
        }
    }
    
    togglePassword = () => {
        if (this.state.resetPassword)
            this.setState({ resetPassword: false })
        else
            this.setState({ resetPassword: true })
    }

    toggleEdit = () => {
        if (this.state.isEdit) this.setState({ isEdit: false })
        else this.setState({ isEdit: true })
    }

    changePasswordVerify = () =>{
        if(this.state.currentPassword==null ||this.state.newPassword==null||this.state.confirmPassword==null){
            this.setState({passwordAlert:"Please type current and new password"})
            return false
        }
        else if(this.state.password !==this.state.currentPassword ){//"Please enter current password"
        this.setState({passwordAlert:"Current Password does not match"})
            return false
        }
        else if(this.state.newPassword.length <8){
            this.setState({passwordAlert:"Password has to be at least 8 characters"})
            return false  
        }
        else if(this.state.newPassword !==this.state.confirmPassword){//"new password does not match"
            this.setState({ passwordAlert: "new and confirm password does not match" })
            return false
        }

        return true;
    }

    submit =()=>{
        //reset password
        console.log(this.state.nameEdit)
        const data = {
            Name:this.state.nameEdit[0],// idk why it set as array, 
            Email:this.state.emailEdit
        }
        userService.update(this.state.id,data)
        .then(resp=>{
            if(resp){
                this.setState({isEdit:false})
                this.getUserProfile()
            }else{
                window.alert("email already exists, try different email")
            }
        })

    }
    render(){

        const mapLyrics = this.state.lyricsList.map((l,i)=>{
            return(
                <tr key={l.Id} className="text-warning" onClick={()=>window.location='/lyricsForm/'+ l.BeatId}>
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
                <tr key={b.Id} className="text-primary" onClick={()=>window.location='/lyricsForm/'+ b.Id}>
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

        const displayMode =
            <div className="jumbotron" style={{ width: '85%' }}>
                <h1 className="display-6">Name: {this.state.name}</h1>
                <p className="lead">Email: {this.state.email}</p>
                <div>Uploaded Lyrics Count: {(this.state.lyricsList).length}</div>
                <div>Uploaded Beats Count: {(this.state.beatList).length}</div>

                <hr className="my-4" />
                <p>Member Since: {moment(this.state.dateCreated).format('MM/DD/YYYY')}</p>
                <p className="lead">
                    <button className="btn btn-primary" onClick={this.toggleEdit}>Edit</button>
                    <button className="btn btn-danger" onClick={this.togglePassword}>Change Password</button>

                </p>
                {this.state.resetPassword ?
                    <div>
                        <hr className="my-4" />
                        <p className="">Current Password: </p>
                        <input type="password" className="form-control" name="currentPassword" onChange={this.handleChange} value={this.state.currentPassword} />

                        <p className="lead">New Password </p>
                        <input type="password" className="form-control" name="newPassword" onChange={this.handleChange} value={this.state.newPassword} />

                        <p className="lead">Confirm Password </p>
                        <input type="password" className="form-control" name="confirmPassword" onChange={this.handleChange} value={this.state.confirmPassword} />
                        <p className="lead"></p>
                        {this.state.passwordAlert == '' ? 
                        "" :
                         <div className="alert alert-dismissible alert-danger">
                                <button type="button" className="close" data-dismiss="alert" onClick={() => this.setState({ passwordAlert: '' })}>&times;</button>
                                {this.state.passwordAlert}
                            </div>
                        }
                        <button className="btn btn-primary" onClick={this.changePassword}>Update Password</button>
                    </div> : ""}
            </div>
        return (
            <React.Fragment>
                <div style={{ paddingTop: '5%' }}>

                    <div className="row">
                        <div className="col-6 ">
                            <div className="container">
                                {this.state.isEdit ?
                                    <div className="jumbotron " style={{ width: '85%' }}>

                                        <p className="">Name: </p>
                                        <input className="form-control" name="nameEdit" onChange={this.handleChange} value={this.state.nameEdit}/>

                                        <p className="lead">Email: </p>
                                        <input className="form-control" name="emailEdit" onChange={this.handleChange} value={this.state.emailEdit}/>

                                        <div>Uploaded Lyrics Count: {(this.state.lyricsList).length}</div>
                                        <div>Uploaded Beats Count: {(this.state.beatList).length}</div>

                                        <hr className="my-4" />
                                        <p>Member Since: {moment(this.state.dateCreated).format('MM/DD/YYYY')}</p>
                                        <p className="lead">
                                            <button className="btn btn-primary" onClick={this.submit}>Save</button>
                                            <button className="btn btn-warning" onClick={this.toggleEdit}>Cancel</button>

                                        </p>

                                    </div> : displayMode}
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