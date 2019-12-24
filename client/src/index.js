import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {store} from './store'
import {Provider} from 'react-redux'

const loader = document.querySelector('.loader');

// if you want to show the loader when React loads data again
const showLoader = () => loader.classList.remove('loader--hide');

const hideLoader = () => loader.classList.add('loader--hide');

class Index extends React.Component {
    componentDidMount() {
      this.props.hideLoader();
    }
    
    render() {   
      return (
        <div>
          {/* I'm the app */}
          </div>
      ); 
    }
  }
  setTimeout(() => 

ReactDOM.render(
    <Provider store={store}>
        <Index 
              hideLoader={hideLoader}
              showLoader={showLoader} 
        />
        <App />
    </Provider>, document.getElementById('root'))
, 400);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA

serviceWorker.unregister();
