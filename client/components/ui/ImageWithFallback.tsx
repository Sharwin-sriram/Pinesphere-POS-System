"use client"
import React, { useState } from 'react'
import Image, { ImageProps } from 'next/image'

type Props = Omit<ImageProps, 'src'> & {
  src?: string
  fallbackSrc?: string
  showLoader?: boolean
  showFallbackBadge?: boolean
}

function resolveFallback(src?: string, explicitFallback?: string) {
  if (explicitFallback) return explicitFallback
  if (!src) return '/images/placeholder.svg'
  if (src.includes('/images/dashboard/')) return '/images/dashboard/fallback.svg'
  if (src.includes('/images/categories/')) return '/images/categories/fallback.svg'
  if (src.includes('/images/items/')) return '/images/items/fallback.svg'
  if (src.includes('/images/combos/')) return '/images/combos/fallback.svg'
  if (src.includes('/images/menu/')) return '/images/menu/fallback.svg'
  return '/images/placeholder.svg'
}

export default function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  className = '',
  onLoad,
  onError,
  showLoader = true,
  showFallbackBadge = false,
  ...rest
}: Props) {
  const resolvedFallback = resolveFallback(src, fallbackSrc)
  const [imgSrc, setImgSrc] = useState(src || resolvedFallback)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isFallback, setIsFallback] = useState(!src)

  return (
    <>
      {showLoader ? (
        <span
          aria-hidden="true"
          className={`absolute inset-0 overflow-hidden bg-[rgba(15,23,42,0.7)] transition-opacity duration-300 ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <span className="absolute inset-0 animate-shimmer bg-[var(--color-bg-tertiary)]" />
        </span>
      ) : null}

      <Image
        src={imgSrc}
        alt={alt || 'image'}
        {...rest}
        className={`${className} transition-opacity duration-500 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={(event) => {
          setIsLoaded(true)
          onLoad?.(event)
        }}
        onError={(event) => {
          if (imgSrc !== resolvedFallback) {
            setImgSrc(resolvedFallback)
            setIsLoaded(false)
            setIsFallback(true)
          } else {
            setIsLoaded(true)
          }
          onError?.(event)
        }}
      />

      {showFallbackBadge && isFallback && isLoaded ? (
        <span className="absolute bottom-3 right-3 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-200">
          Local fallback
        </span>
      ) : null}
    </>
  )
}
