export const useProductsStore = defineStore('products', {
  state: () => ({
    items: [],
    loading: false,
    found: null
  }),

  actions: {
    async load() {
      const { public: { apiBase } } = useRuntimeConfig()
      const auth = useAuthStore()
      const headers = auth.token ? { Authorization: `Bearer ${auth.token}` } : {}
      
      this.loading = true
      try {
        this.items = await $fetch(`${apiBase}/products`, { headers })
      } catch (e) {
        console.error('Load products failed', e)
        this.items = []
      } finally {
        this.loading = false
      }
    },

    async create(payload) {
      // payload = { name, category_id, unit_price, retail_price, stock }
      const { public: { apiBase } } = useRuntimeConfig()
      const auth = useAuthStore()
      const headers = auth.token ? { Authorization: `Bearer ${auth.token}` } : {}

      await $fetch(`${apiBase}/products`, {
        method: 'POST',
        headers,
        body: {
          name: payload.name,
          category_id: payload.category_id,
          unit_price: Number(payload.unit_price) || 0,
          retail_price: Number(payload.retail_price) || 0,
          stock: Number(payload.stock) || 0
        }
      })
      await this.load()
    },

    async findBySku(sku) {
      const { public: { apiBase } } = useRuntimeConfig()
      const auth = useAuthStore()
      const headers = auth.token ? { Authorization: `Bearer ${auth.token}` } : {}

      this.found = await $fetch(`${apiBase}/products/${sku}`, { headers })
      return this.found
    },

    async adjustStock(sku, delta) {
      const { public: { apiBase } } = useRuntimeConfig()
      const auth = useAuthStore()
      const headers = auth.token ? { Authorization: `Bearer ${auth.token}` } : {}

      await $fetch(`${apiBase}/products/${sku}/stock`, {
        method: 'PATCH',
        headers,
        body: { adjustment: delta }
      })
      await this.load()
    },

    async update(sku, payload) {
      // payload = { name, unit_price, retail_price, category_id }
      const { public: { apiBase } } = useRuntimeConfig()
      const auth = useAuthStore()
      const headers = auth.token ? { Authorization: `Bearer ${auth.token}` } : {}

      await $fetch(`${apiBase}/products/${sku}`, {
        method: 'PUT',
        headers,
        body: {
          name: payload.name,
          unit_price: payload.unit_price != null ? Number(payload.unit_price) : undefined,
          retail_price: payload.retail_price != null ? Number(payload.retail_price) : undefined,
          category_id: payload.category_id
        }
      })
      await this.load()
    },

    async remove(sku) {
      const { public: { apiBase } } = useRuntimeConfig()
      const auth = useAuthStore()
      const headers = auth.token ? { Authorization: `Bearer ${auth.token}` } : {}

      await $fetch(`${apiBase}/products/${sku}`, { 
        method: 'DELETE',
        headers
      })
      await this.load()
    }
  }
})