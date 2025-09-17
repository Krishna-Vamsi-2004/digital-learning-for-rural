"use client"

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
  Loader2,
  User,
  MoreHorizontal,
  Power,
  MoreVertical
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

interface User {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive"
}

export default function AdminDashboard() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // User management dialog states
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showAddUserDialog, setShowAddUserDialog] = useState(false)
  const [showEditUserDialog, setShowEditUserDialog] = useState(false)
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false)
  
  // User management
  const [users, setUsers] = useState<User[]>([])
  const [isUsersLoading, setIsUsersLoading] = useState(false)
  
  const fetchUsers = async () => {
    setIsUsersLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      setUsers(data.users.map((user: any) => ({
        id: user.id,
        name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email,
        role: user.role || 'student',
        status: user.active ? 'active' : 'inactive'
      })))
    } catch (error) {
      console.error('Error fetching users:', error)
      // Fallback to offline data if API fails
      setUsers([
        { id: "1", name: "Mrs. Kaur", email: "kaur@nabha.edu", role: "teacher", status: "active" },
        { id: "2", name: "Mr. Singh", email: "singh@nabha.edu", role: "teacher", status: "active" },
        { id: "3", name: "Dr. Rajesh Kumar", email: "rajesh@nabha.edu", role: "admin", status: "active" },
        { id: "4", name: "Mrs. Sharma", email: "sharma@nabha.edu", role: "teacher", status: "inactive" },
        { id: "5", name: "Arjun Kumar", email: "arjun@student.nabha.edu", role: "student", status: "active" },
      ])
    } finally {
      setIsUsersLoading(false)
    }
  }
  
  // User management functions
  const handleAddUser = async (userData: Omit<User, "id">) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          full_name: userData.name,
          role: userData.role,
          active: userData.status === 'active'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add user');
      }
      
      const data = await response.json();
      const newUser = {
        id: data.user.id,
        ...userData
      };
      
      setUsers([...users, newUser]);
      toast({
        title: "Success",
        description: "User added successfully",
      });
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async (id: string, userData: Partial<User>) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          full_name: userData.name,
          role: userData.role,
          active: userData.status === 'active'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      setUsers(users.map(user => 
        user.id === id ? { ...user, ...userData } : user
      ));
      
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      setUsers(users.filter(user => user.id !== id));
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Settings states
  const [defaultLanguage, setDefaultLanguage] = useState("en")
  const [maxFileSize, setMaxFileSize] = useState(50)
  const [syncInterval, setSyncInterval] = useState(30)

  // Mock admin data
  const adminName = "Dr. Rajesh Kumar"
  const schoolDistrict = "Nabha Education District"

  useEffect(() => {
    i18n.init()

    const fetchContent = async () => {
      try {
        const response = await fetch('/api/admin/content')
        if (!response.ok) {
          throw new Error('Failed to fetch content')
        }
        const data = await response.json()
        setContent(data)
      } catch (error) {
        console.error('Error fetching content:', error)
        // Fallback to offline storage if API fails
        try {
          const lessons = await offlineStorage.getLessons()
          const contentItems: ContentItem[] = lessons.map((lesson, index) => ({
            ...lesson,
            uploadDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            uploadedBy: index % 2 === 0 ? "Mrs. Kaur" : "Mr. Singh",
            downloadCount: Math.floor(Math.random() * 100),
            status: index % 10 === 0 ? "draft" : "active",
          }))
          setContent(contentItems)
        } catch (offlineError) {
          console.error("Failed to load offline content:", offlineError)
          setContent([])
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
    fetchUsers()
  }, [])

  const filteredContent = content.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesType = selectedType === "all" || item.type === selectedType
    return matchesSearch && matchesCategory && matchesType
  })

  const categories = ["all", ...Array.from(new Set(content.map((item) => item.category)))]
  const types = ["all", "video", "interactive", "quiz", "epub"]

  // Handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > maxFileSize * 1_000_000) {
      alert(`File too large! Max allowed size is ${maxFileSize}MB.`)
      return
    }

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

    setTimeout(() => {
      setUploadProgress(0)
      setIsUploadDialogOpen(false)
      const newLesson: ContentItem = {
        id: `lesson-${Date.now()}`,
        title: file.name,
        type: "video",
        language: defaultLanguage,
        filePath: `/uploads/${file.name}`,
        size: file.size,
        duration: 30,
        description: "New uploaded lesson",
        category: "Uncategorized",
        difficulty: "beginner",
        cached: false,
        uploadDate: new Date(),
        uploadedBy: adminName,
        downloadCount: 0,
        status: "active",
      }
      setContent((prev) => [...prev, newLesson])
    }, 2500)
  }

  const handleDeleteContent = (id: string) => {
    const itemToDelete = content.find(item => item.id === id);
    if (itemToDelete) {
      setSelectedContent(itemToDelete);
      setIsDeleteDialogOpen(true);
    }
  }
  
  const confirmDelete = async () => {
    if (!selectedContent) return
    
    try {
      // Make API call to delete the content
      const response = await fetch(`/api/admin/content/${selectedContent.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete content')
      }
      
      // Update local state after successful deletion
      setContent(prevContent => prevContent.filter(item => item.id !== selectedContent.id))
      setIsDeleteDialogOpen(false)
      setSelectedContent(null)
    } catch (error) {
      console.error("Error deleting content:", error)
      alert("Failed to delete content. Please try again.")
    }
  }

  const handleToggleStatus = (id: string) => {
    setContent(
      content.map((item) =>
        item.id === id ? { ...item, status: item.status === "active" ? "draft" : "active" } : item,
      ),
    )
  }
  
  const handleViewContent = (id: string) => {
    const itemToView = content.find(item => item.id === id);
    if (itemToView) {
      setSelectedContent(itemToView);
      setIsViewDialogOpen(true);
    }
  }
  
  const handleEditContent = (id: string) => {
    const itemToEdit = content.find(item => item.id === id);
    if (itemToEdit) {
      setSelectedContent(itemToEdit);
      setIsEditDialogOpen(true);
    }
  }
  
  const handleSaveEdit = async (updatedContent: ContentItem) => {
    try {
      // Make API call to update the content
      const response = await fetch(`/api/admin/content/${updatedContent.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedContent),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update content')
      }
      
      // Update local state after successful update
      setContent(content.map(item => 
        item.id === updatedContent.id ? updatedContent : item
      ));
      setIsEditDialogOpen(false);
      setSelectedContent(null);
    } catch (error) {
      console.error("Error updating content:", error)
      alert("Failed to update content. Please try again.")
    }
  }

  const handleClearCache = async () => {
    await offlineStorage.clear()
    alert("Cache cleared successfully!")
  }

  const handleSaveSettings = () => {
    console.log("Saved settings:", { defaultLanguage, maxFileSize, syncInterval })
    alert("Settings saved successfully!")
  }

  // Stats
  const totalContent = content.length
  const activeContent = content.filter((item) => item.status === "active").length
  const totalDownloads = content.reduce((sum, item) => sum + item.downloadCount, 0)
  const totalSize = content.reduce((sum, item) => sum + item.size, 0)
  
  // Analytics state
  const [activeTab, setActiveTab] = useState("content")
  
  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsAnalyticsLoading(true)
        const response = await fetch('/api/admin/analytics')
        if (!response.ok) {
          throw new Error('Failed to fetch analytics')
        }
        const data = await response.json()
        setAnalyticsData(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
        // Fallback to calculated values from content
        const totalContent = content.length
        const activeContent = content.filter(item => item.status === "active").length
        const draftContent = content.filter(item => item.status === "draft").length
        
        // Top 5 most downloaded content
        const topDownloads = [...content]
          .sort((a, b) => b.downloadCount - a.downloadCount)
          .slice(0, 5)
          
        setAnalyticsData({
          userStats: { total: 0, teachers: 0, students: 0, admins: 0 },
          contentStats: { 
            total: totalContent, 
            active: activeContent, 
            draft: draftContent 
          },
          topDownloads,
          recentActivity: []
        })
      } finally {
        setIsAnalyticsLoading(false)
      }
    }
    
    if (activeTab === "analytics") {
      fetchAnalytics()
    }
  }, [activeTab, content])
  const [analyticsData, setAnalyticsData] = useState({
    userStats: { total: 0, teachers: 0, students: 0, admins: 0 },
    contentStats: { total: 0, active: 0, draft: 0 },
    topDownloads: [],
    recentActivity: []
  })
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true)

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
                <User className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="content">
          <TabsList className="mb-4">
            <TabsTrigger value="content">{i18n.t("content")}</TabsTrigger>
            <TabsTrigger value="users">{i18n.t("users")}</TabsTrigger>
            <TabsTrigger value="settings">{i18n.t("settings")}</TabsTrigger>
          </TabsList>
          
          {/* Content tab */}
          <TabsContent value="content">
            {/* Content management UI */}
          </TabsContent>
          
          {/* Users tab */}
          <TabsContent value="users">
            {/* Users management UI */}
          </TabsContent>
          
          {/* Settings tab */}
          <TabsContent value="settings">
            {/* Settings UI */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

function ContentCard({
  item,
  onDelete,
  onToggleStatus,
  onView,
  onEdit,
}: {
  item: ContentItem
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
  onView: (id: string) => void
  onEdit: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{item.title}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <Badge>{item.category}</Badge>
          <Badge variant={item.status === "active" ? "default" : "outline"}>{item.status}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => onView(item.id)}>
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(item.id)}>
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="outline" onClick={() => onToggleStatus(item.id)}>
            {item.status === "active" ? "Deactivate" : "Activate"}
          </Button>
          <Button size="sm" variant="destructive" variant="outline" onClick={() => onDelete(item.id)}>
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
