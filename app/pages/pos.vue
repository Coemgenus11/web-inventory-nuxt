<script setup>
const products = useProductsStore()
const sales = useSalesStore()

const q = ref('')
const cart = ref([])
const cash = ref('')
const showCart = ref(false)

await products.load()

const list = computed(() => {
  if (!q.value) return products.items.slice(0, 24)
  const s = q.value.toLowerCase()
  return products.items.filter(p =>
    p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s)
  )
})

const add = (p) => {
  if (p.stock <= 0) return alert('Out of stock')
  const f = cart.value.find(i => i.sku === p.sku)
  if (f) {
    if (f.qty >= p.stock) return alert(`Hanggang ${p.stock} lang`)
    f.qty++
  } else {
    cart.value.push({ sku: p.sku, name: p.name, price: Number(p.retail_price), qty: 1, stock: p.stock })
  }
  q.value = ''
  if (window.innerWidth < 768) showCart.value = true
}

const total = computed(() => cart.value.reduce((t,i) => t + i.price * i.qty, 0))
const cashNum = computed(() => Number(cash.value || 0))
const isEnough = computed(() => cashNum.value >= total.value && total.value > 0)
const change = computed(() => Math.max(0, cashNum.value - total.value))
const shortage = computed(() => Math.max(0, total.value - cashNum.value))
const itemCount = computed(() => cart.value.reduce((n,i)=>n+i.qty,0))

const pay = async () => {
  if (!cart.value.length) return
  if (!isEnough.value) {
    alert(`Kulang ₱${shortage.value.toFixed(0)}`)
    return
  }
  await sales.checkout({
    items: cart.value.map(i => ({ sku: i.sku, qty: i.qty })),
    cash: cash.value
  })
  alert(`Paid ₱${total.value.toFixed(2)} - Change ₱${change.value.toFixed(2)}`)
  cart.value = []
  cash.value = ''
  showCart.value = false
  products.load()
}
</script>

<template>
<div class="min-h-screen bg-neutral-50">
  <div class="max-w-md mx-auto flex flex-col h- pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
    <!-- Search -->
    <div class="px-3 pt-4 pb-3 bg-neutral-50 sticky top-0 z-10">
      <div class="relative">
      <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input
          v-model="q"
          placeholder="Search product o SKU"
          class="w-full h-14 pl-12 pr-4 rounded-2xl bg-white border-2 border-neutral-200 text- font-medium shadow-sm focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all"
        >
      </div>
    </div>

    <!-- Products -->
    <div class="flex-1 overflow-y-auto px-3">
      <div class="grid grid-cols-2 gap-2.5 pb-4">
        <button
          v-for="p in list"
          :key="p.sku"
          @click="add(p)"
          :disabled="p.stock <= 0"
          class="bg-white p-3.5 rounded-2xl border border-neutral-200 text-left active:scale-[0.98] transition disabled:opacity-40"
        >
          <p class="text- font-medium leading-snug line-clamp-2 min-h-">{{ p.name }}</p>
          <div class="flex items-end justify-between mt-2">
            <p class="text- font-semibold">₱{{ Number(p.retail_price).toFixed(0) }}</p>
            <p class="text- px-2 py-0.5 rounded-full" :class="p.stock===0?'bg-red-100 text-red-600':p.stock<5?'bg-amber-100 text-amber-700':'bg-neutral-100 text-neutral-600'">
              {{ p.stock>0? p.stock : 'Out' }}
            </p>
          </div>
        </button>
      </div>
    </div>
  </div>

  <!-- Cart Preview Bar -->
  <div class="fixed bottom-[4.25rem] md:bottom-0 inset-x-0 z-30" style="padding-bottom: env(safe-area-inset-bottom)">
    <div class="max-w-md mx-auto px-3 pb-3">
      <button @click="showCart =!showCart" class="w-full bg-black text-white rounded-2xl p-3.5 flex items-center justify-between shadow-lg active:scale-[0.99] transition">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
          </div>
          <div class="text-left">
            <p class="text- opacity-80 leading-none">{{ itemCount }} items</p>
            <p class="text- font-medium leading-tight">View cart</p>
          </div>
        </div>
        <p class="text- font-semibold">₱{{ total.toFixed(0) }}</p>
      </button>
    </div>
  </div>

  <!-- Cart Sheet -->
  <Transition name="slide">
    <div v-if="showCart" class="fixed inset-0 z-40 flex items-end">
      <div class="absolute inset-0 bg-black/50" @click="showCart=false"></div>
      <div class="relative w-full max-w-md mx-auto bg-white rounded-t- max-h- flex flex-col" style="margin-bottom: calc(4.25rem + env(safe-area-inset-bottom))">
        <div class="w-10 h-1 bg-neutral-300 rounded-full mx-auto mt-3 mb-2"></div>
        <div class="px-5 py-3 border-b flex items-center justify-between">
          <h3 class="font-semibold">Cart ({{ itemCount }})</h3>
          <button @click="showCart=false" class="text-sm text-neutral-500">Close</button>
        </div>

        <div class="flex-1 overflow-y-auto px-3 py-2">
          <div v-if="!cart.length" class="py-16 text-center text-neutral-400 text-sm">Walang laman</div>
          <div v-for="it in cart" :key="it.sku" class="flex items-center gap-3 py-3 border-b border-neutral-100 last:border-0">
            <div class="flex-1 min-w-0">
              <p class="text- font-medium truncate">{{ it.name }}</p>
              <p class="text- text-neutral-500">₱{{ it.price }} • {{ it.stock }} stock</p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="it.qty>1? it.qty-- : cart.splice(cart.indexOf(it),1)" class="w-8 h-8 rounded-xl bg-neutral-100 active:bg-neutral-200 flex items-center justify-center">−</button>
              <span class="w-6 text-center text- font-medium">{{ it.qty }}</span>
              <button @click="it.qty < it.stock? it.qty++ : null" :disabled="it.qty>=it.stock" class="w-8 h-8 rounded-xl bg-neutral-100 active:bg-neutral-200 disabled:opacity-30 flex items-center justify-center">+</button>
            </div>
          </div>
        </div>

        <!-- Pay section with validation -->
        <div class="border-t bg-neutral-50 p-4 rounded-b-">
          <div class="flex gap-2 mb-3">
            <input
              v-model="cash"
              type="number"
              inputmode="numeric"
              placeholder="Cash received"
              :class="cash &&!isEnough? 'border-red-500 bg-red-50' : 'border-neutral-200 bg-white'"
              class="flex-1 h-12 px-4 rounded-xl border text- text-center focus:outline-none focus:border-black transition"
            >
            <div class="w-28 bg-white border rounded-xl px-3 flex flex-col justify-center transition" :class="cash &&!isEnough? 'border-red-300' : 'border-neutral-200'">
              <p class="text- leading-none" :class="cash &&!isEnough? 'text-red-500' : 'text-neutral-500'">
                {{ isEnough ||!cash? 'Change' : 'Kulang' }}
              </p>
              <p class="text- font-semibold leading-tight" :class="cash &&!isEnough? 'text-red-600' : 'text-black'">
                ₱{{ isEnough ||!cash? change.toFixed(0) : shortage.toFixed(0) }}
              </p>
            </div>
          </div>
          <button
            @click="pay"
            :disabled="!cart.length ||!isEnough"
            class="w-full h-12 bg-black text-white rounded-xl font-medium active:scale-[0.99] disabled:opacity-40 disabled:active:scale-100 transition"
          >
            {{!cash? 'Enter cash' : isEnough? `Bayad ₱${total.toFixed(0)}` : `Kulang ₱${shortage.toFixed(0)}` }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</div>
</template>

<style scoped>
.slide-enter-active,.slide-leave-active { transition: transform.28s cubic-bezier(.16,1,.3,1); }
.slide-enter-from,.slide-leave-to { transform: translateY(100%); }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>