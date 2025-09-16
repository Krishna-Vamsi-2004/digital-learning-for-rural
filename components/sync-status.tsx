"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, RefreshCw, Clock, AlertCircle } from "lucide-react"
import { syncService, type SyncStatus } from "@/lib/sync"

export function SyncStatusIndicator() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSyncTime: null,
    pendingChanges: 0,
    syncInProgress: false,
  })

  useEffect(() => {
    syncService.init()
    setSyncStatus(syncService.getSyncStatus())

    const handleSyncStatusChange = (status: SyncStatus) => {
      setSyncStatus(status)
    }

    syncService.addSyncListener(handleSyncStatusChange)

    return () => {
      syncService.removeSyncListener(handleSyncStatusChange)
    }
  }, [])

  const handleForceSync = async () => {
    await syncService.forcSync()
  }

  const formatLastSync = (date: Date | null) => {
    if (!date) return "Never"

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <div className="flex items-center gap-2">
      {/* Online/Offline Status */}
      <Badge variant={syncStatus.isOnline ? "default" : "destructive"} className="flex items-center gap-1">
        {syncStatus.isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        {syncStatus.isOnline ? "Online" : "Offline"}
      </Badge>

      {/* Pending Changes */}
      {syncStatus.pendingChanges > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {syncStatus.pendingChanges} pending
        </Badge>
      )}

      {/* Sync Button */}
      {syncStatus.isOnline && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleForceSync}
          disabled={syncStatus.syncInProgress}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-3 w-3 ${syncStatus.syncInProgress ? "animate-spin" : ""}`} />
          {syncStatus.syncInProgress ? "Syncing..." : "Sync"}
        </Button>
      )}

      {/* Last Sync Time */}
      {syncStatus.lastSyncTime && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatLastSync(syncStatus.lastSyncTime)}
        </div>
      )}
    </div>
  )
}
