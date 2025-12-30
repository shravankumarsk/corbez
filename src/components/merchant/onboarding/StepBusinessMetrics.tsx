'use client'

interface StepBusinessMetricsProps {
  data: {
    avgOrderValue: number
    priceTier: string
    seatingCapacity: string
    peakHours: string[]
    cateringAvailable: boolean
    offersDelivery: boolean
  }
  onChange: (data: {
    avgOrderValue: number
    priceTier: string
    seatingCapacity: string
    peakHours: string[]
    cateringAvailable: boolean
    offersDelivery: boolean
  }) => void
}

const PRICE_TIERS = [
  { value: '$', label: '$', description: 'Under $15' },
  { value: '$$', label: '$$', description: '$15-$30' },
  { value: '$$$', label: '$$$', description: '$30-$60' },
  { value: '$$$$', label: '$$$$', description: '$60+' },
]

const SEATING_OPTIONS = [
  { value: 'SMALL', label: 'Small', description: '1-30 seats' },
  { value: 'MEDIUM', label: 'Medium', description: '31-75 seats' },
  { value: 'LARGE', label: 'Large', description: '76+ seats' },
]

const PEAK_HOURS = [
  { value: 'BREAKFAST', label: 'Breakfast', icon: '🌅' },
  { value: 'LUNCH', label: 'Lunch', icon: '☀️' },
  { value: 'DINNER', label: 'Dinner', icon: '🌙' },
  { value: 'LATE_NIGHT', label: 'Late Night', icon: '🌃' },
]

export default function StepBusinessMetrics({ data, onChange }: StepBusinessMetricsProps) {
  const togglePeakHour = (hour: string) => {
    const newPeakHours = data.peakHours.includes(hour)
      ? data.peakHours.filter((h) => h !== hour)
      : [...data.peakHours, hour]
    onChange({ ...data, peakHours: newPeakHours })
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-secondary mb-2">A few more details</h2>
        <p className="text-muted">This helps us show potential savings to corporate partners</p>
      </div>

      {/* Average Order Value */}
      <div>
        <label htmlFor="avgOrderValue" className="block text-sm font-medium text-secondary mb-2">
          Average Order Value <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            id="avgOrderValue"
            value={data.avgOrderValue || ''}
            onChange={(e) => onChange({ ...data, avgOrderValue: parseFloat(e.target.value) || 0 })}
            className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="15"
            min={1}
            max={500}
          />
        </div>
        <p className="text-xs text-muted mt-1">Typical amount a customer spends per visit</p>
      </div>

      {/* Price Tier */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-3">
          Price Range <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-4 gap-3">
          {PRICE_TIERS.map((tier) => (
            <button
              key={tier.value}
              type="button"
              onClick={() => onChange({ ...data, priceTier: tier.value })}
              className={`py-4 rounded-xl border-2 text-center transition-all ${
                data.priceTier === tier.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className={`text-2xl font-bold ${data.priceTier === tier.value ? 'text-primary' : 'text-gray-700'}`}>
                {tier.label}
              </span>
              <p className="text-xs text-muted mt-1">{tier.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Seating Capacity */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-3">
          Seating Capacity <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {SEATING_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ ...data, seatingCapacity: option.value })}
              className={`py-4 rounded-xl border-2 text-center transition-all ${
                data.seatingCapacity === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className={`font-semibold ${data.seatingCapacity === option.value ? 'text-primary' : 'text-gray-700'}`}>
                {option.label}
              </span>
              <p className="text-xs text-muted mt-1">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Peak Hours */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-3">
          When are you busiest? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PEAK_HOURS.map((hour) => (
            <button
              key={hour.value}
              type="button"
              onClick={() => togglePeakHour(hour.value)}
              className={`py-4 rounded-xl border-2 text-center transition-all ${
                data.peakHours.includes(hour.value)
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl block mb-1">{hour.icon}</span>
              <span className={`font-medium text-sm ${data.peakHours.includes(hour.value) ? 'text-primary' : 'text-gray-700'}`}>
                {hour.label}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted mt-2">Select all that apply</p>
      </div>

      {/* Catering */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="font-medium text-secondary">Do you offer catering?</p>
          <p className="text-sm text-muted">Corporate events, team lunches, etc.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...data, cateringAvailable: !data.cateringAvailable })}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            data.cateringAvailable ? 'bg-primary' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
              data.cateringAvailable ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Delivery */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="font-medium text-secondary">Do you offer your own delivery?</p>
          <p className="text-sm text-muted">Direct delivery by your restaurant (not third-party apps)</p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...data, offersDelivery: !data.offersDelivery })}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            data.offersDelivery ? 'bg-primary' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
              data.offersDelivery ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  )
}
