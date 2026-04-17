import { Plane, Users, AlertCircle } from 'lucide-react'
import { format, parse } from 'date-fns'

interface FlightCardProps {
  flight: {
    _id: string
    airline: string
    flightNumber: string
    departure: {
      airport: string
      city: string
      date: string
      time: string
    }
    arrival: {
      airport: string
      city: string
      date: string
      time: string
    }
    duration: string
    stops: number
    bookingReference: string
    passengers: string[]
  }
  title: string
  isReturn: boolean
}

export default function FlightCard({ flight, title }: FlightCardProps) {
  const departureDate = parse(flight.departure.date, 'yyyy-MM-dd', new Date())
  const arrivalDate = parse(flight.arrival.date, 'yyyy-MM-dd', new Date())

  return (
    <div className="border border-washi-200 bg-white/60">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-8 py-5 border-b border-washi-200">
        <div>
          <p className="mincho-label mb-1">航空 · Flight</p>
          <h3 className="font-serif text-2xl text-sumi-900">{title}</h3>
        </div>
        <div className="text-right">
          <p className="font-serif text-lg text-ai-500">{flight.airline}</p>
          <p className="text-xs text-sumi-500 tracking-wide mt-1">No. {flight.flightNumber}</p>
        </div>
      </div>

      <div className="px-8 py-8">
        {/* Route */}
        <div className="flex items-start gap-6 mb-10">
          <div className="flex-1">
            <p className="font-serif text-5xl text-sumi-900 leading-none mb-2 tracking-mincho-wide">
              {flight.departure.airport}
            </p>
            <p className="text-xs text-sumi-500 tracking-wide uppercase mb-3">
              {flight.departure.city}
            </p>
            <p className="font-serif text-2xl text-ai-500">{flight.departure.time}</p>
            <p className="text-xs text-sumi-500 tracking-wide mt-1">
              {format(departureDate, 'EEE · MMM d, yyyy')}
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center pt-4">
            <div className="flex items-center w-full">
              <span className="w-1.5 h-1.5 bg-ai-500 rounded-full" aria-hidden />
              <span className="flex-1 h-px bg-ai-500/30" aria-hidden />
              <Plane size={14} strokeWidth={1.5} className="text-ai-500 mx-1" />
              <span className="flex-1 h-px bg-ai-500/30" aria-hidden />
              <span className="w-1.5 h-1.5 bg-ai-500 rounded-full" aria-hidden />
            </div>
            <p className="mt-3 text-xs text-sumi-500 tracking-mincho-wide uppercase">
              {flight.duration}
            </p>
          </div>

          <div className="flex-1 text-right">
            <p className="font-serif text-5xl text-sumi-900 leading-none mb-2 tracking-mincho-wide">
              {flight.arrival.airport}
            </p>
            <p className="text-xs text-sumi-500 tracking-wide uppercase mb-3">
              {flight.arrival.city}
            </p>
            <p className="font-serif text-2xl text-ai-500">{flight.arrival.time}</p>
            <p className="text-xs text-sumi-500 tracking-wide mt-1">
              {format(arrivalDate, 'EEE · MMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-3 gap-0 border-y border-washi-200 mb-8">
          <div className="px-4 py-4 border-r border-washi-200">
            <p className="mincho-label mb-1">Stops</p>
            <p className="font-serif text-lg text-sumi-900">
              {flight.stops === 0 ? 'Direct' : flight.stops === 1 ? '1 stop' : `${flight.stops} stops`}
            </p>
          </div>
          <div className="px-4 py-4 border-r border-washi-200">
            <p className="mincho-label mb-1">Duration</p>
            <p className="font-serif text-lg text-sumi-900">{flight.duration}</p>
          </div>
          <div className="px-4 py-4">
            <p className="mincho-label mb-1">Flight No.</p>
            <p className="font-serif text-lg text-sumi-900">{flight.flightNumber}</p>
          </div>
        </div>

        {/* Booking ref */}
        <div className="accent-rule mb-8">
          <p className="mincho-label mb-2">Booking Reference</p>
          <p className="font-serif text-2xl text-ai-500 tracking-mincho-wide">
            {flight.bookingReference}
          </p>
          <p className="text-xs text-sumi-500 tracking-wide mt-2">
            Keep this for check-in and airline contact.
          </p>
        </div>

        {/* Passengers */}
        {flight.passengers.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Users size={14} strokeWidth={1.5} className="text-ai-500" />
              <p className="mincho-label">Passengers · {flight.passengers.length}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-y border-washi-200">
              {flight.passengers.map((passenger, idx) => (
                <div
                  key={idx}
                  className={`px-4 py-3 text-sm text-sumi-800 font-serif ${
                    idx % 2 === 0 ? 'md:border-r border-washi-200' : ''
                  } ${idx >= 2 ? 'border-t border-washi-200' : ''}`}
                >
                  {passenger}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="flex gap-3 border border-washi-200 bg-washi-100/40 px-5 py-4">
          <AlertCircle size={16} strokeWidth={1.5} className="text-ai-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-sumi-700 leading-relaxed">
            <p className="mincho-label mb-1">Before departure</p>
            <ul className="space-y-1 text-xs text-sumi-600">
              <li>— Online check-in opens 24 hours prior.</li>
              <li>— Arrive 3 hours early for international flights.</li>
              <li>— Keep passport and booking reference at hand.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
