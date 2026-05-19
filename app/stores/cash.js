export const useCashStore = defineStore('cash', {
  state: () => ({
    outs: [],
    loading: false
  }),
  actions: {
    async loadOuts() {
      const { public: { apiBase } } = useRuntimeConfig()
      const auth = useAuthStore() // <-- kunin token
      this.loading = true
      try {
        this.outs = await $fetch(`${apiBase}/cash-outs`, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        })
      } finally {
        this.loading = false
      }
    },
    async createOut(payload) {
      const { public: { apiBase } } = useRuntimeConfig()
      const auth = useAuthStore() // <-- kunin token
      await $fetch(`${apiBase}/cash-outs`, {
        method: 'POST',
        body: payload,
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
      // auto refresh
      await this.loadOuts()
      const sales = useSalesStore()
      await sales.loadDashboard()
    }
  }
})