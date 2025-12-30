'use client'

import { useState } from 'react'
import Image from 'next/image'

interface QRCodeDisplayProps {
  code: string
  qrCodeUrl: string
  title?: string
  subtitle?: string
  expiresAt?: string
  size?: 'sm' | 'md' | 'lg'
  showDownload?: boolean
  showActions?: boolean
  variant?: 'card' | 'modal' | 'inline'
}

export default function QRCodeDisplay({
  code,
  qrCodeUrl,
  title,
  subtitle,
  expiresAt,
  size = 'md',
  showDownload = true,
  showActions = true,
  variant = 'card',
}: QRCodeDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  }

  const handleDownload = async (format: 'png' | 'svg') => {
    setIsDownloading(true)
    try {
      const response = await fetch(`/api/employee/coupon/${code}/qr?format=${format}&size=500`)

      if (!response.ok) {
        throw new Error('Failed to download QR code')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `coupon-${code}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download QR code')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy error:', error)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: title || 'My Corbe Coupon',
      text: `Check out my ${subtitle || 'discount'} coupon!`,
      url: `${window.location.origin}/verify/coupon/${code}`,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.url)
        alert('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Share error:', error)
    }
  }

  const formatExpiry = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = d.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days < 0) return 'Expired'
    if (days === 0) return 'Expires today'
    if (days === 1) return 'Expires tomorrow'
    if (days <= 7) return `Expires in ${days} days`
    return `Expires ${d.toLocaleDateString()}`
  }

  if (variant === 'inline') {
    return (
      <div className="flex flex-col items-center">
        <div className={`${sizeClasses[size]} bg-white p-2 rounded-lg shadow-sm`}>
          {qrCodeUrl ? (
            <Image
              src={qrCodeUrl}
              alt="QR Code"
              width={size === 'lg' ? 256 : size === 'md' ? 192 : 128}
              height={size === 'lg' ? 256 : size === 'md' ? 192 : 128}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
              <span className="text-gray-400 text-sm">Loading...</span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2 font-mono">{code}</p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${variant === 'modal' ? 'max-w-sm mx-auto' : ''}`}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white">
          {title && <h3 className="font-semibold text-lg">{title}</h3>}
          {subtitle && <p className="text-sm text-white/80">{subtitle}</p>}
        </div>
      )}

      {/* QR Code */}
      <div className="p-6 flex flex-col items-center">
        <div className={`${sizeClasses[size]} bg-white p-3 rounded-xl border-2 border-gray-100 shadow-inner`}>
          {qrCodeUrl ? (
            <Image
              src={qrCodeUrl}
              alt="QR Code"
              width={size === 'lg' ? 256 : size === 'md' ? 192 : 128}
              height={size === 'lg' ? 256 : size === 'md' ? 192 : 128}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Code */}
        <div className="mt-4 flex items-center gap-2">
          <span className="font-mono text-lg font-semibold tracking-wider text-gray-800">
            {code}
          </span>
          <button
            onClick={handleCopyCode}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Copy code"
          >
            {copied ? (
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>

        {/* Expiry */}
        {expiresAt && (
          <p className={`mt-2 text-sm ${new Date(expiresAt) < new Date() ? 'text-red-500' : 'text-gray-500'}`}>
            {formatExpiry(expiresAt)}
          </p>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-4 pb-4 flex gap-2">
          {showDownload && (
            <div className="flex-1 flex gap-2">
              <button
                onClick={() => handleDownload('png')}
                disabled={isDownloading}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                PNG
              </button>
              <button
                onClick={() => handleDownload('svg')}
                disabled={isDownloading}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                SVG
              </button>
            </div>
          )}
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="px-4 pb-4">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <strong>How to use:</strong> Show this QR code to the merchant when making your purchase. They will scan it to apply your discount.
          </p>
        </div>
      </div>
    </div>
  )
}
