import Link from 'next/link'
import ScrollReveal from './ScrollReveal'

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-primary-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            The lunch break you deserve starts here
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Your coworkers are already saving. Your favorite restaurant is probably waiting.
            <br className="hidden sm:block" />
            What are you waiting for?
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register?type=employee"
              className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              I Want to Save Money
            </Link>
            <Link
              href="/register?type=merchant"
              className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 border border-white/30 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:-translate-y-0.5"
            >
              I Want More Regulars
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
