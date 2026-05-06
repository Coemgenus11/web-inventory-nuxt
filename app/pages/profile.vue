<script setup>
import { computed, onMounted } from 'vue'

const auth = useAuthStore()

onMounted(async () => {
  if (!auth.user) await auth.fetchMe()
})

const displayName = computed(() => auth.user?.full_name || auth.user?.username || 'Staff')
const initials = computed(() => displayName.value.charAt(0).toUpperCase())
</script>

<template>
  <div class="max-w- mx-auto pb-24">
    <!-- Cover -->
    <div class="relative">
      <div class="h-36 bg-gradient-to-br from-neutral-900 via-black to-neutral-900 relative overflow-hidden rounded-b-">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]"></div>

        <!-- Logout -->
        <button @click="auth.logout()" class="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs font-medium hover:bg-white/20 active:bg-white/25 transition">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          Logout
        </button>
      </div>

      <!-- Profile Card -->
      <div class="px-5 -mt-12 relative z-10">
        <div class="bg-white rounded- border border-neutral-200 shadow-sm pt-14 pb-6 px-6">
          <!-- Avatar -->
          <div class="absolute left-1/2 -translate-x-1/2 -top-12">
            <div class="w-24 h-24 rounded- bg-neutral-900 border- border-white shadow-xl flex items-center justify-center text-3xl font-semibold text-white">
              {{ initials }}
            </div>
          </div>

          <!-- Name -->
          <div class="text-center">
            <h1 class="text-xl font-semibold text-gray-900 tracking-tight">{{ displayName }}</h1>
            <p class="text-sm text-neutral-500 mt-0.5">@{{ auth.user?.username }}</p>

            <div class="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full border" :class="auth.isAdmin? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-100 text-neutral-700 border-neutral-200'">
              <span class="w-1.5 h-1.5 rounded-full" :class="auth.isAdmin? 'bg-white' : 'bg-neutral-500'"></span>
              <span class="text-xs font-medium capitalize tracking-wide">{{ auth.user?.role }}</span>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-3 mt-6">
            <div class="bg-neutral-50 rounded-2xl p-4 text-center border border-neutral-100">
              <p class="text- text-neutral-500 uppercase tracking-wider font-medium mb-1.5">Status</p>
              <div class="flex items-center justify-center gap-1.5">
                <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p class="text-sm font-semibold text-gray-900">Active</p>
              </div>
            </div>
            <div class="bg-neutral-50 rounded-2xl p-4 text-center border border-neutral-100">
              <p class="text- text-neutral-500 uppercase tracking-wider font-medium mb-1.5">User ID</p>
              <p class="text-sm font-semibold text-gray-900">#{{ auth.user?.id || '—' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Details -->
    <div class="px-5 mt-4 space-y-3">
      <div class="bg-white rounded-2xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100">
        <div class="px-4 py-4 flex items-center justify-between">
          <div>
            <p class="text-xs text-neutral-500">Account Type</p>
            <p class="text-sm font-medium text-gray-900 mt-1">{{ auth.isAdmin? 'Administrator' : 'Staff Member' }}</p>
          </div>
          <div class="w-9 h-9 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center">
            <!-- FIXED SVG - dati kulang yung arc flags -->
            <svg class="w-4.5 h-4.5 text-neutral-600" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
        </div>

        <div class="px-4 py-4">
          <p class="text-xs text-neutral-500">Access Level</p>
          <p class="text-sm text-neutral-700 mt-1 leading-snug">{{ auth.isAdmin? 'Full access to all modules and settings' : 'POS & Inventory only' }}</p>
        </div>
      </div>

      <p class="text-center text-xs text-neutral-400 px-8 leading-relaxed">
        Kailangan magpalit ng password? Kontakin ang administrator.
      </p>
    </div>
  </div>
</template>