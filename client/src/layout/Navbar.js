import React from 'react'

export default class Navbar extends React.Component {

  render() {
    return (
      <React.Fragment>
        <div className="navbar navbar-expand-lg fixed-top" style={{backgroundColor:"#282c34",opacity:0.8}}>
          <div className="container ">
            <a href="../" className="navbar-brand text-primary" style={{float:'left',margin:'auto', position:'absolute'}}>LYRICAL OG</a>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarResponsive">
              {/* <ul className="navbar-nav">
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle text-primary" data-toggle="dropdown" href="#" id="themes">Themes <span class="caret"></span></a>

                </li>
              </ul> */}

              <div style={{float:'right'}}>
                <ul className="nav navbar-nav ml-auto">
                  <li className="nav-item">
                    <a className="nav-link text-primary" href="https://bootswatch.com/minty/" target="_blank">Built With Bootstrap</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link text-primary" href="https://bootswatch.com/minty/" target="_blank">WrapBootstrap</a>
                </li>
              </ul>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }
}