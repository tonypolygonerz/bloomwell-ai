'use client';

import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // For login page, just render children without header/sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // For all other admin pages, use the full admin layout
  return <AdminLayout>{children}</AdminLayout>;
}
