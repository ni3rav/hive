import {
  Code2,
  LayoutDashboard,
  PenTool,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Management",
    description:
      "Intuitive UI for easy author, category, tags, and post management.",
  },
  {
    icon: PenTool,
    title: "Writing Experience",
    description:
      "Smooth writing experience with just the right tools of formatting.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Seamless workspace-based collaboration.",
  },
  {
    icon: Code2,
    title: "API Access",
    description:
      "Straightforward API access that works with any framework: Next, Astro, Express, etc.",
  },
  {
    icon: ShieldCheck,
    title: "Role Based Control",
    description:
      "Secure your workspace with granular permissions and role-based access control.",
  },
  {
    icon: Sparkles,
    title: "More Coming Soon",
    description:
      "We are constantly adding new features to make your experience better.",
  },
];

const Features = () => {
  return (
    <div className="flex items-center justify-center py-32">
      <div>
        <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-center">
          Everything You Need
        </h2>
        <div className="mt-10 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-(--breakpoint-lg) mx-auto px-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col border border-foreground/20 rounded-xl py-6 px-5"
            >
              <div className="mb-4 h-10 w-10 flex items-center justify-center bg-muted rounded-full">
                <feature.icon className="size-5" />
              </div>
              <span className="text-lg font-semibold">{feature.title}</span>
              <p className="mt-1 text-foreground/80 text-[15px]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
