-- Phân loại sản phẩm vào các danh mục
-- Chạy script này trong Supabase SQL Editor

-- 1. Cập nhật sản phẩm là Cà phê (cafe)
UPDATE products 
SET category = 'cafe' 
WHERE name ILIKE ANY (ARRAY[
  '%cà phê%', '%cafe%', '%espresso%', '%americano%', '%cappuccino%', 
  '%latte%', '%mocha%', '%bạc xỉu%', '%bac xiu%',
  '%cold brew%', '%phin%', '%chồn%', '%chon%',
  '%đen%', '%den%', '%sữa%', '%sua%'
])
AND (category IS NULL OR category = '');

-- 2. Cập nhật sản phẩm là Trà sữa (trasua)
UPDATE products 
SET category = 'trasua' 
WHERE name ILIKE ANY (ARRAY[
  '%trà sữa%', '%tra sua%', '%trà trái cây%', '%tra trai cay%',
  '%trà đào%', '%tra dao%', '%trà vải%', '%tra vai%',
  '%trà nhài%', '%tra nhai%', '%trà ô long%', '%tra o long%',
  '%oolong%', '%milk tea%', '%bubble tea%', '%trân châu%'
])
AND (category IS NULL OR category = '');

-- 3. Cập nhật sản phẩm là Nước ép (nuocep)
UPDATE products 
SET category = 'nuocep' 
WHERE name ILIKE ANY (ARRAY[
  '%nước ép%', '%nuoc ep%', '%ép%', '%sinh tố%', '%sinh to%',
  '%cam%', '%chanh%', '%dâu%', '%dau%', '%xoài%', '%xoai%',
  '%táo%', '%tao%', '%dưa hấu%', '%dua hau%', '%cà rốt%',
  '%ca rot%', '%cần tây%', '%can tay%', '%cải thìa%', '%cai thia%',
  '%smoothie%', '%juice%'
])
AND (category IS NULL OR category = '');

-- 4. Cập nhật sản phẩm là Latte (latte)
UPDATE products 
SET category = 'latte' 
WHERE name ILIKE ANY (ARRAY[
  '%latte%', '%matcha latte%', '%socola latte%', '%caramel latte%',
  '%vanilla latte%', '%hazelnut latte%', '%trà xanh latte%'
])
AND (category IS NULL OR category = '');

-- 5. Cập nhật sản phẩm là Yogurt (yogurt)
UPDATE products 
SET category = 'yogurt' 
WHERE name ILIKE ANY (ARRAY[
  '%yogurt%', '%sữa chua%', '%sua chua%', '%sữa trân châu%',
  '%yaourt%', '%yoghurt%'
])
AND (category IS NULL OR category = '');

-- 6. Cập nhật các sản phẩm còn lại vào Khác (khac)
UPDATE products 
SET category = 'khac' 
WHERE category IS NULL OR category = '';

-- Kiểm tra kết quả
SELECT 
  CASE category
    WHEN 'cafe' THEN 'Cà phê'
    WHEN 'trasua' THEN 'Trà sữa'
    WHEN 'nuocep' THEN 'Nước ép'
    WHEN 'latte' THEN 'Latte'
    WHEN 'yogurt' THEN 'Yogurt'
    WHEN 'khac' THEN 'Khác'
    ELSE category
  END as danh_muc,
  COUNT(*) as so_luong,
  STRING_AGG(name, ', ' ORDER BY name) as danh_sach
FROM products
GROUP BY category
ORDER BY category;
