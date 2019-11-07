import {Component} from 'react'
import * as userService from '../services/userService'
export default class validateAccount extends Component{

    constructor(props){
        super(props)
        this.state={
            currUserId:0
        }
    }

    sendValidation=()=>{
        let data = {
            Name:this.state.name,
            Eamil:this.state.email,
            Id:this.state.currUserId
        }
        userService.validationRequest(data)
    }

    render(){
        return(
            <React.Fragment>
                <form>
                            <header>Send Validation Email</header>
                            {/* <div className="form-group">
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
                            </div> */}

                            {/* <button onClick={(e) => this.submit(e)} className="btn btn-primary">Login</button>
                            <button onClick={(e) => this.toggleLoginRegis(e)} className="btn btn-secondary">Register</button> */}
                            <button onClick={() => this.sendValidation()} className="btn btn-outline-secondary">Validate Account</button>
                        </form>
            </React.Fragment>
        )
    }
}