# MERN Authentication App

A MERN stack authentication project with login, signup, dashboard access, and forgot-password reset using OTP email verification.

## Project Structure

- `client/vite-project` - React frontend built with Vite
- `server` - Express API with MongoDB authentication endpoints

## Features

- User signup and login
- JWT-based authentication
- Protected dashboard route
- Forgot password flow with 6-digit OTP
- OTP expiry handling
- Password reset with hashed password update

## Run the App

### Server

1. Install dependencies:

```bash
cd server
npm install
```

2. Start the backend:

```bash
npm start
```

## Deploy Frontend on Netlify

- Base directory: `client/vite-project`
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_URL=https://authentication-fmt2.onrender.com`

The frontend uses `VITE_API_URL` for all API calls.
### Client

1. Install dependencies:

```bash
cd client/vite-project
npm install
```

2. Start the frontend:

```bash
npm run dev
```

## Environment Variables

Create `server/.env` with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourgmailaddress@gmail.com
SMTP_PASS=your_google_app_password
SMTP_FROM=yourgmailaddress@gmail.com
```

## Gmail SMTP Notes

If you use Gmail, you must use a Google App Password instead of your normal Gmail password. Make sure 2-Step Verification is enabled on the account.

## Forgot Password Flow

1. User enters email
2. Backend checks whether the email exists
3. Backend generates a 6-digit OTP
4. OTP is stored with expiry for 5 minutes
5. OTP is sent to the user email
6. User enters the OTP
7. Backend verifies OTP
8. If valid, user sets a new password
9. New password is hashed and saved
10. User logs in with the new password
