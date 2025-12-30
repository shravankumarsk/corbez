'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import QRScanner from '@/components/scanner/QRScanner'
import ManualEntry from '@/components/scanner/ManualEntry'
import VerificationResult from '@/components/scanner/VerificationResult'

type ScanMode = 'camera' | 'manual'
type ScanState = 'idle' | 'scanning' | 'result'

interface DiscountInfo {
  percentage: number
  name: string
  type: string
}

interface VerificationData {
  success: boolean
  employeeName?: string
  companyName?: string
  discount?: DiscountInfo
  errorMessage?: string
}

export default function ScannerPage() {
  const [mode, setMode] = useState<ScanMode>('camera')
  const [state, setState] = useState<ScanState>('idle')
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerificationData | null>(null)
  const [merchantId, setMerchantId] = useState<string | null>(null)

  // Fetch merchant ID on mount
  useEffect(() => {
    const fetchMerchantId = async () => {
      try {
        const response = await fetch('/api/merchant/me')
        const data = await response.json()
        if (data.success && data.merchant?._id) {
          setMerchantId(data.merchant._id)
        }
      } catch (error) {
        console.error('Failed to fetch merchant:', error)
      }
    }

    fetchMerchantId()
  }, [])

  const handleVerify = async (data: string) => {
    setIsVerifying(true)

    try {
      // Extract token from URL or use raw data
      let token = data
      if (data.includes('/verify/')) {
        token = data.split('/verify/')[1]
      }

      // Include merchantId for discount calculation
      const url = merchantId
        ? `/api/verify/${encodeURIComponent(token)}?merchantId=${merchantId}`
        : `/api/verify/${encodeURIComponent(token)}`

      const response = await fetch(url)
      const json = await response.json()

      setResult({
        success: json.success,
        employeeName: json.data?.employeeName,
        companyName: json.data?.companyName,
        discount: json.data?.discount,
        errorMessage: json.error,
      })
      setState('result')
    } catch (error) {
      setResult({
        success: false,
        errorMessage: 'Failed to verify. Please try again.',
      })
      setState('result')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setState('idle')
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Verify Employee</h1>
        <p className="text-gray-600 mt-1">Scan a QR code or enter a verification code</p>
      </div>

      {state === 'result' && result ? (
        <Card variant="bordered">
          <CardContent>
            <VerificationResult
              success={result.success}
              employeeName={result.employeeName}
              companyName={result.companyName}
              discount={result.discount}
              errorMessage={result.errorMessage}
              onReset={handleReset}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setMode('camera')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'camera' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Scan QR Code
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Enter Code
            </button>
          </div>

          <Card variant="bordered">
            <CardContent className="py-6">
              {mode === 'camera' ? (
                <QRScanner onScan={handleVerify} onError={(error) => console.error(error)} />
              ) : (
                <ManualEntry onSubmit={handleVerify} isLoading={isVerifying} />
              )}
            </CardContent>
          </Card>

          {/* Help text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Having trouble?{' '}
              <button className="text-blue-600 hover:underline" onClick={() => setMode(mode === 'camera' ? 'manual' : 'camera')}>
                Try {mode === 'camera' ? 'manual entry' : 'QR scanning'}
              </button>
            </p>
          </div>
        </>
      )}
    </div>
  )
}
