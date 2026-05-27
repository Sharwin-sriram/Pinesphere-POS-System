"use client"
import React, { useEffect, useState } from 'react'
import Image, { ImageProps } from 'next/image'

type Props = Omit<ImageProps, 'src'> & {
  src?: string
  fallbackSrc?: string
  showLoader?: boolean
  showFallbackBadge?: boolean
}

const DEFAULT_FALLBACK = '/images/fallbacks/default-restaurant.jpg'
const GLOBAL_MENU_FALLBACK = '/images/menu/fallback.jpg'
const MENU_IMAGE_GROUPS = ['dashboard', 'categories', 'items', 'modifiers', 'combos', 'pricing'] as const

function normalizeMenuAssetPath(src?: string) {
  if (!src) return undefined

  for (const group of MENU_IMAGE_GROUPS) {
    const legacyPrefix = `/images/${group}/`
    if (src.includes(legacyPrefix)) {
      return src.replace(legacyPrefix, `/images/menu/${group}/`)
    }
  }

  return src
}

function resolveMenuImageGroup(src?: string) {
  if (!src) return null

  for (const group of MENU_IMAGE_GROUPS) {
    if (src.includes(`/images/menu/${group}/`) || src.includes(`/images/${group}/`)) {
      return group
    }
  }

  return null
}

function buildFallbackChain(src?: string, explicitFallback?: string) {
  const normalizedSrc = normalizeMenuAssetPath(src)
  const imageGroup = resolveMenuImageGroup(normalizedSrc ?? src)
  const groupFallback = explicitFallback || (imageGroup ? `/images/menu/${imageGroup}/fallback.jpg` : undefined)

  const rasterExts = ['.jpg', '.png', '.webp']

  const makeRasterCandidates = (entry?: string) => {
    if (!entry) return [] as string[]
    const parts = entry.split('?')
    const url = parts[0]
    const qs = parts[1] ? `?${parts[1]}` : ''
    const dotIndex = url.lastIndexOf('.')
    const base = dotIndex > -1 ? url.slice(0, dotIndex) : url
    const candidates: string[] = []
    for (const ext of rasterExts) {
      candidates.push(`${base}${ext}${qs}`)
    }
    // also keep the original candidate (svg or otherwise)
    candidates.push(`${base}${dotIndex > -1 ? url.slice(dotIndex) : ''}${qs}`)
    return candidates
  }

  const chainOrder = [normalizedSrc, groupFallback, GLOBAL_MENU_FALLBACK, DEFAULT_FALLBACK]
  const expanded: string[] = []
  for (const entry of chainOrder) {
    if (!entry) continue
    const candidates = makeRasterCandidates(entry)
    for (const c of candidates) expanded.push(c)
  }

  return Array.from(new Set(expanded))
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
  const fallbackChain = buildFallbackChain(src, fallbackSrc)
  const [fallbackIndex, setFallbackIndex] = useState(0)
  const [imgSrc, setImgSrc] = useState(fallbackChain[0] || DEFAULT_FALLBACK)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isFallback, setIsFallback] = useState(!src)

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[ImageWithFallback] selected src ->', imgSrc)
  }, [imgSrc])

  useEffect(() => {
    let mounted = true

    async function resolveFirstAvailable() {
      const nextChain = buildFallbackChain(src, fallbackSrc)
      setFallbackIndex(0)
      setIsFallback(!src)
      setIsLoaded(false)

      // Helper to probe a candidate by creating an Image element
      const probe = (url?: string) =>
        new Promise<boolean>((resolve) => {
          if (!url) return resolve(false)
          const img = new window.Image()
          img.onload = () => resolve(true)
          img.onerror = () => resolve(false)
          img.src = url
        })

      for (let i = 0; i < nextChain.length; i++) {
        const candidate = nextChain[i]
        // try candidate
        // log attempt for debugging
        // eslint-disable-next-line no-console
        console.log('[ImageWithFallback] probing', candidate)
        // probe
        // handle relative paths by ensuring leading '/'
        const url = candidate
        // Wait for probe result
        // If found, set as current src and stop
        // Note: probe will resolve quickly for cached assets or 404s
        // eslint-disable-next-line no-await-in-loop
        const ok = await probe(url)
        // eslint-disable-next-line no-console
        if (!ok) console.warn('[ImageWithFallback] failed to load', url)
        if (mounted && ok) {
          setFallbackIndex(i)
          setImgSrc(url)
          return
        }
      }

      // none found -> fall back to first chain value
      if (mounted) {
        setFallbackIndex(0)
        setImgSrc(nextChain[0] || DEFAULT_FALLBACK)
      }
    }

    resolveFirstAvailable()

    return () => {
      mounted = false
    }
  }, [src, fallbackSrc])

  return (
    <>
      {showLoader ? (
        <span
          aria-hidden="true"
          className={`absolute inset-0 overflow-hidden bg-slate-900/70 transition-opacity duration-300 ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <span className="absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,rgba(255,255,255,0)_20%,rgba(255,255,255,0.16)_45%,rgba(255,255,255,0)_70%)] bg-size-[200%_100%]" />
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
          const nextFallback = fallbackChain[fallbackIndex + 1]

          if (nextFallback) {
            setFallbackIndex((current) => current + 1)
            setImgSrc(nextFallback)
            setIsLoaded(false)
            setIsFallback(true)
          } else {
            setIsLoaded(true)
          }
          onError?.(event)
        }}
      />

      
    </>
  )
}
