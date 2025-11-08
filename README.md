# 🕒 SlotSwapper – Backend

SlotSwapper is a peer-to-peer time-slot scheduling API where users can mark busy calendar events as “swappable” and exchange them with others.
It’s designed to work well for both individual users and organizations where employees may want to swap meeting or focus block times without administrative overhead.

## 🚀 Tech Stack

- Node.js – Runtime environment

- Express.js – Web framework for API handling

- MongoDB (Atlas) – Cloud database

- Mongoose – ODM for MongoDB

- JWT – Secure user authentication

- Cookies (HttpOnly) – Safe token storage

## 🚀 Features

### 🔐 User Authentication

Register, Login, Logout using JWT with secure httpOnly cookies.

Auto refreshes access tokens for a seamless session experience.

### 📅 Event Management

CRUD operations for personal events (create, update, delete, list).

Mark events as Swappable, Busy, or Swap Pending.

### 🔁 Slot Swapping System

Browse other user's swappable slots.

Request swaps, accept or reject requests.

If accepted, the slots are exchanged between users atomically.

### 🧠 Robust Swap Logic

Prevents overlapping slots.

Prevents multiple pending swaps on the same event.

## 🧩 Folder Structure
```
backend/
│
├── models/            # Mongoose models (User, Event, SwapRequest)
├── routes/            # Route files for auth, events, and swaps
├── controllers/       # Controller logic for each route
├── middleware/        # Authentication (JWT + cookies)
├── utils/             # Helper functions
├── config/            # Database configuration
├── .env               # Environment variables
├── index.js          # App entry point
└── package.json

```

## ⚙️ Setup & Installation

### 1. Clone the repository
```
git clone https://github.com/shubhamthakur-2504/slotswapper-backend.git
cd slotswapper-backend
```

### 2. Install dependencies
```
npm install
```

### 3. Create a .env file
```
PORT=5000
MONGODB_URL=your_mongodb_atlas_connection_string
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d
CLIENT_URL=http://localhost:3000
```

### 4. Run the development server
```
npm run dev

```
### 5. The server will start on:
http://localhost:5000

## 🧱 API Endpoints
### 🧍 Auth Routes (/api/auth)
| Method | Endpoint                | Description                                         | Protected |
| ------ | ----------------------- | --------------------------------------------------- | --------- |
| `POST` | `/register`             | Register new user                                   | ❌         |
| `POST` | `/login`                | Login user and set tokens in cookies                | ❌         |
| `POST` | `/refresh-access-token` | Refresh JWT access token using refresh token cookie | ❌         |
| `POST` | `/logout`               | Logout and clear cookies                            | ✅         |
| `GET`  | `/get-user`             | Get authenticated user info                         | ✅         |

### 🗓️ Event Routes (/api/event)
| Method   | Endpoint                 | Description                      | Protected |
| -------- | ------------------------ | -------------------------------- | --------- |
| `POST`   | `/create-event`          | Create new event                 | ✅         |
| `GET`    | `/get-events`            | Get all events of logged-in user | ✅         |
| `PUT`    | `/update-event/:eventId` | Update a specific event          | ✅         |
| `DELETE` | `/delete-event/:eventId` | Delete a specific event          | ✅         |
| `PUT`    | `/enable-swap/:eventId`  | Mark an event as swappable       | ✅         |
| `PUT`    | `/disable-swap/:eventId` | Disable swappability             | ✅         |

### 🔁 Swap Routes (/api)
| Method | Endpoint                    | Description                                        | Protected |
| ------ | --------------------------- | -------------------------------------------------- | --------- |
| GET    | `/swappable-slots`          | Get all swappable slots (excluding current user’s) | ✅         |
| POST   | `/swap-request`             | Request a swap between two slots                   | ✅         |
| POST   | `/swap-response/:requestId` | Respond (accept/reject) to a swap                  | ✅         |
| GET    | `/incoming-swaps`           | Get all incoming swap requests for current user    | ✅         |
| GET    | `/outgoing-swaps`           | Get all swap requests initiated by current user    | ✅         |

## 🧪 Testing the API

You can test endpoints using:

- Thunder Client or Postman

- Make sure to enable “Send Cookies with Requests” for protected routes.

## 🌟 Future Enhancements

- 📨 Email notifications for swap requests.


- 🔄 Automatic swap retry if one event becomes free again.

- ⚡ WebSocket notifications for live updates.

- 🧭 Frontend in Next.js (React) for real-time interaction.

## 👨‍💻 Author

### Shubham
Backend Developer — Node.js | Express | MongoDB | JWT