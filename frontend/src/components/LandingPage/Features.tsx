import React from "react"
import { AnimatedGroup } from "@/components/ui/animated-group"
import { Calendar, Edit3, Settings, BarChart3, Search } from "lucide-react"

const features = [
	{
		icon: Calendar,
		title: "Scheduling & Planning",
		desc: "Timeline clarity for posts, owners & deadlines.",
	},
	{
		icon: Edit3,
		title: "Clean Writing Experience",
		desc: "Keyboard‑first editor with media + formatting.",
	},
	{
		icon: Settings,
		title: "Metadata & SEO",
		desc: "Optimize structure, tags & previews inline.",
	},
	{
		icon: BarChart3,
		title: "Post Management",
		desc: "Statuses, revisions & ownership at a glance.",
	},
	{
		icon: Search,
		title: "Analytics & Signals",
		desc: "Events & webhooks to iterate smarter.",
	},
]

export function Features() {
	return (
		<section
			id="features"
			className="relative border-t border-border/40 py-28 overflow-hidden"
		>
			<div className="mx-auto max-w-6xl px-6">
				<AnimatedGroup
					preset="blur-slide"
					stagger={100}
					className="flex flex-col gap-6 mb-16 max-w-3xl"
				>
					<h2 className="ag-item text-4xl md:text-5xl font-bold tracking-tight">
						Streamline Your Workflow
					</h2>
					<p className="ag-item text-base md:text-lg text-muted-foreground leading-relaxed">
						Focused capability set engineered to reduce friction from idea
						→ draft → publish.
					</p>
				</AnimatedGroup>

				<AnimatedGroup
					preset="blur-slide"
					stagger={85}
					className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
				>
					{features.map((f) => (
						<div
							key={f.title}
							className="ag-item group relative rounded-xl border border-border/55 bg-background/40 backdrop-blur p-5 flex flex-col
                        overflow-hidden feature-animate hover:border-border hover:shadow-[0_0_0_1px_rgba(255,255,255,0.07)]"
						>
							{/* Shine sweep */}
							<span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.07),transparent)] bg-[length:300%_100%] animate-shine" />
							<div className="relative">
								<div className="icon-wrap w-11 h-11 mb-4 rounded-lg bg-yellow-500/10 flex items-center justify-center ring-1 ring-yellow-500/25 group-hover:ring-yellow-500/40 transition">
									<f.icon className="h-5 w-5 text-yellow-500 icon-pulse" />
								</div>
								<h3 className="font-medium text-sm tracking-tight mb-2">
									{f.title}
								</h3>
								<p className="text-xs text-muted-foreground leading-relaxed pr-1">
									{f.desc}
								</p>
							</div>
						</div>
					))}
				</AnimatedGroup>
			</div>
		</section>
	)
}
