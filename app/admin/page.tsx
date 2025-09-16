"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileText,
  Video,
  HelpCircle,
  BookOpen,
  Edit,
  Trash2,
  Download,
  Eye,
  Plus,
  Search,
  Filter,
  Settings,
  Users,
  BarChart3,
  Home,
} from "lucide-react"
import { offlineStorage, type Lesson } from "@/lib/offline-storage"
import { LanguageSelector } from "@/components/language-selector"
import { SyncStatusIndicator } from "@/components/sync-status"
import { i18n } from "@/lib/i18n"

interface ContentItem extends Lesson {
  uploadDate: Date
  uploadedBy: string
  downloadCount: number
  status: "active" | "draft" | "archived"
}

export default function AdminDashboard() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Mock admin data
  const adminName = "Dr. Rajesh Kumar"
  const schoolDistrict = "Nabha Education District"

  useEffect(() => {
    i18n.init()

    const loadContent = async () => {
      try {
        // Load existing lessons and convert to ContentItem format
        const lessons = await offlineStorage.getLessons()
        const contentItems: ContentItem[] = lessons.map((lesson, index) => ({
          ...lesson,
          uploadDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          uploadedBy: index % 2 === 0 ? "Mrs. Kaur" : "Mr. Singh",
          downloadCount: Math.floor(Math.random() * 100),
          status: index % 10 === 0 ? "draft" : ("active" as "active" | "draft" | "archived"),
        }))

        // Add some additional mock content
        const additionalContent: ContentItem[] = [
          {
            id: "lesson-5",
            title: "Digital Citizenship",
            titleHi: "डिजिटल नागरिकता",
            titlePa: "ਡਿਜੀਟਲ ਨਾਗਰਿਕਤਾ",
            type: "interactive",
            language: "en",
            filePath: "/lessons/digital-citizenship.html",
            size: 8000000,
            duration: 30,
            description: "Learn about responsible internet usage and digital ethics",
            descriptionHi: "जिम्मेदार इंटरनेट उपयोग और डिजिटल नैतिकता के बारे में जानें",
            descriptionPa: "ਜ਼ਿੰਮੇਵਾਰ ਇੰਟਰਨੈੱਟ ਵਰਤੋਂ ਅਤੇ ਡਿਜੀਟਲ ਨੈਤਿਕਤਾ ਬਾਰੇ ਸਿੱਖੋ",
            category: "Digital Literacy",
            difficulty: "intermediate",
            cached: true,
            uploadDate: new Date("2024-01-10"),
            uploadedBy: "Dr. Rajesh Kumar",
            downloadCount: 45,
            status: "active",
          },
          {
            id: "lesson-6",
            title: "Punjabi Literature Basics",
            titleHi: "पंजाबी साहित्य की मूल बातें",
            titlePa: "ਪੰਜਾਬੀ ਸਾਹਿਤ ਦੀਆਂ ਮੂਲ ਗੱਲਾਂ",
            type: "epub",
            language: "pa",
            filePath: "/lessons/punjabi-literature.epub",
            size: 12000000,
            duration: 45,
            description: "Introduction to Punjabi literature and famous poets",
            descriptionHi: "पंजाबी साहित्य और प्रसिद्ध कवियों का परिचय",
            descriptionPa: "ਪੰਜਾਬੀ ਸਾਹਿਤ ਅਤੇ ਮਸ਼ਹੂਰ ਕਵੀਆਂ ਦੀ ਜਾਣ-ਪਛਾਣ",
            category: "Language",
            difficulty: "advanced",
            cached: false,
            uploadDate: new Date("2024-01-08"),
            uploadedBy: "Mrs. Kaur",
            downloadCount: 23,
            status: "draft",
          },
        ]

        const allContent = [...contentItems, ...additionalContent]
        setContent(allContent)
      } catch (error) {
        console.error("Failed to load content:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadContent()
  }, [])

  const filteredContent = content.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesType = selectedType === "all" || item.type === selectedType
    return matchesSearch && matchesCategory && matchesType
  })

  const categories = ["all", ...Array.from(new Set(content.map((item) => item.category)))]
  const types = ["all", "video", "interactive", "quiz", "epub"]

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Simulate upload progress
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    // Simulate upload completion
    setTimeout(() => {
      setUploadProgress(0)
      setIsUploadDialogOpen(false)
      // In real app, would add the new content to the list
    }, 2500)
  }

  const handleDeleteContent = (id: string) => {
    setContent(content.filter((item) => item.id !== id))
  }

  const handleToggleStatus = (id: string) => {
    setContent(
      content.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "active" ? "draft" : ("active" as "active" | "draft") }
          : item,
      ),
    )
  }

  const totalContent = content.length
  const activeContent = content.filter((item) => item.status === "active").length
  const totalDownloads = content.reduce((sum, item) => sum + item.downloadCount, 0)
  const totalSize = content.reduce((sum, item) => sum + item.size, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Settings className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">{i18n.t("adminDashboard")}</h1>
                <p className="text-sm text-muted-foreground">
                  {adminName} • {schoolDistrict}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <SyncStatusIndicator />
              <LanguageSelector />
              <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/")}>
                <Home className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Users className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {i18n.t("addContent")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{i18n.t("uploadNewContent")}</DialogTitle>
                    <DialogDescription>
                      Add new learning content to the platform. Supported formats: MP4, HTML, EPUB, JSON
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">{i18n.t("title")}</Label>
                        <Input id="title" placeholder="Lesson title" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">{i18n.t("category")}</Label>
                        <select
                          id="category"
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                        >
                          <option>Digital Literacy</option>
                          <option>Mathematics</option>
                          <option>Language</option>
                          <option>Science</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">{i18n.t("description")}</Label>
                      <Textarea id="description" placeholder="Lesson description" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Content Type</Label>
                        <select
                          id="type"
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                        >
                          <option>video</option>
                          <option>interactive</option>
                          <option>quiz</option>
                          <option>epub</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">{i18n.t("language")}</Label>
                        <select
                          id="language"
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                        >
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                          <option value="pa">Punjabi</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <select
                          id="difficulty"
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                        >
                          <option>beginner</option>
                          <option>intermediate</option>
                          <option>advanced</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="file">Content File</Label>
                      <Input id="file" type="file" accept=".mp4,.html,.epub,.json" onChange={handleFileUpload} />
                    </div>

                    {uploadProgress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} />
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button disabled={uploadProgress > 0}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Content
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">{i18n.t("contentLibrary")}</TabsTrigger>
            <TabsTrigger value="analytics">{i18n.t("analytics")}</TabsTrigger>
            <TabsTrigger value="users">{i18n.t("userManagement")}</TabsTrigger>
            <TabsTrigger value="settings">{i18n.t("settings")}</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            {/* Content Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{i18n.t("totalContent")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{totalContent}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{i18n.t("activeContent")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">{activeContent}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {i18n.t("totalDownloads")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{totalDownloads}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{i18n.t("storageUsed")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{(totalSize / 1000000).toFixed(0)}MB</div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={i18n.t("searchContent")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? i18n.t("allCategories") : category}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type === "all" ? "All Types" : type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">{item.description}</CardDescription>
                      </div>
                      <div className="ml-2">
                        {item.type === "video" && <Video className="h-5 w-5 text-primary" />}
                        {item.type === "interactive" && <BookOpen className="h-5 w-5 text-secondary" />}
                        {item.type === "quiz" && <HelpCircle className="h-5 w-5 text-accent" />}
                        {item.type === "epub" && <FileText className="h-5 w-5 text-primary" />}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="secondary">{item.category}</Badge>
                      <Badge variant={item.status === "active" ? "default" : "outline"}>{item.status}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">{i18n.t("language")}</p>
                        <p className="font-medium">{item.language.toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{i18n.t("downloads")}</p>
                        <p className="font-medium">{item.downloadCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Size</p>
                        <p className="font-medium">{(item.size / 1000000).toFixed(1)}MB</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Uploaded by</p>
                        <p className="font-medium">{item.uploadedBy}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleToggleStatus(item.id)}>
                        {item.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteContent(item.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {content
                      .sort((a, b) => b.downloadCount - a.downloadCount)
                      .slice(0, 5)
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">{item.downloadCount}</p>
                            <p className="text-xs text-muted-foreground">downloads</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories.slice(1).map((category) => {
                      const categoryCount = content.filter((item) => item.category === category).length
                      const percentage = (categoryCount / totalContent) * 100

                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{category}</span>
                            <span>{categoryCount} items</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{i18n.t("userManagement")}</CardTitle>
                <CardDescription>Manage teachers and students in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{i18n.t("userManagement")}</h3>
                  <p className="text-muted-foreground mb-4">
                    This feature will be available after implementing authentication
                  </p>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Default Language</Label>
                    <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground">
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="pa">Punjabi</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Max File Size (MB)</Label>
                    <Input type="number" defaultValue="50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Auto-sync Interval (minutes)</Label>
                    <Input type="number" defaultValue="30" />
                  </div>
                  <Button>Save Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Storage Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Storage Used</span>
                      <span>{(totalSize / 1000000).toFixed(0)}MB / 1000MB</span>
                    </div>
                    <Progress value={(totalSize / 1000000000) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Export All Content
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      Clear Cache
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
