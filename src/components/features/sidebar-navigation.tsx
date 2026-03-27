'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import type { LucideIcon } from 'lucide-react'

export type MenuItem = {
  href: string
  icon: LucideIcon
  label: string
  isActive?: (pathname: string) => boolean
}

type Props = {
  menuItems: MenuItem[]
}

export function SidebarNavigation({ menuItems }: Props) {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {menuItems.map((item) => {
        const active = item.isActive
          ? item.isActive(pathname)
          : pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={active}>
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
