import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Hero({ badgeText }: { badgeText: string }) {
  return (
    <div className="w-full flex flex-col gap-10 md:gap-16 items-center justify-center px-6 py-12 md:py-16 lg:py-24">
      <div className="text-center max-w-3xl">
        <Badge variant="secondary" className="rounded-full py-1 border-border">
          {badgeText}
        </Badge>
        <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:leading-[1.2] font-semibold tracking-tighter">
          A simple CMS
          <br />
          for your next project
        </h1>
        <p className="mt-6 md:text-lg text-foreground/80">
          Write content in one place and fetch it from any frontend with a
          straightforward API, so your team can focus on what to say instead of
          how to wire it up.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" className="rounded-full text-base" asChild>
            <Link href="https://app.hivecms.online">
              Get Started <ArrowUpRight className="h-5! w-5!" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full text-base shadow-none"
            asChild
          >
            <Link href="/docs">
              <BookOpen className="h-5! w-5!" /> Read Docs
            </Link>
          </Button>
        </div>
      </div>
      <div className="relative w-full max-w-(--breakpoint-xl) mx-auto aspect-video rounded-xl overflow-hidden border border-foreground/10 shadow-[0_0_40px_0_rgba(0,0,0,0.1)] shadow-primary/15">
        <Image
          src="/hive-dashboard.png"
          alt="Hive Dashboard Dark"
          className="hidden dark:block object-cover"
          fill
        />
        <Image
          src="/hive-dashboard-light.png"
          alt="Hive Dashboard Light"
          className="block dark:hidden object-cover"
          fill
        />
      </div>
    </div>
  );
}
