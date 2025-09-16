"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Users,
  TrendingUp,
  Clock,
  Award,
  Search,
  Download,
  Eye,
  BarChart3,
  PieChart,
  Home,
  Settings,
  Filter,
} from "lucide-react"
import { offlineStorage, type Lesson, type StudentProgress } from "@/lib/offline-storage"
import { LanguageSelector } from "@/components/language-selector"
import { SyncStatusIndicator } from "@/components/sync-status"
import { i18n } from "@/lib/i18n"

interface StudentWithProgress {
  student: any
  progress: StudentProgress[]
  completedLessons: number
  totalTimeSpent: number
  averageScore: number
}

export default function TeacherDashboard() {
  const [students, setStudents] = useState<StudentWithProgress[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // Mock teacher data
  const teacherName = "Mrs. Kaur"
  const schoolName = "Government Primary School, Nabha"

  useEffect(() => {
    i18n.init()

    const loadData = async () => {
      try {
        // Mock student data
        const mockStudents: any[] = [
          {
            id: "student-1",
            name: "Priya Singh",
            email: "priya@school.edu",
            role: "student",
            languagePreference: "en",
          },
          {
            id: "student-2",
            name: "Arjun Kumar",
            email: "arjun@school.edu",
            role: "student",
            languagePreference: "hi",
          },
          {
            id: "student-3",
            name: "Simran Kaur",
            email: "simran@school.edu",
            role: "student",
            languagePreference: "pa",
          },
          {
            id: "student-4",
            name: "Rohit Sharma",
            email: "rohit@school.edu",
            role: "student",
            languagePreference: "en",
          },
          {
            id: "student-5",
            name: "Anita Devi",
            email: "anita@school.edu",
            role: "student",
            languagePreference: "hi",
          },
        ]

        // Mock progress data for multiple students
        const mockProgress: StudentProgress[] = [
          // Priya Singh's progress
          {
            id: "progress-1-1",
            userId: "student-1",
            lessonId: "lesson-1",
            completionStatus: "completed",
            score: 85,
            timeSpent: 900,
            lastAccessed: new Date("2024-01-15"),
            attempts: 1,
          },
          {
            id: "progress-1-2",
            userId: "student-1",
            lessonId: "lesson-2",
            completionStatus: "completed",
            score: 92,
            timeSpent: 1200,
            lastAccessed: new Date("2024-01-16"),
            attempts: 1,
          },
          {
            id: "progress-1-3",
            userId: "student-1",
            lessonId: "lesson-3",
            completionStatus: "in_progress",
            timeSpent: 600,
            lastAccessed: new Date("2024-01-17"),
            attempts: 1,
          },
          // Arjun Kumar's progress
          {
            id: "progress-2-1",
            userId: "student-2",
            lessonId: "lesson-1",
            completionStatus: "completed",
            score: 78,
            timeSpent: 1100,
            lastAccessed: new Date("2024-01-14"),
            attempts: 2,
          },
          {
            id: "progress-2-2",
            userId: "student-2",
            lessonId: "lesson-2",
            completionStatus: "in_progress",
            timeSpent: 800,
            lastAccessed: new Date("2024-01-16"),
            attempts: 1,
          },
          // Simran Kaur's progress
          {
            id: "progress-3-1",
            userId: "student-3",
            lessonId: "lesson-1",
            completionStatus: "completed",
            score: 95,
            timeSpent: 800,
            lastAccessed: new Date("2024-01-15"),
            attempts: 1,
          },
          {
            id: "progress-3-2",
            userId: "student-3",
            lessonId: "lesson-2",
            completionStatus: "completed",
            score: 88,
            timeSpent: 1000,
            lastAccessed: new Date("2024-01-17"),
            attempts: 1,
          },
          {
            id: "progress-3-3",
            userId: "student-3",
            lessonId: "lesson-3",
            completionStatus: "completed",
            score: 91,
            timeSpent: 1400,
            lastAccessed: new Date("2024-01-18"),
            attempts: 1,
          },
          // Rohit Sharma's progress
          {
            id: "progress-4-1",
            userId: "student-4",
            lessonId: "lesson-1",
            completionStatus: "in_progress",
            timeSpent: 400,
            lastAccessed: new Date("2024-01-16"),
            attempts: 1,
          },
          // Anita Devi's progress
          {
            id: "progress-5-1",
            userId: "student-5",
            lessonId: "lesson-1",
            completionStatus: "completed",
            score: 82,
            timeSpent: 950,
            lastAccessed: new Date("2024-01-15"),
            attempts: 1,
          },
          {
            id: "progress-5-2",
            userId: "student-5",
            lessonId: "lesson-4",
            completionStatus: "completed",
            score: 87,
            timeSpent: 1100,
            lastAccessed: new Date("2024-01-17"),
            attempts: 1,
          },
        ]

        const storedLessons = await offlineStorage.getLessons()
        const lessonsArray = Array.isArray(storedLessons) ? storedLessons : []

        if (lessonsArray.length === 0) {
          const mockLessons: Lesson[] = [
            {
              id: "lesson-1",
              title: "Introduction to Mathematics",
              titleHi: "गणित का परिचय",
              titlePa: "ਗਣਿਤ ਦੀ ਜਾਣ-ਪਛਾਣ",
              type: "video",
              language: "en",
              filePath: "/lessons/math-intro.mp4",
              size: 50000000,
              duration: 1800,
              description: "Basic mathematical concepts for beginners",
              descriptionHi: "शुरुआती लोगों के लिए बुनियादी गणितीय अवधारणाएं",
              descriptionPa: "ਸ਼ੁਰੂਆਤੀ ਲੋਕਾਂ ਲਈ ਬੁਨਿਆਦੀ ਗਣਿਤ ਦੇ ਸਿਧਾਂਤ",
              category: "Mathematics",
              difficulty: "beginner",
              cached: true,
            },
            {
              id: "lesson-2",
              title: "Basic Science Concepts",
              titleHi: "बुनियादी विज्ञान अवधारणाएं",
              titlePa: "ਬੁਨਿਆਦੀ ਵਿਗਿਆਨ ਸਿਧਾਂਤ",
              type: "interactive",
              language: "en",
              filePath: "/lessons/science-basics.html",
              size: 25000000,
              duration: 1200,
              description: "Introduction to scientific thinking and methods",
              descriptionHi: "वैज्ञानिक सोच और तरीकों का परिचय",
              descriptionPa: "ਵਿਗਿਆਨਕ ਸੋਚ ਅਤੇ ਤਰੀਕਿਆਂ ਦੀ ਜਾਣ-ਪਛਾਣ",
              category: "Science",
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
              size: 5000000,
              duration: 900,
              description: "Fundamental English grammar rules and exercises",
              descriptionHi: "मौलिक अंग्रेजी व्याकरण नियम और अभ्यास",
              descriptionPa: "ਬੁਨਿਆਦੀ ਅੰਗਰੇਜ਼ੀ ਵਿਆਕਰਣ ਨਿਯਮ ਅਤੇ ਅਭਿਆਸ",
              category: "Language",
              difficulty: "beginner",
              cached: true,
            },
            {
              id: "lesson-4",
              title: "History of Punjab",
              titleHi: "पंजाब का इतिहास",
              titlePa: "ਪੰਜਾਬ ਦਾ ਇਤਿਹਾਸ",
              type: "epub",
              language: "pa",
              filePath: "/lessons/punjab-history.epub",
              size: 15000000,
              duration: 2400,
              description: "Rich history and culture of Punjab",
              descriptionHi: "पंजाब का समृद्ध इतिहास और संस्कृति",
              descriptionPa: "ਪੰਜਾਬ ਦਾ ਅਮੀਰ ਇਤਿਹਾਸ ਅਤੇ ਸੱਭਿਆਚਾਰ",
              category: "History",
              difficulty: "intermediate",
              cached: true,
            },
          ]

          // Save mock lessons to storage
          await offlineStorage.saveLessons(mockLessons)
          lessonsArray.push(...mockLessons)
        }

        setLessons(lessonsArray)

        // Process student data with progress
        const studentsWithProgress: StudentWithProgress[] = mockStudents.map((student) => {
          const studentProgress = mockProgress.filter((p) => p.userId === student.id)
          const completedLessons = studentProgress.filter((p) => p.completionStatus === "completed").length
          const totalTimeSpent = studentProgress.reduce((total, p) => total + p.timeSpent, 0)
          const completedWithScores = studentProgress.filter((p) => p.completionStatus === "completed" && p.score)
          const averageScore =
            completedWithScores.length > 0
              ? completedWithScores.reduce((total, p) => total + (p.score || 0), 0) / completedWithScores.length
              : 0

          return {
            student,
            progress: studentProgress,
            completedLessons,
            totalTimeSpent,
            averageScore,
          }
        })

        setStudents(studentsWithProgress)
      } catch (error) {
        console.error("Failed to load teacher data:", error)
        setLessons([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredStudents = students.filter((studentData) => {
    const matchesSearch = studentData.student.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Calculate overall statistics
  const totalStudents = students.length
  const activeStudents = students.filter((s) => s.progress.length > 0).length
  const totalLessonsCompleted = students.reduce((total, s) => total + s.completedLessons, 0)
  const averageClassProgress =
    totalStudents > 0 ? students.reduce((total, s) => total + s.completedLessons, 0) / totalStudents : 0

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Users className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading teacher dashboard...</p>
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
              <Users className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">{i18n.t("teacherDashboard")}</h1>
                <p className="text-sm text-muted-foreground">
                  {teacherName} • {schoolName}
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
                <Award className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{totalStudents}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">{activeStudents}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Lessons Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{totalLessonsCompleted}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{averageClassProgress.toFixed(1)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Recent Student Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {students
                      .filter((s) => s.progress.length > 0)
                      .slice(0, 5)
                      .map((studentData) => {
                        const latestProgress = studentData.progress.sort(
                          (a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime(),
                        )[0]
                        const lesson = lessons.find((l) => l.id === latestProgress.lessonId)

                        return (
                          <div key={studentData.student.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{studentData.student.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {latestProgress.completionStatus === "completed" ? "Completed" : "Working on"}{" "}
                                {lesson?.title}
                              </p>
                            </div>
                            <Badge variant={latestProgress.completionStatus === "completed" ? "default" : "secondary"}>
                              {latestProgress.completionStatus === "completed" ? "Done" : "In Progress"}
                            </Badge>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {students
                      .sort((a, b) => b.averageScore - a.averageScore)
                      .slice(0, 5)
                      .map((studentData, index) => (
                        <div key={studentData.student.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{studentData.student.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {studentData.completedLessons} lessons completed
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">{studentData.averageScore.toFixed(0)}%</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Class Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  Class Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lessons && lessons.length > 0 ? (
                    lessons.map((lesson) => {
                      const studentsStarted = students.filter((s) =>
                        s.progress.some((p) => p.lessonId === lesson.id),
                      ).length
                      const studentsCompleted = students.filter((s) =>
                        s.progress.some((p) => p.lessonId === lesson.id && p.completionStatus === "completed"),
                      ).length
                      const completionRate = totalStudents > 0 ? (studentsCompleted / totalStudents) * 100 : 0

                      return (
                        <div key={lesson.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{lesson.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {studentsCompleted}/{totalStudents} students completed
                              </p>
                            </div>
                            <Badge variant="outline">{completionRate.toFixed(0)}%</Badge>
                          </div>
                          <Progress value={completionRate} className="h-2" />
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No lessons available yet.</p>
                      <p className="text-sm">Lessons will appear here once content is added.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="all">All Students</option>
                  <option value="active">Active Students</option>
                  <option value="inactive">Inactive Students</option>
                </select>
              </div>
            </div>

            {/* Students List */}
            <div className="grid gap-4">
              {filteredStudents.map((studentData) => (
                <Card key={studentData.student.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{studentData.student.name}</CardTitle>
                        <CardDescription>{studentData.student.email}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{studentData.student.languagePreference.toUpperCase()}</Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{studentData.completedLessons}</div>
                        <p className="text-sm text-muted-foreground">Lessons Completed</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-secondary">
                          {Math.floor(studentData.totalTimeSpent / 60)}m
                        </div>
                        <p className="text-sm text-muted-foreground">Time Spent</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent">{studentData.averageScore.toFixed(0)}%</div>
                        <p className="text-sm text-muted-foreground">Average Score</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{studentData.progress.length}</div>
                        <p className="text-sm text-muted-foreground">Total Attempts</p>
                      </div>
                    </div>

                    {/* Student Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Overall Progress</span>
                        <span className="font-medium">
                          {lessons.length > 0 ? ((studentData.completedLessons / lessons.length) * 100).toFixed(0) : 0}%
                        </span>
                      </div>
                      <Progress
                        value={lessons.length > 0 ? (studentData.completedLessons / lessons.length) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Engagement Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Student Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Highly Active</span>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-2 bg-primary rounded"></div>
                        <span className="font-medium">
                          {students.filter((s) => s.completedLessons >= 3).length} students
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Moderately Active</span>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-2 bg-secondary rounded"></div>
                        <span className="font-medium">
                          {students.filter((s) => s.completedLessons >= 1 && s.completedLessons < 3).length} students
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Low Activity</span>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-2 bg-muted rounded"></div>
                        <span className="font-medium">
                          {students.filter((s) => s.completedLessons === 0).length} students
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-secondary" />
                    Performance Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Excellent (90%+)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-2 bg-green-500 rounded"></div>
                        <span className="font-medium">
                          {students.filter((s) => s.averageScore >= 90).length} students
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Good (80-89%)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-2 bg-primary rounded"></div>
                        <span className="font-medium">
                          {students.filter((s) => s.averageScore >= 80 && s.averageScore < 90).length} students
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Average (70-79%)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-2 bg-secondary rounded"></div>
                        <span className="font-medium">
                          {students.filter((s) => s.averageScore >= 70 && s.averageScore < 80).length} students
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Needs Help (&lt;70%)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-2 bg-destructive rounded"></div>
                        <span className="font-medium">
                          {students.filter((s) => s.averageScore > 0 && s.averageScore < 70).length} students
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Language Preference Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent" />
                  Language Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {students.filter((s) => s.student.languagePreference === "en").length}
                    </div>
                    <p className="text-sm text-muted-foreground">English</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">
                      {students.filter((s) => s.student.languagePreference === "hi").length}
                    </div>
                    <p className="text-sm text-muted-foreground">Hindi</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      {students.filter((s) => s.student.languagePreference === "pa").length}
                    </div>
                    <p className="text-sm text-muted-foreground">Punjabi</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Generate Reports</h3>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Progress Report</CardTitle>
                  <CardDescription>Detailed progress report for all students</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Report Type</label>
                    <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground">
                      <option>Individual Progress</option>
                      <option>Class Summary</option>
                      <option>Lesson Analytics</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground">
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>All time</option>
                    </select>
                  </div>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                  <CardDescription>Comprehensive performance analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Analysis Type</label>
                    <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground">
                      <option>Score Distribution</option>
                      <option>Time Analysis</option>
                      <option>Engagement Metrics</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Format</label>
                    <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground">
                      <option>PDF Report</option>
                      <option>Excel Spreadsheet</option>
                      <option>CSV Data</option>
                    </select>
                  </div>
                  <Button className="w-full" variant="secondary">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats for Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Report Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{totalStudents}</div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-secondary">{lessons.length}</div>
                    <p className="text-sm text-muted-foreground">Available Lessons</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-accent">{totalLessonsCompleted}</div>
                    <p className="text-sm text-muted-foreground">Completed Lessons</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {students.reduce((total, s) => total + Math.floor(s.totalTimeSpent / 60), 0)}m
                    </div>
                    <p className="text-sm text-muted-foreground">Total Learning Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
