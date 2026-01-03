<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { passwordResetRequestSchema, passwordResetConfirmSchema } from '@/types'
import { useAuth } from '@/composables/useAuth'
import AuthLayout from '@/layouts/AuthLayout.vue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

const route = useRoute()
const { requestPasswordReset, confirmPasswordReset } = useAuth()

const loading = ref(false)
const emailSent = ref(false)

// Check if we have a token in the URL (confirm mode)
const token = computed(() => route.query.token as string | undefined)
const emailFromUrl = computed(() => route.query.email as string | undefined)
const isConfirmMode = computed(() => !!token.value)

// Request form
const requestForm = useForm({
  validationSchema: toTypedSchema(passwordResetRequestSchema),
})
const [requestEmail, requestEmailAttrs] = requestForm.defineField('email')

// Confirm form
const confirmForm = useForm({
  validationSchema: toTypedSchema(passwordResetConfirmSchema),
  initialValues: {
    token: token.value || '',
    email: emailFromUrl.value || '',
  },
})
const [confirmPassword, confirmPasswordAttrs] = confirmForm.defineField('password')
const [confirmPasswordConfirmation, confirmPasswordConfirmationAttrs] =
  confirmForm.defineField('password_confirmation')

// Request password reset
const onRequestSubmit = requestForm.handleSubmit(async (values) => {
  loading.value = true
  try {
    await requestPasswordReset(values)
    emailSent.value = true
  } finally {
    loading.value = false
  }
})

// Confirm password reset
const onConfirmSubmit = confirmForm.handleSubmit(async (values) => {
  loading.value = true
  try {
    await confirmPasswordReset({
      ...values,
      token: token.value || '',
      email: emailFromUrl.value || '',
    })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AuthLayout>
    <!-- Confirm Mode (with token) -->
    <template v-if="isConfirmMode">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">Set New Password</h2>

      <form class="space-y-4" @submit="onConfirmSubmit">
        <div class="flex flex-col gap-2">
          <label for="password" class="font-medium text-gray-700">New Password</label>
          <Password
            id="password"
            v-model="confirmPassword"
            v-bind="confirmPasswordAttrs"
            :invalid="!!confirmForm.errors.value.password"
            placeholder="Enter new password"
            toggle-mask
            class="w-full"
            input-class="w-full"
          />
          <small v-if="confirmForm.errors.value.password" class="text-red-500">
            {{ confirmForm.errors.value.password }}
          </small>
        </div>

        <div class="flex flex-col gap-2">
          <label for="password_confirmation" class="font-medium text-gray-700">
            Confirm Password
          </label>
          <Password
            id="password_confirmation"
            v-model="confirmPasswordConfirmation"
            v-bind="confirmPasswordConfirmationAttrs"
            :invalid="!!confirmForm.errors.value.password_confirmation"
            placeholder="Confirm new password"
            :feedback="false"
            toggle-mask
            class="w-full"
            input-class="w-full"
          />
          <small v-if="confirmForm.errors.value.password_confirmation" class="text-red-500">
            {{ confirmForm.errors.value.password_confirmation }}
          </small>
        </div>

        <Button
          type="submit"
          label="Reset Password"
          :loading="loading"
          icon="pi pi-check"
          class="w-full mt-4"
        />
      </form>
    </template>

    <!-- Request Mode (email form) -->
    <template v-else-if="!emailSent">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">Reset Password</h2>
      <p class="text-gray-600 mb-6">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <form class="space-y-4" @submit="onRequestSubmit">
        <div class="flex flex-col gap-2">
          <label for="email" class="font-medium text-gray-700">Email</label>
          <InputText
            id="email"
            v-model="requestEmail"
            v-bind="requestEmailAttrs"
            type="email"
            :invalid="!!requestForm.errors.value.email"
            placeholder="you@example.com"
            class="w-full"
          />
          <small v-if="requestForm.errors.value.email" class="text-red-500">
            {{ requestForm.errors.value.email }}
          </small>
        </div>

        <Button
          type="submit"
          label="Send Reset Link"
          :loading="loading"
          icon="pi pi-envelope"
          class="w-full mt-4"
        />
      </form>
    </template>

    <!-- Success message -->
    <template v-else>
      <div class="text-center">
        <i class="pi pi-check-circle text-5xl text-green-500 mb-4"></i>
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">Check Your Email</h2>
        <p class="text-gray-600">
          We've sent a password reset link to your email address. Please check your inbox.
        </p>
      </div>
    </template>

    <div class="mt-6 text-center">
      <router-link to="/login" class="text-sm text-blue-600 hover:underline">
        Back to Sign In
      </router-link>
    </div>
  </AuthLayout>
</template>






