"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { realtimeStore } from "@/lib/realtime-store"
import { Users, BookOpen, Trophy, TrendingUp } from "lucide-react"

interface DashboardStats {
  activeUsers: number
  lessonsCompleted: number
  averageScore: number
  totalQuizzes: number
}

export function RealtimeDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    activeUsers: 0,
    lessonsCompleted: 0,
    averageScore: 0,
    totalQuizzes: 0,
  })

  useEffect(() => {
    // Subscribe to realtime events to update stats
    const subscriptionId = realtimeStore.subscribe((event) => {
      setStats((prev) => {
        const newStats = { ...prev }

        switch (event.type) {
          case "user_online":
            newStats.activeUsers = Math.max(0, prev.activeUsers + 1)
            break
          case "lesson_completed":
            newStats.lessonsCompleted = prev.lessonsCompleted + 1
            break
          case "quiz_submitted":
            newStats.totalQuizzes = prev.totalQuizzes + 1
            newStats.averageScore = Math.round(
              (prev.averageScore * (prev.totalQuizzes - 1) + event.data.score) / prev.totalQuizzes,
            )
            break
        }

        return newStats
      })
    })

    // Initialize with some base stats
    setStats({
      activeUsers: Math.floor(Math.random() * 50) + 10,
      lessonsCompleted: Math.floor(Math.random() * 200) + 50,
      averageScore: Math.floor(Math.random() * 30) + 70,
      totalQuizzes: Math.floor(Math.random() * 100) + 25,
    })

    return () => {
      realtimeStore.unsubscribe(subscriptionId)
    }
  }, [])

  const statCards = [
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+12%",
    },
    {
      title: "Lessons Completed",
      value: stats.lessonsCompleted,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+8%",
    },
    {
      title: "Average Score",
      value: `${stats.averageScore}%`,
      icon: Trophy,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      change: "+5%",
    },
    {
      title: "Total Quizzes",
      value: stats.totalQuizzes,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+15%",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-green-600 font-medium">{stat.change}</div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
