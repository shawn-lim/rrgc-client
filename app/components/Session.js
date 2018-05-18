import React from 'react';
import Modal from 'react-modal';
import moment from 'moment';

import { Users, Sessions, Services } from '../utils/api';
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
    const services = await Services.list();
    this.setState({
      sessions: sessions,
      services: services
    });
  }

  render(){
    const { sessions, services } = this.state;
    return (
      <div className="container">
        {
          sessions &&
            sessions.map((session) => {
              return <SessionBlock session={session} services={services}/>
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
      services: props.services,
      session: session,
      signInModal: false
    }

    this.showSignInModal = this.showSignInModal.bind(this);
  }

  componentWillReceiveProps(props) {
    let session = props.session;
    session.readable_date = moment(session.date).format('LL');

    this.setState({
      services: props.services,
      session: session,
    });
  }

  showSignInModal() {
    this.setState({
      signInModal: true
    });
  }

  render() {
    const { session, services } = this.state;
    if (session) {
      return (
        <div className="session-container">
          <SessionSummary  session={session}/>
          <div className="signin-table">
            <div className="row">
              {
                session.signins && session.signins.map((signin) => {
                  return (
                    <div className="col col-sm-12 col-md-6 col-lg-4">
                      <SignInCard user={ signin } />
                    </div>
                  )
                })
              }
              <div className="col col-sm-12 col-md-6 col-lg-4">
                <a className="new-signin" href="javascript:void(0)" onClick={ this.showSignInModal }>
                  <i className="fas fa-plus-circle"></i>
                  <h2>Sign In</h2>
                </a>
              </div>
            </div>
          </div>
          <SignInModal session={session} services={services} isOpen={this.state.signInModal}/>
        </div>
      )
    }
    else {
      return <div></div>
    }
  }
}

class SignInModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      services: props.services,
      session: props.session,
      isOpen: props.isOpen,
      fee: 0
    }

    this.debouncer;
    this.handleChange = this.handleChange.bind(this);
    this.selectUser = this.selectUser.bind(this);
    this.toggleService = this.toggleService.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({
      isOpen: props.isOpen,
      search: ''
    });
  }

  handleChange(e) {
    this.setState({
      search: e.target.value
    }, () => {
      if(this.state.search.length < 3) {
        this.setState({
          results: null
        });
        return;
      }
      if(this.debouncer) {
        clearTimeout(this.debouncer);
      }

      this.debouncer = setTimeout(()=>{
        Users.find(this.state.search).then((results) => {
          this.setState({
            results: results
          });
        });
      }, 200);
    });
  }

  selectUser(u) {
    this.setState({
      selectedUser: u,
      search: '',
      results: null,
    }, () => {
      if(u) {
        this.preselectServices();
      }
    });
  }

  toggleService(id) {
    const services = this.state.services;
    const idx = services.findIndex((service) => {
      return service.service_id === id;
    });

    services[idx].selected = !services[idx].selected;
    this.setState({
      services: services,
      fee: services.reduce((sum, service) => {
        if(service.selected) {
          return sum + service.cost;
        }
        else {
          return sum;
        }
      }, 0)
    });
  }

  preselectServices() {
    const user = this.state.selectedUser;
    const services = this.state.services.map((service) => {
      if(service.service_id === 'range_fee_ro') {
        service.selected = user.range_officer;
      }
      else if(service.service_id === 'range_fee_member') {
        service.selected = user.member_number && !user.range_officer;
      }
      else if(service.service_id === 'range_fee_non_member') {
        service.selected = !user.member_number;
      }
      return service;
    });

    this.setState({
      services: services,
      fee: services.reduce((sum, service) => {
        if(service.selected) {
          return sum + service.cost;
        }
        else {
          return sum;
        }
      }, 0)
    });
  }

  render() {
    const { selectedUser, services, isOpen, results, fee } = this.state;
    return (
      <Modal
        isOpen={isOpen}
        className='signin-modal'
      >
        <h2>Archery Range Sign In</h2>
        {
          selectedUser ?
            <div>
              <SignInCard user={ selectedUser }/>
              <div className="row">
                {
                  services.filter((service) => {
                    return service.service_id === 'range_fee_ro' ? !!selectedUser.range_officer :
                      service.service_id === 'range_fee_member' ? !selectedUser.range_officer && !!selectedUser.member_number :
                      service.service_id === 'range_fee_non_member' ? !selectedUser.member_number :
                      true
                  })
                    .map((service) => {
                      return (
                        <div className="col col-xs-4">
                          <a className={ `service ${ service.selected ? 'selected' : '' }` }
                            href="javascript:void(0)"
                            onClick={this.toggleService.bind(null, service.service_id)}>
                            {
                              service.selected &&
                              <div className="selected-badge">
                                <i className="fas fa-check-circle"></i>
                              </div>
                            }
                            <div className="service-name">
                              { service.name }
                            </div>
                            <div className="service-cost">
                              { service.cost.formatMoney(2) }
                            </div>
                          </a>
                        </div>
                      )
                    })
                }
              </div>
              <div className="submit-container">
                <div className="row">
                  <div className="col-xs-6">
                    <button className="btn-back" onClick={ this.selectUser.bind(null, null) }>
                      <div className="btn-contents">
                        <i className="fas fa-angle-double-left"></i> Back
                      </div>
                    </button>
                  </div>
                  <div className="col-xs-6 text-right">
                    <button className="btn-signin">
                      <div className="btn-contents">
                        { fee.formatMoney(2) } <i className="fas fa-angle-double-right"></i>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            :
            <div className="search-container">
              <div className="input-search-wrapper">
                <i className="fas fa-search"></i>
                <input type="text" value={ this.state.search } onChange={ this.handleChange }
                  placeholder="Name, Member ID, AC Number..."
                />
              </div>
              <div className="search-results">
                <div className="row">
                  {
                    results &&
                      results.map((user) => {
                        return (
                          <div className="col col-sm-12 col-md-6 col-lg-4">
                            <a href="javascript:void(0)" onClick={ this.selectUser.bind(null, user) }>
                              <SignInCard user={user}/>
                            </a>
                          </div>
                        )
                      })
                  }
                  <div className="col col-sm-12 col-md-6 col-lg-4">
                    <a className="new-signin" href="javascript:void(0)" onClick={ this.showSignInModal }>
                      <i className="fas fa-plus-circle"></i>
                      <h2>New Record</h2>
                    </a>
                  </div>
                </div>
              </div>
            </div>
        }
      </Modal>
    )
  }
}

class SignInCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: props.user,
    }
  }

  render() {
    const { first_name, last_name, member_number, ac_number, phone_number, fee, range_officer } = this.state.user;
    return (
      <div className={ `signin-card ${ range_officer === 1 ? 'ro' : member_number ? 'member' : '' }` }>
        <div className="signin-badges">
          {
            range_officer === 1 &&
              <div className="signin-badge ro">
                <div className="signin-badge-text">RO</div>
                <i className="fas fa-id-badge"></i>
              </div>
          }
          {
            member_number &&
              <div className="signin-badge member">
                <div className="signin-badge-text">MEMBER</div>
                <i className="fas fa-bookmark"></i>
              </div>
          }
        </div>
        <div className="row">
          <div className="col col-sm-6">
            <div className="name">
              { first_name || '-' } { last_name || '-' }
            </div>
            <div className="member-number">
              RRGC Membership: { member_number || '-' }
            </div>
            <div className="ac-number">
              Archery Canada Number: { ac_number || '-' }
            </div>
            <div className="phone-number">
              <i className="fas fa-phone"></i> { phone_number || '-' }
            </div>
          </div>
          {
            fee !== undefined &&
              <div className="col col-sm-6">
                <div className="fee">
                  { fee.formatMoney(2) }
                </div>
              </div>
          }
        </div>
      </div>
    )
  }
}
class SessionSummary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      session: props.session
    }
  }

  render() {
    const { session } = this.state;
    return (
      <div className="session-summary">
        <h1>{ session.name }</h1>
        <span className="date">{ session.readable_date }</span>
        <div className="row">
          <div className="col col-sm-8">
            <div className="range-officer">
              <div className="row">
                <div className="col col-sm-4">
                  Range Officer:
                </div>
                <div className="col col-sm-8">
                  { session.ro_firstname } { session.ro_lastname }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Session;
