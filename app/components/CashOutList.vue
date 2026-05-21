<script setup>
const cash = useCashStore()
const products = useProductsStore()
const sales = useSalesStore()

onMounted(() => {
  cash.loadOuts()
  products.load()
})

const peso = (n) => '₱' + Number(n||0).toLocaleString('en-PH', {minimumFractionDigits:2})
const filter = ref('all')
const expanded = ref(null)
const selected = ref(null)

const filtered = computed(() => {
  if (filter.value === 'all') return cash.outs
  return cash.outs.filter(o => o.status === filter.value)
})

const toggle = async (id) => {
  if (expanded.value === id) { expanded.value = null; return }
  expanded.value = id
  selected.value = await cash.fetchOut(id)
}

const doComplete = async (out) => {
  if (!confirm(`Complete ₱${Number(out.amount).toLocaleString()} - ${out.category}?`)) return
  await cash.completeOut(out.id)
  await products.load()
  await sales.loadDashboard()
}

const doCancel = async (out) => {
  if (!confirm('Cancel this pending cash out?')) return
  await cash.cancelOut(out.id)
}

const doEdit = async (out) => {
  const newAmount = Number(prompt('New amount', out.amount))
  if (!newAmount || newAmount <= 0) return
  await cash.updateOut(out.id, {
    amount: newAmount,
    category: out.category,
    description: out.description,
    items: []
  })
}

const badge = (status) => ({
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  complete: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200'
}[status] || 'bg-gray-100')
</script>

<template>
<div class="bg-white rounded-2xl border">
  <!-- header - nag-wrap sa mobile -->
  <div class="p-3 sm:p-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <div class="flex flex-wrap gap-1.5">
      <button v-for="f in ['all','pending','complete','cancelled']" :key="f"
        @click="filter=f"
        :class="filter===f? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        class="px-3 py-1.5 rounded-xl text-xs capitalize transition">
        {{ f }} <span v-if="f!=='all'" class="opacity-70">({{ cash.outs.filter(o=>o.status===f).length }})</span>
      </button>
    </div>
    <button @click="cash.loadOuts()" class="self-end sm:self-auto text-xs text-gray-500 hover:text-black hover:underline">Refresh</button>
  </div>

  <!-- list -->
  <div class="divide-y max-h- overflow-auto">
    <div v-if="cash.loading" class="p-6 text-center text-gray-400">Loading...</div>

    <div v-for="out in filtered" :key="out.id" class="border-b">
      <!-- main row - stack sa mobile -->
      <button @click="toggle(out.id)" class="w-full p-3 sm:p-4 hover:bg-gray-50 text-left active:bg-gray-100">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="font-semibold text-base sm:text-sm">₱{{ Number(out.amount).toLocaleString() }}</p>
              <span :class="badge(out.status)" class="text- px-2 py-0.5 rounded-full border capitalize shrink-0">{{ out.status }}</span>
            </div>
            <p class="text-xs text-gray-600 mt-1 line-clamp-1">{{ out.category }} • {{ out.description || 'no note' }}</p>
            <p class="text- text-gray-400 mt-0.5">{{ new Date(out.created_at).toLocaleDateString('en-PH', {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}) }}</p>
          </div>
          <div class="flex flex-col items-end gap-1 shrink-0">
            <span class="text- text-gray-500 bg-gray-50 px-2 py-0.5 rounded-lg">{{ out.items_count }} items</span>
            <svg class="w-4 h-4 text-gray-400 transition-transform" :class="expanded===out.id?'rotate-180':''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
      </button>

      <!-- expanded -->
      <div v-if="expanded===out.id" class="bg-gray-50 px-3 sm:px-4 pb-4">
        <div v-if="!selected || selected.id!==out.id" class="py-4 text-xs text-gray-400 text-center">Loading...</div>
        <div v-else>
          <div class="pt-3 space-y-1.5 max-h-40 overflow-auto pr-1">
            <div v-for="it in selected.items" :key="it.id" class="flex justify-between gap-2 text-xs py-1.5 border-b border-gray-200 last:border-0">
              <span class="truncate pr-2">{{ it.product_name }} <span class="text-gray-400">({{ it.sku }})</span></span>
              <span class="shrink-0 font-medium">x{{ it.quantity }} @ ₱{{ Number(it.unit_cost).toLocaleString() }}</span>
            </div>
            <p v-if="!selected.items.length" class="text-xs text-gray-500 italic py-2">No items</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4" v-if="out.status==='pending'">
            <button @click="doComplete(out)" class="h-10 sm:h-9 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 active:scale-[0.98]">Complete</button>
            <button @click="doEdit(out)" class="h-10 sm:h-9 rounded-xl bg-gray-100 text-sm hover:bg-gray-200">Edit</button>
            <button @click="doCancel(out)" class="h-10 sm:h-9 rounded-xl bg-red-50 text-red-600 text-sm hover:bg-red-100">Cancel</button>
          </div>
          <div v-else class="mt-3 text- text-gray-500 text-center sm:text-left">
            {{ out.status === 'complete'? 'Completed' : 'Cancelled' }} • {{ new Date(out.updated_at).toLocaleString() }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="!filtered.length &&!cash.loading" class="p-10 text-center text-gray-400 text-sm">
      No {{ filter!== 'all'? filter : '' }} cash outs
    </div>
  </div>
</div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>