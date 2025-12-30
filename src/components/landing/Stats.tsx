import ScrollReveal from './ScrollReveal'

const stats = [
  {
    value: '500+',
    label: 'Companies',
    description: 'trust their people with us',
  },
  {
    value: '25K+',
    label: 'People',
    description: 'walking in like they own the place',
  },
  {
    value: '150+',
    label: 'Restaurants',
    description: 'building their lunch crowd',
  },
  {
    value: '$2M+',
    label: 'Saved',
    description: 'and counting',
  },
]

export default function Stats() {
  return (
    <section className="py-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              This isn&apos;t new. It&apos;s just getting started.
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Every number here is a real person who decided lunch could be better.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <ScrollReveal key={stat.label} delay={100 + index * 100}>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-primary-light mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-white/60">
                  {stat.description}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
