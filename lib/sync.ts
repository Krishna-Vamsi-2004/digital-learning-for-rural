import { offlineStorage } from "./offline-storage"

export interface SyncStatus {
  isOnline: boolean
  lastSyncTime: Date | null
  pendingChanges: number
  syncInProgress: boolean
}

class SyncService {
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    lastSyncTime: null,
    pendingChanges: 0,
    syncInProgress: false,
  }

  private readonly LAST_SYNC_KEY = "nabha-last-sync"
  private syncListeners: Array<(status: SyncStatus) => void> = []

  init(): void {
    // Load last sync time
    const lastSync = localStorage.getItem(this.LAST_SYNC_KEY)
    if (lastSync) {
      this.syncStatus.lastSyncTime = new Date(lastSync)
    }

    // Listen for online/offline events
    window.addEventListener("online", this.handleOnline.bind(this))
    window.addEventListener("offline", this.handleOffline.bind(this))

    // Update initial status
    this.syncStatus.isOnline = navigator.onLine
    this.updatePendingChanges()

    // Auto-sync when online
    if (this.syncStatus.isOnline) {
      this.syncData()
    }
  }

  private handleOnline(): void {
    this.syncStatus.isOnline = true
    this.notifyListeners()

    // Auto-sync when coming back online
    setTimeout(() => {
      this.syncData()
    }, 1000)
  }

  private handleOffline(): void {
    this.syncStatus.isOnline = false
    this.notifyListeners()
  }

  private async updatePendingChanges(): Promise<void> {
    try {
      const syncQueue = await offlineStorage.getSyncQueue()
      this.syncStatus.pendingChanges = syncQueue.length
      this.notifyListeners()
    } catch (error) {
      console.error("Failed to update pending changes:", error)
    }
  }

  async syncData(): Promise<{ success: boolean; error?: string }> {
    if (!this.syncStatus.isOnline || this.syncStatus.syncInProgress) {
      return { success: false, error: "Cannot sync: offline or sync in progress" }
    }

    this.syncStatus.syncInProgress = true
    this.notifyListeners()

    try {
      // Get pending changes from sync queue
      const syncQueue = await offlineStorage.getSyncQueue()

      if (syncQueue.length === 0) {
        this.syncStatus.syncInProgress = false
        this.notifyListeners()
        return { success: true }
      }

      // Simulate API calls to sync data
      // In a real implementation, you would send data to your backend
      for (const item of syncQueue) {
        await this.simulateApiCall(item)
      }

      // Clear sync queue after successful sync
      await offlineStorage.clearSyncQueue()

      // Update sync status
      this.syncStatus.lastSyncTime = new Date()
      this.syncStatus.pendingChanges = 0
      this.syncStatus.syncInProgress = false

      localStorage.setItem(this.LAST_SYNC_KEY, this.syncStatus.lastSyncTime.toISOString())

      this.notifyListeners()

      return { success: true }
    } catch (error) {
      console.error("Sync failed:", error)
      this.syncStatus.syncInProgress = false
      this.notifyListeners()
      return { success: false, error: "Sync failed" }
    }
  }

  private async simulateApiCall(item: any): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // In a real implementation, you would make actual API calls here
    console.log("Syncing item:", item)
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus }
  }

  addSyncListener(listener: (status: SyncStatus) => void): void {
    this.syncListeners.push(listener)
  }

  removeSyncListener(listener: (status: SyncStatus) => void): void {
    this.syncListeners = this.syncListeners.filter((l) => l !== listener)
  }

  private notifyListeners(): void {
    this.syncListeners.forEach((listener) => listener(this.syncStatus))
  }

  async forcSync(): Promise<{ success: boolean; error?: string }> {
    return this.syncData()
  }
}

export const syncService = new SyncService()
