# Coffee Shop Management System ☕

Hệ thống quản lý quán cà phê full-stack với Vue 3 frontend và Express.js backend theo mô hình MVC.

## 🚀 Demo

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs

## ✨ Features

| Module | Features |
|--------|----------|
| **Order** | Chọn bàn, thêm món theo danh mục, thanh toán |
| **Products** | CRUD + phân loại (Cafe, Trà sữa, Nước ép,...) |
| **Staff** | Quản lý nhân viên, phân quyền Admin/Staff |
| **Tables** | Quản lý trạng thái bàn (trống/có khách) |
| **Invoices** | Tạo hóa đơn, thanh toán, báo cáo doanh thu |
| **Reports** | Tổng kết ca làm việc |

## 🛠️ Tech Stack

### Frontend
- Vue 3 + Composition API
- TypeScript
- Tailwind CSS
- Pinia (State Management)
- Vite

### Backend
- Express.js + TypeScript
- Supabase (PostgreSQL + Auth)
- Swagger/OpenAPI (API Docs)
- MVC Architecture

## 📁 Project Structure

```
coffeeShop/
├── packages/
│   ├── frontend/              # Vue 3 SPA
│   │   └── src/
│   │       ├── views/         # Pages
│   │       ├── stores/        # Pinia stores
│   │       ├── components/    # UI components
│   │       └── lib/           # Supabase config
│   │
│   └── backend/               # Express API (MVC)
│       └── src/
│           ├── models/        # Database queries
│           ├── controllers/     # Business logic
│           ├── routes/          # API routes + Swagger
│           ├── services/        # Business services
│           ├── middleware/      # Auth, error handling
│           └── db/              # Database connection
│
└── scripts/                   # SQL migrations
```

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/CongHieu02-stack/coffeeShop.git
cd coffeeShop

# Install all dependencies
npm install
cd packages/frontend && npm install
cd ../backend && npm install
```

### 2. Environment Setup

**Frontend** - `packages/frontend/.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Backend** - `packages/backend/.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
PORT=3000
```

### 3. Run Servers

```bash
# Backend (Terminal 1)
cd packages/backend
npm run dev
# API: http://localhost:3000
# Docs: http://localhost:3000/api-docs

# Frontend (Terminal 2)
cd packages/frontend
npm run dev
# App: http://localhost:5173
```

## 📚 API Documentation

Full API docs with Swagger UI at: **http://localhost:3000/api-docs**

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email/password |
| GET | `/api/auth/profile` | Get current user (JWT required) |

### Products
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/products` | Public |
| POST | `/api/products` | Admin |
| PUT | `/api/products/:id` | Admin |
| DELETE | `/api/products/:id` | Admin |

### Staff, Tables, Invoices, Reports
Similar REST pattern with appropriate auth requirements.

## 👤 Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@coffee.shop | admin123 |
| Staff | staff@coffee.shop | staff123 |

## �️ Database

Key tables: `products`, `profiles`, `cafe_tables`, `invoices`, `invoice_items`, `shift_reports`

See `scripts/` folder for full SQL setup.

## 🔐 Auth Flow

1. Login via `/api/auth/login` → Get JWT token
2. Include token in header: `Authorization: Bearer <token>`
3. Test APIs in Swagger UI with "Authorize" button

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `npx kill-port 3000` or change PORT in .env |
| Supabase connection error | Check URL and keys in .env files |
| Database RLS errors | Verify RLS policies or use Service Key |

## 🤝 Contributing

1. Fork the repository
2. Create branch: `git checkout -b feature/name`
3. Commit: `git commit -m "Description"`
4. Push: `git push origin feature/name`
5. Open Pull Request

## 📄 License

MIT License

**Author:** [@CongHieu02-stack](https://github.com/CongHieu02-stack)
