/**
 * User Model - Lớp đối tượng Người dùng (Admin/Staff)
 * Theo mẫu OOP
 */
export class User {
  id: string
  email: string
  fullName: string
  role: 'admin' | 'staff'
  isActive: boolean
  createdAt?: Date

  constructor(data: {
    id: string
    email: string
    full_name: string
    role: 'admin' | 'staff'
    is_active?: boolean
    created_at?: string
  }) {
    this.id = data.id
    this.email = data.email
    this.fullName = data.full_name
    this.role = data.role
    this.isActive = data.is_active ?? true
    this.createdAt = data.created_at ? new Date(data.created_at) : undefined
  }

  /**
   * Kiểm tra người dùng có phải Admin không
   */
  isAdmin(): boolean {
    return this.role === 'admin'
  }

  /**
   * Kiểm tra người dùng có phải Staff không
   */
  isStaff(): boolean {
    return this.role === 'staff'
  }

  /**
   * Kiểm tra tài khoản có đang hoạt động không
   */
  canLogin(): boolean {
    return this.isActive
  }

  /**
   * Lấy tên hiển thị
   */
  getDisplayName(): string {
    return this.fullName || this.email
  }

  /**
   * Chuyển đổi từ plain object sang User instance
   */
  static fromJSON(data: Record<string, unknown>): User {
    return new User({
      id: data.id as string,
      email: data.email as string,
      full_name: data.full_name as string,
      role: data.role as 'admin' | 'staff',
      is_active: data.is_active as boolean,
      created_at: data.created_at as string
    })
  }

  /**
   * Chuyển đổi User instance sang plain object
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      email: this.email,
      full_name: this.fullName,
      role: this.role,
      is_active: this.isActive,
      created_at: this.createdAt?.toISOString()
    }
  }
}
