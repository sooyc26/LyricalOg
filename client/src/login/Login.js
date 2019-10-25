import React from 'react';
import * as userService from '../services/userService'
import {connect } from 'react-redux'
import {updateUser, authUser} from '../actions/userActions'

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
            ,wrongInput:false
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
        this.setState({ [e.target.id]: e.target.value,wrongInput:false })
    }

    toggleLoginRegis(e) {
        e.preventDefault();
        this.setState({ RegisterModal: !this.state.RegisterModal })
    }

    submit(e) {
        e.preventDefault();
        var data = {
            Name: this.state.name,
            Email: this.state.email,
            Password: this.state.password
        }

        if (this.state.RegisterModal) {
            userService.create(data)
        } else {
            userService.login(data)
                .then(response => {
                    if (response.SessionToken !== null) {

                        localStorage.setItem('loginToken', JSON.stringify(response))
                        this.props.onUpdateUser(response)
                        this.props.onAuthUser()
                        this.props.history.push("/beatsList");
                    } else {
                        this.setState({ wrongInput: true })
                    }
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
                    {this.state.RegisterModal ?
                        <form>
                            <header>Register</header>
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
                                <input type="password" value={this.state.regisPassword} onChange={this.handleChange} className="form-control" id="regisPassword" placeholder="Password" />
                            </div>
                            <div className="form-group">
                                <label >Confirm Password</label>
                                <input type="password" value={this.state.confirmPassword} onChange={this.handleChange} className="form-control" id="confirmPassword" placeholder="Password" />
                            </div>
                            <button onClick={(e) => this.submit(e)} className="btn btn-primary">Register</button>
                            <button onClick={(e) => this.toggleLoginRegis(e)} className="btn btn-outline-secondary">Login?</button>
                        </form>

                        :
                        <form>
                            <header>Login</header>
                            <div className="form-group">
                                <label >Email Address</label>
                                <input type="email" value={this.state.email} onChange={this.handleChange} className="form-control" id="email" placeholder="Enter email" />
                            </div>
                            <div className="form-group">
                                <label >Password</label>
                                <input type="password" value={this.state.password} onChange={this.handleChange} className="form-control" id="password" placeholder="Password" />
                            </div>
                            <div>

                                {this.state.wrongInput ?
                                    <div className="alert alert-dismissible alert-danger">
                                        <button type="button" className="close" data-dismiss="alert" onClick={()=>this.setState({wrongInput:false})}>&times;</button>
                                         <a href="#" className="alert-link"></a> Wrong email or password.
                            </div> : ''}
                            </div>

                            <button onClick={(e) => this.submit(e)} className="btn btn-primary">Login</button>
                            <button onClick={(e) => this.toggleLoginRegis(e)} className="btn btn-secondary">Register</button>
                            <button onClick={() => this.password()} className="btn btn-outline-secondary">forgot password?</button>
                        </form>
                    }
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
export default connect(mapStateToProps,mapActionsToProps)(Login);