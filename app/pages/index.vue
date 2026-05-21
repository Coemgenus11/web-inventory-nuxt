<script setup>
const sales = useSalesStore()
const products = useProductsStore() // kailangan para sa refresh ng stock
const tab = ref('overview')
const expanded = ref(null)
const details = ref({})
const showCashOut = ref(false)

onMounted(() => {
  sales.loadDashboard()
  products.load() // <-- dagdag
})

const inventoryValue = computed(() => 
  products.items.reduce((total, p) => 
    total + (Number(p.stock) || 0) * (Number(p.retail_price) || 0), 0)
)

const totalUnits = computed(() => 
  products.items.reduce((total, p) => total + (Number(p.stock) || 0), 0)
)

const peso = (n) => '₱' + Number(n||0).toLocaleString('en-PH', {minimumFractionDigits:2})

const toggle = async (id) => {
  if (expanded.value === id) {
    expanded.value = null
    return
  }
  expanded.value = id
  if (!details.value[id]) {
    details.value[id] = await sales.fetchSale(id)
  }
}

const doReturn = async (saleId, item) => {
  const remaining = item.quantity - (item.returned_qty || 0)
  const qty = Number(prompt(`How many to return for ${item.name}? (max ${remaining})`, '1'))
  if (!qty || qty <= 0 || qty > remaining) return

  // --- NEW CONFIRMATION ---
  const refundAmount = Number(item.unit_price) * qty
  const confirmMsg = `Confirm Return?\n\nProduct: ${item.name}\nQuantity: ${qty}\nRefund: ${peso(refundAmount)}\n\nThis will add back to stock and deduct from cash on hand.`

  if (!confirm(confirmMsg)) return
  // --- END ---

  try {
    const res = await sales.returnSale(saleId, [{ sale_item_id: item.id, qty }])
    alert(`Returned! Refund: ${peso(res.total_refund)}`)
    // refresh
    details.value[saleId] = await sales.fetchSale(saleId)
    await sales.loadDashboard()
    await products.load()
  } catch (e) {
    alert(e.data?.message || e.message)
  }
}
</script>

<template>
    <div class="max-w-6xl mx-auto">
    <!-- cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <div class="bg-white p-5 rounded-2xl border">
                <p class="text-sm text-gray-500">Today</p>
                <p class="text-2xl font-bold mt-1">{{ peso(sales.summary.today.total) }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ sales.summary.today.orders }} orders</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border">
                <p class="text-sm text-gray-500">Last 7 Days</p>
                <p class="text-2xl font-bold mt-1">{{ peso(sales.summary.week.total) }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ sales.summary.week.orders }} orders</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border">
                <p class="text-sm text-gray-500">This Month</p>
                <p class="text-2xl font-bold mt-1">{{ peso(sales.summary.month.total) }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ sales.summary.month.orders }} orders</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border">
                <p class="text-sm text-gray-500">All Time Sales</p>
                <p class="text-2xl font-bold mt-1">{{ peso(sales.summary.allTime.total) }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ sales.summary.allTime.orders }} orders</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border-2 border-green-500">
                <p class="text-sm text-gray-500">Cash on Hand</p>
                <p class="text-2xl font-bold mt-1 text-green-600">{{ peso(sales.summary.cash?.onHand) }}</p>
                <p class="text-xs text-gray-500 mt-1">
                In: {{ peso(sales.summary.cash?.salesIn) }} • Out: {{ peso((sales.summary.cash?.expensesOut||0)+(sales.summary.cash?.returnsOut||0)) }}
                </p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-blue-200">
                <p class="text-sm text-gray-500">Inventory Value (Retail)</p>
                <p class="text-2xl font-bold mt-1 text-blue-600">{{ peso(inventoryValue) }}</p>
                <p class="text-xs text-gray-500 mt-1">
                    {{ products.items.length }} products • {{ totalUnits }} units
                </p>
            </div>
        </div>

        <!-- tabs -->
        <div class="bg-white rounded-2xl border">
            <div class="flex border-b">
                <button @click="tab='overview'" :class="tab==='overview'?'border-b-2 border-black':''" class="px-5 py-3 text-sm font-medium">Overview</button>
                <button @click="tab='history'" :class="tab==='history'?'border-b-2 border-black':''" class="px-5 py-3 text-sm font-medium">Transactions</button>
                <!-- sa may tabs, line 85 -->
                <button @click="tab='cashouts'" :class="tab==='cashouts'?'border-b-2 border-black':''" class="px-5 py-3 text-sm font-medium">Cash Outs</button>
            </div>

            <div v-if="tab==='overview'" class="p-6">
                <div class="grid md:grid-cols-2 gap-4">
            
                    <!-- POS CARD -->
                    <NuxtLink to="/pos" class="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-3xl text-white hover:shadow-xl transition">
                        <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
                        <div class="relative">
                            <div class="inline-flex p-3 bg-white/20 rounded-2xl mb-4 group-hover:scale-110 transition">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                            </div>
                            <h2 class="text-2xl font-bold mb-1">Bukas na ang POS</h2>
                            <p class="text-blue-100 text-sm mb-4">Mag-scan, magbenta, mag-print ng resibo in seconds.</p>
                            <span class="inline-flex items-center gap-2 text-sm font-semibold">
                            Punta sa POS 
                            <svg class="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </span>
                        </div>
                    </NuxtLink>

                    <!-- INVENTORY CARD -->
                    <NuxtLink to="/inventory" class="group relative overflow-hidden bg-white border-2 border-gray-100 p-8 rounded-3xl hover:border-blue-200 hover:shadow-xl transition">
                        <div class="absolute -right-8 -top-8 w-32 h-32 bg-blue-50 rounded-full"></div>
                        <div class="relative">
                            <div class="inline-flex p-3 bg-blue-100 text-blue-600 rounded-2xl mb-4 group-hover:scale-110 transition">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                                </svg>
                            </div>
                            <h2 class="text-2xl font-bold mb-1 text-gray-900">Ayusin ang Inventory</h2>
                            <p class="text-gray-500 text-sm mb-4">Magdagdag ng produkto, check stock, at iwas out-of-stock.</p>
                            <span class="inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                                Manage Inventory
                                <svg class="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </span>
                        </div>
                    </NuxtLink>

                </div>

                <!-- small tip -->
                <p class="text-center text-xs text-gray-400 mt-6">Tip: Gamitin ang barcode scanner sa POS para mas mabilis</p>
            </div>

            <div v-if="tab==='history'" class="divide-y max-h- overflow-auto">
                <div v-if="sales.loading" class="p-6 text-center text-gray-400">Loading...</div>

                   <div v-for="s in sales.history" :key="s.id" class="border-b">
                        <!-- header row - clickable -->
                        <button @click="toggle(s.id)" class="w-full p-4 flex justify-between items-center hover:bg-gray-50 text-left">
                            <div>
                                <p class="font-medium text-sm">{{ s.receipt_no }}</p>
                                <p class="text-xs text-gray-500">{{ new Date(s.created_at).toLocaleString() }}</p>
                            </div>
                            <div class="flex items-center gap-3">
                                <p class="font-semibold">{{ peso(s.total_amount) }}</p>
                                <svg class="w-4 h-4 text-gray-400 transition" :class="expanded===s.id?'rotate-180':''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                            </div>
                        </button>

                        <!-- collapsible items -->
                        <div v-if="expanded===s.id" class="bg-gray-50 px-4 pb-4">
                            <div v-if="!details[s.id]" class="py-3 text-xs text-gray-400">Loading items...</div>
                            <div v-else class="space-y-2 pt-2">

                                <div v-for="it in details[s.id].items" :key="it.id"
                                    class="flex justify-between items-start py-2 border-b border-gray-200 last:border-0">
                                    <div class="flex-1">
                                        <p class="font-medium flex items-center gap-2">
                                        {{ it.name }}
                                            <span v-if="it.returned_qty > 0"
                                                    class="text- bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                                Returned {{ it.returned_qty }}
                                            </span>
                                        </p>
                                        <p class="text-xs text-gray-500">
                                        {{ it.sku }} • {{ it.quantity - it.returned_qty }} / {{ it.quantity }} remaining @ {{ peso(it.unit_price) }}
                                        </p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-gray-700">{{ peso(it.subtotal) }}</p>
                                        <button v-if="it.returned_qty < it.quantity"
                                                @click="doReturn(s.id, it)"
                                                class="text-xs text-red-600 hover:underline mt-1">
                                        Return
                                        </button>
                                        <span v-else class="text-xs text-gray-400 mt-1">Fully returned</span>
                                    </div>
                                </div>

                                <div class="flex justify-between text-xs pt-2 text-gray-600">
                                    <span>Cash: {{ peso(details[s.id].cash_tendered) }}</span>
                                    <span>Change: {{ peso(details[s.id].change_amount) }}</span>
                                </div>
                            </div>
                        </div>

                    <div v-if="!sales.history.length &&!sales.loading" class="p-10 text-center text-gray-400 text-sm">Wala pang benta</div>
                </div>
            </div>
            <div v-if="tab==='cashouts'" class="p-6">
                <div class="flex justify-end mb-4">
                    <CashOutModal v-model:show="showCashOut" @saved="sales.loadDashboard()" />
                    <button @click="showCashOut=true" class="px-4 py-2 bg-red-600 text-white rounded-xl text-sm">
                    + Cash Out
                    </button>
                </div>
                <CashOutList />
            </div>
        </div>
    </div>
</template>