<template>
  <div class="h-[calc(100vh-140px)] flex gap-6">
    <!-- Products Panel -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-4">
          <button 
            @click="goBack"
            class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Order - Bàn {{ tableName }}</h2>
            <p class="text-sm text-gray-500">{{ currentTime }}</p>
          </div>
        </div>
        
        <div class="relative w-64">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            class="input w-full pl-10"
          />
          <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <!-- Products Grid -->
      <div class="flex-1 overflow-y-auto">
        <div class="grid grid-cols-3 gap-4">
          <button
            v-for="product in filteredProducts"
            :key="product.id"
            @click="addToCart(product)"
            :disabled="!product.is_available"
            class="card p-4 text-left transition-all hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <img 
              :src="product.image_url || '/placeholder-product.png'" 
              :alt="product.name"
              class="w-full h-32 object-cover rounded-lg mb-3"
            />
            <h4 class="font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">{{ product.name }}</h4>
            <p class="text-coffee-600 font-bold text-lg mt-2">{{ formatCurrency(product.price) }}</p>
          </button>
        </div>
        
        <div v-if="filteredProducts.length === 0" class="text-center text-gray-500 py-12">
          Không tìm thấy sản phẩm nào
        </div>
      </div>
    </div>
    
    <!-- Cart Panel -->
    <div class="w-96 card flex flex-col shadow-lg">
      <div class="p-4 border-b border-gray-100 bg-coffee-50">
        <h3 class="text-lg font-semibold text-coffee-900 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Hóa đơn - Bàn {{ tableName }}
        </h3>
      </div>
      
      <!-- Cart Items -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div v-if="cart.length === 0" class="text-center text-gray-400 py-12">
          <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p>Chưa có sản phẩm nào</p>
          <p class="text-sm">Chọn món từ menu bên trái</p>
        </div>
        
        <div 
          v-for="(item, index) in cart" 
          :key="index"
          class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
        >
          <img 
            :src="item.product.image_url || '/placeholder-product.png'" 
            class="w-14 h-14 object-cover rounded-lg"
          />
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm text-gray-900 truncate">{{ item.product.name }}</p>
            <p class="text-coffee-600 text-sm font-semibold">{{ formatCurrency(item.product.price) }}</p>
          </div>
          <div class="flex items-center space-x-1">
            <button 
              @click="decreaseQuantity(index)"
              class="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-lg"
            >
              −
            </button>
            <span class="w-10 text-center font-bold text-gray-900">{{ item.quantity }}</span>
            <button 
              @click="increaseQuantity(index)"
              class="w-8 h-8 flex items-center justify-center bg-coffee-100 border border-coffee-200 rounded-lg hover:bg-coffee-200 transition-colors text-coffee-700 text-lg"
            >
              +
            </button>
            <button 
              @click="removeFromCart(index)"
              class="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Cart Summary -->
      <div class="p-4 border-t border-gray-100 bg-gray-50">
        <div class="space-y-2 mb-4">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Tạm tính ({{ totalItems }} món):</span>
            <span class="font-medium">{{ formatCurrency(subtotal) }}</span>
          </div>
          <div class="flex justify-between items-center pt-2 border-t border-gray-200">
            <span class="text-lg font-semibold text-gray-900">Tổng cộng:</span>
            <span class="text-2xl font-bold text-coffee-600">{{ formatCurrency(total) }}</span>
          </div>
        </div>
        
        <button 
          @click="showPaymentDialog"
          :disabled="cart.length === 0 || isCreating"
          class="btn-success w-full text-lg py-3"
        >
          <span v-if="isCreating">Đang xử lý...</span>
          <span v-else class="flex items-center justify-center">
            <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            Thanh toán
          </span>
        </button>
      </div>
    </div>
    
    <!-- Payment Modal -->
    <ModalDialog
      :is-open="isPaymentModalOpen"
      title="Xác nhận thanh toán"
      @close="isPaymentModalOpen = false"
    >
      <div class="space-y-6">
        <div class="text-center">
          <p class="text-gray-600 mb-2">Tổng tiền cần thanh toán</p>
          <p class="text-4xl font-bold text-coffee-600">{{ formatCurrency(total) }}</p>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <button 
            @click="processPayment('cash')"
            :disabled="isProcessing"
            class="p-6 border-2 border-yellow-200 bg-yellow-50 rounded-xl hover:bg-yellow-100 hover:border-yellow-300 transition-all text-center"
          >
            <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p class="font-semibold text-gray-900">Tiền mặt</p>
            <p class="text-sm text-gray-500">Thanh toán bằng tiền mặt</p>
          </button>
          
          <button 
            @click="processPayment('transfer')"
            :disabled="isProcessing"
            class="p-6 border-2 border-blue-200 bg-blue-50 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all text-center"
          >
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <p class="font-semibold text-gray-900">Chuyển khoản</p>
            <p class="text-sm text-gray-500">Thanh toán qua ngân hàng</p>
          </button>
        </div>
        
        <div v-if="isProcessing" class="text-center">
          <LoadingSpinner text="Đang xử lý thanh toán..." />
        </div>
      </div>
    </ModalDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore, type Product } from '@/stores/products'
import { useTablesStore } from '@/stores/tables'
import { useInvoicesStore } from '@/stores/invoices'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ModalDialog from '@/components/common/ModalDialog.vue'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()
const tablesStore = useTablesStore()
const invoicesStore = useInvoicesStore()
const authStore = useAuthStore()

const tableId = computed(() => Number(route.params.tableId))
const tableName = computed(() => {
  const table = tablesStore.tables.find(t => t.id === tableId.value)
  return table?.name || tableId.value
})

const searchQuery = ref('')
const cart = ref<{ product: Product; quantity: number }[]>([])
const isCreating = ref(false)
const isPaymentModalOpen = ref(false)
const isProcessing = ref(false)
const currentTime = ref('')

let timeInterval: number | null = null

const filteredProducts = computed(() => {
  if (!searchQuery.value) return productsStore.availableProducts
  
  const query = searchQuery.value.toLowerCase()
  return productsStore.availableProducts.filter(p => 
    p.name.toLowerCase().includes(query)
  )
})

const totalItems = computed(() => cart.value.reduce((sum, item) => sum + item.quantity, 0))
const subtotal = computed(() => cart.value.reduce((sum, item) => sum + (item.product.price * item.quantity), 0))
const total = computed(() => subtotal.value)

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const updateTime = () => {
  currentTime.value = new Date().toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const goBack = () => {
  router.push('/client')
}

const addToCart = (product: Product) => {
  const existingItem = cart.value.find(item => item.product.id === product.id)
  if (existingItem) {
    existingItem.quantity++
  } else {
    cart.value.push({ product, quantity: 1 })
  }
}

const increaseQuantity = (index: number) => {
  cart.value[index].quantity++
}

const decreaseQuantity = (index: number) => {
  if (cart.value[index].quantity > 1) {
    cart.value[index].quantity--
  } else {
    removeFromCart(index)
  }
}

const removeFromCart = (index: number) => {
  cart.value.splice(index, 1)
}

const showPaymentDialog = () => {
  isPaymentModalOpen.value = true
}

const processPayment = async (paymentMethod: 'cash' | 'transfer') => {
  if (!authStore.user) return
  
  isProcessing.value = true
  
  const items = cart.value.map(item => ({
    product_id: item.product.id,
    quantity: item.quantity,
    unit_price: item.product.price,
    subtotal: item.product.price * item.quantity
  }))
  
  const invoice = await invoicesStore.createInvoice({
    staff_id: authStore.user.id,
    table_id: tableId.value,
    total_amount: total.value,
    payment_method: null,
    status: 'pending',
    paid_at: null
  }, items)
  
  if (invoice) {
    // Pay the invoice
    const success = await invoicesStore.payInvoice(invoice.id, paymentMethod)
    
    if (success) {
      // Clear cart and close modal
      cart.value = []
      isPaymentModalOpen.value = false
      isProcessing.value = false
      
      alert(`Thanh toán thành công!\nPhương thức: ${paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}\nTổng tiền: ${formatCurrency(total.value)}`)
      
      // Go back to table selection
      router.push('/client')
    }
  }
  
  isProcessing.value = false
}

onMounted(() => {
  productsStore.loadProducts()
  tablesStore.loadTables()
  updateTime()
  timeInterval = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>
