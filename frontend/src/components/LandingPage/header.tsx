import React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

const nav = [
	{ label: "Features", href: "#features" },
	{ label: "Solution", href: "#solution" },
	{ label: "Pricing", href: "#pricing" },
	{ label: "About", href: "#about" },
]

export function HeroHeader() {
	const [scrolled, setScrolled] = React.useState(false)
	const navigate = useNavigate()
	React.useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 20)
		window.addEventListener("scroll", onScroll)
		onScroll()
		return () => window.removeEventListener("scroll", onScroll)
	}, [])
	return (
		<header className="fixed inset-x-0 top-0 z-50">
			<div
				className={`mx-auto max-w-6xl px-6 transition-colors ${
					scrolled
						? "bg-background/70 backdrop-blur border-b border-border/40"
						: "bg-transparent"
				}`}
			>
				<div className="flex h-20 items-center justify-between">
					<div className="flex items-center gap-10">
						<a href="/" className="shrink-0 flex items-center gap-2">
							<Logo />
							<span className="font-semibold tracking-tight">Hive</span>
						</a>
						<nav className="hidden md:flex gap-7 text-sm">
							{nav.map((i) => (
								<a
									key={i.label}
									href={i.href}
									className="text-muted-foreground hover:text-foreground transition"
								>
									{i.label}
								</a>
							))}
						</nav>
					</div>
					<div className="flex items-center gap-3">
						<Button
							variant="outline"
							size="sm"
							className="border-border/50 hover:bg-yellow-500/10"
							onClick={() => navigate("/login")}
						>
							Login
						</Button>
						<Button
							size="sm"
							className="bg-yellow-500 text-black hover:bg-yellow-500/90"
							onClick={() => navigate("/login")}
						>
							Sign Up
						</Button>
					</div>
				</div>
			</div>
		</header>
	)
}
