export interface Database {
    public: {
        Tables: {
            products: {
                Row: {
                    id: string;
                    name: string;
                    description: string | null;
                    price: number;
                    category: string;
                    image_url: string | null;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    description?: string | null;
                    price: number;
                    category: string;
                    image_url?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string | null;
                    price?: number;
                    category?: string;
                    image_url?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            staff: {
                Row: {
                    id: string;
                    full_name: string;
                    email: string;
                    role: 'admin' | 'manager' | 'staff';
                    phone: string | null;
                    is_active: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    full_name: string;
                    email: string;
                    role: 'admin' | 'manager' | 'staff';
                    phone?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    full_name?: string;
                    email?: string;
                    role?: 'admin' | 'manager' | 'staff';
                    phone?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                };
            };
            profiles: {
                Row: {
                    id: string;
                    full_name: string | null;
                    role: 'admin' | 'manager' | 'staff' | null;
                    phone: string | null;
                    is_active: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    full_name?: string | null;
                    role?: 'admin' | 'manager' | 'staff' | null;
                    phone?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    full_name?: string | null;
                    role?: 'admin' | 'manager' | 'staff' | null;
                    phone?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                };
            };
            tables: {
                Row: {
                    id: string;
                    table_number: number;
                    capacity: number;
                    status: 'available' | 'occupied' | 'reserved';
                    location: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    table_number: number;
                    capacity: number;
                    status?: 'available' | 'occupied' | 'reserved';
                    location?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    table_number?: number;
                    capacity?: number;
                    status?: 'available' | 'occupied' | 'reserved';
                    location?: string | null;
                    created_at?: string;
                };
            };
            vouchers: {
                Row: {
                    id: string;
                    code: string;
                    description: string | null;
                    discount_value: number;
                    is_percentage: boolean;
                    min_order_amount: number | null;
                    max_discount: number | null;
                    is_active: boolean;
                    expiry_date: string | null;
                    usage_limit: number | null;
                    usage_count: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    code: string;
                    description?: string | null;
                    discount_value: number;
                    is_percentage: boolean;
                    min_order_amount?: number | null;
                    max_discount?: number | null;
                    is_active?: boolean;
                    expiry_date?: string | null;
                    usage_limit?: number | null;
                    usage_count?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    code?: string;
                    description?: string | null;
                    discount_value?: number;
                    is_percentage?: boolean;
                    min_order_amount?: number | null;
                    max_discount?: number | null;
                    is_active?: boolean;
                    expiry_date?: string | null;
                    usage_limit?: number | null;
                    usage_count?: number;
                    created_at?: string;
                };
            };
        };
    };
}
//# sourceMappingURL=database.d.ts.map