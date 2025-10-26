import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Bloomwell AI",
  description: "Nonprofit AI Assistant",
}

export default async function RootLayout({ children }: { children: React.ReactNode }): Promise<React.ReactElement> {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
