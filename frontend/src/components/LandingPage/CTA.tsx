type Props = {
  onGetStarted: () => void;
};

export function CTA({ onGetStarted }: Props) {
  return (
    <section className="py-20 bg-neutral-950">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Writing?
        </h2>
        <p className="text-xl text-neutral-300 mb-8">
          Join thousands of writers who use Hive to create, schedule, and publish
          amazing content.
        </p>
        <button
          onClick={onGetStarted}
          className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-yellow-400/25"
        >
          Get Started Free
        </button>
      </div>
    </section>
  );
}