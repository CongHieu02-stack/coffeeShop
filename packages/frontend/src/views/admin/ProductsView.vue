<template>

  <div class="space-y-6">

    <!-- Category Tabs -->

    <div class="flex flex-wrap gap-2">

      <button

        @click="selectedCategory = 'all'"

        :class="[

          'px-4 py-2 rounded-lg font-medium transition-colors',

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

          'px-4 py-2 rounded-lg font-medium transition-colors',

          selectedCategory === cat.value

            ? 'bg-coffee-600 text-white'

            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'

        ]"

      >

        {{ cat.label }}

      </button>

    </div>



    <!-- Header -->

    <div class="flex items-center justify-between">

      <div class="flex items-center space-x-4">

        <div class="relative">

          <input

            v-model="searchQuery"

            type="text"

            placeholder="Tìm kiếm sản phẩm..."

            class="input w-64 pl-10"

          />

          <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">

            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />

          </svg>

        </div>

        <select v-model="filterStatus" class="input w-40">

          <option value="all">Tất cả trạng thái</option>

          <option value="available">Có sẵn</option>

          <option value="unavailable">Hết hàng</option>

        </select>

      </div>

      

      <button @click="openAddModal" class="btn-primary">

        <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">

          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />

        </svg>

        Thêm sản phẩm

      </button>

    </div>

    

    <!-- Products Table -->

    <div class="card overflow-hidden">

      <div class="overflow-x-auto">

        <table class="table">

          <thead>

            <tr>

              <th>Hình ảnh</th>

              <th>Tên sản phẩm</th>

              <th>Danh mục</th>

              <th>Giá</th>

              <th>Trạng thái</th>

              <th>Thao tác</th>

            </tr>

          </thead>

          <tbody>

            <tr v-for="product in filteredProducts" :key="product.id">

              <td>

                <img 

                  :src="product.image_url || '/placeholder-product.png'" 

                  :alt="product.name"

                  class="w-16 h-16 object-cover rounded-lg"

                />

              </td>

              <td class="font-medium">{{ product.name }}</td>

              <td>

                <span class="px-2 py-1 bg-gray-100 rounded text-sm">

                  {{ productsStore.PRODUCT_CATEGORIES.find(c => c.value === product.category)?.label || product.category }}

                </span>

              </td>

              <td>{{ formatCurrency(product.price) }}</td>

              <td>

                <span :class="product.is_available ? 'badge-success' : 'badge-danger'">

                  {{ product.is_available ? 'Có sẵn' : 'Hết hàng' }}

                </span>

              </td>

              <td>

                <div class="flex items-center space-x-2">

                  <button 

                    @click="editProduct(product)"

                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"

                  >

                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">

                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />

                    </svg>

                  </button>

                  <button 

                    @click="toggleProductAvailability(product)"

                    :class="product.is_available ? 'text-gray-600 hover:bg-gray-50' : 'text-green-600 hover:bg-green-50'"

                    class="p-2 rounded-lg transition-colors"

                    :title="product.is_available ? 'Vô hiệu hóa' : 'Kích hoạt'"

                  >

                    <svg v-if="product.is_available" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">

                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />

                    </svg>

                    <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">

                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />

                    </svg>

                  </button>

                </div>

              </td>

            </tr>

            <tr v-if="filteredProducts.length === 0">

              <td colspan="6" class="text-center text-gray-500 py-8">

                Không tìm thấy sản phẩm nào

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>

    

    <!-- Add/Edit Modal -->

    <ModalDialog

      :is-open="isModalOpen"

      :title="editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'"

      @close="closeModal"

    >

      <form @submit.prevent="saveProduct" class="space-y-4">

        <div>

          <label class="label">Tên sản phẩm</label>

          <input v-model="form.name" type="text" class="input" required />

        </div>

        

        <div>

          <label class="label">Giá (VNĐ)</label>

          <input v-model.number="form.price" type="number" class="input" min="0" required />

        </div>

        

        <div>

          <label class="label">Danh mục</label>

          <select v-model="form.category" class="input w-full" required>

            <option v-for="cat in productsStore.PRODUCT_CATEGORIES" :key="cat.value" :value="cat.value">

              {{ cat.label }}

            </option>

          </select>

        </div>



        <div>

          <label class="label">URL Hình ảnh</label>

          <input v-model="form.image_url" type="text" class="input" placeholder="https://..." />

        </div>



        <div class="flex items-center space-x-2">

          <input

            v-model="form.is_available"

            type="checkbox"

            id="is_available"

            class="w-4 h-4 rounded border-gray-300 text-coffee-600 focus:ring-coffee-500"

          />

          <label for="is_available" class="text-sm text-gray-700">Có sẵn</label>

        </div>

        

        <div class="flex justify-end space-x-3 pt-4">

          <button type="button" @click="closeModal" class="btn-secondary">Hủy</button>

          <button type="submit" class="btn-primary" :disabled="productsStore.isLoading">

            {{ editingProduct ? 'Cập nhật' : 'Thêm' }}

          </button>

        </div>

      </form>

    </ModalDialog>

  </div>

</template>



<script setup lang="ts">

import { ref, computed, onMounted } from 'vue'

import { useProductsStore, type Product, type ProductCategory } from '@/stores/products'

import ModalDialog from '@/components/common/ModalDialog.vue'



const productsStore = useProductsStore()



const searchQuery = ref('')

const filterStatus = ref<'all' | 'available' | 'unavailable'>('all')

const selectedCategory = ref<ProductCategory | 'all'>('all')

const isModalOpen = ref(false)

const editingProduct = ref<Product | null>(null)



const form = ref({

  name: '',

  price: 0,

  image_url: '',

  is_available: true,

  category: 'cafe' as ProductCategory

})



const filteredProducts = computed(() => {

  let result = productsStore.products

  

  // Filter by category

  if (selectedCategory.value !== 'all') {

    result = result.filter(p => p.category === selectedCategory.value)

  }

  

  if (searchQuery.value) {

    const query = searchQuery.value.toLowerCase()

    result = result.filter(p => p.name.toLowerCase().includes(query))

  }

  

  if (filterStatus.value === 'available') {

    result = result.filter(p => p.is_available)

  } else if (filterStatus.value === 'unavailable') {

    result = result.filter(p => !p.is_available)

  }

  

  return result

})



const formatCurrency = (amount: number) => {

  return new Intl.NumberFormat('vi-VN', {

    style: 'currency',

    currency: 'VND'

  }).format(amount)

}



const openAddModal = () => {

  editingProduct.value = null

  form.value = {

    name: '',

    price: 0,

    image_url: '',

    is_available: true,

    category: 'cafe'

  }

  isModalOpen.value = true

}



const editProduct = (product: Product) => {

  editingProduct.value = product

  form.value = {

    name: product.name,

    price: product.price,

    image_url: product.image_url || '',

    is_available: product.is_available,

    category: product.category

  }

  isModalOpen.value = true

}



const closeModal = () => {

  isModalOpen.value = false

  editingProduct.value = null

}



const saveProduct = async () => {

  if (editingProduct.value) {

    await productsStore.updateProduct(editingProduct.value.id, form.value)

  } else {

    await productsStore.createProduct(form.value)

  }

  closeModal()

}



const toggleProductAvailability = async (product: Product) => {
  await productsStore.updateProduct(product.id, {
    is_available: !product.is_available
  })
}



onMounted(() => {

  productsStore.loadProducts()

})

</script>

