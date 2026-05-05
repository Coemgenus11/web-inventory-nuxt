<script setup>
const store = useProductsStore()
const showAdd = ref(false)
const showEdit = ref(false)
const showStock = ref(false)

const form = ref({ name:'', category_id:2, unit_price:0, retail_price:0, stock:0 })
const editing = ref(null)
const stockTarget = ref(null)
const stockInput = ref(0)
const q = ref('')
const errors = ref({})

onMounted(() => store.load())

const filtered = computed(() => {
  const s = q.value.toLowerCase()
  return store.items.filter(p => p.name?.toLowerCase().includes(s) || p.sku?.toLowerCase().includes(s))
})

const validate = () => {
  errors.value = {}
  if(!form.value.name?.trim()) errors.value.name = 'Lagyan ng pangalan'
  if(form.value.unit_price < 0) errors.value.unit_price = 'Bawal negative'
  if(form.value.retail_price < 0) errors.value.retail_price = 'Bawal negative'
  if(form.value.retail_price < form.value.unit_price) errors.value.retail_price = 'Retail dapat ≥ Cost'
  if(form.value.stock < 0) errors.value.stock = 'Bawal negative'
  return Object.keys(errors.value).length === 0
}

const resetForm = () => { form.value = { name:'', category_id:2, unit_price:0, retail_price:0, stock:0 }; errors.value={} }

const add = async () => {
  if(!validate()) return
  if(!confirm(`Add "${form.value.name}"?`)) return
  await store.create(form.value)
  resetForm(); showAdd.value = false
}

const openEdit = (p) => {
  editing.value = p
  form.value = {...p, unit_price:Number(p.unit_price), retail_price:Number(p.retail_price)}
  errors.value = {}
  showEdit.value = true
}

const saveEdit = async () => {
  if(!validate()) return
  if(!confirm(`I-save changes sa "${form.value.name}"?`)) return
  await store.update(editing.value.sku, form.value)
  showEdit.value = false
}

const deleteProduct = async () => {
  if(!confirm(`Delete "${editing.value.name}" permanently?`)) return
  await store.remove(editing.value.sku)
  showEdit.value = false
}

// STOCK
const adjustQuick = async (p, delta) => {
  const action = delta>0? 'Add' : 'Remove'
  if(!confirm(`${action} 1 stock sa "${p.name}"?`)) return
  if(p.stock + delta < 0) return alert('Kulang na stock!')
  await store.adjustStock(p.sku, delta)
}

const openStock = (p) => {
  stockTarget.value = p
  stockInput.value = p.stock
  showStock.value = true
}

const saveStock = async () => {
  const newStock = Number(stockInput.value)
  if(isNaN(newStock) || newStock < 0) return alert('Invalid stock')
  const delta = newStock - stockTarget.value.stock
  if(delta === 0) return showStock.value = false
  if(!confirm(`Palitan stock from ${stockTarget.value.stock} to ${newStock}?`)) return
  await store.adjustStock(stockTarget.value.sku, delta)
  showStock.value = false
}
</script>

<template>
<div class="pb-20">
  <!-- Header -->
  <div class="sticky top-0 bg-gray-50/90 backdrop-blur z-30 px-4 py-3 -mx-4 md:mx-0">
    <div class="flex justify-between items-center">
      <div><h1 class="text-2xl font-bold">Inventory</h1><p class="text-sm text-gray-500">{{ store.items.length }} items</p></div>
      <button @click="showAdd=true;resetForm()" class="w-11 h-11 bg-blue-600 text-white rounded-2xl grid place-items-center active:scale-95">+</button>
    </div>
    <div class="mt-3 relative">
      <input v-model="q" placeholder="Search" class="w-full h-12 pl-10 pr-4 rounded-2xl border bg-white text-sm outline-none">
      <svg class="w-4 h-4 absolute left-3.5 top-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
    </div>
  </div>

  <!-- List -->
  <div class="px-4 md:px-0 mt-4 space-y-3">
    <div v-for="p in filtered" :key="p.sku" @click="openEdit(p)" class="bg-white p-4 rounded-2xl border shadow-sm active:scale-[0.99]">
      <div class="flex justify-between">
        <div>
          <span class="text-xs px-2 py-0.5 rounded-lg" :class="p.category_id==1?'bg-orange-100 text-orange-700':'bg-cyan-100 text-cyan-700'">{{ p.category_name }}</span>
          <h3 class="font-semibold mt-1">{{ p.name }}</h3>
          <p class="text-xs font-mono text-gray-400">{{ p.sku }}</p>
        </div>
        <button @click.stop="openStock(p)" class="text-xs px-3 py-1.5 rounded-full h-fit font-medium" :class="p.stock<10?'bg-red-100 text-red-700':'bg-green-100 text-green-700'">
          {{ p.stock }} pcs ✏️
        </button>
      </div>
      <div class="flex justify-between items-end mt-3 pt-3 border-t">
        <div>
          <p class="font-bold text-lg">₱{{ Number(p.retail_price).toFixed(2) }}</p>
          <p class="text-xs text-gray-500">Cost ₱{{ Number(p.unit_price).toFixed(2) }} • Profit ₱{{ (p.retail_price - p.unit_price).toFixed(2) }}</p>
        </div>
        <div class="flex gap-2" @click.stop>
          <button @click="adjustQuick(p,-1)" class="w-9 h-9 bg-gray-100 rounded-xl">−</button>
          <button @click="adjustQuick(p,1)" class="w-9 h-9 bg-blue-600 text-white rounded-xl">+</button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ADD -->
<Transition name="fade">
  <div v-if="showAdd" class="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-4">
    <!-- backdrop -->
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showAdd=false"></div>

    <!-- modal -->
    <div class="relative w-full md:max-w-[420px] bg-white rounded-t-[28px] md:rounded-[24px] shadow-2xl max-h-[90vh] flex flex-col animate-in">
      <!-- header -->
      <div class="flex items-center justify-between px-6 pt-5 pb-4">
        <div>
          <h2 class="text-[17px] font-semibold tracking-tight">Add Product</h2>
          <p class="text-xs text-gray-500 mt-0.5">Fill in details below</p>
        </div>
        <button @click="showAdd=false" class="w-8 h-8 grid place-items-center rounded-full hover:bg-gray-100 text-gray-500">✕</button>
      </div>

      <!-- body -->
      <div class="px-6 pb-6 space-y-5 overflow-y-auto">
        <!-- name -->
        <div>
          <label class="text-xs font-medium text-gray-600">Product name</label>
          <input
            v-model="form.name"
            placeholder="e.g. Coke 1.5L"
            class="mt-1.5 w-full h-12 px-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 focus:ring-0 outline-none transition"
          >
          <p v-if="errors.name" class="text-[11px] text-red-500 mt-1.5">{{ errors.name }}</p>
        </div>

        <!-- category -->
        <div>
          <label class="text-xs font-medium text-gray-600">Category</label>
          <div class="mt-1.5 grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl">
            <button
              @click="form.category_id=1"
              :class="form.category_id==1? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'"
              class="h-10 rounded-xl text-sm font-medium transition"
            >
              Grocery
            </button>
            <button
              @click="form.category_id=2"
              :class="form.category_id==2? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'"
              class="h-10 rounded-xl text-sm font-medium transition"
            >
              Aice
            </button>
          </div>
        </div>

        <!-- prices -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-medium text-gray-600">Unit Cost</label>
            <div class="relative mt-1.5">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₱</span>
              <input v-model.number="form.unit_price" type="number" step="0.01" inputmode="decimal" class="w-full h-12 pl-7 pr-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 outline-none transition">
            </div>
            <p v-if="errors.unit_price" class="text-[11px] text-red-500 mt-1.5">{{ errors.unit_price }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-600">Retail Price</label>
            <div class="relative mt-1.5">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₱</span>
              <input v-model.number="form.retail_price" type="number" step="0.01" inputmode="decimal" class="w-full h-12 pl-7 pr-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 outline-none transition">
            </div>
            <p v-if="errors.retail_price" class="text-[11px] text-red-500 mt-1.5">{{ errors.retail_price }}</p>
          </div>
        </div>

        <!-- stock -->
        <div>
          <label class="text-xs font-medium text-gray-600">Initial Stock</label>
          <input v-model.number="form.stock" type="number" inputmode="numeric" placeholder="0" class="mt-1.5 w-full h-12 px-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 outline-none transition">
          <p v-if="errors.stock" class="text-[11px] text-red-500 mt-1.5">{{ errors.stock }}</p>
        </div>
      </div>

      <!-- footer -->
      <div class="px-6 pb-6 pt-2 mt-auto border-t border-gray-100">
        <button @click="add" class="w-full h-12 rounded-2xl bg-gray-900 text-white font-medium hover:bg-black active:scale-[0.98] transition">
          Save Product
        </button>
      </div>
    </div>
  </div>
</Transition>

<!-- EDIT -->
<!-- EDIT -->
<Transition name="fade">
<div v-if="showEdit" class="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-4">
  <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showEdit=false"></div>

  <div class="relative w-full md:max-w- bg-white rounded-t- md:rounded- shadow-2xl flex flex-col">
    <!-- header -->
    <div class="px-6 pt-5 pb-4 flex items-start justify-between">
      <div>
        <h2 class="text- font-semibold leading-tight">{{ editing?.name }}</h2>
        <p class="text- font-mono text-gray-500 mt-1 tracking-wider">{{ editing?.sku }}</p>
      </div>
      <button @click="showEdit=false" class="w-8 h-8 grid place-items-center rounded-full hover:bg-gray-100 text-gray-500 -mr-1">✕</button>
    </div>

    <div class="px-6 pb-6 space-y-5">
      <div>
        <label class="text-xs font-medium text-gray-600">Product name</label>
        <input v-model="form.name" class="mt-1.5 w-full h-12 px-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 outline-none transition">
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs font-medium text-gray-600">Unit Cost</label>
          <div class="relative mt-1.5">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₱</span>
            <input v-model.number="form.unit_price" type="number" step="0.01" inputmode="decimal" class="w-full h-12 pl-7 pr-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 outline-none transition">
          </div>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-600">Retail Price</label>
          <div class="relative mt-1.5">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₱</span>
            <input v-model.number="form.retail_price" type="number" step="0.01" inputmode="decimal" class="w-full h-12 pl-7 pr-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 outline-none transition">
          </div>
        </div>
      </div>
    </div>

    <!-- footer actions -->
    <div class="px-6 pb-6 pt-4 border-t border-gray-100 flex items-center gap-3">
      <button @click="deleteProduct" class="h-12 px-4 rounded-2xl bg-red-200 text-red-600 hover:bg-red-50 font-medium transition">
        Delete
      </button>
      <button @click="saveEdit" class="flex-1 h-12 rounded-2xl bg-gray-900 text-white font-medium hover:bg-black active:scale-[0.98] transition">
        Update
      </button>
    </div>
  </div>
</div>
</Transition>

<!-- STOCK EDITOR -->
<Transition name="fade">
<div v-if="showStock" class="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-4">
  <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showStock=false"></div>

  <div class="relative w-full md:max-w- bg-white rounded-t- md:rounded- shadow-2xl">
    <div class="px-6 pt-5 text-center">
      <h3 class="text- font-semibold">Adjust Stock</h3>
      <p class="text-sm text-gray-900 mt-1">{{ stockTarget?.name }}</p>
      <p class="text- text-gray-500 mt-0.5">Current: {{ stockTarget?.stock }} pcs</p>
    </div>

    <div class="px-6 py-5">
      <!-- big input -->
      <input
        v-model.number="stockInput"
        type="number"
        inputmode="numeric"
        class="w-full h- text-center text-3xl font-semibold tracking-tight rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-gray-900 outline-none transition"
      >

      <!-- quick adjust, minimal pero useful -->
      <div class="flex justify-center gap-2 mt-3">
        <button @click="stockInput = Math.max(0, (stockInput||0)-5)" class="h-9 px-3 rounded-xl bg-gray-100 text-sm hover:bg-gray-200">-5</button>
        <button @click="stockInput = Math.max(0, (stockInput||0)-1)" class="h-9 px-3 rounded-xl bg-gray-100 text-sm hover:bg-gray-200">-1</button>
        <button @click="stockInput = (stockInput||0)+1" class="h-9 px-3 rounded-xl bg-gray-100 text-sm hover:bg-gray-200">+1</button>
        <button @click="stockInput = (stockInput||0)+5" class="h-9 px-3 rounded-xl bg-gray-100 text-sm hover:bg-gray-200">+5</button>
      </div>
    </div>

    <div class="px-6 pb-6 grid grid-cols-2 gap-3">
      <button @click="showStock=false" class="h-12 rounded-2xl bg-gray-100 font-medium hover:bg-gray-200 transition">Cancel</button>
      <button @click="saveStock" class="h-12 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700 active:scale-[0.98] transition">Set Stock</button>
    </div>
  </div>
</div>
</Transition>
</template>

<style scoped>
.fade-enter-active,.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,.fade-leave-to { opacity: 0; }
</style>