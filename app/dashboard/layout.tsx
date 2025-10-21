import { Providers } from "../../src/components/Providers"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      {children}
    </Providers>
  )
}

