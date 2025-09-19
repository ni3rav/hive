import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Edit3,
  Settings,
  BarChart3,
  Search,
  ArrowRight,
  Hexagon,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Scheduling & Planning",
    description:
      "Plan your work with simple scheduling tools, publish and amplify your voice.",
    buttonText: "LEARN MORE",
  },
  {
    icon: Edit3,
    title: "Scheduling & Editor",
    description:
      "Plan or content via our scheduler. Enhance and edit all your content.",
    buttonText: "LEARN MORE",
  },
  {
    icon: Settings,
    title: "Metadata & SEO Editor",
    description:
      "Optimize your metadata, enhance your content for search engine optimization.",
    buttonText: "LEARN MORE",
  },
  {
    icon: BarChart3,
    title: "Seamless Post Management",
    description:
      "Organize content via an advanced interface. Manage all your content with ease.",
    buttonText: "LEARN MORE",
  },
  {
    icon: Search,
    title: "Analytics & Webhooks",
    description:
      "Gather feedback from all integrations and manage all your analytics.",
    buttonText: "LEARN MORE",
  },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Hexagon className="h-8 w-8 text-primary fill-background" />
          <span className="text-xl font-bold text-foreground">Hive</span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/login")}
            className="text-muted-foreground hover:text-foreground"
          >
            Log in
          </Button>
          <Button
            onClick={() => navigate("/login")}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
          >
            Start Publishing
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
               Where Blogs Stay Organized And
                <br />
                <span className="text-foreground">Under Control</span> 
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
              From content planning to publishing and analytics, Hive makes blog management seamless and professional.
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium text-lg px-8 py-3"
            >
              Start Writing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src="/tiptap-hero.png"
                alt="Hive Editor Interface"
                className="w-full h-auto object-cover"
              />
              {/* Optional overlay for better text contrast if needed */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="mt-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Streamline Your Workflow
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-card border hover:shadow-lg transition-shadow h-full flex flex-col"
              >
                <CardHeader className="text-center space-y-4 flex-1">
                  <div className="mx-auto w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="space-y-3">
                    <CardTitle className="text-lg font-semibold mb-2">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground min-h-[60px] flex items-center">
                      {feature.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 font-medium"
                  >
                    {feature.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-24 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2024 Hive. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}