<script setup>
const auth = useAuthStore()
const form = reactive({ username: '', password: '' })
const error = ref('')
async function submit() {
  try {
    await auth.login(form)
    navigateTo('/')
  } catch (e) {
    error.value = 'Mali ang username o password'
  }
}
</script>
<template>
  <div class="min-h-screen flex items-center justify-center">
    <form @submit.prevent="submit" class="bg-white p-6 rounded shadow w-80 space-y-3">
      <h1 class="font-bold text-xl">Login</h1>
      <input v-model="form.username" placeholder="Username" class="w-full border p-2 rounded"/>
      <input v-model="form.password" type="password" placeholder="Password" class="w-full border p-2 rounded"/>
      <button class="w-full bg-blue-600 text-white p-2 rounded">Login</button>
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
    </form>
  </div>
</template>