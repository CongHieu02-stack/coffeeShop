/**
 * Table Model - Lớp đối tượng Bàn (trống/có khách)
 * Theo mẫu OOP
 */

export class Table {
  id: number
  name: string
  isOccupied: boolean
  isActive: boolean
  createdAt?: Date

  constructor(data: {
    id: number
    name: string
    is_occupied?: boolean
    is_active?: boolean
    created_at?: string
  }) {
    this.id = data.id
    this.name = data.name
    this.isOccupied = data.is_occupied ?? false
    this.isActive = data.is_active ?? true
    this.createdAt = data.created_at ? new Date(data.created_at) : undefined
  }

  /**
   * Kiểm tra bàn có đang trống không
   */
  isAvailable(): boolean {
    return !this.isOccupied && this.isActive
  }

  /**
   * Đánh dấu bàn có khách
   */
  occupy(): void {
    if (!this.isActive) {
      throw new Error('Bàn không hoạt động')
    }
    this.isOccupied = true
  }

  /**
   * Đánh dấu bàn trống
   */
  release(): void {
    this.isOccupied = false
  }

  /**
   * Vô hiệu hóa bàn
   */
  deactivate(): void {
    this.isActive = false
    this.isOccupied = false
  }

  /**
   * Kích hoạt bàn
   */
  activate(): void {
    this.isActive = true
  }

  /**
   * Lấy trạng thái hiển thị
   */
  getStatusLabel(): string {
    if (!this.isActive) return 'Ngừng hoạt động'
    return this.isOccupied ? 'Có khách' : 'Trống'
  }

  /**
   * Lấy màu trạng thái
   */
  getStatusColor(): string {
    if (!this.isActive) return 'gray'
    return this.isOccupied ? 'red' : 'green'
  }

  /**
   * Chuyển đổi từ plain object
   */
  static fromJSON(data: Record<string, unknown>): Table {
    return new Table({
      id: data.id as number,
      name: data.name as string,
      is_occupied: data.is_occupied as boolean,
      is_active: data.is_active as boolean,
      created_at: data.created_at as string
    })
  }

  /**
   * Chuyển đổi sang plain object
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      is_occupied: this.isOccupied,
      is_active: this.isActive,
      created_at: this.createdAt?.toISOString()
    }
  }
}
