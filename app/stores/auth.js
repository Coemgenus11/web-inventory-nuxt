export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: useCookie('token').value || null,
    user: null,
  }),
  getters: {
    isLoggedIn: (state) =>!!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
  },
  actions: {
    async login({ username, password }) {
      const { public: { apiBase } } = useRuntimeConfig()
      const res = await $fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        body: { username, password }
      })
      this.token = res.token
      this.user = res.user
      useCookie('token', { maxAge: 60*60*24 }).value = res.token
      return res
    },
    async fetchMe() {
      if (!this.token) return null
      const { public: { apiBase } } = useRuntimeConfig()
      try {
        this.user = await $fetch(`${apiBase}/auth/me`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        console.log(this.user)
      } catch {
        this.logout()
      }
    },
    logout() {
      this.token = null
      this.user = null
      useCookie('token').value = null
      navigateTo('/login')
    },
    async registerUser(payload) { // admin only
      const { public: { apiBase } } = useRuntimeConfig()
      return await $fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.token}` },
        body: payload
      })
    },
    async listUsers() { // kailangan mo ng GET /auth/users sa backend
      const { public: { apiBase } } = useRuntimeConfig()
      return await $fetch(`${apiBase}/auth/users`, {
        headers: { Authorization: `Bearer ${this.token}` }
      })
    },
    async updateUserPassword(id, password) {
        const { public: { apiBase } } = useRuntimeConfig()
        return await $fetch(`${apiBase}/auth/users/${id}/password`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${this.token}` },
            body: { password }
        })
    },
  }
})