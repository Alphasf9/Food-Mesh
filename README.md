# 🍔 FoodMesh

> **Fresh • Fast • Delivered** — A full-stack food delivery platform built with microservices architecture


<img width="1024" height="559" alt="image" src="https://github.com/user-attachments/assets/44f2a8e0-945a-45ef-be1f-76575f4d030f" />


---

## 📌 Overview

FoodMesh is a modern food delivery web application that connects customers with nearby restaurants. It supports three user roles — **Customer**, **Seller (Restaurant Owner)**, and **Rider** — each with their own dedicated dashboard and features.

---

## 🚀 Features

### Customer
- Google OAuth login
- Browse nearby restaurants using geolocation
- Search restaurants by name or cuisine
- View restaurant menus
- Add items to cart (single restaurant at a time)
- Checkout with delivery address selection
- Pay securely via **Razorpay**
- Download PDF receipt after payment
- Manage saved delivery addresses (with interactive map)
- Cart counter in navbar updates in real time

### Seller (Restaurant Owner)
- Create and manage restaurant profile
- Upload restaurant images via Cloudinary
- Toggle restaurant open/closed status
- Add, edit, delete menu items
- Toggle menu item availability
- Restaurant verification system

### General
- JWT-based authentication with role-based access control
- Automatic token refresh on API calls
- Location detection using browser Geolocation API + Nominatim reverse geocoding
- Responsive UI built with TailwindCSS

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React + TypeScript | UI framework |
| Vite | Build tool |
| TailwindCSS | Styling |
| ShadCN UI | Component library |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| React Leaflet | Interactive maps |
| jsPDF | PDF receipt generation |
| React Hot Toast | Notifications |
| Lucide React | Icons |

### Backend (Microservices)
| Service | Port | Responsibility |
|---|---|---|
| Auth Service | 8080 | Google OAuth, JWT, user management |
| Restaurant Service | 8001 | Restaurants, menus, cart, orders, addresses |
| Utils Service | 8002 | File uploads (Cloudinary), Razorpay payments |

### Infrastructure
| Technology | Purpose |
|---|---|
| MongoDB + Mongoose | Database |
| RabbitMQ | Message queue (payment events) |
| Cloudinary | Image storage |
| Razorpay | Payment gateway |
| Docker | RabbitMQ container |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│                   localhost:5173                     │
└──────────┬──────────────┬──────────────┬────────────┘
           │              │              │
           ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Auth Service │ │  Restaurant  │ │    Utils     │
│  Port 8080   │ │   Service    │ │   Service    │
│              │ │  Port 8001   │ │  Port 8002   │
│ - Google     │ │              │ │              │
│   OAuth      │ │ - Restaurants│ │ - Cloudinary │
│ - JWT tokens │ │ - Menus      │ │   uploads    │
│ - User mgmt  │ │ - Cart       │ │ - Razorpay   │
└──────────────┘ │ - Orders     │ │   payments   │
                 │ - Addresses  │ └──────┬───────┘
                 └──────┬───────┘        │
                        │                │
                        ▼                ▼
                 ┌──────────────────────────┐
                 │         RabbitMQ         │
                 │   Payment Event Queue    │
                 └──────────────────────────┘
                        │
                        ▼
                 ┌──────────────┐
                 │   MongoDB    │
                 └──────────────┘
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Docker Desktop (for RabbitMQ)
- Razorpay account (test mode)
- Google Cloud Console project (OAuth credentials)
- Cloudinary account

---

### 1. Clone the repository

```bash
git clone https://github.com/Alphasf9/Food-Mesh.git
cd foodmesh
```

---

### 2. Start RabbitMQ via Docker

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

RabbitMQ dashboard → `http://localhost:15672` (guest/guest)

---

### 3. Setup Environment Variables

#### Auth Service (`services/auth/.env`)
```env
PORT=8080
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Restaurant Service (`services/restaurant/.env`)
```env
PORT1=8001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
RABBITMQ_URL=amqp://guest:guest@localhost:5672
PAYMENT_QUEUE=payment_event
INTERNAL_SERVICE_KEY=your_internal_key
UPLOAD_SERVICE_URL=http://localhost:8002/api/v1/media
```

#### Utils Service (`services/utils/.env`)
```env
PORT2=8002
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RABBITMQ_URL=amqp://guest:guest@localhost:5672
PAYMENT_QUEUE=payment_event
ORDER_API_URL=http://localhost:8001/api/v1/orders
INTERNAL_SERVICE_KEY=your_internal_key
```

#### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8080/api/v1/auth
VITE_RESTAURANT_API_URL=http://localhost:8001/api/v1/restaurants
VITE_MENU_API_URL=http://localhost:8001/api/v1/menu
VITE_CART_API_URL=http://localhost:8001/api/v1/cart
VITE_ADDRESS_API_URL=http://localhost:8001/api/v1/address
VITE_ORDER_API_URL=http://localhost:8001/api/v1/orders
VITE_PAYMENT_API_URL=http://localhost:8002/api/v1/payment
```

---

### 4. Install Dependencies & Run

#### Auth Service
```bash
cd services/auth
npm install
npm run dev
```

#### Restaurant Service
```bash
cd services/restaurant
npm install
npm run dev
```

#### Utils Service
```bash
cd services/utils
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Project Structure

```
FoodMesh/
├── frontend/                  # React + TypeScript frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── context/           # AppContext (auth, cart, location)
│   │   ├── pages/             # Page components
│   │   └── types/             # TypeScript interfaces
│   └── package.json
│
└── services/
    ├── auth/                  # Auth microservice
    │   ├── src/
    │   │   ├── controllers/
    │   │   ├── middlewares/
    │   │   ├── model/
    │   │   └── routes/
    │   └── package.json
    │
    ├── restaurant/            # Restaurant microservice
    │   ├── src/
    │   │   ├── controllers/
    │   │   ├── middlewares/
    │   │   ├── models/
    │   │   └── routes/
    │   └── package.json
    │
    └── utils/                 # Utils microservice
        ├── src/
        │   ├── controllers/
        │   ├── config/
        │   └── routes/
        └── package.json
```

---

## 🔐 Authentication Flow

```
User clicks "Login with Google"
    → Google OAuth popup opens
    → User grants permission
    → Auth code sent to backend
    → Backend exchanges code for tokens
    → JWT issued with { id, name, email, role, restaurantId }
    → Token stored in localStorage
    → User redirected based on role
```

---

## 💳 Payment Flow

```
Customer clicks "Pay"
    → Order created in DB (status: pending)
    → Utils service creates Razorpay order
    → Razorpay modal opens
    → Customer pays
    → Backend verifies payment signature
    → Message published to RabbitMQ queue
    → Restaurant service consumes message
    → Order updated (status: placed, paymentStatus: paid)
    → Customer redirected to receipt page
    → PDF receipt available for download
```

---

## 👤 User Roles

| Role | Access |
|---|---|
| **Customer** | Browse restaurants, order food, manage cart, checkout, view orders |
| **Seller** | Manage restaurant, menu items, toggle availability, view dashboard |
| **Rider** | (Coming soon) Accept deliveries, track orders |

---

## 🗺️ API Endpoints

### Auth Service (8080)
| Method | Route | Description |
|---|---|---|
| POST | `/api/v1/auth/login` | Google OAuth login |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/my-user` | Get current user |
| PUT | `/api/v1/auth/add-role` | Set user role |

### Restaurant Service (8001)
| Method | Route | Description |
|---|---|---|
| GET | `/api/v1/restaurants/nearby-restaurants` | Get nearby restaurants |
| GET | `/api/v1/restaurants/my-restaurant` | Get seller's restaurant |
| POST | `/api/v1/restaurants/add-restaurant` | Create restaurant |
| PUT | `/api/v1/restaurants/update-restaurant` | Update restaurant |
| PATCH | `/api/v1/restaurants/update-status` | Toggle open/closed |
| DELETE | `/api/v1/restaurants/delete-restaurant` | Delete restaurant |
| GET | `/api/v1/menu/get-all-menu-items/:id` | Get menu items |
| POST | `/api/v1/menu/add-menu-item` | Add menu item |
| PATCH | `/api/v1/menu/edit-menu-item/:id` | Edit menu item |
| DELETE | `/api/v1/menu/delete-menu-item/:id` | Delete menu item |
| PATCH | `/api/v1/menu/toggle-availability/:id` | Toggle availability |
| GET | `/api/v1/cart/my-cart` | Get cart |
| POST | `/api/v1/cart/add-to-cart` | Add to cart |
| PUT | `/api/v1/cart/increment-cart-item` | Increase quantity |
| PUT | `/api/v1/cart/decrement-cart-item` | Decrease quantity |
| DELETE | `/api/v1/cart/remove-cart-item/:itemId` | Remove item |
| DELETE | `/api/v1/cart/clear-cart` | Clear cart |
| POST | `/api/v1/orders/create-order` | Create order |
| GET | `/api/v1/orders/order-by-payment/:paymentId` | Get order by payment |

### Utils Service (8002)
| Method | Route | Description |
|---|---|---|
| POST | `/api/v1/media/upload` | Upload image to Cloudinary |
| POST | `/api/v1/payment/create-razorpay-order` | Create Razorpay order |
| POST | `/api/v1/payment/verify-payment` | Verify payment signature |

---

## 🧪 Testing Payments

Use Razorpay test credentials:

```
Card Number : 5267 3181 8797 5449
Expiry      : 02/26
CVV         : 123
OTP         : 1234
```

Or use Net Banking:
```
Username : success
Password : success
```

---

## 🔮 Roadmap

- [ ] Rider service (delivery tracking)
- [ ] Real-time order tracking with Socket.io
- [ ] Push notifications
- [ ] Admin panel (restaurant verification)
- [ ] Reviews and ratings system
- [ ] Order history page
- [ ] Loyalty points system
- [ ] Mobile app (React Native)

---

## 👨‍💻 Author

**Haseeb**
- Building FoodMesh as a full-stack microservices project

---

## 📄 License

This project is licensed under the ISC License.

---

> Built with ❤️ using React, Node.js, MongoDB, RabbitMQ, and Razorpay
