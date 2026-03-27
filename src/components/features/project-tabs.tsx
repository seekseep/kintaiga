'use client'

import Link from 'next/link'

type Tab = {
  label: string
  href: string
}

type Props = {
  tabs: Tab[]
  isActive: (href: string) => boolean
}

export function ProjectTabs({ tabs, isActive }: Props) {
  return (
    <nav className="flex border-b">
      {tabs.map(tab => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            isActive(tab.href)
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
