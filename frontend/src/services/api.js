// services/api.js  — MISSING FILE (was never provided but imported everywhere)

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL  = `${BASE_URL}/api`;
const SOAP_URL = `${BASE_URL}/soap`;

// ─── REST helpers ─────────────────────────────────────────────────────────────

async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const getHealth = () =>
  fetch(`${BASE_URL}/health`).then(handleResponse);

export const getUsers = (page = 1, limit = 10) =>
  fetch(`${API_URL}/users?page=${page}&limit=${limit}`).then(handleResponse);

export const searchUsers = (q) =>
  fetch(`${API_URL}/users/search?q=${encodeURIComponent(q)}`).then(handleResponse);

export const getUserById = (id) =>
  fetch(`${API_URL}/users/${id}`).then(handleResponse);

export const createUser = (data) =>
  fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse);

export const updateUser = (id, data) =>
  fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse);

export const deleteUser = (id) =>
  fetch(`${API_URL}/users/${id}`, { method: 'DELETE' }).then(handleResponse);

// ─── SOAP XML envelope builders (for the UI inspector / live preview) ─────────

const NS = 'http://www.example.com/soap/user';

const envelope = (body) => `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:usr="${NS}">
  <soapenv:Header/>
  <soapenv:Body>
${body}
  </soapenv:Body>
</soapenv:Envelope>`;

export const soapExamples = {
  GetAllUsers: (page = 1, limit = 10) => envelope(`    <usr:GetAllUsersRequest>
      <usr:page>${page}</usr:page>
      <usr:limit>${limit}</usr:limit>
    </usr:GetAllUsersRequest>`),

  GetUserById: (id) => envelope(`    <usr:GetUserByIdRequest>
      <usr:id>${id}</usr:id>
    </usr:GetUserByIdRequest>`),

  CreateUser: (u) => envelope(`    <usr:CreateUserRequest>
      <usr:user>
        <usr:name>${u.name}</usr:name>
        <usr:email>${u.email}</usr:email>
        <usr:age>${u.age}</usr:age>
        <usr:role>${u.role || 'user'}</usr:role>
      </usr:user>
    </usr:CreateUserRequest>`),

  UpdateUser: (id, u) => envelope(`    <usr:UpdateUserRequest>
      <usr:id>${id}</usr:id>
      <usr:user>
        <usr:name>${u.name}</usr:name>
        <usr:email>${u.email}</usr:email>
        <usr:age>${u.age}</usr:age>
        <usr:role>${u.role || 'user'}</usr:role>
      </usr:user>
    </usr:UpdateUserRequest>`),

  DeleteUser: (id) => envelope(`    <usr:DeleteUserRequest>
      <usr:id>${id}</usr:id>
    </usr:DeleteUserRequest>`),

  SearchUsers: (query) => envelope(`    <usr:SearchUsersRequest>
      <usr:query>${query}</usr:query>
    </usr:SearchUsersRequest>`),
};