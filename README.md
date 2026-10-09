# 🚀 Backend API — Account Authentication

<p align="center">
  <strong>REST API built with Express.js, MySQL, and JWT Authentication</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Runtime-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-Framework-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Postman-API_Testing-FF6C37?style=for-the-badge&logo=postman&logoColor=white" />
</p>

---

## 📌 About The Project

This project is a backend REST API built with **Node.js and Express.js**,
using MySQL as the database and JWT for authentication.

### ✨ Features

- 🔐 Account authentication
- 🔑 Password hashing with bcrypt
- 🎟️ JSON Web Token (JWT)
- 🗄️ MySQL database integration
- 📁 File upload support with Multer
- ⚙️ Environment variable configuration
- 🧪 API testing with Postman

---

## 🛠️ Tech Stack

| Technology | Description |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend web framework |
| MySQL | Relational database |
| mysql2 | MySQL database driver |
| bcrypt | Password hashing |
| jsonwebtoken | Token-based authentication |
| dotenv | Environment configuration |
| multer | File upload handling |
| Postman | API testing |

---

## 📦 Installation

**1. Clone the repository**

```bash
git clone <YOUR_REPOSITORY_URL>
```

**2. Enter the project directory**

```bash
cd <YOUR_PROJECT_FOLDER>
```

**3. Install dependencies**

```bash
npm install
```

**4. Configure environment variables**

Create a `.env` file in the root directory.

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

JWT_SECRET=your_secret_key
```

> ⚠️ Adjust the environment variables according to your project configuration.

**5. Run the server**

```bash
npm run dev
```

Or, if your project uses Node.js directly:

```bash
node server.js
```

---

## 🧪 Account Testing in Postman

Test the account authentication endpoint using Postman.

### 🔑 Login Credentials

Use the following JSON as the request body.

```json
{
  "email": "budi@gmail.com",
  "password": "password123"
}
```

### 📡 Request Configuration

| Setting | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3000/api/login` |
| Body Type | `raw` → `JSON` |
| Content-Type | `application/json` |

> 💡 Replace `/api/login` with the actual login route defined in your Express application.

### 📋 Steps to Test

1. Open Postman.
2. Create a new HTTP request.
3. Select the `POST` method.
4. Enter your login endpoint URL.
5. Open **Body → raw → JSON**.
6. Paste the login credentials above.
7. Click **Send**.
8. Check the response and HTTP status code.

### ✅ Expected Response

If authentication succeeds, the API may return a response similar to this:

```json
{
  "message": "Login successful",
  "token": "your_jwt_token"
}
```

> Note: The response format depends on your actual backend implementation. The account must also exist in your database, with a password stored in the format expected by your authentication logic.

### 📊 HTTP Status Codes

| Status Code | Description |
|---|---|
| `200 OK` | Login successful |
| `400 Bad Request` | Invalid request data |
| `401 Unauthorized` | Invalid email or password |
| `404 Not Found` | Endpoint or account not found |
| `500 Internal Server Error` | Server-side error |

---

## 📂 Project Structure

```text
crud_express/
├── src/
|   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── repositories/
|   ├── routes/
|   ├── services/
|   ├── utils/
├── app.js
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

> 📌 Adjust the folder structure to match your actual project.

---

## 🔒 Security Notes

- Never commit your `.env` file to GitHub.
- Store passwords using bcrypt hashing.
- Keep your JWT secret private.
- Validate incoming request data.
- Use HTTPS in production.
- Do not use sample credentials for production accounts.

Add the following to `.gitignore`:

```gitignore
node_modules/
.env
```

---

## 👨‍💻 Author

**Backend API Developer**

Built with ❤️ using Node.js, Express.js, and MySQL.

---

<p align="center">
  ⭐ If you find this project useful, consider giving it a star!
</p>