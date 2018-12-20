import React from 'react'

export default class Navbar extends React.Component {

  render() {
    return (
      <React.Fragment>
        <div className="navbar fixed-top" style={{ backgroundColor: "#282c34", opacity: 0.8 }}>
          <div>
            <a href="../" className="navbar-brand text-primary" style={{ float: 'left', }}>LYRICAL OG</a>
          </div>
          {/* <div className="container "> */}


          <div style={{ float: 'right' }}>
            <ul className="nav ml-auto">
              <li className="nav-item">
                <a className="nav-link float-right text-primary" href="https://bootswatch.com/minty/" target="_blank">Write Lyrics</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-primary" href="https://bootswatch.com/minty/" target="_blank">Vote</a>
              </li>
            </ul>
          </div>
        </div>
        {/* </div> */}
      </React.Fragment>
    )
  }
}