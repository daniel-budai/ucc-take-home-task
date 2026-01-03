import { useToast } from 'primevue/usetoast'
import type { ToastServiceMethods } from 'primevue/toastservice'
import type { AppError } from '@/utils/errorHandler'

class NotificationService {
  private toastInstance: ToastServiceMethods | null = null

  setToastInstance(toast: ToastServiceMethods): void {
    this.toastInstance = toast
  }

  private getToast(): ToastServiceMethods {
    // First try component context
    try {
      return useToast()
    } catch {
      // Fall back to global instance (for stores/services)
      if (!this.toastInstance) {
        // If no instance available, create a no-op function
        return {
          add: () => {
            console.warn('Toast not available - ensure Toast component is mounted')
          },
          remove: () => {},
          removeAll: () => {},
          removeGroup: () => {},
          removeAllGroups: () => {},
        } as ToastServiceMethods
      }
      return this.toastInstance
    }
  }

  success(message: string, title = 'Success'): void {
    this.getToast().add({
      severity: 'success',
      summary: title,
      detail: message,
      life: 3000,
    })
  }

  error(message: string, title = 'Error'): void {
    this.getToast().add({
      severity: 'error',
      summary: title,
      detail: message,
      life: 5000,
    })
  }

  warning(message: string, title = 'Warning'): void {
    this.getToast().add({
      severity: 'warn',
      summary: title,
      detail: message,
      life: 4000,
    })
  }

  info(message: string, title = 'Info'): void {
    this.getToast().add({
      severity: 'info',
      summary: title,
      detail: message,
      life: 3000,
    })
  }

  // Error with recovery options
  showErrorWithRecovery(appError: AppError): void {
    const toast = this.getToast()
    
    // Add main error toast
    toast.add({
      severity: 'error',
      summary: this.getErrorTitle(appError.type),
      detail: appError.userMessage,
      life: appError.canRetry ? 8000 : 5000,
    })

    // Add recovery action toast if available
    if (appError.context?.retry && appError.canRetry) {
      const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
        toast.add({
          severity: 'info',
          summary: 'Retry Available',
          detail: 'The operation failed but you can try again.',
          life: 6000,
          closable: true,
        })
      }, 1000)
      // Store timeout ID if needed for cleanup (optional)
      void timeoutId
    }
  }

  private getErrorTitle(type: AppError['type']): string {
    switch (type) {
      case 'network': return 'Connection Error'
      case 'auth': return 'Authentication Error'
      case 'validation': return 'Validation Error'
      case 'permission': return 'Permission Denied'
      case 'not_found': return 'Not Found'
      case 'server': return 'Server Error'
      default: return 'Error'
    }
  }
}

export const notificationService = new NotificationService()

export function useNotification() {
  return {
    success: (message: string, title?: string) => 
      notificationService.success(message, title),
    error: (message: string, title?: string) => 
      notificationService.error(message, title),
    warning: (message: string, title?: string) => 
      notificationService.warning(message, title),
    info: (message: string, title?: string) => 
      notificationService.info(message, title),
    showErrorWithRecovery: (appError: AppError) => 
      notificationService.showErrorWithRecovery(appError),
  }
}