interface RealtimeEvent {
  type: string
  data: any
  timestamp: number
  userId?: string
}

interface RealtimeSubscription {
  id: string
  callback: (event: RealtimeEvent) => void
  filter?: (event: RealtimeEvent) => boolean
}

class RealtimeStore {
  private subscriptions: Map<string, RealtimeSubscription> = new Map()
  private eventHistory: RealtimeEvent[] = []
  private maxHistorySize = 1000

  constructor() {
    // Listen for storage events from other tabs
    if (typeof window !== "undefined") {
      window.addEventListener("storage", this.handleStorageEvent.bind(this))
    }
  }

  private handleStorageEvent(event: StorageEvent) {
    if (event.key === "realtime_events" && event.newValue) {
      try {
        const realtimeEvent: RealtimeEvent = JSON.parse(event.newValue)
        this.notifySubscribers(realtimeEvent)
      } catch (error) {
        console.error("Failed to parse realtime event:", error)
      }
    }
  }

  subscribe(callback: (event: RealtimeEvent) => void, filter?: (event: RealtimeEvent) => boolean): string {
    const id = Math.random().toString(36).substr(2, 9)
    this.subscriptions.set(id, { id, callback, filter })
    return id
  }

  unsubscribe(id: string) {
    this.subscriptions.delete(id)
  }

  emit(type: string, data: any, userId?: string) {
    const event: RealtimeEvent = {
      type,
      data,
      timestamp: Date.now(),
      userId,
    }

    // Store in history
    this.eventHistory.push(event)
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }

    // Notify local subscribers
    this.notifySubscribers(event)

    // Broadcast to other tabs via localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("realtime_events", JSON.stringify(event))
      // Clear immediately to allow repeated events
      setTimeout(() => localStorage.removeItem("realtime_events"), 100)
    }
  }

  private notifySubscribers(event: RealtimeEvent) {
    this.subscriptions.forEach((subscription) => {
      if (!subscription.filter || subscription.filter(event)) {
        try {
          subscription.callback(event)
        } catch (error) {
          console.error("Error in realtime subscription callback:", error)
        }
      }
    })
  }

  getHistory(filter?: (event: RealtimeEvent) => boolean): RealtimeEvent[] {
    return filter ? this.eventHistory.filter(filter) : [...this.eventHistory]
  }

  // Simulate real-time updates for demo purposes
  simulateActivity() {
    const activities = [
      {
        type: "user_online",
        data: {
          userId: "student_" + Math.floor(Math.random() * 100),
          name: "Student " + Math.floor(Math.random() * 100),
        },
      },
      {
        type: "lesson_completed",
        data: {
          lessonId: "lesson_" + Math.floor(Math.random() * 10),
          userId: "student_" + Math.floor(Math.random() * 100),
        },
      },
      {
        type: "quiz_submitted",
        data: { quizId: "quiz_" + Math.floor(Math.random() * 5), score: Math.floor(Math.random() * 100) },
      },
      { type: "new_message", data: { message: "Great progress on the math lesson!", from: "Teacher Smith" } },
    ]

    const activity = activities[Math.floor(Math.random() * activities.length)]
    this.emit(activity.type, activity.data)
  }
}

export const realtimeStore = new RealtimeStore()

// Auto-simulate activity every 10-30 seconds for demo
if (typeof window !== "undefined") {
  setInterval(
    () => {
      if (Math.random() > 0.7) {
        // 30% chance every interval
        realtimeStore.simulateActivity()
      }
    },
    10000 + Math.random() * 20000,
  )
}
