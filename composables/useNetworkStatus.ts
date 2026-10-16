export function useNetworkStatus() {
  const isOnline = useState<boolean>('network-is-online', () => true)

  function updateStatus() {
    if (import.meta.client) {
      isOnline.value = navigator.onLine
    }
  }

  onMounted(() => {
    if (import.meta.client) {
      isOnline.value = navigator.onLine
      window.addEventListener('online', updateStatus)
      window.addEventListener('offline', updateStatus)
    }
  })

  onBeforeUnmount(() => {
    if (import.meta.client) {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  })

  return {
    isOnline,
  }
}
