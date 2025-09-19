type Props = { onGetStarted?: () => void };

export function Hero({ onGetStarted }: Props) {
  return (
    <section className="relative overflow-hidden bg-neutral-950 py-20 lg:py-32">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#262626_0,transparent_40%),radial-gradient(circle_at_80%_0,#1f1f1f_0,transparent_40%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-yellow-400/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800/50 px-4 py-2 text-sm text-neutral-300 mb-8">
              <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
              Powerful for writers
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Master Your Content
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                with Precision.
              </span>
            </h1>
            
            <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              Hive is powerful platformal platform for writers, offering 
              ultratracement toolize, publish, and amplify your voice.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-yellow-400/25"
              >
                Start Writing
              </button>
              <button className="px-8 py-4 border border-neutral-600 text-white hover:bg-neutral-800 rounded-lg text-lg transition-all duration-200">
                Learn more
              </button>
            </div>
          </div>
          
          {/* Right Content - Dashboard Preview */}
          <div className="relative">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl blur-3xl transform -rotate-6" />
            
            {/* Dashboard Frame */}
            <div className="relative bg-neutral-900 border border-neutral-700 rounded-2xl overflow-hidden shadow-2xl">
              {/* Header Bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-neutral-800 border-b border-neutral-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 text-center">
                  <div className="bg-neutral-700 rounded px-3 py-1 text-xs text-neutral-300 inline-block">
                    🐝 Hive
                  </div>
                </div>
                <div className="bg-yellow-400 text-black px-3 py-1 rounded text-xs font-semibold">
                  Start
                </div>
              </div>
              
              {/* Dashboard Content */}
              <div className="aspect-video bg-neutral-900">
                <img
                  src="/tiptap-hero.png"
                  alt="Hive Dashboard Interface"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-yellow-400 text-black px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
              ✨ Live
            </div>
            <div className="absolute -bottom-4 -left-4 bg-neutral-800 border border-neutral-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
              📝 Writing Mode
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}