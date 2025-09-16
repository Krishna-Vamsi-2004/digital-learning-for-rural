"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe, Check } from "lucide-react"
import { i18n, type Language } from "@/lib/i18n"

interface LanguageSelectorProps {
  onLanguageChange?: (language: Language) => void
}

export function LanguageSelector({ onLanguageChange }: LanguageSelectorProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en")

  useEffect(() => {
    i18n.init()
    setCurrentLanguage(i18n.getCurrentLanguage())
  }, [])

  const handleLanguageChange = (language: Language) => {
    i18n.setLanguage(language)
    setCurrentLanguage(language)
    onLanguageChange?.(language)
  }

  const languageOptions = i18n.getLanguageOptions()
  const currentOption = languageOptions.find(
    (option) => option.value === currentLanguage
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Globe className="h-4 w-4 mr-1" />
          {currentOption?.nativeLabel || "English"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languageOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleLanguageChange(option.value)}
            className="flex items-center justify-between"
          >
            <span>{option.nativeLabel}</span>
            {currentLanguage === option.value && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
