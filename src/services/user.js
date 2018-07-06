/* eslint-disable linebreak-style */
import request from '../utils/request';

export async function query() {
  return request('/api/users');
}

export async function queryCurrent() {
  // console.log(request('/api/currentUser'));

  const DochenAuth = JSON.parse(sessionStorage.getItem('dochen-auth'));
  const info = {
    avatar: DochenAuth.logo,
    name: DochenAuth.username,
    notifyCount: 0,
    userid: DochenAuth.uuid,
  };
  return info;

  // return request('/api/currentUser');
}
