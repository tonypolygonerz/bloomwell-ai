import { redirect } from "next/navigation"

export default function HomePage(): React.ReactElement {
  // Redirect to dashboard for now
  redirect("/dashboard")
}
