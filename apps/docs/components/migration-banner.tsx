import Link from "next/link"
import { Info } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function MigrationBanner() {
  return (
    <Alert className="rounded-none border-x-0 border-t-0 border-foreground/15 bg-card px-4 py-2 shadow-none">
      <Info />
      <AlertTitle>Hive has migrated</AlertTitle>
      <AlertDescription>
        Hive now lives on hive.niravv.me. The app, API, and media have moved
        with it.{" "}
        <Link
          href="/docs/migration"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Details
        </Link>
      </AlertDescription>
    </Alert>
  )
}
