"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize,
  BookOpen,
  MessageCircle,
  Lightbulb,
  CheckCircle,
  X,
  RefreshCw,
} from "lucide-react"

interface LessonContent {
  id: string
  type: "video" | "interactive" | "quiz" | "text"
  title: string
  content: any
  duration?: number
  interactions?: InteractiveElement[]
}

interface InteractiveElement {
  id: string
  type: "question" | "note" | "bookmark" | "quiz"
  timestamp?: number
  content: string
  options?: string[]
  correctAnswer?: number
  userAnswer?: number
  completed: boolean
}

interface LessonNote {
  id: string
  timestamp: number
  content: string
  type: "note" | "question" | "highlight"
}

export function InteractiveLessonPlayer({ lessonId }: { lessonId: string }) {
  const [currentContent, setCurrentContent] = useState<LessonContent | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState<LessonNote[]>([])
  const [newNote, setNewNote] = useState("")
  const [activeInteraction, setActiveInteraction] = useState<InteractiveElement | null>(null)
  const [completedInteractions, setCompletedInteractions] = useState<Set<string>>(new Set())

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Load lesson content
    const loadLesson = async () => {
      // Mock lesson content - in real app this would come from API
      const mockContent: LessonContent = {
        id: lessonId,
        type: "video",
        title: "Introduction to Computers",
        content: {
          videoUrl: "/placeholder.mp4",
          transcript: "Welcome to our computer basics lesson...",
        },
        duration: 900, // 15 minutes
        interactions: [
          {
            id: "q1",
            type: "question",
            timestamp: 120,
            content: "What is the main component that processes data in a computer?",
            options: ["Monitor", "CPU", "Keyboard", "Mouse"],
            correctAnswer: 1,
            completed: false,
          },
          {
            id: "q2",
            type: "quiz",
            timestamp: 300,
            content: "Quick Check: Can you identify the input devices?",
            options: ["Keyboard and Mouse", "Monitor and Speakers", "CPU and RAM", "Hard Drive and SSD"],
            correctAnswer: 0,
            completed: false,
          },
          {
            id: "note1",
            type: "note",
            timestamp: 450,
            content: "Remember: CPU stands for Central Processing Unit",
            completed: false,
          },
        ],
      }

      setCurrentContent(mockContent)
      setDuration(mockContent.duration || 0)
    }

    loadLesson()
  }, [lessonId])

  useEffect(() => {
    // Check for interactions at current timestamp
    if (currentContent?.interactions) {
      const interaction = currentContent.interactions.find(
        (i) => i.timestamp === Math.floor(currentTime) && !completedInteractions.has(i.id),
      )
      if (interaction) {
        setActiveInteraction(interaction)
        setIsPlaying(false)
      }
    }
  }, [currentTime, currentContent, completedInteractions])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const handleSeek = (time: number) => {
    setCurrentTime(time)
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted)
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note: LessonNote = {
        id: Date.now().toString(),
        timestamp: currentTime,
        content: newNote,
        type: "note",
      }
      setNotes([...notes, note])
      setNewNote("")
    }
  }

  const handleInteractionComplete = (interaction: InteractiveElement, userAnswer?: number) => {
    const updatedInteraction = { ...interaction, completed: true, userAnswer }
    setCompletedInteractions(new Set([...completedInteractions, interaction.id]))
    setActiveInteraction(null)
    setIsPlaying(true)

    // Award points for correct answers
    if (interaction.type === "quiz" && userAnswer === interaction.correctAnswer) {
      // Award bonus points
      console.log("Correct answer! +10 XP")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!currentContent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading lesson...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <Card>
        <CardContent className="p-0">
          <div className="relative bg-black rounded-t-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full aspect-video"
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            >
              <source src="/placeholder.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="space-y-2">
                <Progress value={(currentTime / duration) * 100} className="h-1" />
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handlePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                      className="text-white hover:bg-white/20"
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
                      className="text-white hover:bg-white/20"
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleVolumeToggle}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Elements */}
      {activeInteraction && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {activeInteraction.type === "question" && <Lightbulb className="h-5 w-5 text-yellow-500" />}
              {activeInteraction.type === "quiz" && <CheckCircle className="h-5 w-5 text-blue-500" />}
              {activeInteraction.type === "note" && <BookOpen className="h-5 w-5 text-green-500" />}
              Interactive Element
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-medium">{activeInteraction.content}</p>
            {activeInteraction.options && (
              <div className="space-y-2">
                {activeInteraction.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => handleInteractionComplete(activeInteraction, index)}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </Button>
                ))}
              </div>
            )}
            {activeInteraction.type === "note" && (
              <Button onClick={() => handleInteractionComplete(activeInteraction)} className="w-full">
                Got it!
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveInteraction(null)}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lesson Tools */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Notes Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                My Notes
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowNotes(!showNotes)}>
                {showNotes ? "Hide" : "Show"}
              </Button>
            </CardTitle>
          </CardHeader>
          {showNotes && (
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a note at current time..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddNote()}
                />
                <Button onClick={handleAddNote}>Add</Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="p-2 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs">
                        {formatTime(note.timestamp)}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => handleSeek(note.timestamp)} className="text-xs">
                        Jump to
                      </Button>
                    </div>
                    <p className="text-sm">{note.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Progress Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Lesson Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Video Progress</span>
                <span>{Math.round((currentTime / duration) * 100)}%</span>
              </div>
              <Progress value={(currentTime / duration) * 100} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Interactions</span>
                <span>
                  {completedInteractions.size}/{currentContent.interactions?.length || 0}
                </span>
              </div>
              <Progress
                value={
                  currentContent.interactions
                    ? (completedInteractions.size / currentContent.interactions.length) * 100
                    : 0
                }
              />
            </div>
            <div className="pt-2">
              <Badge variant="secondary" className="w-full justify-center">
                Overall:{" "}
                {Math.round(
                  ((currentTime / duration + completedInteractions.size / (currentContent.interactions?.length || 1)) /
                    2) *
                    100,
                )}
                %
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
