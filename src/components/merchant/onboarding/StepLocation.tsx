'use client'

interface StepLocationProps {
  data: {
    address: string
    city: string
    state: string
    zipCode: string
    phone: string
  }
  onChange: (data: { address: string; city: string; state: string; zipCode: string; phone: string }) => void
}

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' },
]

export default function StepLocation({ data, onChange }: StepLocationProps) {
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/)
    if (match) {
      const parts = [match[1], match[2], match[3]].filter(Boolean)
      if (parts.length === 0) return ''
      if (parts.length === 1) return parts[0]
      if (parts.length === 2) return `(${parts[0]}) ${parts[1]}`
      return `(${parts[0]}) ${parts[1]}-${parts[2]}`
    }
    return value
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    onChange({ ...data, phone: formatted })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-secondary mb-2">Where are you located?</h2>
        <p className="text-muted">Nearby employees will find you easily</p>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-secondary mb-2">
          Street Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="address"
          value={data.address}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          placeholder="123 Main Street"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-secondary mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="city"
            value={data.city}
            onChange={(e) => onChange({ ...data, city: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="San Francisco"
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-secondary mb-2">
            State <span className="text-red-500">*</span>
          </label>
          <select
            id="state"
            value={data.state}
            onChange={(e) => onChange({ ...data, state: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          >
            <option value="">Select state</option>
            {US_STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-secondary mb-2">
            ZIP Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="zipCode"
            value={data.zipCode}
            onChange={(e) => onChange({ ...data, zipCode: e.target.value.replace(/\D/g, '').slice(0, 5) })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="94102"
            maxLength={5}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-secondary mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={data.phone}
            onChange={handlePhoneChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>
    </div>
  )
}
