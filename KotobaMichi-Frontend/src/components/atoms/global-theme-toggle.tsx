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
            className="relative w-16 h-8 rounded-full dark:from-slate-700 bg-gray-100 dark:via-slate-800 dark:to-slate-900 p-1 transition-all duration-700 ease-in-out hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer border border-orange-200/30 dark:border-white/10 dark:bg-slate-900"
            aria-label="Toggle theme"
          >
            {/* Toggle Switch Handle */}
            <div className={`absolute w-6 h-6 rounded-full bg-black dark:bg-slate-100 shadow-lg transition-all duration-700 ease-in-out transform ${
              theme === 'dark' ? 'translate-x-8' : 'translate-x-0'
            }`}>
              {/* Sun Icon */}
              <Sun className={`absolute inset-0 m-auto h-3 w-3 text-white transition-all duration-700 ease-in-out ${
                theme === 'light' ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 rotate-180'
              }`} />
              
              {/* Moon Icon */}
              <Moon className={`absolute inset-0 m-auto h-3 w-3 text-slate-600 transition-all duration-700 ease-in-out ${
                theme === 'dark' ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-180'
              }`} />
            </div>
            
            {/* Stars for Dark Mode */}
            <div className={`absolute inset-0 rounded-full transition-all duration-700 ease-in-out ${
              theme === 'dark' ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="absolute top-1 left-2 w-1 h-1 bg-white rounded-full animate-pulse" />
              <div className="absolute top-2 right-3 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-100" />
              <div className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-200" />
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