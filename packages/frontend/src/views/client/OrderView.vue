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





      <!-- Category Tabs -->

      <div class="flex flex-wrap gap-2 mb-4">

        <button


          @click="selectedCategory = 'all'"


          :class="[


            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',


            selectedCategory === 'all'


              ? 'bg-coffee-600 text-white'


              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'


          ]"


        >


          Tất cả


        </button>


        <button

          v-for="cat in productsStore.PRODUCT_CATEGORIES"

          :key="cat.value"


          @click="selectedCategory = cat.value"


          :class="[


            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',


            selectedCategory === cat.value


              ? 'bg-coffee-600 text-white'


              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'


          ]"


        >


          {{ cat.label }}


        </button>


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

      

      

      <!-- Existing Invoice Items -->


      <div v-if="existingInvoice?.items?.length" class="p-4 border-b border-gray-100 bg-blue-50">


        <p class="text-sm font-medium text-blue-700 mb-2">Hóa đơn hiện tại:</p>


        <div class="space-y-2">


          <div 


            v-for="item in existingInvoice.items" 


            :key="item.id"


            class="flex items-center space-x-3 p-2 bg-white rounded-lg"


          >


            <img 

              :src="item.product?.image_url || '/placeholder-product.png'" 

              class="w-10 h-10 object-cover rounded-lg"


            />


            <div class="flex-1 min-w-0">


              <p class="font-medium text-sm text-gray-900 truncate">{{ item.product?.name }}</p>

              <p class="text-gray-500 text-xs">{{ item.quantity }} x {{ formatCurrency(item.unit_price) }}</p>

            </div>

            <p class="text-blue-600 font-semibold text-sm">{{ formatCurrency(item.subtotal || item.quantity * item.unit_price) }}</p>

          </div>


        </div>


        <div class="mt-2 pt-2 border-t border-blue-200 flex justify-between text-sm">


          <span class="text-blue-600">Tổng hóa đơn cũ:</span>

          <span class="font-bold text-blue-700">{{ formatCurrency(existingInvoice.total_amount) }}</span>

        </div>


      </div>





      <!-- Cart Items (New Items) -->


      <div class="flex-1 overflow-y-auto p-4 space-y-3">


        <div v-if="cart.length === 0 && !existingInvoice" class="text-center text-gray-400 py-12">


          <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">


            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />


          </svg>


          <p>Chưa có sản phẩm nào</p>


          <p class="text-sm">Chọn món từ menu bên trái</p>


        </div>

        

        

        <div v-if="cart.length > 0" class="mb-2">


          <p class="text-sm font-medium text-green-700 mb-2">Món mới:</p>


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

        

        

        <!-- Existing Order Buttons -->


        <div v-if="existingInvoice" class="space-y-3">


          <!-- Add Items Button (only if cart has items) -->


          <button 


            v-if="cart.length > 0"


            @click="addToExistingOrder"


            :disabled="isCreating"


            class="btn-primary w-full text-lg py-3"


          >


            <span v-if="isCreating">Đang xử lý...</span>


            <span v-else class="flex items-center justify-center">


              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">


                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />


              </svg>

              Thêm vào hóa đơn ({{ formatCurrency(existingInvoice?.total_amount || 0) }})

            </span>


          </button>

          

          

          <!-- Pay Existing Order Button -->


          <button 


            @click="showPaymentDialog"


            :disabled="isProcessing"


            class="btn-success w-full text-lg py-3"


          >


            <span v-if="isProcessing">Đang xử lý...</span>


            <span v-else class="flex items-center justify-center">


              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">


                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a1 1 0 11-2 0 1 1 0 012 0z" />


              </svg>


              Thanh toán hóa đơn ({{ formatCurrency((finalTotal) ) }})


            </span>


          </button>


        </div>

        

        

        <!-- New Order: Payment Button -->


        <button 


          v-else


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


        <!-- Original Amount -->


        <div class="text-center">


          <p class="text-gray-600 mb-2">Tổng tiền</p>


          <p class="text-3xl font-bold text-coffee-600" :class="{ 'line-through text-gray-400 text-xl': appliedVoucher }">


            {{ formatCurrency(originalTotal) }}


          </p>


        </div>





        <!-- Voucher Section -->


        <div class="bg-gray-50 p-4 rounded-lg">


          <div class="flex space-x-2">


            <input 


              v-model="voucherCode" 


              type="text" 


              placeholder="Nhập mã voucher..."


              class="flex-1 input text-sm"

              :disabled="isApplyingVoucher || appliedVoucher"

            />


            <button 


              v-if="!appliedVoucher"


              @click="applyVoucher"


              :disabled="isApplyingVoucher || !voucherCode"


              class="btn-primary text-sm px-4"


            >


              {{ isApplyingVoucher ? '...' : 'Áp dụng' }}


            </button>


            <button 


              v-else


              @click="removeVoucher"


              class="btn-secondary text-sm px-4"


            >


              Xóa


            </button>


          </div>


          <p v-if="voucherError" class="text-red-500 text-sm mt-2">{{ voucherError }}</p>


          <p v-if="appliedVoucher" class="text-emerald-600 text-sm mt-2">


            Đã áp dụng: {{ appliedVoucher.code }} - Giảm {{ formatCurrency(discountAmount) }}


          </p>


        </div>





        <!-- Final Amount -->


        <div v-if="appliedVoucher" class="text-center bg-emerald-50 p-4 rounded-lg">


          <p class="text-gray-600 mb-2">Thanh toán</p>


          <p class="text-4xl font-bold text-emerald-600">{{ formatCurrency(finalTotal) }}</p>


          <p class="text-sm text-emerald-500 mt-1">Tiết kiệm {{ formatCurrency(discountAmount) }}</p>


        </div>

        <!-- Note Section -->
        <div class="bg-blue-50 p-4 rounded-lg">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú (lượng đường, đá...)
          </label>
          <textarea
            v-model="orderNote"
            placeholder="Ví dụ: Ít đường, nhiều đá..."
            class="input w-full"
            rows="2"
          ></textarea>
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

import { useProductsStore, type Product, type ProductCategory } from '@/stores/products'

import { useTablesStore } from '@/stores/tables'


import { useInvoicesStore } from '@/stores/invoices'


import { useAuthStore } from '@/stores/auth'


import { useVouchersStore, type Voucher } from '@/stores/vouchers'

import { supabase } from '@/lib/supabaseClient'


import LoadingSpinner from '@/components/common/LoadingSpinner.vue'


import ModalDialog from '@/components/common/ModalDialog.vue'





const route = useRoute()


const router = useRouter()

const productsStore = useProductsStore()

const tablesStore = useTablesStore()


const invoicesStore = useInvoicesStore()


const authStore = useAuthStore()


const vouchersStore = useVouchersStore()



const tableId = computed(() => Number(route.params.tableId))


const tableName = computed(() => {


  const table = tablesStore.tables.find(t => t.id === tableId.value)


  return table?.name || tableId.value


})





const searchQuery = ref('')


const selectedCategory = ref<ProductCategory | 'all'>('all')


const cart = ref<{ product: Product; quantity: number }[]>([])


const isCreating = ref(false)


const isPaymentModalOpen = ref(false)


const isProcessing = ref(false)


const currentTime = ref('')


const existingInvoice = ref<any>(null)


const isLoadingInvoice = ref(false)





// Voucher state


const voucherCode = ref('')


const appliedVoucher = ref<Voucher | null>(null)


const isApplyingVoucher = ref(false)


const voucherError = ref('')


const discountAmount = ref(0)



let timeInterval: number | null = null



const filteredProducts = computed(() => {


  let result = productsStore.availableProducts

  

  

  // Filter by category


  if (selectedCategory.value !== 'all') {

    result = result.filter(p => p.category === selectedCategory.value)

  }

  

  

  if (searchQuery.value) {


    const query = searchQuery.value.toLowerCase()

    result = result.filter(p => p.name.toLowerCase().includes(query))

  }

  

  return result


})





const totalItems = computed(() => cart.value.reduce((sum, item) => sum + item.quantity, 0))


const subtotal = computed(() => cart.value.reduce((sum, item) => sum + (item.product.price * item.quantity), 0))


const total = computed(() => subtotal.value)





// Voucher computed properties


const originalTotal = computed(() => {


  const existingTotal = existingInvoice.value?.total_amount || 0


  return existingTotal + total.value


})





const finalTotal = computed(() => {


  return Math.max(0, originalTotal.value - discountAmount.value)


})





const formatCurrency = (amount: number) => {


  return new Intl.NumberFormat('vi-VN', {


    style: 'currency',


    currency: 'VND'


  }).format(amount)


}





const applyVoucher = async () => {


  if (!voucherCode.value) return

  

  

  isApplyingVoucher.value = true


  voucherError.value = ''

  

  

  try {


    await vouchersStore.loadVouchers()


    const voucher = vouchersStore.getVoucherByCode(voucherCode.value)

    

    

    if (!voucher) {


      voucherError.value = 'Mã voucher không tồn tại hoặc đã hết hạn'


      return


    }

    

    

    // Check minimum order amount


    if (voucher.min_order_amount && originalTotal.value < voucher.min_order_amount) {


      voucherError.value = `Đơn hàng tối thiểu ${formatCurrency(voucher.min_order_amount)} để sử dụng voucher này`


      return


    }

    

    

    appliedVoucher.value = voucher


    discountAmount.value = vouchersStore.calculateDiscount(voucher, originalTotal.value)

    

    

    // Increment usage (don't block if this fails)


    try {


      await vouchersStore.incrementUsage(voucher.id)


    } catch (incrementErr) {


      console.warn('Failed to increment voucher usage:', incrementErr)


      // Don't show error to user, voucher is still applied


    }


  } catch (err) {


    voucherError.value = 'Có lỗi xảy ra khi áp dụng voucher'


  } finally {


    isApplyingVoucher.value = false


  }


}





const removeVoucher = () => {


  appliedVoucher.value = null


  discountAmount.value = 0


  voucherCode.value = ''


  voucherError.value = ''


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





const goBack = async () => {


  // If cart has items and no existing invoice, create pending invoice


  if (cart.value.length > 0 && !existingInvoice.value && authStore.user) {


    const items = cart.value.map(item => ({


      product_id: item.product.id,


      quantity: item.quantity,


      unit_price: item.product.price


    }))

    

    

    const invoice = await invoicesStore.createInvoice({


      staff_id: authStore.user.id,


      table_id: tableId.value,


      total_amount: finalTotal.value,

      payment_method: null,

      status: 'pending',

      paid_at: null

    }, items)

    

    

    if (invoice) {


      // Update table to occupied


      await tablesStore.updateTableStatus(tableId.value, true)


    }


  }

  

  

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





const addToExistingOrder = async () => {


  if (!existingInvoice.value || !authStore.user) return

  

  

  isCreating.value = true

  

  

  const newItems = cart.value.map(item => ({


    product_id: item.product.id,


    quantity: item.quantity,


    unit_price: item.product.price


  }))

  

  

  try {


    // Add new items to existing invoice (exclude subtotal - has DEFAULT constraint)


    const { error } = await supabase


      .from('invoice_items')


      .insert(newItems.map(item => ({ ...item, invoice_id: existingInvoice.value.id })))

    

    

    if (error) throw error

    

    

    // Update invoice total


    const newTotal = existingInvoice.value.total_amount + total.value


    await invoicesStore.updateInvoice(existingInvoice.value.id, {


      total_amount: newTotal

    })

    

    alert(`Đã thêm ${totalItems.value} món vào hóa đơn!\nTổng tiền mới: ${formatCurrency(newTotal)}`)

    

    cart.value = []


    router.push('/client')


  } catch (err) {


    console.error('Error adding to order:', err)

    alert('Không thể thêm món vào hóa đơn')

  } finally {


    isCreating.value = false


  }


}





const processPayment = async (paymentMethod: 'cash' | 'transfer') => {


  console.log('processPayment called', { user: authStore.user, userId: authStore.user?.id, existingInvoice: existingInvoice.value?.id })

  

  

  if (!authStore.user?.id) {

    alert('Lỗi: Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.')

    return


  }

  

  

  isProcessing.value = true

  

  

  let invoiceId: string | null = null

  

  

  if (existingInvoice.value) {


    // Existing order: add items first if cart has items, then pay


    if (cart.value.length > 0) {


      const newItems = cart.value.map(item => ({


        product_id: item.product.id,


        quantity: item.quantity,


        unit_price: item.product.price


      }))

      

      

      try {


        const { error } = await supabase


          .from('invoice_items')


          .insert(newItems.map(item => ({ ...item, invoice_id: existingInvoice.value.id })))

        

        

        if (error) throw error

        

        

        // Update invoice total with discount applied


        const newTotal = existingInvoice.value.total_amount + total.value - discountAmount.value


        await invoicesStore.updateInvoice(existingInvoice.value.id, {


          total_amount: Math.max(0, newTotal)


        })

        

        

      } catch (err) {


        console.error('Error adding items before payment:', err)

        alert('Không thể thêm món vào hóa đơn')

        isProcessing.value = false


        return


      }


    }

    

    

    invoiceId = existingInvoice.value.id


  } else {


    // New order: create invoice


    const items = cart.value.map(item => ({


      product_id: item.product.id,


      quantity: item.quantity,


      unit_price: item.product.price


    }))

    

    

    const invoice = await invoicesStore.createInvoice({


      staff_id: authStore.user.id,


      table_id: tableId.value,


      total_amount: finalTotal.value,

      payment_method: null,

      status: 'pending',

      paid_at: null

    }, items)

    

    

    if (!invoice) {

      alert('Lỗi: Không thể tạo hóa đơn')

      isProcessing.value = false


      return


    }

    

    

    invoiceId = invoice.id


  }

  

  

  // Pay the invoice


  // Pay the invoice


if (!invoiceId) {

  alert('Lỗi: Không tìm thấy hóa đơn')

  isProcessing.value = false


  return


}





// ✅ update total đúng (đã trừ voucher)


await invoicesStore.updateInvoice(invoiceId, {

  total_amount: finalTotal.value

})



const success = await invoicesStore.payInvoice(invoiceId, paymentMethod)



if (success) {

  const finalAmount = finalTotal.value





  cart.value = []


  isPaymentModalOpen.value = false


  isProcessing.value = false


  existingInvoice.value = null





  // reset voucher


  appliedVoucher.value = null


  discountAmount.value = 0


  voucherCode.value = ''





  await tablesStore.updateTableStatus(tableId.value, false)



  alert(`Thanh toán thành công!

Phương thức: ${paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}

Tổng tiền: ${formatCurrency(finalAmount)}`)



  router.push('/client')


} else {

  alert('Lỗi: Không thể thanh toán hóa đơn')

  isProcessing.value = false


}


}





const loadExistingInvoice = async () => {


  isLoadingInvoice.value = true

  

  

  try {


    // Find pending invoice for this table


    const { data, error } = await supabase


      .from('invoices')


      .select(`


        *,


        items:invoice_items(*, product:products(*))


      `)


      .eq('table_id', tableId.value)


      .eq('status', 'pending')


      .order('created_at', { ascending: false })


      .limit(1)


      .single()

    

    

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows

    

    

    if (data) {


      existingInvoice.value = data


      // Cart stays empty - only for new items


      // Existing items are in the invoice, not cart


    }


  } catch (err) {


    console.error('Error loading invoice:', err)


  } finally {


    isLoadingInvoice.value = false


  }


}





onMounted(() => {


  productsStore.loadProducts()


  tablesStore.loadTables().then(() => {


    // Check if table is occupied, then load existing invoice


    const table = tablesStore.tables.find(t => t.id === tableId.value)


    if (table?.is_occupied) {


      loadExistingInvoice()


    }


  })


  updateTime()

  timeInterval = window.setInterval(updateTime, 1000)

})





onUnmounted(() => {


  if (timeInterval) {


    clearInterval(timeInterval)


  }


})


</script>


