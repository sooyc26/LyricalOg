import React from 'react';
import * as userService from '../services/userService'
import {connect } from 'react-redux'
import {updateUser, authUser} from '../actions/user-actions'
import * as jwt_decode from "jwt-decode";

class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
            email: '',
            regisEmail: '',
            password: '',
            confirmPassword: ''

            , RegisterModal: false
            ,loginAlert:''
        }
        this.handleChange = this.handleChange.bind(this)
        this.submit = this.submit.bind(this)
        this.toggleLoginRegis = this.toggleLoginRegis.bind(this)
        this.onUpdateUser = this.onUpdateUser.bind(this)
    }

    onUpdateUser(name){

        this.props.onUpdateUser(name)
    
      }

    handleChange(e) {
        this.setState({ [e.target.id]: e.target.value })
    }

    toggleLoginRegis(e) {
        e.preventDefault();
        this.setState({ RegisterModal: !this.state.RegisterModal })
    }

    loginVerify = ()=>{
        if(this.state.email===''){
            this.setState({loginAlert:"Please Enter valid email."})
            return false
        }
        if(this.state.password===""){
            this.setState({loginAlert:"Please Enter a valid password."})
            return false
        }
        return true
    }

    submit(e) {
        e.preventDefault();        
        if(this.loginVerify())
        //login
            var data = {
                Email: this.state.email,
                Password: this.state.password
            }
            userService.login(data)
                .then(response => {
                    if (response !== null) {
                        //if not authenticated, resend validation email page
                        localStorage.setItem('loginToken', response)
                        this.props.onUpdateUser(JSON.parse(jwt_decode(response).currUser))
                        this.props.onAuthUser()
                        this.props.history.push("/beatsList");
                    } 
                })
                .catch(response =>{              
                    this.setState({loginAlert:response.response.data})
                    
                })
    }


    render() {
        return (
            <React.Fragment>
                <header className="App-header" style={{ opacity: 0.8 }}>
                    <div style={{ lineHeight: '200px' }}>
                        <h1 className="text-primary" style={{ paddingTop: "40px", fontSize: "30px" }}>Lyrical OG</h1>
                    </div>
                    <h3 className="text-warning">Login</h3>
                    <form style={{ width: '25%' }}>
                        <div className="form-group">
                            <label >Email Address</label>
                            <input type="email" value={this.state.email} onChange={this.handleChange} className="form-control" id="email" placeholder="Enter email" />
                        </div>
                        <div className="form-group">
                            <label >Password</label>
                            <input type="password" value={this.state.password} onChange={this.handleChange} className="form-control" id="password" placeholder="Password" />
                        </div>
                        <div>

                            {this.state.loginAlert === "" ? "" :
                                <div className="alert alert-dismissible alert-danger lead">
                                    <button type="button" className="close" data-dismiss="alert" onClick={() => this.setState({ loginAlert: "" })}>&times;</button>
                                    {this.state.loginAlert}
                                </div>}
                        </div>

                        <button onClick={(e) => this.submit(e)} className="btn btn-outline-primary">Login</button>
                        <button type="button" onClick={() => this.props.history.push("/Register")} className="btn btn-outline-warning">Register</button>
                        <a href="/passwordResetRequest" className="btn btn-outline-secondary">forgot password?</a>
                    </form>

                </header>

            </React.Fragment>
        )
    }
}
const mapStateToProps = state=> ({
      user:state.user,
      authed:state.authed 
});

const mapActionsToProps = {
    onUpdateUser:updateUser,
    onAuthUser: authUser
}
export default (connect(mapStateToProps,mapActionsToProps)(Login));