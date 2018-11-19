import React from 'react'

export default class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: ''

            , RegisterModal: false
        }
        this.handleChange = this.handleChange.bind(this)
        this.submit = this.submit.bind(this)
        this.register = this.register.bind(this)
    }

    handleChange(e) {
        this.setState({ [e.target.id]: e.target.value })
    }

    register() {
        this.setState({ RegisterModal: true })
    }

    submit() {

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
                    <button onSubmit={() => this.submit()} className="btn btn-primary">Login</button>
                    <button onClick={() => this.register()} className="btn btn-secondary">Register</button>

                </form>

                {this.state.RegisterModal ?
                    (<div class="modal">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">Modal title</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <p>Modal body text goes here.</p>
                                    <form>

                                    </form>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-primary">Save changes</button>
                                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>) : ''}
            </React.Fragment>
        )
    }
}