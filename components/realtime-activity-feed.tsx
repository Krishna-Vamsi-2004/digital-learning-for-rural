"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { realtimeStore } from "@/lib/realtime-store"
import { Users, BookOpen, Trophy, MessageCircle, Clock } from "lucide-react"

interface ActivityItem {
  id: string
  type: string
  data: any
  timestamp: number
  userId?: string
}

export function RealtimeActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Subscribe to realtime events
    const subscriptionId = realtimeStore.subscribe((event) => {
      const activity: ActivityItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: event.type,
        data: event.data,
        timestamp: event.timestamp,
        userId: event.userId,
      }

      setActivities((prev) => [activity, ...prev.slice(0, 49)]) // Keep last 50 activities

      // Track online users
      if (event.type === "user_online") {
        setOnlineUsers((prev) => new Set([...prev, event.data.userId]))
        // Remove user after 5 minutes of inactivity
        setTimeout(() => {
          setOnlineUsers((prev) => {
            const newSet = new Set(prev)
            newSet.delete(event.data.userId)
            return newSet
          })
        }, 300000)
      }
    })

    // Load initial history
    const history = realtimeStore.getHistory()
    const initialActivities = history
      .slice(-20)
      .reverse()
      .map((event) => ({
        id: Math.random().toString(36).substr(2, 9),
        type: event.type,
        data: event.data,
        timestamp: event.timestamp,
        userId: event.userId,
      }))
    setActivities(initialActivities)

    return () => {
      realtimeStore.unsubscribe(subscriptionId)
    }
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_online":
        return <Users className="h-4 w-4 text-green-500" />
      case "lesson_completed":
        return <BookOpen className="h-4 w-4 text-blue-500" />
      case "quiz_submitted":
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case "new_message":
        return <MessageCircle className="h-4 w-4 text-purple-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case "user_online":
        return `${activity.data.name} came online`
      case "lesson_completed":
        return `Lesson completed by student`
      case "quiz_submitted":
        return `Quiz submitted with score: ${activity.data.score}%`
      case "new_message":
        return `${activity.data.from}: ${activity.data.message}`
      default:
        return "Unknown activity"
    }
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 60000) return "Just now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          Live Activity
          <Badge variant="secondary" className="ml-auto">
            {onlineUsers.size} online
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-6">
          <div className="space-y-3">
            {activities.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{getActivityText(activity)}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
