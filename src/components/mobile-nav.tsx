"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home, Calendar, CheckSquare, BarChart3, FileText, Trophy, Settings, FileText as LogoIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navigation = [
    { name: "Today", href: "/home", icon: Home },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "All Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Stats", href: "/stats", icon: BarChart3 },
    { name: "Templates", href: "/templates", icon: FileText },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden mr-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
                <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
                    <div className="flex items-center p-4 border-b border-sidebar-border">
                        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center mr-2">
                            <LogoIcon className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="font-semibold text-sidebar-foreground">DailyNote</span>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className="block"
                                >
                                    <Button
                                        variant={isActive ? "default" : "ghost"}
                                        className={cn(
                                            "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                                            isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                                        )}
                                    >
                                        <Icon className="mr-3 h-4 w-4" />
                                        {item.name}
                                    </Button>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </SheetContent>
        </Sheet>
    );
}
