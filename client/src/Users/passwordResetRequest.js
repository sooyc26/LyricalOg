import React from 'react'
import * as userService from '../services/userService'
export default class PasswordResetRequest extends React.Component{

    constructor(props){
        super (props)
        this.state={
            email:''

        }
    }
    handleChange=(e)=> {
        this.setState({ [e.target.id]: e.target.value,wrongInput:false })
    }
    submit=e=>{
        e.preventDefault();
        if(this.state.email !==''){
            const data = {
                Email:this.state.email
            }
            userService.passwordResetRequest(data)
            .then(resp=>{
                window.alert("email sent!")
            })
        }else{
            window.alert("please enter your email")
        }
    }
    render(){
        return(
            <React.Fragment>
                <header className="App-header" style={{ opacity: 0.8 }}>
                    <div style={{ lineHeight: '200px' }}>
                        <h1 className="text-primary" style={{ paddingTop: "40px", fontSize: "30px" }}>Lyrical OG</h1>
                    </div>
                        <form>
                            <header>Password Reset Request</header>
                            <div className="form-group">
                                <label >Email Address</label>
                                <input type="email" value={this.state.email} onChange={this.handleChange} className="form-control" id="email" placeholder="Enter email" />
                            </div>
                            <div>

                            </div>

                            <button onClick={(e) => this.submit(e)} className="btn btn-primary">Send Email Request!</button>
                            <a href="/Login" className="btn btn-outline-secondary">Login?</a>
                        </form>
                    
                </header>

            </React.Fragment>
        )
    }
}