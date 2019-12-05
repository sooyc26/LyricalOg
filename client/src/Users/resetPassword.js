import React from 'react'
import * as userService from '../services/userService'
export default class ResetPassword extends React.Component{

    constructor(props){
        super (props)
        this.state={
            email:'',
            resetKey:'',
            password:'',
            passwordConfirm:''
            ,unExpired:false

        }
    }

    componentDidMount=()=>{
        this.checkUniqueKey()
    }
    checkUniqueKey =()=>{
        var key = this.props.match.params.key ? this.props.match.params.key : 0

        userService.checkExpireDate(key)
        .then(resp =>{
            this.setState({
                id:resp.Id,
                unExpired:resp.ExpireBoolean,
                message:resp.ReturnMessage
            })
        })
    }

    handleChange=(e)=> {
        this.setState({ [e.target.id]: e.target.value,wrongInput:false })
    }
    submit=e=>{
        e.preventDefault()
        if(this.validatePassword){
            const data = {
                Id:this.state.id,
                Password:this.state.password
            }
            userService.passwordReset(data)
            .then(resp=>{
                if(window.confirm("password reset!")){
                    this .props.history.push("/login")

                }
            })

        }
    }

    validatePassword =()=>{
        if(this.state.password ===this.state.passwordConfirm){
            return true
        }

        return false
    }
    render(){
        return(
            <React.Fragment>
                {this.state.unExpired?
                <div>
                <header className="App-header" style={{ opacity: 0.8 }}>
                    <div style={{ lineHeight: '200px' }}>
                        <h1 className="text-primary" style={{ paddingTop: "40px", fontSize: "30px" }}>Lyrical OG</h1>
                    </div>
                        <form>
                            <header>Password Reset</header>
                            <div className="form-group">
                                <label >New Password</label>
                                <input type="password" value={this.state.password} onChange={this.handleChange} className="form-control" id="password" placeholder="Enter password" />
                            </div>
                            <div>
                            <div className="form-group">
                                <label >Confirm New Password</label>
                                <input type="password" value={this.state.passwordConfirm} onChange={this.handleChange} className="form-control" id="passwordConfirm" placeholder="Enter password" />
                            </div>
                            </div>

                            <button onClick={(e) => this.submit(e)} className="btn btn-primary">Update Password</button>
                        </form>
                    
                </header>
                </div>:
                <div  style={{lineHeight: '200px', paddingTop: "40px", fontSize: "30px" }}> Checking key expiration, please wait</div>}
            </React.Fragment>
        )
    }
}