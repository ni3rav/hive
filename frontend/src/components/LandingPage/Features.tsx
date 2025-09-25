import React, { useState, useEffect, useRef } from "react"
import { Calendar, Edit3, Settings, BarChart3, Search } from "lucide-react"

const features = [
    {
        icon: Calendar,
        title: "Scheduling & Planning",
        desc: "Gain timeline clarity with a comprehensive overview of posts, content owners, and crucial deadlines, ensuring nothing falls through the cracks.",
    },
    {
        icon: Edit3,
        title: "Clean Writing Experience",
        desc: "Enjoy a distraction-free, keyboard-first editor that supports rich media and intuitive formatting, letting your ideas flow effortlessly onto the page.",
    },
    {
        icon: Settings,
        title: "Metadata & SEO",
        desc: "Fine-tune your content for maximum reach by optimizing its structure, managing tags, and perfecting search engine and social media previews, all inline.",
    },
    {
        icon: BarChart3,
        title: "Post Management",
        desc: "Keep your content pipeline organized with clear statuses, accessible revision history, and defined ownership, all available at a single glance.",
    },
    {
        icon: Search,
        title: "Analytics & Signals",
        desc: "Connect events and webhooks to your workflow to gather actionable data, helping you iterate faster and make smarter, data-driven content decisions.",
    },
]

export function Features() {
    const [activeIndex, setActiveIndex] = useState(0)
    const featureRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = parseInt(entry.target.getAttribute("data-index") || "0", 10)
                        setActiveIndex(index)
                    }
                })
            },
            // This triggers the change when a feature card is in the vertical center of the screen
            { rootMargin: "-50% 0px -50% 0px" }
        )

        featureRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref)
        })

        return () => {
            featureRefs.current.forEach((ref) => {
                if (ref) observer.unobserve(ref)
            })
        }
    }, [])

    const ActiveFeature = features[activeIndex]

    return (
        <section
            id="features"
            className="relative border-t border-border/40 py-28"
        >
            <div className="mx-auto max-w-6xl px-6 grid lg:grid-cols-2 lg:gap-20">
                {/* Left Column (Sticky) */}
                <div className="lg:sticky top-28 h-fit">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Streamline Your Workflow
                    </h2>
                    <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed">
                        Focused capability set engineered to reduce friction from idea → draft → publish.
                    </p>
                    <div className="mt-12 hidden lg:block">
                        {/* The active feature's details are shown here */}
                        <div className="relative h-20 w-full">
                            {features.map((f, index) => (
                                <div key={f.title} className={`absolute inset-0 transition-opacity duration-300 ${activeIndex === index ? 'opacity-100' : 'opacity-0'}`}>
                                    <div className="w-12 h-12 mb-4 rounded-lg bg-secondary/10 flex items-center justify-center ring-1 ring-secondary/25">
                                        <ActiveFeature.icon className="h-6 w-6 text-secondary" />
                                    </div>
                                    <h3 className="font-medium text-lg tracking-tight mb-2">
                                        {ActiveFeature.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed pr-1">
                                        {ActiveFeature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column (Scrolling) */}
                <div className="flex flex-col gap-8 mt-12 lg:mt-0">
                    {features.map((f, index) => (
                        <div
                            key={f.title}
                            ref={(el) => { featureRefs.current[index] = el }}
                            data-index={index}
                            className={`group rounded-xl border p-6 transition-all duration-300
                                ${activeIndex === index
                                    // Change: Using secondary color for the active card
                                    ? "border-secondary/50 bg-secondary/5 shadow-md shadow-secondary/10"
                                    : "border-border/55 bg-background/40"
                                }`}
                        >
                            {/* Mobile-only view of feature details */}
                            <div className="lg:hidden">
                                <div className="w-11 h-11 mb-4 rounded-lg bg-secondary/10 flex items-center justify-center ring-1 ring-secondary/25">
                                    <f.icon className="h-5 w-5 text-secondary" />
                                </div>
                                <h3 className="font-medium tracking-tight mb-2">{f.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed pr-1">{f.desc}</p>
                            </div>
                            {/* Desktop-only view of feature titles */}
                            <div className="hidden lg:block">
                                <h3 className={`font-medium tracking-tight ${activeIndex === index ? 'text-foreground' : 'text-muted-foreground'}`}>{f.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}