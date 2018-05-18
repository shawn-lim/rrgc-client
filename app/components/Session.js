import React from 'react';
import moment from 'moment';

import { Sessions } from '../utils/api';
import helper from '../utils/helper';

class Session extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      session_date: props.match.params.date
    };
  }

  async componentDidMount() {
    const sessions = await Sessions.get(this.state.session_date);
    this.setState({
      sessions: sessions
    });
  }

  render(){
    const { sessions } = this.state;
    return (
      <div className="container">
        {
          sessions &&
            sessions.map((session) => {
              return <SessionBlock session={session} />
            })
        }
      </div>
    )
  }
}

class SessionBlock extends React.Component {
  constructor(props) {
    super(props);

    let session = props.session;
    session.readable_date = moment(session.date).format('LL');

    this.state = {
      session: session
    }
    console.log(session);
  }

  render() {
    const { session } = this.state;
    console.log(session);
    if (session) {
      return (
        <div className="session-container">
          <h1>{ session.name }</h1>
          <span className="date">{ session.readable_date }</span>

          <div className="session-summary">
            TODO
          </div>
          <div className="signin-table">
            <div className="row header">
              <div className="col col-sm-2">First Name</div>
              <div className="col col-sm-2">Last Name</div>
              <div className="col col-sm-2">Member ID</div>
              <div className="col col-sm-2">AC Number</div>
              <div className="col col-sm-2">Phone Number</div>
              <div className="col col-sm-2">Fee</div>
            </div>
            {
              session.signins && session.signins.map((signin) => {
                return (
                  <div className="row">
                    <div className="col col-sm-2">{ signin.first_name || '-' }</div>
                    <div className="col col-sm-2">{ signin.last_name || '-' }</div>
                    <div className="col col-sm-2">{ signin.member_number || '-' }</div>
                    <div className="col col-sm-2">{ signin.ac_number || '-' }</div>
                    <div className="col col-sm-2">{ signin.phone_number || '-' }</div>
                    <div className="col col-sm-2">{ signin.fee.formatMoney(2) }</div>
                  </div>
                )
              })
            }
          </div>
        </div>
      )
    }
    else {
      return <div></div>
    }
  }
}

export default Session;
