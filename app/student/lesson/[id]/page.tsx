"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, Pause, RotateCcw, CheckCircle, Clock, BookOpen } from "lucide-react"
import { offlineStorage, type Lesson, type StudentProgress } from "@/lib/offline-storage"

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.id as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [progress, setProgress] = useState<StudentProgress | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Mock student data
  const studentId = "student-1"

  useEffect(() => {
    const loadLesson = async () => {
      try {
        const lessons = await offlineStorage.getLessons()
        const currentLesson = lessons.find((l) => l.id === lessonId)

        if (currentLesson) {
          setLesson(currentLesson)

          // Load existing progress
          const userProgress = await offlineStorage.getProgress(studentId)
          const lessonProgress = userProgress.find((p) => p.lessonId === lessonId)
          setProgress(lessonProgress || null)
        }
      } catch (error) {
        console.error("Failed to load lesson:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLesson()
  }, [lessonId, studentId])

  const handleStartLesson = async () => {
    if (!lesson) return

    const newProgress: StudentProgress = {
      id: `progress-${lessonId}-${Date.now()}`,
      userId: studentId,
      lessonId: lessonId,
      completionStatus: "in_progress",
      timeSpent: 0,
      lastAccessed: new Date(),
      attempts: (progress?.attempts || 0) + 1,
    }

    await offlineStorage.saveProgress(newProgress)
    setProgress(newProgress)
    setIsPlaying(true)
  }

  const handleCompleteLesson = async () => {
    if (!lesson || !progress) return

    const updatedProgress: StudentProgress = {
      ...progress,
      completionStatus: "completed",
      score: 85, // Mock score
      timeSpent: progress.timeSpent + currentTime,
      lastAccessed: new Date(),
    }

    await offlineStorage.saveProgress(updatedProgress)
    setProgress(updatedProgress)
    setIsPlaying(false)
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleRestart = () => {
    setCurrentTime(0)
    setIsPlaying(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Lesson Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested lesson could not be found.</p>
          <Button onClick={() => router.push("/student")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const progressPercentage = lesson.duration ? (currentTime / (lesson.duration * 60)) * 100 : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/student")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground line-clamp-1">{lesson.title}</h1>
              <p className="text-sm text-muted-foreground">{lesson.category}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={lesson.cached ? "default" : "destructive"}>{lesson.cached ? "Offline" : "Online"}</Badge>
              {progress?.completionStatus === "completed" && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Lesson Content */}
          <Card>
            <CardHeader>
              <CardTitle>{lesson.title}</CardTitle>
              <CardDescription>{lesson.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Video/Content Player */}
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                {lesson.type === "video" && (
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        {isPlaying ? (
                          <Pause className="h-12 w-12 text-primary" />
                        ) : (
                          <Play className="h-12 w-12 text-primary" />
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Video Lesson</h3>
                      <p className="text-muted-foreground">Duration: {lesson.duration} minutes</p>
                    </div>
                  </div>
                )}

                {lesson.type === "interactive" && (
                  <div className="text-center">
                    <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-12 w-12 text-secondary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Interactive Lesson</h3>
                    <p className="text-muted-foreground">Hands-on learning experience</p>
                  </div>
                )}

                {lesson.type === "quiz" && (
                  <div className="text-center">
                    <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-12 w-12 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Quiz</h3>
                    <p className="text-muted-foreground">Test your knowledge</p>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {progress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                {!progress ? (
                  <Button onClick={handleStartLesson} size="lg" className="px-8">
                    <Play className="h-5 w-5 mr-2" />
                    Start Lesson
                  </Button>
                ) : progress.completionStatus === "completed" ? (
                  <div className="flex gap-4">
                    <Button onClick={handleRestart} variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restart
                    </Button>
                    <Button onClick={() => router.push("/student")}>Back to Dashboard</Button>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <Button onClick={handlePlayPause} variant="outline">
                      {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                      {isPlaying ? "Pause" : "Resume"}
                    </Button>
                    <Button onClick={handleCompleteLesson}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Lesson
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lesson Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lesson Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <Badge variant="secondary">{lesson.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <Badge variant="outline">{lesson.difficulty}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {lesson.duration} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="capitalize">{lesson.type}</span>
                </div>
              </CardContent>
            </Card>

            {progress && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={progress.completionStatus === "completed" ? "default" : "secondary"}>
                      {progress.completionStatus === "completed" ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Spent:</span>
                    <span>{Math.floor(progress.timeSpent / 60)} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Attempts:</span>
                    <span>{progress.attempts}</span>
                  </div>
                  {progress.score && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Score:</span>
                      <span className="font-semibold text-primary">{progress.score}%</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
