import React from 'react'
import loader from './lightningLoader2.gif'
import './App.css'

export default class Loader extends React.Component{

    render(){
        return (
            <React.Fragment>
                <img className='loader' src={loader} style={{
                    position: 'absolute', left: '50%', top: '50%',
                    transform: 'translate(-50%, -50%)'
                }}></img>
            </React.Fragment>
        )
    }
}