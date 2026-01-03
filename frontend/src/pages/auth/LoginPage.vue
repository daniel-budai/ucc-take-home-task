<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { loginCredentialsSchema } from '@/types'
import { useAuth } from '@/composables/useAuth'
import AuthLayout from '@/layouts/AuthLayout.vue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

const { login } = useAuth()
const loading = ref(false)

const { handleSubmit, defineField, errors } = useForm({
  validationSchema: toTypedSchema(loginCredentialsSchema),
})

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  try {
    await login(values)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AuthLayout>
    <h2 class="text-2xl font-semibold text-gray-800 mb-6">Sign In</h2>

    <form class="space-y-4" @submit="onSubmit">
      <div class="flex flex-col gap-2">
        <label for="email" class="font-medium text-gray-700">Email</label>
        <InputText
          id="email"
          v-model="email"
          v-bind="emailAttrs"
          type="email"
          :invalid="!!errors.email"
          placeholder="you@example.com"
          class="w-full"
        />
        <small v-if="errors.email" class="text-red-500">{{ errors.email }}</small>
      </div>

      <div class="flex flex-col gap-2">
        <label for="password" class="font-medium text-gray-700">Password</label>
        <Password
          id="password"
          v-model="password"
          v-bind="passwordAttrs"
          :invalid="!!errors.password"
          placeholder="Enter your password"
          :feedback="false"
          toggle-mask
          class="w-full"
          input-class="w-full"
        />
        <small v-if="errors.password" class="text-red-500">{{ errors.password }}</small>
      </div>

      <Button
        type="submit"
        label="Sign In"
        :loading="loading"
        icon="pi pi-sign-in"
        class="w-full mt-4"
      />
    </form>

    <div class="mt-6 text-center">
      <router-link to="/reset-password" class="text-sm text-blue-600 hover:underline">
        Forgot your password?
      </router-link>
    </div>
  </AuthLayout>
</template>






