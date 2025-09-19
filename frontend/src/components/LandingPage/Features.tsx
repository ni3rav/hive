import { Calendar, Edit, Settings, Share, BarChart, Sparkles, Zap, Shield } from "lucide-react";

const features = [
	{
		icon: Calendar,
		title: "Scheduling & Planning",
		description: "Plan posts and manage drafts with calendar view.",
		gradient: "from-blue-500 via-blue-600 to-purple-600",
		iconBg: "bg-blue-500/10 border-blue-500/20",
		iconColor: "text-blue-400",
	},
	{
		icon: Edit,
		title: "Rich Editor",
		description: "Write in a clean, focused editor environment.",
		gradient: "from-green-500 via-emerald-600 to-teal-600",
		iconBg: "bg-green-500/10 border-green-500/20",
		iconColor: "text-green-400",
	},
	{
		icon: Settings,
		title: "Metadata & SEO",
		description: "Optimize titles, tags and descriptions.",
		gradient: "from-purple-500 via-violet-600 to-indigo-600",
		iconBg: "bg-purple-500/10 border-purple-500/20",
		iconColor: "text-purple-400",
	},
	{
		icon: Share,
		title: "Post Management",
		description: "Organize content and manage drafts efficiently.",
		gradient: "from-orange-500 via-red-500 to-pink-600",
		iconBg: "bg-orange-500/10 border-orange-500/20",
		iconColor: "text-orange-400",
	},
	{
		icon: BarChart,
		title: "Analytics & Webhooks",
		description: "Track performance with detailed analytics.",
		gradient: "from-red-500 via-rose-600 to-pink-600",
		iconBg: "bg-red-500/10 border-red-500/20",
		iconColor: "text-red-400",
	},
];

export function Features() {
	return (
		<section className="relative py-32 bg-neutral-950 overflow-hidden">
			{/* Advanced Background Effects */}
			<div className="absolute inset-0">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#262626_0,transparent_50%),radial-gradient(circle_at_80%_80%,#1f1f1f_0,transparent_50%)]" />
				<div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl animate-pulse" />
				<div
					className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl animate-pulse"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			<div className="relative mx-auto max-w-7xl px-6">
				{/* Enhanced Header */}
				<div className="text-center mb-20">
					<div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/5 px-6 py-3 text-sm font-medium text-yellow-300 mb-8 backdrop-blur-sm">
						<Sparkles className="h-4 w-4" />
						Powerful Features
					</div>

					<h2 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
						Streamline Your
						<br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">
							Workflow
						</span>
					</h2>

					<p className="text-xl text-neutral-300 max-w-4xl mx-auto leading-relaxed">
						Everything you need to create, manage, and publish content
						efficiently. Built for modern creators who demand precision and
						performance.
					</p>
				</div>

				{/* Enhanced Feature Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
					{features.map((feature, index) => (
						<div
							key={index}
							className="group relative"
							style={{ animationDelay: `${index * 150}ms` }}
						>
							{/* Animated Background Card */}
							<div className="absolute inset-0 bg-gradient-to-br from-neutral-900/80 via-neutral-800/50 to-neutral-900/80 rounded-2xl backdrop-blur-sm border border-neutral-700/50 group-hover:border-yellow-400/50 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-yellow-400/20" />

							{/* Glow Effect on Hover */}
							<div
								className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl`}
							/>

							{/* Content */}
							<div className="relative p-8 h-full flex flex-col">
								{/* Icon with Enhanced Styling */}
								<div
									className={`w-16 h-16 ${feature.iconBg} border rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
								>
									<feature.icon
										className={`w-8 h-8 ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`}
									/>
								</div>

								{/* Title with Gradient Effect */}
								<h3 className="text-xl font-bold text-white mb-4 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-300 group-hover:to-orange-300 transition-all duration-300">
									{feature.title}
								</h3>

								{/* Description */}
								<p className="text-neutral-400 text-sm leading-relaxed mb-8 flex-grow group-hover:text-neutral-300 transition-colors duration-300">
									{feature.description}
								</p>

								{/* Enhanced CTA Button */}
								<div className="relative">
									<button className="w-full relative overflow-hidden bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-black px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-yellow-400/25">
										<span className="relative z-10 flex items-center justify-center gap-2">
											<Zap className="w-4 h-4" />
											LEARN MORE
										</span>
										<div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
									</button>
								</div>
							</div>

							{/* Corner Accent */}
							<div className="absolute top-4 right-4 w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
						</div>
					))}
				</div>

				{/* Bottom CTA Section */}
				<div className="text-center mt-20">
					<div className="inline-flex items-center gap-3 rounded-full border border-green-400/30 bg-green-400/5 px-6 py-3 text-sm font-medium text-green-300 backdrop-blur-sm">
						<Shield className="h-4 w-4" />
						Trusted by 10,000+ content creators
					</div>
				</div>
			</div>
		</section>
	);
}