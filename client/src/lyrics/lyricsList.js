import React, { Component } from 'react';
import * as lyricService from '../services/lyricService'

 class LyricsList extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            items: []
        }
        this.getLyrics = this.getLyrics.bind(this)
    }

    componentDidMount() {
        this.getLyrics();
    }

    getLyrics() {
        lyricService.getAll()
            .then(response => {
                this.setState({
                    items: response.items
                })
            })
            .catch(console.log.error);
    }

    redner() {

        // const lyricsList = this.state.items.map((item) => {
        //     return (
        //         <div>
        //             <li>{item.id}</li>
        //             <li>{item.lyrics}</li>
        //         </div>
        //     )
        // })
        return (
            <div>
                {/* {lyricsList} */}
            </div>
        );
    }
}
export default LyricsList