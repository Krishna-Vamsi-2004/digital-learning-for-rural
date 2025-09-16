export const registerServiceWorker = async (): Promise<void> => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return
  }

  if (
    window.location.hostname.includes("vusercontent.net") ||
    window.location.hostname.includes("preview-") ||
    window.location.hostname === "localhost" ||
    process.env.NODE_ENV === "development"
  ) {
    console.log("[v0] Service Worker registration skipped in development/preview environment")
    return
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js")
    console.log("Service Worker registered successfully:", registration)
  } catch (error) {
    console.error("Service Worker registration failed:", error)
  }
}

export const checkOnlineStatus = (): boolean => {
  return navigator.onLine
}

export const addOnlineStatusListener = (callback: (isOnline: boolean) => void): void => {
  window.addEventListener("online", () => callback(true))
  window.addEventListener("offline", () => callback(false))
}

export const requestPersistentStorage = async (): Promise<boolean> => {
  if ("storage" in navigator && "persist" in navigator.storage) {
    const persistent = await navigator.storage.persist()
    console.log(`Persistent storage: ${persistent}`)
    return persistent
  }
  return false
}

export const getStorageEstimate = async (): Promise<StorageEstimate | null> => {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    return await navigator.storage.estimate()
  }
  return null
}
