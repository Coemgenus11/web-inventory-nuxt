<script setup>
definePageMeta({ middleware: 'admin' })

const auth = useAuthStore()
const users = ref([])
const showModal = ref(false)
const isCreating = ref(false)
const showPasswordModal = ref(false)
const selectedUser = ref(null)
const isUpdating = ref(false)

const form = reactive({ username: '', password: '', full_name: '', role: 'user' })
const passwordForm = reactive({ password: '' })

async function load() { users.value = await auth.listUsers() }
async function create() {
  if (!form.username ||!form.password) return
  isCreating.value = true
  try {
    await auth.registerUser(form)
    Object.assign(form, { username: '', password: '', full_name: '', role: 'user' })
    showModal.value = false
    await load()
  } finally { isCreating.value = false }
}
function openPasswordModal(u) { selectedUser.value = u; passwordForm.password = ''; showPasswordModal.value = true }
async function updatePassword() {
  if (!passwordForm.password ||!selectedUser.value) return
  isUpdating.value = true
  try {
    await auth.updateUserPassword(selectedUser.value.id, passwordForm.password)
    showPasswordModal.value = false
  } catch (e) { alert(e.data?.error || 'Failed') } finally { isUpdating.value = false }
}
onMounted(load)
</script>

<template>
  <div class="space-y-5 pb-28 md:pb-6">
    <!-- Header with Logout -->
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text- font-semibold tracking-tight text-neutral-900">Users</h1>
        <p class="text- text-neutral-500 mt-0.5">{{ users.length }} accounts</p>
      </div>
      <div class="flex items-center gap-2">
        <!-- Logout - same minimal style -->
        <button @click="auth.logout()" class="h-9 px-3 rounded-xl bg-neutral-100 text-neutral-600 hover:bg-neutral-200 active:bg-neutral-200 flex items-center gap-1.5 transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          <span class="hidden sm:inline text- font-medium">Logout</span>
        </button>
        <button @click="showModal = true" class="hidden md:inline-flex items-center gap-1.5 bg-neutral-900 text-white px-3.5 h-9 rounded-xl text- font-medium active:scale-[0.98] transition">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
          Add
        </button>
      </div>
    </div>

    <!-- List -->
    <div class="bg-white md:rounded-2xl md:border md:border-neutral-200 overflow-hidden -mx-4 md:mx-0">
      <!-- Desktop -->
      <div class="hidden md:block">
        <table class="w-full">
          <thead class="bg-neutral-50/80">
            <tr class="border-b border-neutral-200">
              <th class="text-left text- font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">User</th>
              <th class="text-left text- font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Role</th>
              <th class="text-right text- font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            <tr v-for="u in users" :key="u.id" class="hover:bg-neutral-50/60">
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center text- font-medium">{{ (u.full_name || u.username).charAt(0).toUpperCase() }}</div>
                  <div>
                    <div class="text- font-medium text-neutral-900">{{ u.full_name || '—' }}</div>
                    <div class="text- text-neutral-500">@{{ u.username }}</div>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <span :class="u.role==='admin'? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'" class="px-2.5 py-1 rounded-lg text- font-medium capitalize">{{ u.role }}</span>
              </td>
              <td class="px-5 py-3.5 text-right">
                <button @click="openPasswordModal(u)" class="text- font-medium text-neutral-600 hover:text-black px-3 py-1.5 rounded-lg hover:bg-neutral-100">Reset</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile - super clean cards -->
      <div class="md:hidden divide-y divide-neutral-100">
        <div v-for="u in users" :key="u.id" class="flex items-center gap-3 px-4 h- active:bg-neutral-50">
          <div class="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center text- font-medium shrink-0">
            {{ (u.full_name || u.username).charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5">
              <p class="text- font-medium text-neutral-900 truncate">{{ u.full_name || u.username }}</p>
              <span :class="u.role==='admin'? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-700'" class="px-1.5 py-0.5 rounded-md text- font-medium uppercase tracking-wide">{{ u.role }}</span>
            </div>
            <p class="text- text-neutral-500 truncate">@{{ u.username }}</p>
          </div>
          <button @click="openPasswordModal(u)" class="w-8 h-8 rounded-lg active:bg-neutral-100 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
          </button>
        </div>
        <div v-if="users.length===0" class="py-20 text-center">
          <p class="text- text-neutral-500">No users yet</p>
        </div>
      </div>
    </div>

    <!-- Mobile FAB -->
    <button @click="showModal = true" class="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-neutral-900 text-white rounded-2xl shadow-lg active:scale-95 transition z-30 flex items-center justify-center">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
    </button>

    <!-- Add Modal -->
    <Transition name="fade">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-end md:items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="showModal=false"></div>
        <div class="relative bg-white w-full md:max-w- rounded-t- md:rounded-2xl animate-slide-up">
          <div class="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-neutral-100 rounded-t- md:rounded-t-2xl">
            <div class="w-9 h-1 bg-neutral-300 rounded-full mx-auto mb-3 md:hidden"></div>
            <div class="flex items-center justify-between">
              <h2 class="text- font-semibold">New User</h2>
              <button @click="showModal=false" class="w-7 h-7 rounded-full hover:bg-neutral-100 flex items-center justify-center"><svg class="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
          <form @submit.prevent="create" class="px-5 py-4 space-y-3.5">
            <div>
              <label class="text- text-neutral-600 mb-1 block">Full name</label>
              <input v-model="form.full_name" class="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text- focus:outline-none focus:bg-white focus:border-neutral-900" placeholder="Juan Dela Cruz"/>
            </div>
            <div>
              <label class="text- text-neutral-600 mb-1 block">Username</label>
              <input v-model="form.username" class="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text- focus:outline-none focus:bg-white focus:border-neutral-900" placeholder="juan" autocapitalize="off"/>
            </div>
            <div>
              <label class="text- text-neutral-600 mb-1 block">Password</label>
              <input v-model="form.password" type="password" class="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text- focus:outline-none focus:bg-white focus:border-neutral-900" placeholder="••••••••"/>
            </div>
            <div>
              <label class="text- text-neutral-600 mb-1.5 block">Role</label>
              <div class="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100 rounded-xl">
                <button type="button" @click="form.role='user'" :class="form.role==='user'? 'bg-white shadow-sm text-black' : 'text-neutral-600'" class="h-10 rounded-lg text- font-medium">Staff</button>
                <button type="button" @click="form.role='admin'" :class="form.role==='admin'? 'bg-white shadow-sm text-black' : 'text-neutral-600'" class="h-10 rounded-lg text- font-medium">Admin</button>
              </div>
            </div>
            <div class="flex gap-2.5 pt-2">
              <button type="button" @click="showModal=false" class="flex-1 h-11 rounded-xl bg-neutral-100 text- font-medium active:bg-neutral-200">Cancel</button>
              <button type="submit" :disabled="isCreating ||!form.username ||!form.password" class="flex-1 h-11 rounded-xl bg-neutral-900 text-white text- font-medium disabled:opacity-40 active:bg-black">{{ isCreating? 'Creating...' : 'Create' }}</button>
            </div>
            <div class="h-4 md:hidden"></div>
          </form>
        </div>
        </div>
      </div>
    </Transition>

    <!-- Reset Modal -->
    <Transition name="fade">
      <div v-if="showPasswordModal" class="fixed inset-0 z-50 flex items-end md:items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="showPasswordModal=false"></div>
        <div class="relative bg-white w-full md:max-w- rounded-t- md:rounded-2xl animate-slide-up">
          <div class="px-5 pt-5 pb-2">
            <div class="w-9 h-1 bg-neutral-300 rounded-full mx-auto mb-3 md:hidden"></div>
            <h2 class="text- font-semibold">Reset Password</h2>
            <p class="text- text-neutral-500 mt-0.5">@{{ selectedUser?.username }}</p>
          </div>
          <form @submit.prevent="updatePassword" class="px-5 pb-5 space-y-3">
            <input v-model="passwordForm.password" type="password" autofocus class="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text- focus:outline-none focus:bg-white focus:border-neutral-900" placeholder="New password"/>
            <div class="flex gap-2.5">
              <button type="button" @click="showPasswordModal=false" class="flex-1 h-11 rounded-xl bg-neutral-100 text- font-medium">Cancel</button>
              <button type="submit" :disabled="isUpdating ||!passwordForm.password" class="flex-1 h-11 rounded-xl bg-neutral-900 text-white text- font-medium disabled:opacity-40">{{ isUpdating? 'Updating...' : 'Update' }}</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,.fade-leave-active{transition:opacity.18s}
.fade-enter-from,.fade-leave-to{opacity:0}
.animate-slide-up{animation:slideUp.25s cubic-bezier(.2,.8,.2,1)}
@keyframes slideUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
</style>