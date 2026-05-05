<script setup>
const products = useProductsStore()
const sales = useSalesStore()

const q = ref('')
const cart = ref([])
const cash = ref('')

await products.load()

const list = computed(() => {
  if (!q.value) return products.items.slice(0, 12)
  const s = q.value.toLowerCase()
  return products.items.filter(p => 
    p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s)
  )
})

const add = (p) => {
  // bawal mag-add kung wala ng stock
  if (p.stock <= 0) {
    alert('Out of stock')
    return
  }
  const f = cart.value.find(i => i.sku === p.sku)
  if (f) {
    // check kung aabot na sa stock limit
    if (f.qty >= p.stock) {
      alert(`Hanggang ${p.stock} lang ang available`)
      return
    }
    f.qty++
  } else {
    cart.value.push({ 
      sku: p.sku, 
      name: p.name, 
      price: Number(p.retail_price), 
      qty: 1,
      stock: p.stock  // sinave natin para macheck sa plus button
    })
  }
  q.value = ''
}

const total = computed(() => cart.value.reduce((t,i) => t + i.price * i.qty, 0))
const change = computed(() => Math.max(0, Number(cash.value||0) - total.value))

const pay = async () => {
  if (!cart.value.length) return
  await sales.checkout({
    items: cart.value.map(i => ({ sku: i.sku, qty: i.qty })),
    cash: cash.value
  })
  alert(`Paid ₱${total.value.toFixed(2)} - Change ₱${change.value.toFixed(2)}`)
  cart.value = []
  cash.value = ''
  products.load()
}
</script>

<template>
<div class="min-h-screen bg-gray-50">
  <div class="max-w-md mx-auto p-3 pb-28">
    
    <!-- search -->
    <input v-model="q" placeholder="Search o SKU" class="w-full h-12 px-4 rounded-xl bg-white border text-base mb-3">

    <!-- products -->
    <div class="grid grid-cols-2 gap-2">
      <button 
        v-for="p in list" 
        :key="p.sku" 
        @click="add(p)" 
        :disabled="p.stock <= 0"
        class="bg-white p-3 rounded-xl border text-left active:bg-gray-100 disabled:opacity-40"
      >
        <p class="text-sm font-medium leading-tight h-10 overflow-hidden">{{ p.name }}</p>
        <p class="mt-1 font-bold">₱{{ Number(p.retail_price).toFixed(0) }}</p>
        <p class="text-xs" :class="p.stock < 5 ? 'text-red-500' : 'text-gray-500'">
          {{ p.stock > 0 ? p.stock + ' pcs' : 'Out of stock' }}
        </p>
      </button>
    </div>

    <!-- cart -->
    <div class="mt-5 bg-white rounded-xl border divide-y">
      <div class="p-3 font-medium">Cart ({{ cart.length }})</div>
      <div v-if="!cart.length" class="p-6 text-center text-gray-400 text-sm">Tap product para mag-add</div>
      <div v-for="it in cart" :key="it.sku" class="p-3 flex items-center justify-between">
        <div>
          <p class="text-sm">{{ it.name }}</p>
          <p class="text-xs text-gray-500">₱{{ it.price }} × {{ it.qty }} | {{ it.stock }} stock/s</p>
        </div>
        <div class="flex gap-2">
          <button @click="it.qty>1 ? it.qty-- : cart.splice(cart.indexOf(it),1)" class="w-8 h-8 bg-gray-100 rounded-lg">-</button>
          <button 
            @click="it.qty < it.stock ? it.qty++ : null" 
            :disabled="it.qty >= it.stock"
            class="w-8 h-8 bg-gray-100 rounded-lg disabled:opacity-30"
          >+</button>
        </div>
      </div>
    </div>
  </div>

  <!-- bottom bar -->
  <div class="fixed bottom-16 md:bottom-0 inset-x-0 bg-white border-t">
    <div class="max-w-md mx-auto p-3">
      <div class="flex gap-2 mb-2">
        <input v-model="cash" type="number" inputmode="numeric" placeholder="Cash" class="flex-1 h-11 px-3 rounded-lg bg-gray-100 text-center">
        <div class="w-24 text-right">
          <p class="text-xs text-gray-500">Total</p>
          <p class="font-bold">₱{{ total.toFixed(0) }}</p>
        </div>
      </div>
      <button @click="pay" :disabled="!cart.length" class="w-full h-12 bg-black text-white rounded-xl font-medium disabled:bg-gray-300">
        Bayad
      </button>
    </div>
  </div>
</div>
</template>