"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Save, Upload, FileText, Video, HelpCircle, BookOpen, Plus, X, Eye, Globe, Clock } from "lucide-react"
import type { Lesson } from "@/lib/offline-storage"

interface ContentEditorProps {
  lesson?: Lesson
  onSave: (lesson: Lesson) => void
  onCancel: () => void
}

export function ContentEditor({ lesson, onSave, onCancel }: ContentEditorProps) {
  const [formData, setFormData] = useState({
    title: lesson?.title || "",
    titleHi: lesson?.titleHi || "",
    titlePa: lesson?.titlePa || "",
    description: lesson?.description || "",
    descriptionHi: lesson?.descriptionHi || "",
    descriptionPa: lesson?.descriptionPa || "",
    category: lesson?.category || "Digital Literacy",
    type: lesson?.type || "video",
    language: lesson?.language || "en",
    difficulty: lesson?.difficulty || "beginner",
    duration: lesson?.duration || 0,
    tags: [] as string[],
  })

  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleSave = () => {
    const newLesson: Lesson = {
      id: lesson?.id || `lesson-${Date.now()}`,
      title: formData.title,
      titleHi: formData.titleHi,
      titlePa: formData.titlePa,
      description: formData.description,
      descriptionHi: formData.descriptionHi,
      descriptionPa: formData.descriptionPa,
      type: formData.type as "video" | "quiz" | "epub" | "interactive",
      language: formData.language as "en" | "hi" | "pa",
      category: formData.category,
      difficulty: formData.difficulty as "beginner" | "intermediate" | "advanced",
      duration: formData.duration,
      filePath: lesson?.filePath || `/lessons/${formData.title.toLowerCase().replace(/\s+/g, "-")}.mp4`,
      size: lesson?.size || 25000000,
      cached: lesson?.cached || false,
    }

    onSave(newLesson)
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
    }
  }

  const removeTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">{lesson ? "Edit Content" : "Create New Content"}</h2>
          <p className="text-muted-foreground">
            {lesson ? "Update existing learning content" : "Add new learning content to the platform"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? "Edit" : "Preview"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.title || isUploading}>
            <Save className="h-4 w-4 mr-2" />
            Save Content
          </Button>
        </div>
      </div>

      {previewMode ? (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                {formData.type === "video" && <Video className="h-6 w-6 text-primary" />}
                {formData.type === "interactive" && <BookOpen className="h-6 w-6 text-secondary" />}
                {formData.type === "quiz" && <HelpCircle className="h-6 w-6 text-accent" />}
                {formData.type === "epub" && <FileText className="h-6 w-6 text-primary" />}
              </div>
              <div>
                <h3 className="text-xl font-bold">{formData.title}</h3>
                <p className="text-muted-foreground">{formData.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">{formData.category}</Badge>
              <Badge variant="outline">{formData.difficulty}</Badge>
              <Badge variant="outline">{formData.language.toUpperCase()}</Badge>
              {formData.duration > 0 && (
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {formData.duration}min
                </Badge>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium">English Title</p>
                <p className="text-muted-foreground">{formData.title || "Not set"}</p>
              </div>
              <div>
                <p className="font-medium">Hindi Title</p>
                <p className="text-muted-foreground">{formData.titleHi || "Not set"}</p>
              </div>
              <div>
                <p className="font-medium">Punjabi Title</p>
                <p className="text-muted-foreground">{formData.titlePa || "Not set"}</p>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="multilingual">Languages</TabsTrigger>
            <TabsTrigger value="content">Content File</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Set the primary details for your content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Enter content title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange("category", e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option>Digital Literacy</option>
                      <option>Mathematics</option>
                      <option>Language</option>
                      <option>Science</option>
                      <option>Social Studies</option>
                      <option>Arts</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe what students will learn"
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Content Type</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => handleInputChange("type", e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="video">Video Lesson</option>
                      <option value="interactive">Interactive Content</option>
                      <option value="quiz">Quiz/Assessment</option>
                      <option value="epub">E-Book</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <select
                      id="difficulty"
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange("difficulty", e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => handleInputChange("duration", Number.parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multilingual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Multilingual Content
                </CardTitle>
                <CardDescription>Provide translations for better accessibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="titleHi">Hindi Title (हिंदी शीर्षक)</Label>
                    <Input
                      id="titleHi"
                      value={formData.titleHi}
                      onChange={(e) => handleInputChange("titleHi", e.target.value)}
                      placeholder="हिंदी में शीर्षक दर्ज करें"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="titlePa">Punjabi Title (ਪੰਜਾਬੀ ਸਿਰਲੇਖ)</Label>
                    <Input
                      id="titlePa"
                      value={formData.titlePa}
                      onChange={(e) => handleInputChange("titlePa", e.target.value)}
                      placeholder="ਪੰਜਾਬੀ ਵਿੱਚ ਸਿਰਲੇਖ ਦਰਜ ਕਰੋ"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="descriptionHi">Hindi Description</Label>
                    <Textarea
                      id="descriptionHi"
                      value={formData.descriptionHi}
                      onChange={(e) => handleInputChange("descriptionHi", e.target.value)}
                      placeholder="हिंदी में विवरण दर्ज करें"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descriptionPa">Punjabi Description</Label>
                    <Textarea
                      id="descriptionPa"
                      value={formData.descriptionPa}
                      onChange={(e) => handleInputChange("descriptionPa", e.target.value)}
                      placeholder="ਪੰਜਾਬੀ ਵਿੱਚ ਵੇਰਵਾ ਦਰਜ ਕਰੋ"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryLanguage">Primary Language</Label>
                  <select
                    id="primaryLanguage"
                    value={formData.language}
                    onChange={(e) => handleInputChange("language", e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Content File
                </CardTitle>
                <CardDescription>Upload your learning content file</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Content File</Label>
                  <Input id="file" type="file" accept=".mp4,.html,.epub,.json,.pdf,.zip" onChange={handleFileUpload} />
                  <p className="text-sm text-muted-foreground">
                    Supported formats: MP4 (video), HTML (interactive), EPUB (books), JSON (quizzes), PDF, ZIP
                  </p>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading content...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {lesson && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Current File</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{lesson.filePath.split("/").pop()}</p>
                        <p className="text-xs text-muted-foreground">
                          {(lesson.size / 1000000).toFixed(1)}MB • Uploaded
                        </p>
                      </div>
                      <Badge variant={lesson.cached ? "default" : "outline"}>
                        {lesson.cached ? "Cached" : "Online Only"}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Configure additional options for your content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addTag((e.target as HTMLInputElement).value)
                          ;(e.target as HTMLInputElement).value = ""
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add a tag"]') as HTMLInputElement
                        if (input?.value) {
                          addTag(input.value)
                          input.value = ""
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground">
                      <option>All Students</option>
                      <option>Primary (Ages 6-11)</option>
                      <option>Secondary (Ages 12-16)</option>
                      <option>Adult Learners</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Prerequisites</Label>
                    <Input placeholder="Required prior knowledge" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Learning Objectives</Label>
                  <Textarea placeholder="What will students learn from this content?" rows={3} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
