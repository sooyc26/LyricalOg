import React from 'react'

export default class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: ''
        }
        this.handleChange = this.handleChange.bind(this)
        this.submit=this.submit.bind(this)
    }

    handleChange(e) {
        this.setState({ [e.target.id]: e.target.value })
    }

    submit(){

    }

    render() {
        return (
            <React.Fragment>
                <form>
                    <div class="form-group">
                        <label for="exampleInputEmail1">Email address</label>
                        <input type="email" value={this.state.email} onChange={this.handleChange} class="form-control" id="email" aria-describedby="emailHelp" placeholder="Enter email" />
                    </div>
                    <div class="form-group">
                        <label for="exampleInputPassword1">Password</label>
                        <input type="password" value={this.state.password} onChange={this.handleChange} class="form-control" id="password" placeholder="Password" />
                    </div>
                    <button onSubmit={()=>this.submit()} className="btn btn-primary">Login</button>
                    <button onSubmit={()=>this.register()} className="btn btn-secondary">Register</button>

                </form>
            </React.Fragment>
        )
    }
}