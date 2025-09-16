"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, Target, TrendingUp, Lightbulb, Clock, Star } from "lucide-react"

interface LearningPath {
  id: string
  title: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedTime: number
  lessons: string[]
  prerequisites: string[]
  skills: string[]
}

interface PersonalizedRecommendation {
  lessonId: string
  reason: string
  confidence: number
  type: "review" | "next" | "challenge" | "remedial"
}

export function AdaptiveLearningEngine({ userId }: { userId: string }) {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([])
  const [currentPath, setCurrentPath] = useState<LearningPath | null>(null)
  const [learningStyle, setLearningStyle] = useState<"visual" | "auditory" | "kinesthetic" | "reading">("visual")

  useEffect(() => {
    // Initialize learning paths
    const paths: LearningPath[] = [
      {
        id: "digital-literacy-path",
        title: "Digital Literacy Mastery",
        description: "Complete journey from basic computer skills to advanced digital citizenship",
        difficulty: "beginner",
        estimatedTime: 120,
        lessons: ["lesson-1", "lesson-5", "lesson-6"],
        prerequisites: [],
        skills: ["Computer Basics", "Internet Safety", "Digital Communication"],
      },
      {
        id: "math-fundamentals-path",
        title: "Mathematics Foundation",
        description: "Build strong mathematical foundation with interactive exercises",
        difficulty: "beginner",
        estimatedTime: 180,
        lessons: ["lesson-2", "lesson-7", "lesson-8"],
        prerequisites: [],
        skills: ["Basic Arithmetic", "Problem Solving", "Logical Thinking"],
      },
      {
        id: "language-mastery-path",
        title: "English Language Proficiency",
        description: "Develop comprehensive English language skills",
        difficulty: "intermediate",
        estimatedTime: 200,
        lessons: ["lesson-3", "lesson-9", "lesson-10"],
        prerequisites: ["digital-literacy-path"],
        skills: ["Grammar", "Vocabulary", "Communication"],
      },
    ]

    setLearningPaths(paths)

    // Generate personalized recommendations based on user progress
    const generateRecommendations = () => {
      const recs: PersonalizedRecommendation[] = [
        {
          lessonId: "lesson-2",
          reason: "Based on your strong performance in basic concepts",
          confidence: 0.85,
          type: "next",
        },
        {
          lessonId: "lesson-1",
          reason: "Review recommended to strengthen foundation",
          confidence: 0.72,
          type: "review",
        },
        {
          lessonId: "lesson-4",
          reason: "Challenge yourself with advanced concepts",
          confidence: 0.68,
          type: "challenge",
        },
      ]
      setRecommendations(recs)
    }

    generateRecommendations()
  }, [userId])

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "next":
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      case "review":
        return <Target className="h-4 w-4 text-orange-500" />
      case "challenge":
        return <Star className="h-4 w-4 text-purple-500" />
      case "remedial":
        return <Lightbulb className="h-4 w-4 text-yellow-500" />
      default:
        return <Brain className="h-4 w-4 text-gray-500" />
    }
  }

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case "next":
        return "bg-blue-50 border-blue-200"
      case "review":
        return "bg-orange-50 border-orange-200"
      case "challenge":
        return "bg-purple-50 border-purple-200"
      case "remedial":
        return "bg-yellow-50 border-yellow-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Learning Style Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Adaptive Learning Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Your Learning Style</p>
              <p className="text-sm text-muted-foreground">Optimized for {learningStyle} learning</p>
            </div>
            <Badge variant="secondary" className="capitalize">
              {learningStyle}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(["visual", "auditory", "kinesthetic", "reading"] as const).map((style) => (
              <Button
                key={style}
                variant={learningStyle === style ? "default" : "outline"}
                size="sm"
                onClick={() => setLearningStyle(style)}
                className="capitalize"
              >
                {style}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personalized Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getRecommendationColor(rec.type)} transition-colors hover:shadow-sm`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getRecommendationIcon(rec.type)}
                    <div>
                      <p className="font-medium text-sm">Lesson {rec.lessonId.split("-")[1]}</p>
                      <p className="text-xs text-muted-foreground">{rec.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {Math.round(rec.confidence * 100)}% match
                    </Badge>
                    <Button size="sm" className="mt-2 ml-2">
                      Start
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Paths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            Recommended Learning Paths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {learningPaths.map((path) => (
              <div
                key={path.id}
                className={`p-4 rounded-lg border transition-colors hover:shadow-sm ${
                  currentPath?.id === path.id ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{path.title}</h4>
                    <p className="text-sm text-muted-foreground">{path.description}</p>
                  </div>
                  <Badge variant={path.difficulty === "beginner" ? "default" : "secondary"}>{path.difficulty}</Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {path.estimatedTime} min
                  </div>
                  <div>{path.lessons.length} lessons</div>
                  <div>{path.skills.length} skills</div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {path.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <Progress value={currentPath?.id === path.id ? 30 : 0} className="flex-1 mr-4" />
                  <Button
                    size="sm"
                    variant={currentPath?.id === path.id ? "outline" : "default"}
                    onClick={() => setCurrentPath(currentPath?.id === path.id ? null : path)}
                  >
                    {currentPath?.id === path.id ? "Continue" : "Start Path"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
