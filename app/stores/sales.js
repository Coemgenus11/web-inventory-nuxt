export const useSalesStore = defineStore('sales', {
  state: () => ({
    summary: { 
      today:{orders:0,total:0}, 
      week:{orders:0,total:0}, 
      month:{orders:0,total:0}, 
      allTime: { orders: 0, total: 0 },
      cash:{ salesIn:0, returnsOut:0, expensesOut:0, onHand:0 } // <-- dagdag
    },
    history: [],
    loading: false,
    lastSale: null
  }),
  actions: {
    async loadDashboard() {
      const { public: { apiBase } } = useRuntimeConfig()
      this.loading = true
      try {
        const data = await $fetch(`${apiBase}/sales/dashboard`)
        this.summary = data.summary
        this.history = data.history
      } finally {
        this.loading = false
      }
    },
    async checkout(payload) {
      const { public: { apiBase } } = useRuntimeConfig()
      const sale = await $fetch(`${apiBase}/sales`, {
        method: 'POST',
        body: { items: payload.items, cash_tendered: payload.cash }
      })
      this.lastSale = sale
      await this.loadDashboard() // auto refresh dashboard
      return sale
    },
    async fetchSale(id) {
        const { public: { apiBase } } = useRuntimeConfig()
        return await $fetch(`${apiBase}/sales/${id}`)
    },
    async returnSale(id, items, reason='') {
        const { public: { apiBase } } = useRuntimeConfig()
        return await $fetch(`${apiBase}/sales/${id}/return`, {
            method: 'POST',
            body: { items, reason }
        })
    }
  }
})