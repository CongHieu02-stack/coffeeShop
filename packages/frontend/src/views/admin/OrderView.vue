<template>
  <div class="h-[calc(100vh-140px)] flex gap-6">
    <!-- Products Panel -->
    <div class="flex-1 flex flex-col">
      <!-- Filters -->
      <div class="flex items-center space-x-4 mb-4">
        <div class="relative flex-1">
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
        <select v-model="selectedTable" class="input w-40" required>
          <option value="">Chọn bàn</option>
          <option v-for="table in tablesStore.availableTables" :key="table.id" :value="table.id">
            Bàn {{ table.name || table.id }}
          </option>
        </select>
      </div>
      
      <!-- Products Grid -->
      <div class="flex-1 overflow-y-auto">
        <div class="grid grid-cols-3 gap-4">
          <button
            v-for="product in filteredProducts"
            :key="product.id"
            @click="addToCart(product)"
            :disabled="!product.is_available"
            class="card p-4 text-left transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img 
              :src="product.image_url || '/placeholder-product.png'" 
              :alt="product.name"
              class="w-full h-32 object-cover rounded-lg mb-3"
            />
            <h4 class="font-medium text-gray-900 line-clamp-2">{{ product.name }}</h4>
            <p class="text-coffee-600 font-semibold mt-1">{{ formatCurrency(product.price) }}</p>
          </button>
        </div>
        
        <div v-if="filteredProducts.length === 0" class="text-center text-gray-500 py-12">
          Không tìm thấy sản phẩm nào
        </div>
      </div>
    </div>
    
    <!-- Cart Panel -->
    <div class="w-96 card flex flex-col">
      <div class="p-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">
          Hóa đơn
          <span v-if="selectedTable" class="text-coffee-600 ml-2">
            - Bàn {{ getTableName(selectedTable) }}
          </span>
        </h3>
      </div>
      
      <!-- Cart Items -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div v-if="cart.length === 0" class="text-center text-gray-400 py-8">
          Chưa có sản phẩm nào
        </div>
        
        <div 
          v-for="(item, index) in cart" 
          :key="index"
          class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
        >
          <img 
            :src="item.product.image_url || '/placeholder-product.png'" 
            class="w-12 h-12 object-cover rounded"
          />
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm truncate">{{ item.product.name }}</p>
            <p class="text-coffee-600 text-sm">{{ formatCurrency(item.product.price) }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <button 
              @click="decreaseQuantity(index)"
              class="w-7 h-7 flex items-center justify-center bg-white rounded border hover:bg-gray-100"
            >
              -
            </button>
            <span class="w-8 text-center font-medium">{{ item.quantity }}</span>
            <button 
              @click="increaseQuantity(index)"
              class="w-7 h-7 flex items-center justify-center bg-white rounded border hover:bg-gray-100"
            >
              +
            </button>
            <button 
              @click="removeFromCart(index)"
              class="w-7 h-7 flex items-center justify-center text-red-500 hover:bg-red-50 rounded"
            >
              ×
            </button>
          </div>
        </div>
      </div>
      
      <!-- Cart Summary -->
      <div class="p-4 border-t border-gray-100 bg-gray-50">
        <div class="space-y-2 mb-4">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Tạm tính:</span>
            <span class="font-medium">{{ formatCurrency(subtotal) }}</span>
          </div>
          <div class="flex justify-between text-lg font-semibold">
            <span>Tổng cộng:</span>
            <span class="text-coffee-600">{{ formatCurrency(total) }}</span>
          </div>
        </div>
        
        <button 
          @click="createInvoice"
          :disabled="cart.length === 0 || !selectedTable || invoicesStore.isLoading"
          class="btn-primary w-full"
        >
          <span v-if="invoicesStore.isLoading">Đang xử lý...</span>
          <span v-else>Tạo hóa đơn</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProductsStore, type Product } from '@/stores/products'
import { useTablesStore } from '@/stores/tables'
import { useInvoicesStore } from '@/stores/invoices'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const productsStore = useProductsStore()
const tablesStore = useTablesStore()
const invoicesStore = useInvoicesStore()
const authStore = useAuthStore()
const { success } = useToast()

const searchQuery = ref('')
const selectedTable = ref<number | ''>('')
const cart = ref<{ product: Product; quantity: number }[]>([])

const filteredProducts = computed(() => {
  if (!searchQuery.value) return productsStore.availableProducts
  
  const query = searchQuery.value.toLowerCase()
  return productsStore.availableProducts.filter(p => 
    p.name.toLowerCase().includes(query)
  )
})

const subtotal = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
})

const total = computed(() => subtotal.value)

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const getTableName = (tableId: number | string) => {
  const table = tablesStore.tables.find(t => t.id === Number(tableId))
  return table?.name || tableId
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

const createInvoice = async () => {
  if (!selectedTable.value || cart.value.length === 0 || !authStore.user) return
  
  const items = cart.value.map(item => ({
    product_id: item.product.id,
    quantity: item.quantity,
    unit_price: item.product.price,
    subtotal: item.product.price * item.quantity
  }))
  
  const success = await invoicesStore.createInvoice({
    staff_id: authStore.user.id,
    table_id: Number(selectedTable.value),
    total_amount: total.value,
    payment_method: null,
    status: 'pending',
    paid_at: null
  }, items)
  
  if (success) {
    // Clear cart
    cart.value = []
    selectedTable.value = ''
    success('Thành công', 'Hóa đơn đã được tạo thành công!')
    router.push('/admin/invoices')
  }
}

onMounted(() => {
  productsStore.loadProducts()
  tablesStore.loadTables()
})
</script>
