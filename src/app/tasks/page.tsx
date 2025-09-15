import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { TasksPage } from "@/components/tasks-page"

export default function AllTasksPage() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <TasksPage />
        </main>
      </div>
    </div>
  )
}
