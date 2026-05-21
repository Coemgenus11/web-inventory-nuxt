export const useCashStore = defineStore('cash', {
  state: () => ({
    outs: [],
    loading: false,
    current: null
  }),
  actions: {
    async loadOuts() {
      const { public: { apiBase } } = useRuntimeConfig()
      const auth = useAuthStore()
      this.loading = true
      try {
        this.outs = await $fetch(`${apiBase}/cash-outs`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        })
      } finally { this.loading = false }
    },
    async createOut(payload) {
      const { public: { apiBase } } = useRuntimeConfig()
      const auth = useAuthStore()
      await $fetch(`${apiBase}/cash-outs`, {
        method: 'POST',
        body: payload,
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      await this.loadOuts()
      await useSalesStore().loadDashboard()
    },
    async fetchOut(id) {
      const { public: { apiBase } } = useRuntimeConfig()
      const auth = useAuthStore()
      this.current = await $fetch(`${apiBase}/cash-outs/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      return this.current
    },
    async updateOut(id, payload) {
      const { public: { apiBase } } = useRuntimeConfig()
      const auth = useAuthStore()
      await $fetch(`${apiBase}/cash-outs/${id}`, {
        method: 'PUT',
        body: payload,
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      await this.loadOuts()
    },
    async completeOut(id) {
      const { public: { apiBase } } = useRuntimeConfig()
      const auth = useAuthStore()
      await $fetch(`${apiBase}/cash-outs/${id}/complete`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      await this.loadOuts()
      await useSalesStore().loadDashboard() // refresh onHand
    },
    async cancelOut(id) {
      const { public: { apiBase } } = useRuntimeConfig()
      const auth = useAuthStore()
      await $fetch(`${apiBase}/cash-outs/${id}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      await this.loadOuts()
      await useSalesStore().loadDashboard()
    }
  },
  getters: {
    pending: (state) => state.outs.filter(o => o.status === 'pending'),
    completed: (state) => state.outs.filter(o => o.status === 'complete'),
  }
})