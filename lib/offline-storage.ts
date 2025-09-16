export interface User {
  id: string
  name: string
  email: string
  role: "student" | "teacher" | "admin"
  languagePreference: "en" | "hi" | "pa"
  progressData?: StudentProgress[]
}

export interface Lesson {
  id: string
  title: string
  titleHi?: string
  titlePa?: string
  type: "video" | "quiz" | "epub" | "interactive"
  language: "en" | "hi" | "pa"
  filePath: string
  size: number
  duration?: number
  description: string
  descriptionHi?: string
  descriptionPa?: string
  category: string
  difficulty: "beginner" | "intermediate" | "advanced"
  cached: boolean
}

export interface Quiz {
  id: string
  lessonId: string
  questions: QuizQuestion[]
  passingScore: number
}

export interface QuizQuestion {
  id: string
  question: string
  questionHi?: string
  questionPa?: string
  options: string[]
  optionsHi?: string[]
  optionsPa?: string[]
  correctAnswer: number
  explanation?: string
  explanationHi?: string
  explanationPa?: string
}

export interface StudentProgress {
  id: string
  userId: string
  lessonId: string
  completionStatus: "not_started" | "in_progress" | "completed"
  score?: number
  timeSpent: number
  lastAccessed: Date
  attempts: number
}

class OfflineStorage {
  private dbName = "nabha-learning-db"
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Users store
        if (!db.objectStoreNames.contains("users")) {
          const userStore = db.createObjectStore("users", { keyPath: "id" })
          userStore.createIndex("email", "email", { unique: true })
        }

        // Lessons store
        if (!db.objectStoreNames.contains("lessons")) {
          const lessonStore = db.createObjectStore("lessons", { keyPath: "id" })
          lessonStore.createIndex("category", "category")
          lessonStore.createIndex("language", "language")
        }

        // Quizzes store
        if (!db.objectStoreNames.contains("quizzes")) {
          const quizStore = db.createObjectStore("quizzes", { keyPath: "id" })
          quizStore.createIndex("lessonId", "lessonId")
        }

        // Progress store
        if (!db.objectStoreNames.contains("progress")) {
          const progressStore = db.createObjectStore("progress", { keyPath: "id" })
          progressStore.createIndex("userId", "userId")
          progressStore.createIndex("lessonId", "lessonId")
        }

        // Sync queue for offline changes
        if (!db.objectStoreNames.contains("syncQueue")) {
          db.createObjectStore("syncQueue", { keyPath: "id", autoIncrement: true })
        }
      }
    })
  }

  async saveUser(user: User): Promise<void> {
    if (!this.db) await this.init()
    const transaction = this.db!.transaction(["users"], "readwrite")
    const store = transaction.objectStore("users")
    await store.put(user)
  }

  async getUser(id: string): Promise<User | null> {
    if (!this.db) await this.init()
    const transaction = this.db!.transaction(["users"], "readonly")
    const store = transaction.objectStore("users")
    const result = await store.get(id)
    return result || null
  }

  async saveLessons(lessons: Lesson[]): Promise<void> {
    if (!this.db) await this.init()
    const transaction = this.db!.transaction(["lessons"], "readwrite")
    const store = transaction.objectStore("lessons")

    for (const lesson of lessons) {
      await store.put(lesson)
    }
  }

  async getLessons(language?: string): Promise<Lesson[]> {
    if (!this.db) await this.init()
    const transaction = this.db!.transaction(["lessons"], "readonly")
    const store = transaction.objectStore("lessons")

    return new Promise((resolve, reject) => {
      let request: IDBRequest

      if (language) {
        const index = store.index("language")
        request = index.getAll(language)
      } else {
        request = store.getAll()
      }

      request.onsuccess = () => {
        resolve(request.result || [])
      }
      request.onerror = () => reject(request.error)
    })
  }

  async saveProgress(progress: StudentProgress): Promise<void> {
    if (!this.db) await this.init()
    const transaction = this.db!.transaction(["progress", "syncQueue"], "readwrite")
    const progressStore = transaction.objectStore("progress")
    const syncStore = transaction.objectStore("syncQueue")

    return new Promise((resolve, reject) => {
      const progressRequest = progressStore.put(progress)

      progressRequest.onsuccess = () => {
        const syncRequest = syncStore.add({
          type: "progress",
          data: progress,
          timestamp: new Date(),
        })

        syncRequest.onsuccess = () => resolve()
        syncRequest.onerror = () => reject(syncRequest.error)
      }

      progressRequest.onerror = () => reject(progressRequest.error)
    })
  }

  async getProgress(userId: string): Promise<StudentProgress[]> {
    if (!this.db) await this.init()
    const transaction = this.db!.transaction(["progress"], "readonly")
    const store = transaction.objectStore("progress")
    const index = store.index("userId")

    return new Promise((resolve, reject) => {
      const request = index.getAll(userId)
      request.onsuccess = () => {
        resolve(request.result || [])
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getSyncQueue(): Promise<any[]> {
    if (!this.db) await this.init()
    const transaction = this.db!.transaction(["syncQueue"], "readonly")
    const store = transaction.objectStore("syncQueue")

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        resolve(request.result || [])
      }
      request.onerror = () => reject(request.error)
    })
  }

  async clearSyncQueue(): Promise<void> {
    if (!this.db) await this.init()
    const transaction = this.db!.transaction(["syncQueue"], "readwrite")
    const store = transaction.objectStore("syncQueue")

    return new Promise((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

export const offlineStorage = new OfflineStorage()
