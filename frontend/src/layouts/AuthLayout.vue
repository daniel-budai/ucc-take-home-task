<script setup lang="ts">
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
  >

    <div class="w-full max-w-md">
      <!-- Logo / Brand -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">UCC Event Manager</h1>
        <p class="text-gray-600 mt-2">Manage your events and get support</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-xl shadow-lg p-8">
        <slot />
      </div>

      <!-- Footer -->
      <p class="text-center text-sm text-gray-500 mt-6">
        © {{ new Date().getFullYear() }} United Call Centers
      </p>
    </div>
  </div>
</template>






