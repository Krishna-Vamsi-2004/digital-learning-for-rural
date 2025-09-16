import { offlineStorage, type User } from "./offline-storage"

export interface AuthUser extends User {
  password?: string // Only stored locally for offline auth
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  name: string
  email: string
  password: string
  role: "student" | "teacher" | "admin"
  languagePreference: "en" | "hi" | "pa"
}

class AuthService {
  private currentUser: AuthUser | null = null
  private readonly CURRENT_USER_KEY = "nabha-current-user"

  async init(): Promise<void> {
    // Check if user is already logged in
    const savedUser = localStorage.getItem(this.CURRENT_USER_KEY)
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser)
      } catch (error) {
        console.error("Failed to parse saved user:", error)
        localStorage.removeItem(this.CURRENT_USER_KEY)
      }
    }
  }

  async signup(data: SignupData): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      // Check if user already exists
      const existingUsers = await this.getAllUsers()
      const existingUser = existingUsers.find((u) => u.email === data.email)

      if (existingUser) {
        return { success: false, error: "User with this email already exists" }
      }

      // Create new user
      const newUser: AuthUser = {
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        languagePreference: data.languagePreference,
        password: data.password, // In production, this would be hashed
        progressData: [],
      }

      // Save user to offline storage
      await offlineStorage.saveUser(newUser)

      // Set as current user
      this.currentUser = { ...newUser }
      delete this.currentUser.password // Don't keep password in memory
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(this.currentUser))

      return { success: true, user: this.currentUser }
    } catch (error) {
      console.error("Signup failed:", error)
      return { success: false, error: "Failed to create account" }
    }
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const users = await this.getAllUsers()
      const user = users.find((u) => u.email === credentials.email)

      if (!user) {
        return { success: false, error: "User not found" }
      }

      // In production, you would hash the password and compare
      if (user.password !== credentials.password) {
        return { success: false, error: "Invalid password" }
      }

      // Set as current user
      this.currentUser = { ...user }
      delete this.currentUser.password // Don't keep password in memory
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(this.currentUser))

      return { success: true, user: this.currentUser }
    } catch (error) {
      console.error("Login failed:", error)
      return { success: false, error: "Login failed" }
    }
  }

  async logout(): Promise<void> {
    this.currentUser = null
    localStorage.removeItem(this.CURRENT_USER_KEY)
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role
  }

  private async getAllUsers(): Promise<AuthUser[]> {
    // This is a simplified approach - in production you'd have proper user management
    const users: AuthUser[] = []

    // Try to get users from IndexedDB (this is a simplified implementation)
    try {
      // For now, we'll create some default users if none exist
      const defaultUsers: AuthUser[] = [
        {
          id: "admin-1",
          name: "Dr. Rajesh Kumar",
          email: "admin@nabha.edu",
          role: "admin",
          languagePreference: "en",
          password: "admin123",
        },
        {
          id: "teacher-1",
          name: "Mrs. Kaur",
          email: "teacher@nabha.edu",
          role: "teacher",
          languagePreference: "pa",
          password: "teacher123",
        },
        {
          id: "student-1",
          name: "Priya Singh",
          email: "student@nabha.edu",
          role: "student",
          languagePreference: "en",
          password: "student123",
        },
      ]

      // Check if we have any users in storage, if not, add defaults
      const storedUser = await offlineStorage.getUser("admin-1")
      if (!storedUser) {
        for (const user of defaultUsers) {
          await offlineStorage.saveUser(user)
        }
      }

      return defaultUsers
    } catch (error) {
      console.error("Failed to get users:", error)
      return []
    }
  }

  async updateProfile(updates: Partial<AuthUser>): Promise<{ success: boolean; error?: string }> {
    if (!this.currentUser) {
      return { success: false, error: "Not authenticated" }
    }

    try {
      const updatedUser = { ...this.currentUser, ...updates }
      await offlineStorage.saveUser(updatedUser)

      this.currentUser = updatedUser
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(this.currentUser))

      return { success: true }
    } catch (error) {
      console.error("Profile update failed:", error)
      return { success: false, error: "Failed to update profile" }
    }
  }
}

export const authService = new AuthService()
