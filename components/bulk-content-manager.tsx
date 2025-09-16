"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Upload,
  Download,
  Trash2,
  Archive,
  Eye,
  CheckCircle,
  AlertCircle,
  FileText,
  Package,
  Settings,
} from "lucide-react"
import type { Lesson } from "@/lib/offline-storage"

interface BulkContentManagerProps {
  content: Lesson[]
  onBulkAction: (action: string, selectedIds: string[]) => void
}

export function BulkContentManager({ content, onBulkAction }: BulkContentManagerProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [bulkUploadProgress, setBulkUploadProgress] = useState(0)
  const [isBulkUploading, setIsBulkUploading] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(content.map((item) => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId])
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== itemId))
    }
  }

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsBulkUploading(true)
    setBulkUploadProgress(0)

    // Simulate bulk upload progress
    const totalFiles = files.length
    let processedFiles = 0

    const interval = setInterval(() => {
      processedFiles += 1
      const progress = (processedFiles / totalFiles) * 100

      setBulkUploadProgress(progress)

      if (processedFiles >= totalFiles) {
        clearInterval(interval)
        setIsBulkUploading(false)
        setShowBulkUpload(false)
        setBulkUploadProgress(0)
      }
    }, 1000)
  }

  const bulkActions = [
    { id: "activate", label: "Activate", icon: CheckCircle, color: "text-green-600" },
    { id: "deactivate", label: "Deactivate", icon: AlertCircle, color: "text-amber-600" },
    { id: "archive", label: "Archive", icon: Archive, color: "text-blue-600" },
    { id: "delete", label: "Delete", icon: Trash2, color: "text-red-600" },
    { id: "export", label: "Export", icon: Download, color: "text-primary" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Bulk Content Management
              </CardTitle>
              <CardDescription>Manage multiple content items at once</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Upload
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Upload Content</DialogTitle>
                    <DialogDescription>
                      Upload multiple content files at once. Supported formats: MP4, HTML, EPUB, JSON, PDF, ZIP
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        type="file"
                        multiple
                        accept=".mp4,.html,.epub,.json,.pdf,.zip"
                        onChange={handleBulkUpload}
                        disabled={isBulkUploading}
                      />
                      <p className="text-sm text-muted-foreground">Select multiple files to upload them all at once</p>
                    </div>

                    {isBulkUploading && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Processing files...</span>
                          <span>{Math.round(bulkUploadProgress)}%</span>
                        </div>
                        <Progress value={bulkUploadProgress} />
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Selection Controls */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-4">
                <Checkbox checked={selectedItems.length === content.length} onCheckedChange={handleSelectAll} />
                <span className="text-sm font-medium">
                  {selectedItems.length > 0
                    ? `${selectedItems.length} of ${content.length} items selected`
                    : "Select all items"}
                </span>
              </div>

              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2">
                  {bulkActions.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      onClick={() => onBulkAction(action.id, selectedItems)}
                      className="flex items-center gap-1"
                    >
                      <action.icon className={`h-3 w-3 ${action.color}`} />
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Content List */}
            <div className="space-y-2">
              {content.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
                    selectedItems.includes(item.id) ? "bg-primary/5 border-primary" : "hover:bg-muted/50"
                  }`}
                >
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{item.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="text-right">
                      <p className="font-medium">{(item.size / 1000000).toFixed(1)}MB</p>
                      <p className="text-xs">{item.language.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.duration}min</p>
                      <p className="text-xs">{item.difficulty}</p>
                    </div>
                    <Badge variant={item.cached ? "default" : "outline"} className="text-xs">
                      {item.cached ? "Cached" : "Online"}
                    </Badge>
                  </div>

                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {content.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Content Available</h3>
                <p className="text-muted-foreground">Upload some content to get started with bulk management</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Summary */}
      {selectedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Bulk Actions Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{selectedItems.length}</div>
                <div className="text-sm text-muted-foreground">Items Selected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">
                  {content.filter((item) => selectedItems.includes(item.id)).reduce((sum, item) => sum + item.size, 0) /
                    1000000}
                  MB
                </div>
                <div className="text-sm text-muted-foreground">Total Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">
                  {content
                    .filter((item) => selectedItems.includes(item.id))
                    .reduce((sum, item) => sum + (item.duration || 0), 0)}
                  min
                </div>
                <div className="text-sm text-muted-foreground">Total Duration</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
