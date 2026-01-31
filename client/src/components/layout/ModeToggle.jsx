import React from "react"
import { Moon, Sun } from "lucide-react"

import { useTheme } from "@/components/providers/ThemeProvider"
import { cn } from "@/lib/utils"

export function ModeToggle({ className }) {
    const { theme, setTheme } = useTheme()

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn("p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors relative", className)}
            aria-label="Toggle theme"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 top-2" />
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}
