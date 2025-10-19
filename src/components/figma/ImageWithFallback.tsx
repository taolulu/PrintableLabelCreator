import React, { useState } from 'react'
import { getImageBlob } from '../../lib/idbImages';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)
  const handleError = () => {
    setDidError(true)
  }

  const handleLoad = () => {
    // Clear any prior error state on successful load
    if (didError) {
      // cleared error state on successful load
    }
    setDidError(false)
  }

  const { src, alt, style, className, ...rest } = props

  // Reset error flag whenever src changes so we attempt to load a new image
  React.useEffect(() => {
    setDidError(false)
  }, [src])

  if (!src) {
    // Render an inline SVG placeholder when there is no src
    return (
      <div className={`inline-flex items-center justify-center ${className ?? ''}`} style={style}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <rect x="2" y="3" width="20" height="14" rx="2" stroke="#e5e7eb" strokeWidth="1.5" fill="none" />
          <path d="M3 18c0-.552.448-1 1-1h16c.552 0 1 .448 1 1v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-1z" fill="#f9fafb"/>
          <circle cx="8.5" cy="9.5" r="1.8" fill="#e5e7eb" />
        </svg>
      </div>
    )
  }
  if (didError) {
    // Render same SVG placeholder on load error
    return (
      <div className={`inline-flex items-center justify-center ${className ?? ''}`} style={style}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <rect x="2" y="3" width="20" height="14" rx="2" stroke="#e5e7eb" strokeWidth="1.5" fill="none" />
          <path d="M3 18c0-.552.448-1 1-1h16c.552 0 1 .448 1 1v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-1z" fill="#f9fafb"/>
          <circle cx="8.5" cy="9.5" r="1.8" fill="#e5e7eb" />
        </svg>
      </div>
    )
  }
  // If src is an idb URL, attempt to load blob and use object URL for display
  if (src && src.startsWith('idb://')) {
    const id = src.replace('idb://', '');
    const [objectUrl, setObjectUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
      let mounted = true;
      let url: string | undefined;
      (async () => {
        try {
          const blob = await getImageBlob(id);
          if (!mounted) return;
          if (blob) {
            url = URL.createObjectURL(blob);
            setObjectUrl(url);
          } else {
            setDidError(true);
          }
        } catch (e) {
          setDidError(true);
        }
      })();

      return () => {
        mounted = false;
        if (url) {
          URL.revokeObjectURL(url);
        }
      }
    }, [id]);

    if (objectUrl) {
      return <img src={objectUrl} alt={alt} className={className} style={style} {...rest} onError={handleError} onLoad={handleLoad} />
    }

    return (
      <div className={`inline-flex items-center justify-center ${className ?? ''}`} style={style}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <rect x="2" y="3" width="20" height="14" rx="2" stroke="#e5e7eb" strokeWidth="1.5" fill="none" />
          <path d="M3 18c0-.552.448-1 1-1h16c.552 0 1 .448 1 1v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-1z" fill="#f9fafb"/>
          <circle cx="8.5" cy="9.5" r="1.8" fill="#e5e7eb" />
        </svg>
      </div>
    )
  }

  return (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={handleError} onLoad={handleLoad} />
  )
}
