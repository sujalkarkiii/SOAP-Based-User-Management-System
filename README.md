# 🚀 User Manager Using SOAP

![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![React](https://img.shields.io/badge/React-Frontend-blue)
![SOAP](https://img.shields.io/badge/SOAP-XML-orange)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)

A **SOAP-Based User Management System** built with React, Node.js,
Express, and MongoDB.

This project demonstrates how a frontend communicates with a backend
using **XML-based SOAP web services**, along with REST APIs for
comparison.

------------------------------------------------------------------------import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
});

## 📌 Features

-   ✅ Create User\
-   📄 Get All Users (Pagination)\
-   🔍 Get User by ID\
-   ✏️ Update User\
-   ❌ Delete User\
-   🔎 Search Users\
-   📨 Raw SOAP XML Request Builder\
-   🔁 REST API (for comparison)\
-   ❤️ Health Check Endpoint

------------------------------------------------------------------------

## 🛠 Tech Stack

### 🔹 Frontend

-   React (Vite)
-   Axios
-   Fetch API

### 🔹 Backend

-   Node.js
-   Express.js
-   SOAP (XML Web Services)
-   MongoDB Atlas

------------------------------------------------------------------------

## 🏗 Architecture

React Frontend\
↓\
SOAP XML / REST Request\
↓\
Express Backend (SOAP + REST)\
↓\
MongoDB Atlas

------------------------------------------------------------------------

## 📂 Project Structure

frontend/ → React Client\
backend/ → Express Server (SOAP + REST)

------------------------------------------------------------------------

## ⚙️ Installation Guide

### 1️⃣ Clone the Repository

git clone https://github.com/your-username/user-manager-soap.git\
cd user-manager-soap

------------------------------------------------------------------------

## 🔹 Backend Setup

cd backend\
npm install

Create `.env` file inside backend folder:

MONGODB_URI=your_mongodb_connection_string\
PORT=5000

Start backend:

npm start

Server runs on:\
http://localhost:5000

------------------------------------------------------------------------

## 🔹 Frontend Setup

cd frontend\
npm install\
npm run dev

Create `.env` file inside frontend folder (Vite):

VITE_API_URL=http://localhost:5000

Frontend runs on:\
http://localhost:5173

------------------------------------------------------------------------

## 🔄 SOAP Endpoint

POST http://localhost:5000/soap

------------------------------------------------------------------------

## 📚 What This Project Demonstrates

-   SOAP XML messaging structure\
-   Difference between REST and SOAP\
-   Service-Oriented Architecture (SOA)\
-   Backend API integration with MongoDB

------------------------------------------------------------------------

## 🎓 Learning Purpose

This project was developed for academic and learning purposes to
understand how SOAP services are implemented and consumed in modern
applications.

------------------------------------------------------------------------

## 👨‍💻 Author

Sujal Karki
