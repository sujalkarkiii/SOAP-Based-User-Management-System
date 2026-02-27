# 🧼 SOAP MERN Stack App

A full-stack User Management application built with **MongoDB, Express, React, and Node.js** that uses **SOAP (Simple Object Access Protocol)** as the primary communication protocol — with a REST API proxy layer for the frontend.

---

## 📁 Project Structure

```
SOAP/
├── backend/
│   └── src/
│       ├── databse/               # (database connection — optional)
│       ├── schema/
│       │   └── userschema.js      # Mongoose User model
│       ├── service/
│       │   └── service.js         # SOAP service implementation
│       ├── index.js               # Express + SOAP server entry point
│       ├── user.wsdl              # WSDL contract (defines all SOAP operations)
│       └── .env                   # Environment variables
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── SoapInspector.jsx  # Raw SOAP envelope builder & sender
│       │   └── UserModal.jsx      # Create / Edit user modal with live XML preview
│       ├── services/
│       │   └── api.js             # REST helpers + SOAP XML envelope builders
│       ├── App.css
│       ├── App.jsx                # Main app — user table, search, pagination
│       ├── index.css
│       └── main.jsx
│   ├── .env
│   ├── index.html
│   ├── vite.config.js             # Vite proxy config (fixes CORS)
│   └── package.json
│
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **npm** v9+

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd SOAP
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/src/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/soap_mern
```

> For MongoDB Atlas:
> `MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/soap_mern`

Start the backend:

```bash
npm run dev
```

You should see all 4 lines in the terminal:
```
✅ MongoDB connected: mongodb://localhost:27017/soap_mern
🚀 Server running   → http://localhost:5000
🧼 SOAP service     → http://localhost:5000/soap
📄 WSDL             → http://localhost:5000/soap?wsdl
🌐 REST API         → http://localhost:5000/api
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at → **http://localhost:5173**

---

## 🔑 Environment Variables

### `backend/src/.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Backend server port |
| `MONGO_URI` | `mongodb://localhost:27017/soap_mern` | MongoDB connection string |

---

## 🧼 SOAP Operations

All operations are defined in `user.wsdl` and implemented in `service/service.js`.

| Operation | Description | Input |
|-----------|-------------|-------|
| `GetAllUsers` | Paginated list of users | `page`, `limit` |
| `GetUserById` | Single user by MongoDB ID | `id` |
| `CreateUser` | Create a new user | `name`, `email`, `age`, `role` |
| `UpdateUser` | Update existing user | `id`, `name`, `email`, `age`, `role` |
| `DeleteUser` | Delete a user | `id` |
| `SearchUsers` | Search by name or email | `query` |

**SOAP Endpoint:** `POST http://localhost:5000/soap`  
**WSDL:** `http://localhost:5000/soap?wsdl`  
**Content-Type:** `text/xml`

### Example — CreateUser

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:usr="http://www.example.com/soap/user">
  <soapenv:Header/>
  <soapenv:Body>
    <usr:CreateUserRequest>
      <usr:user>
        <usr:name>John Doe</usr:name>
        <usr:email>john@example.com</usr:email>
        <usr:age>30</usr:age>
        <usr:role>user</usr:role>
      </usr:user>
    </usr:CreateUserRequest>
  </soapenv:Body>
</soapenv:Envelope>
```

---

## 🌐 REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users?page=1&limit=10` | Get paginated users |
| `GET` | `/api/users/search?q=john` | Search users |
| `GET` | `/api/users/:id` | Get user by ID |
| `POST` | `/api/users` | Create user |
| `PUT` | `/api/users/:id` | Update user |
| `DELETE` | `/api/users/:id` | Delete user |
| `GET` | `/health` | Server health check |

---

## 🗃️ User Schema

```js
// backend/src/schema/userschema.js
{
  name:      String   // required
  email:     String   // required, unique, lowercase
  age:       Number   // required, min: 1
  role:      String   // "user" | "admin" | "moderator"  (default: "user")
  createdAt: Date     // auto-generated (timestamps: true)
  updatedAt: Date     // auto-generated (timestamps: true)
}
```

---

## 🔬 SOAP Inspector

Built-in tool in the sidebar (🔬 icon) — lets you:

- Select any SOAP operation from a dropdown
- Load a pre-filled XML envelope example
- Edit the XML freely before sending
- Send the real SOAP request to the server
- View the raw XML response with status code and response time

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Protocol | SOAP 1.1 (`soap` npm package) |
| Database | MongoDB + Mongoose |
| Proxy | Vite dev proxy (eliminates CORS) |

---

## 🐛 Common Issues & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| CORS blocked on `/soap` | Browser can't cross origins | Use Vite proxy — fetch `/soap` not `localhost:5000/soap` |
| `500` on `/api/users` | Missing schema file or wrong path | Check `backend/src/schema/userschema.js` exists |
| `Cannot find module './service/service'` | Wrong import path in `index.js` | Must be `require('./service/service')` |
| WSDL parse error on startup | Broken `<o>` tags in WSDL binding | All binding outputs must use `<o>` not `<o>` |
| MongoDB not connecting | Wrong URI or Atlas IP not whitelisted | Check `.env` MONGO_URI and Atlas network access |
