import { useConfirm } from 'primevue/useconfirm'

export function useConfirmDialog() {
  const confirm = useConfirm()

  function confirmDelete(message: string, onAccept: () => void, onReject?: () => void) {
    confirm.require({
      message,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Cancel',
      acceptLabel: 'Delete',
      rejectClass: 'p-button-secondary p-button-outlined',
      acceptClass: 'p-button-danger',
      accept: onAccept,
      reject: onReject,
    })
  }

  function confirmAction(
    message: string,
    header: string,
    onAccept: () => void,
    onReject?: () => void
  ) {
    confirm.require({
      message,
      header,
      icon: 'pi pi-question-circle',
      rejectLabel: 'Cancel',
      acceptLabel: 'Confirm',
      accept: onAccept,
      reject: onReject,
    })
  }

  return {
    confirmDelete,
    confirmAction,
  }
}






