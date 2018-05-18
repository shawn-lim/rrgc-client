import React from 'react';
import { Link } from 'react-router-dom';

import { Sessions } from '../utils/api';
import helper from '../utils/helper';

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  async componentDidMount() {
    const sessions = await Sessions.getCurrent();
    console.log(sessions);
    this.setState({
      current_sessions: sessions
    });
  }

  render(){
    const { current_sessions } = this.state;
    return (
      <div className="container">
        <div className="logo-container">
          <h1>RRGC</h1>
          <img src="/public/images/RRGCLogo.png"/>
        </div>
        <div>
          <h2>Today's Sessions: </h2>
          {
            current_sessions &&
              <Link to={ `/session/${current_sessions[0].date}` } className="current-session-link">
                { current_sessions[0].date }
              </Link>
          }
        </div>
      </div>
    )
  }
}

export default Home;
