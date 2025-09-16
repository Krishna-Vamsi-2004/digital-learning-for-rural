"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Award,
  TrendingUp,
  Home,
  User,
  Settings,
} from "lucide-react"
import { offlineStorage, type Lesson, type StudentProgress } from "@/lib/offline-storage"
import { LanguageSelector } from "@/components/language-selector"
import { SyncStatusIndicator } from "@/components/sync-status"
import { i18n } from "@/lib/i18n"

export default function StudentDashboard() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [progress, setProgress] = useState<StudentProgress[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // Mock student data - in real app this would come from authentication
  const studentId = "student-1"
  const studentName = "Priya Singh"

  useEffect(() => {
    i18n.init()

    const loadData = async () => {
      try {
        // Load sample lessons
        const sampleLessons: Lesson[] = [
          {
            id: "lesson-1",
            title: "Introduction to Computers",
            titleHi: "कंप्यूटर का परिचय",
            titlePa: "ਕੰਪਿਊਟਰ ਦੀ ਜਾਣ-ਪਛਾਣ",
            type: "video",
            language: "en",
            filePath: "/lessons/intro-computers.mp4",
            size: 25000000,
            duration: 15,
            description: "Learn the basics of computers and their components",
            descriptionHi: "कंप्यूटर और उनके घटकों की मूल बातें सीखें",
            descriptionPa: "ਕੰਪਿਊਟਰ ਅਤੇ ਉਹਨਾਂ ਦੇ ਹਿੱਸਿਆਂ ਦੀਆਂ ਮੂਲ ਗੱਲਾਂ ਸਿੱਖੋ",
            category: "Digital Literacy",
            difficulty: "beginner",
            cached: true,
          },
          {
            id: "lesson-2",
            title: "Basic Math - Addition",
            titleHi: "बुनियादी गणित - जोड़",
            titlePa: "ਬੁਨਿਆਦੀ ਗਣਿਤ - ਜੋੜ",
            type: "interactive",
            language: "en",
            filePath: "/lessons/math-addition.html",
            size: 5000000,
            duration: 20,
            description: "Practice addition with interactive exercises",
            descriptionHi: "इंटरैक्टिव अभ्यास के साथ जोड़ का अभ्यास करें",
            descriptionPa: "ਇੰਟਰਐਕਟਿਵ ਅਭਿਆਸ ਨਾਲ ਜੋੜ ਦਾ ਅਭਿਆਸ ਕਰੋ",
            category: "Mathematics",
            difficulty: "beginner",
            cached: true,
          },
          {
            id: "lesson-3",
            title: "English Grammar Basics",
            titleHi: "अंग्रेजी व्याकरण की मूल बातें",
            titlePa: "ਅੰਗਰੇਜ਼ੀ ਵਿਆਕਰਣ ਦੀਆਂ ਮੂਲ ਗੱਲਾਂ",
            type: "quiz",
            language: "en",
            filePath: "/lessons/english-grammar.json",
            size: 2000000,
            duration: 25,
            description: "Test your knowledge of English grammar",
            descriptionHi: "अंग्रेजी व्याकरण के अपने ज्ञान का परीक्षण करें",
            descriptionPa: "ਅੰਗਰੇਜ਼ੀ ਵਿਆਕਰਣ ਦੇ ਆਪਣੇ ਗਿਆਨ ਦੀ ਜਾਂਚ ਕਰੋ",
            category: "Language",
            difficulty: "intermediate",
            cached: false,
          },
          {
            id: "lesson-4",
            title: "Science - Water Cycle",
            titleHi: "विज्ञान - जल चक्र",
            titlePa: "ਵਿਗਿਆਨ - ਪਾਣੀ ਚੱਕਰ",
            type: "video",
            language: "en",
            filePath: "/lessons/water-cycle.mp4",
            size: 30000000,
            duration: 18,
            description: "Understanding the water cycle process",
            descriptionHi: "जल चक्र प्रक्रिया को समझना",
            descriptionPa: "ਪਾਣੀ ਚੱਕਰ ਪ੍ਰਕਿਰਿਆ ਨੂੰ ਸਮਝਣਾ",
            category: "Science",
            difficulty: "intermediate",
            cached: true,
          },
        ]

        // Sample progress data
        const sampleProgress: StudentProgress[] = [
          {
            id: "progress-1",
            userId: studentId,
            lessonId: "lesson-1",
            completionStatus: "completed",
            score: 85,
            timeSpent: 900,
            lastAccessed: new Date(),
            attempts: 1,
          },
          {
            id: "progress-2",
            userId: studentId,
            lessonId: "lesson-2",
            completionStatus: "in_progress",
            timeSpent: 600,
            lastAccessed: new Date(),
            attempts: 1,
          },
        ]

        await offlineStorage.saveLessons(sampleLessons)
        for (const prog of sampleProgress) {
          await offlineStorage.saveProgress(prog)
        }

        setLessons(sampleLessons)
        setProgress(sampleProgress)
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || lesson.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["all", ...Array.from(new Set(lessons.map((lesson) => lesson.category)))]

  const getProgressForLesson = (lessonId: string) => {
    return progress.find((p) => p.lessonId === lessonId)
  }

  const completedLessons = progress.filter((p) => p.completionStatus === "completed").length
  const totalLessons = lessons.length
  const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading your lessons...</p>
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
              <BookOpen className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">{i18n.t("studentDashboard")}</h1>
                <p className="text-sm text-muted-foreground">
                  {i18n.t("welcome")}, {studentName}
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

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="lessons" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lessons">{i18n.t("lessons")}</TabsTrigger>
            <TabsTrigger value="progress">{i18n.t("progress")}</TabsTrigger>
            <TabsTrigger value="achievements">{i18n.t("achievements")}</TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={i18n.t("searchLessons")}
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
              </div>
            </div>

            {/* Lessons Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.map((lesson) => {
                const lessonProgress = getProgressForLesson(lesson.id)
                const isCompleted = lessonProgress?.completionStatus === "completed"
                const isInProgress = lessonProgress?.completionStatus === "in_progress"

                return (
                  <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{lesson.title}</CardTitle>
                          <CardDescription className="line-clamp-2 mt-1">{lesson.description}</CardDescription>
                        </div>
                        <div className="ml-2">
                          {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {isInProgress && <Clock className="h-5 w-5 text-amber-500" />}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="secondary">{lesson.category}</Badge>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {lesson.duration}min
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={lesson.difficulty === "beginner" ? "default" : "outline"} className="text-xs">
                          {i18n.t(lesson.difficulty)}
                        </Badge>
                        <Badge variant={lesson.cached ? "default" : "destructive"} className="text-xs">
                          {lesson.cached ? i18n.t("downloaded") : i18n.t("onlineOnly")}
                        </Badge>
                      </div>

                      {lessonProgress && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{i18n.t("progress")}</span>
                            <span className="font-medium">
                              {lessonProgress.completionStatus === "completed" ? "100%" : i18n.t("inProgress")}
                            </span>
                          </div>
                          <Progress
                            value={lessonProgress.completionStatus === "completed" ? 100 : 50}
                            className="h-2"
                          />
                        </div>
                      )}

                      <Button
                        className="w-full"
                        variant={isCompleted ? "outline" : "default"}
                        onClick={() => (window.location.href = `/student/lesson/${lesson.id}`)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {isCompleted ? i18n.t("review") : isInProgress ? i18n.t("continue") : i18n.t("start")}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Overall Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {i18n.t("overallProgress")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{Math.round(overallProgress)}%</div>
                    <p className="text-muted-foreground">
                      {completedLessons} {i18n.t("of")} {totalLessons} {i18n.t("lessonsCompleted")}
                    </p>
                  </div>
                  <Progress value={overallProgress} className="h-3" />
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-secondary" />
                    {i18n.t("recentActivity")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {progress.slice(0, 3).map((prog) => {
                      const lesson = lessons.find((l) => l.id === prog.lessonId)
                      return (
                        <div key={prog.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{lesson?.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {Math.floor(prog.timeSpent / 60)} {i18n.t("minutesSpent")}
                            </p>
                          </div>
                          <Badge variant={prog.completionStatus === "completed" ? "default" : "secondary"}>
                            {prog.completionStatus === "completed" ? i18n.t("done") : i18n.t("inProgress")}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Progress */}
            <Card>
              <CardHeader>
                <CardTitle>{i18n.t("lessonProgressDetails")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lessons.map((lesson) => {
                    const lessonProgress = getProgressForLesson(lesson.id)
                    return (
                      <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{lesson.title}</h4>
                          <p className="text-sm text-muted-foreground">{lesson.category}</p>
                        </div>
                        <div className="text-right">
                          {lessonProgress ? (
                            <div>
                              <Badge
                                variant={lessonProgress.completionStatus === "completed" ? "default" : "secondary"}
                              >
                                {lessonProgress.completionStatus === "completed"
                                  ? i18n.t("completed")
                                  : i18n.t("inProgress")}
                              </Badge>
                              {lessonProgress.score && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {i18n.t("score")}: {lessonProgress.score}%
                                </p>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline">{i18n.t("notStarted")}</Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Achievement Cards */}
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>{i18n.t("firstLesson")}</CardTitle>
                  <CardDescription>{i18n.t("completeFirstLesson")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant={completedLessons > 0 ? "default" : "outline"}>
                    {completedLessons > 0 ? i18n.t("unlocked") : i18n.t("locked")}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-2 p-3 bg-secondary/10 rounded-full w-fit">
                    <TrendingUp className="h-8 w-8 text-secondary" />
                  </div>
                  <CardTitle>{i18n.t("quickLearner")}</CardTitle>
                  <CardDescription>{i18n.t("complete5Lessons")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant={completedLessons >= 5 ? "default" : "outline"}>
                    {completedLessons >= 5 ? i18n.t("unlocked") : `${completedLessons}/5`}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-2 p-3 bg-accent/10 rounded-full w-fit">
                    <BookOpen className="h-8 w-8 text-accent" />
                  </div>
                  <CardTitle>{i18n.t("scholar")}</CardTitle>
                  <CardDescription>{i18n.t("completeAllLessons")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant={completedLessons === totalLessons ? "default" : "outline"}>
                    {completedLessons === totalLessons ? i18n.t("unlocked") : `${completedLessons}/${totalLessons}`}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
