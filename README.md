# Coffee Shop Management System

Hệ thống quản lý quán cà phê với đầy đủ chức năng order, thanh toán và báo cáo doanh thu.

## 🚀 Demo

- **Frontend**: https://coffee-shop-demo.netlify.app (hoặc chạy local)
- **Backend API**: Chạy local với Supabase

## 📋 Tính năng chính

### Nhân viên (Staff)
- ✅ Chọn bàn và tạo hóa đơn
- ✅ Thêm/xóa/sửa món trong giỏ hàng
- ✅ Thanh toán tiền mặt hoặc chuyển khoản
- ✅ Xem hóa đơn pending và thêm món tiếp
- ✅ Tổng kết ca làm việc (doanh thu theo ngày)
- ✅ Quản lý trạng thái bàn (trống/có khách)

### Admin
- ✅ Quản lý sản phẩm (thêm/sửa/xóa)
- ✅ Quản lý nhân viên
- ✅ Xem tất cả hóa đơn
- ✅ Báo cáo doanh thu

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3 + TypeScript + Vite |
| Styling | Tailwind CSS |
| State Management | Pinia |
| Backend | Supabase (PostgreSQL + Auth) |
| Database | PostgreSQL |
| Auth | Supabase Auth |

## 📁 Project Structure

```
coffee-shop/
├── packages/
│   ├── frontend/          # Vue 3 SPA
│   │   ├── src/
│   │   │   ├── views/     # Các trang UI
│   │   │   ├── stores/    # Pinia stores
│   │   │   ├── components/# UI components
│   │   │   └── lib/       # Supabase client
│   │   └── package.json
│   └── backend/           # Express API (optional)
├── public/                # Static assets
└── package.json           # Root package.json
```

## 🚀 Cài đặt và chạy

### 1. Clone repository

```bash
git clone https://github.com/CongHieu02-stack/coffeeShop.git
cd coffeeShop
```

### 2. Cài đặt dependencies

```bash
npm install
cd packages/frontend && npm install
```

### 3. Cấu hình Supabase

Tạo file `packages/frontend/.env`:

```env
VITE_SUPABASE_URL=https://fbrbtbkkwoqsssmbiknr.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Database Schema

Chạy các SQL sau trong Supabase SQL Editor:

```sql
-- Bảng nhân viên
CREATE TABLE staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  role text DEFAULT 'staff',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Bảng sản phẩm
CREATE TABLE products (
  id serial PRIMARY KEY,
  name text NOT NULL,
  price integer NOT NULL,
  description text,
  image_url text,
  category text,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Bảng bàn
CREATE TABLE cafe_tables (
  id serial PRIMARY KEY,
  name text NOT NULL,
  is_occupied boolean DEFAULT false
);

-- Bảng hóa đơn
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES staff(id),
  table_id integer REFERENCES cafe_tables(id),
  total_amount integer DEFAULT 0,
  payment_method text,
  status text DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Bảng chi tiết hóa đơn
CREATE TABLE invoice_items (
  id serial PRIMARY KEY,
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  product_id integer REFERENCES products(id),
  quantity integer NOT NULL,
  unit_price integer NOT NULL,
  subtotal integer GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- Thêm 16 bàn
INSERT INTO cafe_tables (name, is_occupied) VALUES
('Bàn 1', false), ('Bàn 2', false), ('Bàn 3', false), ('Bàn 4', false),
('Bàn 5', false), ('Bàn 6', false), ('Bàn 7', false), ('Bàn 8', false),
('Bàn 9', false), ('Bàn 10', false), ('Bàn 11', false), ('Bàn 12', false),
('Bàn 13', false), ('Bàn 14', false), ('Bàn 15', false), ('Bàn 16', false);
```

### 5. Chạy development server

```bash
cd packages/frontend
npm run dev
```

Mở http://localhost:5173

## 👤 Tài khoản mặc định

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@coffee.shop | admin123 |
| Staff | staff@coffee.shop | staff123 |

## 📱 Flow sử dụng

### Order và thanh toán

1. **Chọn bàn** → Vào trang order
2. **Thêm món** → Giỏ hàng cập nhật realtime
3. **Thanh toán ngay**:
   - Bấm "Thanh toán" → Chọn phương thức (Tiền mặt/Chuyển khoản)
   - Hóa đơn `paid`, bàn về trống, về màn hình chọn bàn
4. **Chưa thanh toán**:
   - Bấm back → Hóa đơn `pending`, bàn vẫn "có khách"
   - Vào lại bàn → Thấy hóa đơn cũ, có thể thêm món hoặc thanh toán

### Luật làm trống bàn

- **Bàn trống**: Có thể chọn và order bình thường
- **Bàn có khách**: Phải vào thanh toán hóa đơn pending trước, không thể làm trống trực tiếp

## 📊 Tổng kết ca

- Hiển thị tất cả hóa đơn `paid` trong ngày
- Thống kê: Tổng doanh thu, tiền mặt, chuyển khoản
- Tự động reload khi quay lại từ trang order

## 🔐 Row Level Security (RLS)

Các bảng invoices và invoice_items cần RLS policies để nhân viên chỉ xem/sửa hóa đơn của mình:

```sql
-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Staff can view/update their own invoices
CREATE POLICY "Staff can view own invoices" ON invoices
  FOR SELECT USING (staff_id = auth.uid());

CREATE POLICY "Staff can update own invoices" ON invoices
  FOR UPDATE USING (staff_id = auth.uid());
```

## 🐛 Troubleshooting

| Lỗi | Giải pháp |
|-----|------------|
| Không tìm thấy bàn | Kiểm tra DEMO_MODE hoặc dữ liệu trong Supabase |
| Không lưu hóa đơn | Kiểm tra RLS policies và constraints |
| Thanh toán lỗi | Kiểm tra staff_id và invoice status |

## 🤝 Đóng góp

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit changes: `git commit -m "Mô tả thay đổi"`
4. Push lên branch: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

## 📄 License

MIT License - Xem [LICENSE](LICENSE) để biết thêm chi tiết.

## 👨‍💻 Tác giả

- **Cong Hieu** - [@CongHieu02-stack](https://github.com/CongHieu02-stack)

---

⭐ Star repository nếu thấy hữu ích!
