import React from 'react';
import * as userService from '../services/userService'
import {connect } from 'react-redux'
import {updateUser, authUser} from '../actions/user-actions'

class Register extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
            email: '',
            regisEmail: '',
            password: '',
            confirmPassword: ''

            , RegisterModal: false
            ,registerAlert:''
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

    registerValidate =()=>{
        if(this.state.name===''){
            this.setState({registerAlert:"Please enter a name."})
            return false
        }else if(this.state.regisEmail===''){
            this.setState({registerAlert:"Please enter an email."})
            return false
        }else if(this.state.password===''){
            this.setState({registerAlert:"Please enter a valid password."})
            return false
        }else if(this.state.password.length<8){
            this.setState({registerAlert:"Password has to be at least 8 characters."})
            return false
        }else if(this.state.password !==this.state.confirmPassword){
            this.setState({registerAlert:"The password does not match."})
            return false
        }
        return true

    }

    submit(e) {
        e.preventDefault();
        if(this.registerValidate()){

            var data = {
                Name: this.state.name,
                Email: this.state.regisEmail,
                Password: this.state.password
            }
            userService.create(data)
            .then(response=>{
                
                if (window.confirm('Verification email sent! Please check your email.')) {
                    this.props.history.push('/')
                }
            })
            .catch(r =>{
                debugger
                this.setState({registerAlert:r.response.data})
            })
        }
    }        

    render() {
        return (
            <React.Fragment>
                <header className="App-header" style={{ opacity: 0.8 }}>
                    <div style={{ lineHeight: '200px' }}>
                        <h1 className="text-primary" style={{ paddingTop: "40px", fontSize: "30px" }}>Lyrical OG</h1>
                    </div>
                    <h3 className="text-warning">Register</h3>
                    <form style={{width:'25%'}}>
                        <div className="form-group">
                            <label>Name</label>
                            <input value={this.state.name} onChange={this.handleChange} className="form-control" id="name" aria-describedby="emailHelp" placeholder="Enter name" />
                        </div>
                        <div className="form-group">
                            <label >Email address</label>
                            <input type="email" value={this.state.regisEmail} onChange={this.handleChange} className="form-control" id="regisEmail" aria-describedby="emailHelp" placeholder="Enter email" />
                        </div>
                        <div className="form-group">
                            <label >Password</label>
                            <input type="password" value={this.state.password} onChange={this.handleChange} className="form-control" id="password" placeholder="Password" />
                        </div>
                        <div className="form-group">
                            <label >Confirm Password</label>
                            <input type="password" value={this.state.confirmPassword} onChange={this.handleChange} className="form-control" id="confirmPassword" placeholder="Password" />
                        </div>
                        {this.state.registerAlert === '' ? 
                        "" :
                         <div className="alert alert-dismissible alert-danger lead">
                                {this.state.registerAlert}
                                <button type="button" className="close" data-dismiss="alert" onClick={() => this.setState({ registerAlert: '' })}>&times;</button>
                            </div>
                        }
                        <button onClick={(e) => this.submit(e)} className="btn btn-outline-primary">Register</button>
                        <button onClick={() => this.props.history.push("/Login")} className="btn btn-outline-secondary">Login?</button>
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
export default connect(mapStateToProps,mapActionsToProps)(Register);