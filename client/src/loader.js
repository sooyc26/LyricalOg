import React from 'react'
import loader from '../public/images/lightningLoader2'
import './App.css'

export default class Loader extends React.Component{

    render(){
        return(
            <React.Fragment>
                <img className='loader' src={loader}></img>
            </React.Fragment>
        )
    }
}