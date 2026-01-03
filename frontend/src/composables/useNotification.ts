import { useToast } from 'primevue/usetoast'

export function useNotification() {
  const toast = useToast()

  function success(message: string, title = 'Success') {
    toast.add({
      severity: 'success',
      summary: title,
      detail: message,
      life: 3000,
    })
  }

  function error(message: string, title = 'Error') {
    toast.add({
      severity: 'error',
      summary: title,
      detail: message,
      life: 5000,
    })
  }

  function info(message: string, title = 'Info') {
    toast.add({
      severity: 'info',
      summary: title,
      detail: message,
      life: 3000,
    })
  }

  function warn(message: string, title = 'Warning') {
    toast.add({
      severity: 'warn',
      summary: title,
      detail: message,
      life: 4000,
    })
  }

  return {
    success,
    error,
    info,
    warn,
  }
}






