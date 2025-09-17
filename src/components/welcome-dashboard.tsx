"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Smile, LogIn } from "lucide-react"

export function WelcomeDashboard() {
  return (
    <div className="p-6 space-y-6 flex flex-col items-center justify-center min-h-screen">
      <Card className="bg-card border-border shadow-lg max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 justify-center text-3xl font-bold">
            <Smile className="w-8 h-8 text-primary" />
            <span>Welcome to Daily Note App</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-center text-muted-foreground">
            Organize your day, track your tasks, and boost your productivity. Sign up or log in to get started!
          </p>
          <div className="flex flex-col space-y-3">
            <Button variant="default" size="lg" className="w-full" onClick={() => window.location.href = "/signup"}>
              <LogIn className="w-5 h-5 mr-2" /> Sign Up
            </Button>
            <Button variant="outline" size="lg" className="w-full" onClick={() => window.location.href = "/login"}>
              <LogIn className="w-5 h-5 mr-2" /> Log In
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="mt-8 text-center text-muted-foreground">
        <p>Start your journey to a more organized and productive life.</p>
      </div>
    </div>
  )
}
