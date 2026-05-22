<script setup>
const props = defineProps({ show: Boolean })
const emit = defineEmits(['update:show', 'saved'])

const cash = useCashStore()
const products = useProductsStore()
const sales = useSalesStore()

const form = ref({ amount: '', category: 'puhunan', description: '', items: [] })
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
    sales.loadDashboard()
  }
})

const close = () => emit('update:show', false)
const addItem = () => form.value.items.push({ sku:'', quantity:1 })
const removeItem = (i) => form.value.items.splice(i,1)

const submit = async () => {
  const amount = Number(form.value.amount)
  if (!amount || amount <= 0) return alert('Please enter a valid amount')
  if (form.value.category === 'puhunan') {
    const validItems = form.value.items.filter(i => i.sku && i.quantity > 0)
    if (validItems.length === 0) return alert('Please add at least one product')
    form.value.items = validItems
  }
  const categoryLabel = categories.find(c => c.value === form.value.category)?.label
  const itemsText = form.value.category === 'puhunan'
  ? '\n\nItems:\n' + form.value.items.map(i => {
        const p = products.items.find(x => x.sku === i.sku)
        return `• ${p?.name || i.sku} x${i.quantity}`
      }).join('\n') : ''
  const confirmMsg = `Save as PENDING?\n\nAmount: ₱${amount.toLocaleString()}\nCategory: ${categoryLabel}${form.value.description? `\nNote: ${form.value.description}` : ''}${itemsText}\n\nHindi pa babawas sa cash.`
  if (!confirm(confirmMsg)) return
  loading.value = true
  try {
    await cash.createOut({
      amount,
      category: form.value.category,
      description: form.value.description,
      items: form.value.category === 'puhunan'? form.value.items : []
    })
    emit('saved'); close()
  } finally { loading.value = false }
}
</script>

<template>
<Transition name="fade">
  <div v-if="show" class="fixed inset-0 z-[80] flex items-end md:items-center justify-center p-0 md:p-4">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close"></div>
    <div class="relative w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">

      <div class="px-5 sm:px-6 pt-5 pb-4 flex justify-between items-start shrink-0">
        <div>
          <h2 class="text-lg font-semibold">New Cash Out</h2>
          <p class="text-xs text-gray-500 mt-0.5">Available: ₱{{ cashOnHand.toLocaleString() }}</p>
        </div>
        <button @click="close" class="w-9 h-9 -mr-1 grid place-items-center rounded-full hover:bg-gray-100 text-xl">×</button>
      </div>

      <div class="px-5 sm:px-6 pb-6 space-y-4 overflow-y-auto">
        <div>
          <label class="text-xs font-medium text-gray-600">Amount</label>
          <div class="relative mt-1.5">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₱</span>
            <input v-model.number="form.amount" type="number" inputmode="decimal" placeholder="0.00"
              class="w-full h-12 pl-8 pr-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black outline-none text-base">
          </div>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Category</label>
          <select v-model="form.category" class="mt-1.5 w-full h-12 px-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black outline-none text-base">
            <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-600">Description</label>
          <input v-model="form.description" placeholder="Optional note"
            class="mt-1.5 w-full h-12 px-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black outline-none">
        </div>

        <!-- IMPROVED ITEMS -->
        <div v-if="form.category==='puhunan'" class="space-y-3 p-3 sm:p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <div class="flex justify-between items-center">
            <p class="text-xs font-semibold text-amber-800">Purchased Items</p>
            <button @click="addItem" type="button" class="text-xs px-3 py-1.5 bg-amber-600 text-white rounded-lg active:scale-95">+ Add Item</button>
          </div>

          <div v-if="!form.items.length" class="text-center py-6 text-amber-700/70 text-sm">
            Tap "+ Add Item" to start
          </div>

          <div v-for="(it,i) in form.items" :key="i" class="bg-white rounded-xl border border-amber-100 p-3 space-y-2.5">
            <!-- product select -->
            <div>
              <select v-model="it.sku" class="w-full h-12 px-3 rounded-lg bg-gray-50 border border-gray-200 text- focus:border-amber-500 outline-none">
                <option value="">Select product</option>
                <option v-for="p in products.items" :key="p.sku" :value="p.sku">{{ p.name }}</option>
              </select>
              <p v-if="it.sku" class="text- text-gray-500 mt-1 ml-1">
                Stock: {{ products.items.find(p=>p.sku===it.sku)?.stock || 0 }} • ₱{{ Number(products.items.find(p=>p.sku===it.sku)?.retail_price||0).toLocaleString() }}
              </p>
            </div>

            <!-- qty controls -->
            <div class="flex items-center justify-between">
              <button @click="removeItem(i)" type="button" class="text-xs text-red-600 hover:underline">Remove</button>
              <div class="flex items-center gap-2">
                <button @click="it.quantity = Math.max(1, (it.quantity||1)-1)" type="button" class="w-10 h-10 grid place-items-center rounded-lg bg-gray-100 active:bg-gray-200 text-xl leading-none">−</button>
                <input v-model.number="it.quantity" type="number" min="1" class="w-16 h-10 text-center rounded-lg bg-gray-50 border border-gray-200 font-medium outline-none">
                <button @click="it.quantity = (it.quantity||1)+1" type="button" class="w-10 h-10 grid place-items-center rounded-lg bg-gray-100 active:bg-gray-200 text-xl leading-none">+</button>
              </div>
            </div>
          </div>

          <p class="text- text-amber-700/80 px-1">Stock will increase only after you tap "Complete".</p>
        </div>
      </div>

      <div class="px-5 sm:px-6 pb-5 pt-3 border-t bg-white shrink-0">
        <button @click="submit" :disabled="loading ||!form.amount"
          class="w-full h-12 rounded-xl bg-amber-600 text-white font-medium active:scale-[0.98] disabled:opacity-40">
          {{ loading? 'Saving...' : 'Save as Pending' }}
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