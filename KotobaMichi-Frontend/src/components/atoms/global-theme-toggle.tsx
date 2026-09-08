import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/atoms/tooltip"

interface GlobalThemeToggleProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  className?: string
}

export function GlobalThemeToggle({ 
  position = 'bottom-right',
  className = ""
}: GlobalThemeToggleProps) {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6'
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <div className={`${positionClasses[position]} z-50 ${className}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full bg-secondary/80 border border-border/90 p-0.5 transition-all duration-300 ease-in-out hover:scale-105 shadow-sm hover:shadow-md cursor-pointer backdrop-blur-md"
            aria-label="Toggle theme"
          >
            {/* Toggle Switch Handle */}
            <div className={`flex items-center justify-center w-5 h-5 rounded-full bg-card shadow-xs transition-all duration-300 ease-in-out transform border border-border/50 ${
              theme === 'dark' ? 'translate-x-7' : 'translate-x-0.5'
            }`}>
              {theme === 'dark' ? (
                <Moon className="h-3 w-3 text-foreground transition-all" />
              ) : (
                <Sun className="h-3 w-3 text-amber-500 transition-all" />
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p className="font-medium">
            {theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
} 