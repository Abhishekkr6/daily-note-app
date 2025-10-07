"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  CheckSquare,
  Calendar,
  BarChart3,
  Sparkles,
  Clock,
  Target,
  Zap,
  ArrowRight,
  Star,
  Users,
  TrendingUp,
} from "lucide-react"

export function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: FileText,
      title: "Daily Notes",
      description: "Capture thoughts, ideas, and reflections with our rich text editor. Every day gets its own page.",
      color: "text-orange-600",
    },
    {
      icon: CheckSquare,
      title: "Smart Tasks",
      description: "Create tasks with natural language. Set priorities, due dates, and tags effortlessly.",
      color: "text-green-600",
    },
    {
      icon: Calendar,
      title: "Visual Calendar",
      description: "See your productivity at a glance with completion heatmaps and daily overviews.",
      color: "text-blue-600",
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Track streaks, completion rates, and productivity patterns with beautiful charts.",
      color: "text-purple-600",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      content: "DailyNote transformed how I organize my work. The natural language task creation is a game-changer!",
      rating: 5,
    },
    {
      name: "Alex Rodriguez",
      role: "Freelancer",
      content: "Finally, a productivity app that doesn't overwhelm me. Clean, simple, and incredibly effective.",
      rating: 5,
    },
    {
      name: "Maya Patel",
      role: "Student",
      content: "The daily notes feature helps me reflect and stay focused. Love the progress tracking!",
      rating: 5,
    },
  ]

  return (
  <div className="min-h-screen bg-[#171717] text-white">
      {/* Header */}
  <header className="border-b bg-[#171717] backdrop-blur-sm sticky top-0 z-50 text-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold heading">DailyNote</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/signup" className="cursor-pointer">
              <Button variant="ghost" className="btn cursor-pointer">Sign Up</Button>
            </Link>
            <Link href="/login" className="cursor-pointer">
              <Button className="btn cursor-pointer">Log In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
  <section className="container mx-auto px-4 py-20 text-center bg-[#171717] text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-primary" />
            <Badge variant="secondary" className="text-sm">
              Your Daily Productivity Companion
            </Badge>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance heading">
            Start your productivity journey with <span className="text-primary">DailyNote</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
            Combine daily journaling with smart task management. Track your progress, build habits, and achieve your
            goals with our beautifully designed productivity app.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup" className="cursor-pointer">
              <Button size="lg" className="text-lg px-8 py-6 cursor-pointer">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 cursor-pointer" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent cursor-pointer">
              View Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">10K+</span>
              </div>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <CheckSquare className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold">1M+</span>
              </div>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold">95%</span>
              </div>
              <p className="text-sm text-muted-foreground">User Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
  <section className="container mx-auto px-4 py-20 bg-[#171717] text-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 heading">Everything you need to stay productive</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you organize your thoughts, manage tasks, and track your progress
            effortlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                onMouseEnter={() => setActiveFeature(index)}
              >
                <CardHeader className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-accent flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg heading">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Feature Highlight */}
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  {React.createElement(features[activeFeature].icon, {
                    className: `w-8 h-8 ${features[activeFeature].color}`,
                  })}
                  <h3 className="text-2xl font-bold heading">{features[activeFeature].title}</h3>
                </div>
                <p className="text-lg text-muted-foreground mb-6">{features[activeFeature].description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    Time Tracking
                  </Badge>
                  <Badge variant="secondary">
                    <Target className="w-3 h-3 mr-1" />
                    Goal Setting
                  </Badge>
                  <Badge variant="secondary">
                    <Zap className="w-3 h-3 mr-1" />
                    Quick Actions
                  </Badge>
                </div>
              </div>
              <div className="bg-accent/20 rounded-2xl p-8 text-center">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-4">
                  {React.createElement(features[activeFeature].icon, {
                    className: `w-16 h-16 ${features[activeFeature].color}`,
                  })}
                </div>
                <p className="text-sm text-muted-foreground">Interactive preview coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Testimonials */}
  <section className="bg-[#171717] py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 heading">Loved by productive people everywhere</h2>
            <p className="text-xl text-muted-foreground">
              See what our users have to say about their DailyNote experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
  <section className="container mx-auto px-4 py-20 text-center bg-[#171717] text-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 heading">Ready to boost your productivity?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users who have transformed their daily routine with DailyNote. Start your free account
            today.
          </p>
          <Link href="/signup" className="cursor-pointer">
            <Button size="lg" className="text-lg px-8 py-6 btn cursor-pointer">
              Create Your Free Account
              <ArrowRight className="w-5 h-5 ml-2 cursor-pointer" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">No credit card required • Free forever plan available</p>
        </div>
      </section>

      {/* Footer */}
  <footer className="border-t bg-[#171717] backdrop-blur-sm text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold heading">DailyNote</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 DailyNote. Made with ❤️ for productive people.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
