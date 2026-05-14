# ShopKart - Full Stack E-Commerce Platform

ShopKart is a full-stack e-commerce assignment built with React, Node.js/Express, and MongoDB. It includes customer shopping flows, JWT authentication, an admin dashboard, and a seed script for demo data.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v6, Axios, React Hot Toast |
| Backend | Node.js, Express, JWT Auth |
| Database | MongoDB, Mongoose |
| Styling | Custom CSS |
| Build Tool | Vite |

## Project Structure

```text
ecommerce/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar/
│   │   │   ├── Footer/
│   │   │   └── ProductCard/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── utils/api.js
│   ├── package.json
│   └── vite.config.js
│
└── server/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── seeders/seed.js
    ├── package.json
    └── index.js
```

## Setup

### Prerequisites

- Node.js v18+
- MongoDB local instance or MongoDB Atlas
- npm

### Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Seed demo data:

```bash
npm run seed
```

Start the API:

```bash
npm run dev
```

The backend runs at `http://localhost:8000`.

### Frontend

```bash
cd ../client
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

For production deployments, add `client/.env`:

```env
VITE_API_URL=https://your-api-host.com/api
```

In local development this is optional because Vite proxies `/api` to `http://localhost:8000`.

## Demo Accounts

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shopkart.com | admin123 |
| User | john@example.com | password123 |

## Environment Variables

### Server

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Long random secret for JWT signing | Yes |
| `PORT` | API port, defaults to `8000` in local env examples | No |
| `CLIENT_URL` | Frontend origin allowed by CORS | No |
| `NODE_ENV` | `development` or `production` | No |

### Client

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Deployed API base URL, for example `https://api.example.com/api` | Production only |

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a user |
| `POST` | `/api/auth/login` | Login and receive token |
| `GET` | `/api/auth/me` | Get current user |
| `PUT` | `/api/auth/profile` | Update profile |
| `POST` | `/api/auth/change-password` | Change password |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List products with search, filters, sort, and pagination |
| `GET` | `/api/products/featured` | Featured products |
| `GET` | `/api/products/:slug` | Product details |
| `POST` | `/api/products` | Create product, admin only |
| `PUT` | `/api/products/:id` | Update product, admin only |
| `DELETE` | `/api/products/:id` | Soft-delete product, admin only |

### Cart

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cart` | Get current user's cart |
| `POST` | `/api/cart/add` | Add an item |
| `PUT` | `/api/cart/item/:id` | Update quantity |
| `DELETE` | `/api/cart/item/:id` | Remove item |
| `DELETE` | `/api/cart/clear` | Clear cart |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/orders` | Place order |
| `GET` | `/api/orders/my` | Current user's orders |
| `GET` | `/api/orders/:id` | Order details |
| `GET` | `/api/orders` | All orders, admin only |
| `PUT` | `/api/orders/:id/status` | Update status, admin only |

### Reviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/reviews/:productId` | Product reviews |
| `POST` | `/api/reviews` | Submit review |
| `DELETE` | `/api/reviews/:id` | Delete own review |

## Features

### Customer

- Home page with categories, promos, and featured products
- Product search, filtering, sorting, and pagination
- Product detail pages with variants and reviews
- Persistent authenticated cart
- Checkout flow with address, payment method, and order review
- Order history and order detail pages
- Profile updates and password change

### Admin

- Dashboard overview
- Product create, update, and delete
- Order listing and status updates
- User listing

### Technical

- JWT authentication and protected routes
- Password hashing with bcrypt
- Helmet, CORS, and API rate limiting
- Loading, empty, and API error states
- Responsive React UI
- Deployment-oriented environment handling

## Deployment

### Frontend

```bash
cd client
npm run build
```

Deploy the generated `dist/` folder to Vercel, Netlify, or another static host. Set `VITE_API_URL` to the deployed backend API URL.

### Backend

Deploy `server/` to Render, Railway, or a Node-capable host.

```bash
cd server
npm start
```

Set `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, and `NODE_ENV=production` in the platform dashboard.

### Database

Use MongoDB Atlas for deployment. After setting `MONGODB_URI`, run `npm run seed` once if demo data is needed.

## Pages

| Page | Route |
|------|-------|
| Home | `/` |
| Products | `/products` |
| Product Detail | `/products/:slug` |
| Cart | `/cart` |
| Checkout | `/checkout` |
| Login | `/login` |
| Register | `/register` |
| My Orders | `/orders` |
| Order Detail | `/orders/:id` |
| Profile | `/profile` |
| Admin | `/admin` |

## Submission Checklist

- Keep real `.env` files, `node_modules`, and generated `dist/` output out of git.
- Commit package files, source code, and this README.
- Run `npm run build` in `client/` before submitting.
- Verify MongoDB is running before seeding or starting the API locally.

Built for the Orufy Technologies assignment.
