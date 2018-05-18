var axios = require('axios');

export const Users = {
  list: () => {
    return axios.get('/api/users').then(function(res){return res.data;});
  },
  find: (keyword) => {
    return axios.get(`/api/users?search=${keyword}`).then(function(res){return res.data;});
  }
};

export const Sessions = {
  get: (date) => {
    return axios.get(`/api/sessions/${date}`).then(function(res){return res.data;});
  },
  getCurrent: () => {
    return axios.get('/api/sessions').then(function(res){return res.data;});
  }
};

export const Services = {
  list: () => {
    return axios.get('/api/services').then(function(res){return res.data;});
  },
}
