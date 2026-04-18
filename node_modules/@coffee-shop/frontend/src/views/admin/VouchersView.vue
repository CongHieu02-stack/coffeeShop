<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">Quản lý Voucher</h2>
      <button @click="openAddModal" class="btn-primary">
        <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Thêm voucher
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
        <div class="text-sm opacity-90">Tổng voucher</div>
        <div class="text-3xl font-bold mt-1">{{ vouchersStore.vouchers.length }}</div>
      </div>
      <div class="card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div class="text-sm opacity-90">Đang hoạt động</div>
        <div class="text-3xl font-bold mt-1">{{ activeCount }}</div>
      </div>
      <div class="card p-6 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
        <div class="text-sm opacity-90">Đã hết hạn</div>
        <div class="text-3xl font-bold mt-1">{{ expiredCount }}</div>
      </div>
      <div class="card p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <div class="text-sm opacity-90">Tổng lượt sử dụng</div>
        <div class="text-3xl font-bold mt-1">{{ totalUsage }}</div>
      </div>
    </div>

    <!-- Vouchers Table -->
    <div class="card">
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900">Danh sách voucher</h3>
        <div class="flex space-x-2">
          <button @click="showActiveOnly = !showActiveOnly" :class="showActiveOnly ? 'btn-primary' : 'btn-secondary'" class="text-sm">
            {{ showActiveOnly ? 'Đang hoạt động' : 'Tất cả' }}
          </button>
        </div>
      </div>
      
      <div v-if="vouchersStore.isLoading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
      </div>
      
      <div v-else-if="filteredVouchers.length === 0" class="p-8 text-center text-gray-500">
        Chưa có voucher nào
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Mã voucher</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Mô tả</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">Giảm giá</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">Đơn tối thiểu</th>
              <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">Trạng thái</th>
              <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">Hết hạn</th>
              <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">Đã dùng</th>
              <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="voucher in filteredVouchers" :key="voucher.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-sm font-semibold text-gray-900">{{ voucher.code }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ voucher.description || '-' }}</td>
              <td class="px-4 py-3 text-sm text-right font-medium">
                {{ voucher.is_percentage ? voucher.discount_value + '%' : formatPrice(voucher.discount_value) }}
                <span v-if="voucher.max_discount" class="text-xs text-gray-500 block">Tối đa {{ formatPrice(voucher.max_discount) }}</span>
              </td>
              <td class="px-4 py-3 text-sm text-right">{{ voucher.min_order_amount ? formatPrice(voucher.min_order_amount) : '-' }}</td>
              <td class="px-4 py-3 text-sm text-center">
                <span :class="getStatusClass(voucher)">{{ getStatusText(voucher) }}</span>
              </td>
              <td class="px-4 py-3 text-sm text-center">{{ formatDate(voucher.expiry_date) }}</td>
              <td class="px-4 py-3 text-sm text-center">
                {{ voucher.usage_count }}{{ voucher.usage_limit ? '/' + voucher.usage_limit : '' }}
              </td>
              <td class="px-4 py-3 text-sm text-center">
                <div class="flex justify-center space-x-2">
                  <button @click="openEditModal(voucher)" class="text-blue-600 hover:text-blue-800">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="toggleStatus(voucher)" :title="voucher.is_active ? 'Tắt voucher' : 'Bật voucher'" :class="voucher.is_active ? 'text-amber-600 hover:text-amber-800' : 'text-emerald-600 hover:text-emerald-800'">
                    <svg v-if="voucher.is_active" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button @click="confirmDelete(voucher)" class="text-red-600 hover:text-red-800">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div class="px-6 py-4 border-b">
          <h3 class="text-lg font-bold text-gray-900">{{ editingVoucher ? 'Sửa voucher' : 'Thêm voucher' }}</h3>
        </div>
        
        <form @submit.prevent="saveVoucher" class="p-6 space-y-4">
          <div>
            <label class="label">Mã voucher <span class="text-red-500">*</span></label>
            <input v-model="form.code" type="text" class="input" placeholder="VD: WELCOME10" required />
          </div>
          
          <div>
            <label class="label">Mô tả</label>
            <input v-model="form.description" type="text" class="input" placeholder="Mô tả voucher..." />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Giá trị giảm <span class="text-red-500">*</span></label>
              <input v-model.number="form.discount_value" type="number" class="input" min="0" required />
            </div>
            <div>
              <label class="label">Loại giảm giá</label>
              <select v-model="form.is_percentage" class="input">
                <option :value="true">Phần trăm (%)</option>
                <option :value="false">Số tiền (VNĐ)</option>
              </select>
            </div>
          </div>
          
          <div v-if="form.is_percentage">
            <label class="label">Giảm tối đa (VNĐ)</label>
            <input v-model.number="form.max_discount" type="number" class="input" min="0" placeholder="Không giới hạn" />
          </div>
          
          <div>
            <label class="label">Đơn hàng tối thiểu (VNĐ)</label>
            <input v-model.number="form.min_order_amount" type="number" class="input" min="0" placeholder="Không yêu cầu" />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Ngày hết hạn</label>
              <input v-model="form.expiry_date" type="date" class="input" />
            </div>
            <div>
              <label class="label">Giới hạn sử dụng</label>
              <input v-model.number="form.usage_limit" type="number" class="input" min="1" placeholder="Không giới hạn" />
            </div>
          </div>
          
          <div class="flex items-center">
            <input v-model="form.is_active" type="checkbox" id="is_active" class="w-4 h-4 text-amber-600 rounded" />
            <label for="is_active" class="ml-2 text-sm text-gray-700">Kích hoạt ngay</label>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" @click="closeModal" class="btn-secondary">Hủy</button>
            <button type="submit" class="btn-primary" :disabled="vouchersStore.isLoading">
              {{ vouchersStore.isLoading ? 'Đang lưu...' : (editingVoucher ? 'Cập nhật' : 'Thêm mới') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div v-if="voucherToDelete" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
        <p class="text-gray-600 mb-6">Bạn có chắc muốn xóa voucher "{{ voucherToDelete.code }}"? Hành động này không thể hoàn tác.</p>
        <div class="flex justify-end space-x-3">
          <button @click="voucherToDelete = null" class="btn-secondary">Hủy</button>
          <button @click="deleteVoucher" class="btn-danger" :disabled="vouchersStore.isLoading">
            {{ vouchersStore.isLoading ? 'Đang xóa...' : 'Xóa' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useVouchersStore, type Voucher } from '@/stores/vouchers'

const vouchersStore = useVouchersStore()
const isModalOpen = ref(false)
const editingVoucher = ref<Voucher | null>(null)
const voucherToDelete = ref<Voucher | null>(null)
const showActiveOnly = ref(false)

const form = ref({
  code: '',
  description: '',
  discount_value: 0,
  is_percentage: true,
  max_discount: null as number | null,
  min_order_amount: null as number | null,
  expiry_date: '',
  usage_limit: null as number | null,
  is_active: true
})

const filteredVouchers = computed(() => {
  let list = vouchersStore.vouchers
  if (showActiveOnly.value) {
    list = list.filter(v => v.is_active)
  }
  return list
})

const activeCount = computed(() => vouchersStore.vouchers.filter(v => v.is_active).length)

const expiredCount = computed(() => 
  vouchersStore.vouchers.filter(v => {
    if (!v.expiry_date) return false
    return new Date(v.expiry_date) < new Date()
  }).length
)

const totalUsage = computed(() => 
  vouchersStore.vouchers.reduce((sum, v) => sum + v.usage_count, 0)
)

const formatPrice = (price: number | null) => {
  if (!price) return '-'
  return price.toLocaleString('vi-VN') + 'đ'
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Không'
  return new Date(dateStr).toLocaleDateString('vi-VN')
}

const getStatusClass = (voucher: Voucher) => {
  const base = 'px-2 py-1 rounded-full text-xs font-medium '
  if (!voucher.is_active) return base + 'bg-gray-100 text-gray-600'
  if (voucher.expiry_date && new Date(voucher.expiry_date) < new Date()) return base + 'bg-red-100 text-red-600'
  if (voucher.usage_limit && voucher.usage_count >= voucher.usage_limit) return base + 'bg-amber-100 text-amber-600'
  return base + 'bg-emerald-100 text-emerald-600'
}

const getStatusText = (voucher: Voucher) => {
  if (!voucher.is_active) return 'Đã tắt'
  if (voucher.expiry_date && new Date(voucher.expiry_date) < new Date()) return 'Hết hạn'
  if (voucher.usage_limit && voucher.usage_count >= voucher.usage_limit) return 'Hết lượt'
  return 'Hoạt động'
}

const openAddModal = () => {
  editingVoucher.value = null
  form.value = {
    code: '',
    description: '',
    discount_value: 10,
    is_percentage: true,
    max_discount: null,
    min_order_amount: null,
    expiry_date: '',
    usage_limit: null,
    is_active: true
  }
  isModalOpen.value = true
}

const openEditModal = (voucher: Voucher) => {
  editingVoucher.value = voucher
  form.value = {
    code: voucher.code,
    description: voucher.description || '',
    discount_value: voucher.discount_value,
    is_percentage: voucher.is_percentage,
    max_discount: voucher.max_discount,
    min_order_amount: voucher.min_order_amount,
    expiry_date: voucher.expiry_date ? voucher.expiry_date.split('T')[0] : '',
    usage_limit: voucher.usage_limit,
    is_active: voucher.is_active
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingVoucher.value = null
}

const saveVoucher = async () => {
  try {
    const data = {
      ...form.value,
      expiry_date: form.value.expiry_date || null
    }
    
    if (editingVoucher.value) {
      await vouchersStore.updateVoucher(editingVoucher.value.id, data)
    } else {
      await vouchersStore.createVoucher(data)
    }
    closeModal()
  } catch (err) {
    alert('Có lỗi xảy ra. Vui lòng thử lại.')
  }
}

const toggleStatus = async (voucher: Voucher) => {
  await vouchersStore.toggleVoucherStatus(voucher.id, !voucher.is_active)
}

const confirmDelete = (voucher: Voucher) => {
  voucherToDelete.value = voucher
}

const deleteVoucher = async () => {
  if (!voucherToDelete.value) return
  try {
    await vouchersStore.deleteVoucher(voucherToDelete.value.id)
    voucherToDelete.value = null
  } catch (err) {
    alert('Có lỗi xảy ra khi xóa.')
  }
}

onMounted(() => {
  vouchersStore.loadVouchers()
})
</script>

<style scoped>
.btn-danger {
  @apply px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors;
}
</style>
