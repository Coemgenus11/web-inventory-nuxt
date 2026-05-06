<script setup>
const auth = useAuthStore()
onMounted(() => auth.fetchMe())
const isAdmin = computed(() => auth.isAdmin)
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc]" :class="auth.isLoggedIn? 'pb-20 md:pb-0' : ''">
    <!-- Desktop Header - LALABAS LANG PAG LOGGED IN -->
    <header v-if="auth.isLoggedIn" class="hidden md:flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/20">W</div>
        <span class="font-semibold text- tracking-tight text-gray-900">Web Inventory</span>
      </div>

      <nav class="flex items-center gap-1.5">
        <NuxtLink to="/" exact-active-class="text-blue-600 bg-blue-50" class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition">
          <svg class="w- h-" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          Dashboard
        </NuxtLink>

        <NuxtLink to="/inventory" active-class="text-blue-600 bg-blue-50" class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition">
          <svg class="w- h-" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          Inventory
        </NuxtLink>

        <NuxtLink to="/pos" active-class="text-blue-600 bg-blue-50" class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition">
          <svg class="w- h-" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2 7h20M5 7V5a2 2 0 012-2h10a2 2 0 012 2v2M5 7v10a2 2 0 002 2h10a2 2 0 002-2V7M9 14h6"/></svg>
          POS
        </NuxtLink>

        <NuxtLink v-if="isAdmin" to="/admin/users" active-class="text-blue-600 bg-blue-50" class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition">
          <svg class="w- h-" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          Users
        </NuxtLink>
        <NuxtLink v-else to="/profile" active-class="text-blue-600 bg-blue-50" class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition">
          <svg class="w- h-" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          Profile
        </NuxtLink>
      </nav>

      <button @click="auth.logout()" class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        Logout
      </button>
    </header>

    <main class="max-w-6xl mx-auto p-4 md:p-6" :class="auth.isLoggedIn? 'pb-24 md:pb-6' : ''">
      <slot />
    </main>

    <!-- Mobile nav - LALABAS LANG PAG LOGGED IN -->
    <nav v-if="auth.isLoggedIn" class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40 h-16" style="padding-bottom: env(safe-area-inset-bottom)">
      <div class="grid-cols-4 grid h-full">
        <NuxtLink to="/" class="flex flex-col items-center justify-center gap-1 text-gray-500" exact-active-class="!text-blue-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          <span class="text-xs">Home</span>
        </NuxtLink>
        <NuxtLink to="/inventory" class="flex flex-col items-center justify-center gap-1 text-gray-500" active-class="!text-blue-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          <span class="text-xs">Inventory</span>
        </NuxtLink>
        <NuxtLink to="/pos" class="flex flex-col items-center justify-center gap-1 text-gray-500" active-class="!text-blue-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          <span class="text-xs">POS</span>
        </NuxtLink>
        <NuxtLink v-if="isAdmin" to="/admin/users" class="flex flex-col items-center justify-center gap-1 text-gray-500" active-class="!text-blue-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          <span class="text-xs">Users</span>
        </NuxtLink>
        <NuxtLink v-else to="/profile" class="flex flex-col items-center justify-center gap-1 text-gray-500" active-class="!text-blue-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          <span class="text-xs">Profile</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>