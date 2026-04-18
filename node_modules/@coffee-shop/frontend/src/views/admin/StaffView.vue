<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm nhân viên..."
          class="input w-64 pl-10"
        />
        <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      <button @click="isModalOpen = true" class="btn-primary">
        <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        Thêm nhân viên
      </button>
    </div>
    
    <!-- Staff Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in filteredStaff" :key="member.id">
              <td class="font-medium">{{ member.full_name }}</td>
              <td>{{ member.email }}</td>
              <td>
                <span :class="member.role === 'admin' ? 'badge-warning' : 'badge-info'">
                  {{ member.role === 'admin' ? 'Quản trị viên' : 'Nhân viên' }}
                </span>
              </td>
              <td>
                <span :class="member.is_active ? 'badge-success' : 'badge-danger'">
                  {{ member.is_active ? 'Hoạt động' : 'Vô hiệu' }}
                </span>
              </td>
              <td class="text-gray-500">{{ formatDate(member.created_at) }}</td>
              <td>
                <button 
                  @click="toggleStatus(member)"
                  :class="[
                    'p-2 rounded-lg transition-colors',
                    member.is_active 
                      ? 'text-red-600 hover:bg-red-50' 
                      : 'text-green-600 hover:bg-green-50'
                  ]"
                >
                  <svg v-if="member.is_active" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr v-if="filteredStaff.length === 0">
              <td colspan="6" class="text-center text-gray-500 py-8">
                Không tìm thấy nhân viên nào
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Add Staff Modal -->
    <ModalDialog
      :is-open="isModalOpen"
      title="Thêm nhân viên mới"
      @close="isModalOpen = false"
    >
      <form @submit.prevent="createStaff" class="space-y-4">
        <div>
          <label class="label">Họ tên</label>
          <input v-model="form.full_name" type="text" class="input" required />
        </div>
        
        <div>
          <label class="label">Email</label>
          <input v-model="form.email" type="email" class="input" required />
        </div>
        
        <div>
          <label class="label">Mật khẩu</label>
          <input v-model="form.password" type="password" class="input" required minlength="6" />
        </div>
        
        <div>
          <label class="label">Vai trò</label>
          <select v-model="form.role" class="input" required>
            <option value="staff">Nhân viên</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <button type="button" @click="isModalOpen = false" class="btn-secondary">Hủy</button>
          <button type="submit" class="btn-primary" :disabled="staffStore.isLoading">
            Thêm nhân viên
          </button>
        </div>
      </form>
    </ModalDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStaffStore, type StaffMember } from '@/stores/staff'
import ModalDialog from '@/components/common/ModalDialog.vue'

const staffStore = useStaffStore()

const searchQuery = ref('')
const isModalOpen = ref(false)
const form = ref({
  full_name: '',
  email: '',
  password: '',
  role: 'staff' as 'admin' | 'staff'
})

const filteredStaff = computed(() => {
  if (!searchQuery.value) return staffStore.staff
  
  const query = searchQuery.value.toLowerCase()
  return staffStore.staff.filter(s => 
    s.full_name.toLowerCase().includes(query) ||
    s.email.toLowerCase().includes(query)
  )
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const createStaff = async () => {
  const success = await staffStore.createStaff(
    form.value.email,
    form.value.password,
    form.value.full_name,
    form.value.role
  )
  
  if (success) {
    isModalOpen.value = false
    form.value = {
      full_name: '',
      email: '',
      password: '',
      role: 'staff'
    }
  }
}

const toggleStatus = async (member: StaffMember) => {
  await staffStore.toggleStaffStatus(member.id, !member.is_active)
}

onMounted(() => {
  staffStore.loadStaff()
})
</script>
