"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogIn, Menu, X, BookOpen } from "lucide-react"
import { i18n } from "@/lib/i18n"
import { authService } from "@/lib/auth"
import { LanguageSelector } from "@/components/language-selector"
import { SyncStatusIndicator } from "@/components/sync-status"

export default function Navbar() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    authService.init().then(() => {
      setCurrentUser(authService.getCurrentUser())
    })
  }, [])

  const handleLogout = async () => {
    await authService.logout()
    setCurrentUser(null)
  }

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary rounded-xl shadow-lg">
            <BookOpen className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-card-foreground tracking-tight">
              {i18n.t("platformName")}
            </h1>
            <p className="text-sm text-muted-foreground">{i18n.t("platformDescription")}</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <SyncStatusIndicator />
          <LanguageSelector />
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-card-foreground">
                  {i18n.t("welcome")}, {currentUser.name}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
              </div>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                {i18n.t("logout")}
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => router.push("/auth/login")}
              className="rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <LogIn className="h-4 w-4 mr-2" />
              {i18n.t("login")}
            </Button>
          )}
        </div>

        <div className="md:hidden flex items-center">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-card-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-card-foreground" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-card/90 backdrop-blur-sm border-t border-border">
          <div className="flex flex-col px-4 py-4 gap-4">
            <SyncStatusIndicator />
            <LanguageSelector />
            {currentUser ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-card-foreground">
                  {i18n.t("welcome")}, {currentUser.name}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
                <Button variant="destructive" size="sm" onClick={handleLogout}>
                  {i18n.t("logout")}
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => router.push("/auth/login")}
                className="rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <LogIn className="h-4 w-4 mr-2" />
                {i18n.t("login")}
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
