"use client";

import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const currentPath = usePathname();
  const pathMaps = [
    {
      name: "GPT",
      path: "/gpt-reading-list",
    },
    {
      name: "Table",
      path: "/generations",
    },
    {
      name: "Mermaid",
      path: "/mermaidview",
    }
  ]


  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {pathMaps.map((pathMap) => (
        <Link
            key={pathMap.path}
            href={pathMap.path}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              currentPath.includes(pathMap.path) ? "text-primary" : "text-gray-600"
            )}
          >
            {pathMap.name}
          </Link>
      ))}
    </nav>
  )
}