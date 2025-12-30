import ScrollReveal from './ScrollReveal'

const testimonials = [
  {
    quote: "I walked into a new place last week. Before I could even explain, they said 'Oh, you're with Google!' Made my day.",
    author: "David Kim",
    title: "Product Manager",
    company: "Google",
    avatar: "DK",
  },
  {
    quote: "We used to see the same 20 faces every day. Now we've got people coming in who say 'I heard you're part of the corbez thing.' Best marketing we never paid for.",
    author: "Maria Santos",
    title: "Owner",
    company: "Café Loma",
    avatar: "MS",
  },
  {
    quote: "It's become a thing in our office. 'Did you get your corbez yet?' Like you're not really one of us until you do.",
    author: "James Wright",
    title: "Software Engineer",
    company: "Stripe",
    avatar: "JW",
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Real people. Real recognition.
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Don&apos;t take our word for it. Take theirs.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <ScrollReveal key={testimonial.author} delay={100 + index * 150}>
              <div className="bg-gray-50 rounded-2xl p-8 relative h-full hover:shadow-lg transition-shadow">
                {/* Quote mark */}
                <div className="absolute top-6 right-6 text-primary/20 text-6xl font-serif">
                  &ldquo;
                </div>

                <p className="text-gray-700 mb-6 relative z-10 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-secondary">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-muted">
                      {testimonial.title}, {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
