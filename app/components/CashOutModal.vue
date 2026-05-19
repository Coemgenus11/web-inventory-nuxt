<script setup>
const props = defineProps({ show: Boolean })
const emit = defineEmits(['update:show', 'saved'])

const cash = useCashStore()
const products = useProductsStore()
const sales = useSalesStore()

const form = ref({
  amount: '',
  category: 'puhunan',
  description: '',
  items: []
})
const loading = ref(false)

const cashOnHand = computed(() => Number(sales.summary.cash?.onHand || 0))

const categories = [
  { value: 'puhunan', label: 'Capital / Stock Purchase' },
  { value: 'bills', label: 'Bills' },
  { value: 'sahod', label: 'Salary' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'withdrawal', label: 'Personal Withdrawal' },
  { value: 'other', label: 'Other' },
]

watch(() => props.show, (v) => {
  if (v) {
    form.value = { amount:'', category:'puhunan', description:'', items:[] }
    products.load()
    sales.loadDashboard() // refresh cash on hand
  }
})

const close = () => emit('update:show', false)
const addItem = () => form.value.items.push({ sku:'', quantity:1 })
const removeItem = (i) => form.value.items.splice(i,1)

const submit = async () => {
  const amount = Number(form.value.amount)

  // validation 1: amount
  if (!amount || amount <= 0) return alert('Please enter a valid amount')
  if (amount > cashOnHand.value) {
    return alert(`Insufficient cash. You only have ₱${cashOnHand.value.toLocaleString()}`)
  }

  // validation 2: puhunan must have products
  if (form.value.category === 'puhunan') {
    const validItems = form.value.items.filter(i => i.sku && i.quantity > 0)
    if (validItems.length === 0) {
      return alert('Please add at least one product for Capital purchase')
    }
    form.value.items = validItems
  }

  // --- NEW CONFIRMATION ---
  const categoryLabel = categories.find(c => c.value === form.value.category)?.label
  const itemsText = form.value.category === 'puhunan' 
    ? '\n\nItems:\n' + form.value.items.map(i => {
        const p = products.items.find(x => x.sku === i.sku)
        return `• ${p?.name || i.sku} x${i.quantity}`
      }).join('\n')
    : ''
  
  const confirmMsg = `Confirm Cash Out?\n\nAmount: ₱${amount.toLocaleString()}\nCategory: ${categoryLabel}${form.value.description ? `\nNote: ${form.value.description}` : ''}${itemsText}\n\nCash after: ₱${(cashOnHand.value - amount).toLocaleString()}`

  if (!confirm(confirmMsg)) return
  // --- END ---

  loading.value = true
  try {
    await cash.createOut({
      amount,
      category: form.value.category,
      description: form.value.description,
      items: form.value.items
    })
    emit('saved')
    close()
  } finally {
    loading.value = false
  }
}
</script>

<template>
<Transition name="fade">
  <div v-if="show" class="fixed inset-0 z-[80] flex items-end md:items-center justify-center p-0 md:p-4">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close"></div>
    <div class="relative w-full md:max-w- bg-white rounded-t- md:rounded- shadow-2xl max-h- flex flex-col">

      <div class="px-6 pt-5 pb-4 flex justify-between items-start">
        <div>
          <h2 class="text- font-semibold">Cash Out</h2>
          <p class="text-xs text-gray-500 mt-0.5">Available: ₱{{ cashOnHand.toLocaleString() }}</p>
        </div>
        <button @click="close" class="w-8 h-8 grid place-items-center rounded-full hover:bg-gray-100">✕</button>
      </div>

      <div class="px-6 pb-6 space-y-4 overflow-y-auto">
        <div>
          <label class="text-xs font-medium text-gray-600">Amount</label>
          <div class="relative mt-1.5">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₱</span>
            <input v-model.number="form.amount" type="number" inputmode="decimal" placeholder="0.00"
              class="w-full h-12 pl-7 pr-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 outline-none">
          </div>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Category</label>
          <select v-model="form.category" class="mt-1.5 w-full h-12 px-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 outline-none">
            <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Description (optional)</label>
          <input v-model="form.description" placeholder="e.g. Meralco bill, supplier payment"
            class="mt-1.5 w-full h-12 px-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 outline-none">
        </div>

        <!-- MULTIPLE PRODUCTS -->
        <div v-if="form.category==='puhunan'" class="space-y-3 p-3 bg-blue-50 rounded-2xl">
          <div class="flex justify-between items-center">
            <p class="text-xs font-medium text-blue-700">Purchased Items</p>
            <button @click="addItem" type="button" class="text-xs px-2.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ Add Item</button>
          </div>

          <div v-for="(it,i) in form.items" :key="i" class="flex gap-2">
            <select v-model="it.sku" class="flex-1 h-11 px-3 rounded-xl bg-white border text-sm outline-none">
              <option value="">Select product</option>
              <option v-for="p in products.items" :key="p.sku" :value="p.sku">{{ p.name }} ({{ p.stock }} left)</option>
            </select>
            <input v-model.number="it.quantity" type="number" min="1" class="w-20 h-11 px-2 rounded-xl bg-white border text-sm text-center outline-none">
            <button @click="removeItem(i)" type="button" class="w-9 h-11 grid place-items-center text-red-500 hover:bg-red-50 rounded-xl">×</button>
          </div>
          <p v-if="!form.items.length" class="text- text-amber-700">Add at least one product for capital purchases</p>
          <p class="text- text-gray-500">Stock will be increased automatically. Cash will be deducted by the amount above.</p>
        </div>
      </div>

      <div class="px-6 pb-6 pt-2 border-t">
        <button @click="submit" :disabled="loading ||!form.amount"
          class="w-full h-12 rounded-2xl bg-red-600 text-white font-medium hover:bg-red-700 active:scale-[0.98] disabled:opacity-40 transition">
          {{ loading? 'Saving...' : 'Log Cash Out' }}
        </button>
      </div>
    </div>
  </div>
</Transition>
</template>

<style scoped>
.fade-enter-active,.fade-leave-active{transition:opacity.2s}
.fade-enter-from,.fade-leave-to{opacity:0}
</style>