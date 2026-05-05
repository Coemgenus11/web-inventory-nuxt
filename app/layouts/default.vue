<template>
  <div class="min-h-screen bg-gray-50 pb-20 md:pb-0">
    <!-- Desktop Top Bar -->
    <header class="hidden md:flex items-center justify-between px-6 py-3 bg-white shadow-sm sticky top-0 z-40">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
        <span class="font-bold text-lg">Web Inventory</span>
      </div>
      <nav class="flex gap-6">
        <NuxtLink to="/" class="nav-link" active-class="text-blue-600 font-semibold">Dashboard</NuxtLink>
        <NuxtLink to="/inventory" class="nav-link" active-class="text-blue-600 font-semibold">Inventory</NuxtLink>
        <NuxtLink to="/pos" class="nav-link" active-class="text-blue-600 font-semibold">POS</NuxtLink>
      </nav>
    </header>

    <!-- BINAGO: nilagyan ng pb-24 sa mobile para hindi matakpan ng nav -->
    <main class="max-w-6xl mx-auto p-4 md:p-6 pb-24 md:pb-6">
      <slot />
    </main>

    <!-- Mobile Bottom Nav -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40 h-16" style="padding-bottom: env(safe-area-inset-bottom)">
      <div class="grid grid-cols-3 h-full">
        <NuxtLink to="/" class="flex flex-col items-center justify-center gap-1" active-class="text-blue-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          <span class="text-xs">Home</span>
        </NuxtLink>
        <NuxtLink to="/inventory" class="flex flex-col items-center justify-center gap-1" active-class="text-blue-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          <span class="text-xs">Inventory</span>
        </NuxtLink>
        <NuxtLink to="/pos" class="flex flex-col items-center justify-center gap-1" active-class="text-blue-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          <span class="text-xs">POS</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>


<style>
.nav-link { @apply text-gray-600 hover:text-black transition; }
</style>