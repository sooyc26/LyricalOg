import React,{Component} from 'react'
import * as userService from '../services/userService'

export default class ValidateAccount extends Component{

    constructor(props){
        super(props)
        this.state={
            currUserId:0
        }
    }

    componentDidMount = () => {
        var key = this.props.match.params.key ? this.props.match.params.key : ''

        this.validateAccount(key)

    }
    validateAccount=(key)=>{
        userService.verifyAccount(key)
        .then(res =>{
            if(res)
            //this.setState({validationAlert:"Your account has been sucessfully verifed."})
            window.alert("Your account has been sucessfully verifed.")
        })
        .catch(res =>{
            //this.setState.bind({validationAlert:"Validation Unsuccessful. Please try again."})
            window.alert("Validation Unsuccessful. Please try again.")

        })
    }

    render(){
        return(
            <React.Fragment>
                <header className="App-header" style={{ opacity: 0.8 }}>

                    <h1 className="text-primary" style={{ paddingTop: "40px", fontSize: "30px" }}>Lyrical OG</h1>

                    <header>Account Validated</header>

                    <p> If you are logged in, logout and login again.</p>
                    <a href="/Login" className="btn btn-outline-secondary">Login?</a>
                </header>
            </React.Fragment>
        )
    }
}