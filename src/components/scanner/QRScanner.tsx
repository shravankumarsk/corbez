'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Button from '@/components/ui/Button'

interface QRScannerProps {
  onScan: (data: string) => void
  onError?: (error: string) => void
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)

  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }, [])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })

      streamRef.current = stream
      setHasPermission(true)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsScanning(true)
        scanQRCode()
      }
    } catch (error) {
      console.error('Camera error:', error)
      setHasPermission(false)
      onError?.('Camera access denied. Please enable camera permissions.')
    }
  }, [onError])

  const scanQRCode = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(scanQRCode)
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    // Use BarcodeDetector API if available (Chrome, Edge)
    if ('BarcodeDetector' in window) {
      const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['qr_code'],
      })

      barcodeDetector
        .detect(canvas)
        .then((barcodes: any[]) => {
          if (barcodes.length > 0) {
            const qrData = barcodes[0].rawValue
            stopCamera()
            onScan(qrData)
          } else {
            animationRef.current = requestAnimationFrame(scanQRCode)
          }
        })
        .catch(() => {
          animationRef.current = requestAnimationFrame(scanQRCode)
        })
    } else {
      // Fallback: Continue scanning (in production, use a library like jsQR)
      animationRef.current = requestAnimationFrame(scanQRCode)
    }
  }, [onScan, stopCamera])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  if (hasPermission === false) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">Camera Access Required</h3>
        <p className="text-gray-600 text-sm mb-4">
          Please enable camera permissions in your browser settings to scan QR codes.
        </p>
        <Button variant="primary" onClick={startCamera}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      {!isScanning ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Ready to Scan</h3>
          <p className="text-gray-600 text-sm mb-6">
            Point your camera at the employee&apos;s QR code to verify their discount eligibility.
          </p>
          <Button variant="primary" size="lg" onClick={startCamera}>
            Start Scanning
          </Button>
        </div>
      ) : (
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full max-w-md mx-auto rounded-lg"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanning overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-2 border-blue-500 rounded-lg relative">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-500 rounded-tl" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-500 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-500 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-500 rounded-br" />

              {/* Scanning line animation */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 animate-scan" />
            </div>
          </div>

          <div className="text-center mt-4">
            <Button variant="outline" onClick={stopCamera}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scan {
          0%,
          100% {
            top: 0;
          }
          50% {
            top: 100%;
          }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
