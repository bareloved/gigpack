"use client"

import * as React from "react"
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps"
import { MapPin, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface PlaceResult {
  name: string
  address: string
  mapsUrl: string
}

interface VenueAutocompleteProps {
  value?: string
  onChange?: (value: string) => void
  onPlaceSelect?: (place: PlaceResult) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

// Inner component that uses the Places library
function VenueAutocompleteInner({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Search for a venue...",
  disabled = false,
  className,
}: VenueAutocompleteProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value || "")
  const places = useMapsLibrary("places")

  // Sync input value with prop
  React.useEffect(() => {
    setInputValue(value || "")
  }, [value])

  // Function to get computed CSS variable values
  const getCSSVar = React.useCallback((varName: string) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
    return value ? `hsl(${value})` : ""
  }, [])

  // Function to style the input inside shadow DOM
  const styleAutocompleteInput = React.useCallback((autocomplete: Element) => {
    const shadowRoot = (autocomplete as HTMLElement & { shadowRoot: ShadowRoot | null }).shadowRoot
    if (shadowRoot) {
      const input = shadowRoot.querySelector("input")
      if (input) {
        const bgColor = getCSSVar("--background")
        const fgColor = getCSSVar("--foreground")
        const borderColor = getCSSVar("--input")
        const mutedColor = getCSSVar("--muted-foreground")

        input.style.cssText = `
          height: 36px !important;
          width: 100% !important;
          border-radius: 6px !important;
          border: 1px solid ${borderColor} !important;
          background: ${bgColor} !important;
          color: ${fgColor} !important;
          padding: 0 12px !important;
          padding-right: 40px !important;
          font-size: 14px !important;
          outline: none !important;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
        `
        
        // Check if we already added placeholder styles
        if (!shadowRoot.querySelector("[data-placeholder-style]")) {
          const styleEl = document.createElement("style")
          styleEl.setAttribute("data-placeholder-style", "true")
          styleEl.textContent = `input::placeholder { color: ${mutedColor} !important; }`
          shadowRoot.appendChild(styleEl)
        }
        
        return true
      }
    }
    return false
  }, [getCSSVar])

  // Initialize the autocomplete when places library is ready
  React.useEffect(() => {
    if (!places || !containerRef.current) return

    // Create the new Place Autocomplete element
    // @ts-expect-error - PlaceAutocompleteElement exists in newer Places API
    const autocomplete = new places.PlaceAutocompleteElement({})

    // Listen for place selection
    autocomplete.addEventListener("gmp-placeselect", async (event: Event) => {
      const placeEvent = event as google.maps.places.PlaceAutocompletePlaceSelectEvent
      const place = placeEvent.place

      // Fetch additional details
      await place.fetchFields({ 
        fields: ["displayName", "formattedAddress", "googleMapsURI"] 
      })

      const name = place.displayName || ""
      const address = place.formattedAddress || ""
      const mapsUrl = place.googleMapsURI || ""

      setInputValue(name)
      onChange?.(name)
      onPlaceSelect?.({ name, address, mapsUrl })
    })

    // Clear and append
    containerRef.current.innerHTML = ""
    containerRef.current.appendChild(autocomplete)
    
    // Set placeholder on the light DOM input if available
    const input = autocomplete.querySelector("input")
    if (input) {
      input.placeholder = placeholder
    }

    // Apply styles to shadow DOM input - try multiple times as it may take time to render
    styleAutocompleteInput(autocomplete)
    const timers = [
      setTimeout(() => styleAutocompleteInput(autocomplete), 50),
      setTimeout(() => styleAutocompleteInput(autocomplete), 150),
      setTimeout(() => styleAutocompleteInput(autocomplete), 300),
    ]

    setIsReady(true)

    return () => {
      timers.forEach(clearTimeout)
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [places, onChange, onPlaceSelect, placeholder, styleAutocompleteInput])

  // Re-apply styles when theme changes (listen for class changes on html element)
  React.useEffect(() => {
    if (!containerRef.current || !isReady) return
    
    const observer = new MutationObserver(() => {
      const autocomplete = containerRef.current?.querySelector("gmp-place-autocomplete")
      if (autocomplete) {
        styleAutocompleteInput(autocomplete)
      }
    })

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    
    return () => observer.disconnect()
  }, [isReady, styleAutocompleteInput])

  if (!places) {
    return (
      <div className={cn(
        "flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm md:text-sm",
        className
      )}>
        <span className="flex-1 text-muted-foreground">{placeholder}</span>
        <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
      </div>
    )
  }

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className={cn(
          "[&_input]:pr-10",
          disabled && "pointer-events-none opacity-50",
          className
        )}
      />
      {isReady && (
        <div className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2">
          <MapPin className="h-4 w-4 text-green-500 opacity-70" />
        </div>
      )}
    </div>
  )
}

// Wrapper with fallback for when API key is not set
export function VenueAutocomplete(props: VenueAutocompleteProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
  const [inputValue, setInputValue] = React.useState(props.value || "")

  // Sync with prop
  React.useEffect(() => {
    setInputValue(props.value || "")
  }, [props.value])

  // Fallback when no API key
  if (!apiKey) {
    return (
      <div className="relative">
        <Input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            props.onChange?.(e.target.value)
          }}
          placeholder={props.placeholder}
          disabled={props.disabled}
          className={props.className}
        />
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <APIProvider apiKey={apiKey}>
      <VenueAutocompleteInner {...props} />
    </APIProvider>
  )
}
