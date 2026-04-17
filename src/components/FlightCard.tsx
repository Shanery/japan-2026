import { Plane, Clock, Users, AlertCircle } from 'lucide-react'
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

export default function FlightCard({ flight, title, isReturn }: FlightCardProps) {
  const departureDate = parse(flight.departure.date, 'yyyy-MM-dd', new Date())
  const arrivalDate = parse(flight.arrival.date, 'yyyy-MM-dd', new Date())

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-smooth">
      <div className="bg-gradient-to-r from-japan-slate to-japan-slate/90 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Plane size={24} />
            {title}
          </h3>
          <div className="text-right">
            <p className="text-2xl font-bold">{flight.airline}</p>
            <p className="text-sm text-gray-300">Flight {flight.flightNumber}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Flight Route */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {/* Departure */}
            <div className="flex-1">
              <p className="text-3xl font-bold text-japan-slate mb-2">{flight.departure.airport}</p>
              <p className="text-sm text-gray-600 mb-1">{flight.departure.city}</p>
              <p className="text-xl font-bold text-japan-red">{flight.departure.time}</p>
              <p className="text-xs text-gray-600">{format(departureDate, 'EEE, MMM d, yyyy')}</p>
            </div>

            {/* Flight Path */}
            <div className="flex-1 flex items-center justify-center px-4">
              <div className="relative w-full">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-japan-red rounded-full"></div>
                  <div className="flex-1 h-0.5 bg-japan-red relative">
                    <Plane size={16} className="text-japan-red absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white" />
                  </div>
                  <div className="w-2 h-2 bg-japan-red rounded-full"></div>
                </div>
                <p className="text-xs text-gray-600 text-center mt-2 font-medium">{flight.duration}</p>
              </div>
            </div>

            {/* Arrival */}
            <div className="flex-1 text-right">
              <p className="text-3xl font-bold text-japan-slate mb-2">{flight.arrival.airport}</p>
              <p className="text-sm text-gray-600 mb-1">{flight.arrival.city}</p>
              <p className="text-xl font-bold text-japan-red">{flight.arrival.time}</p>
              <p className="text-xs text-gray-600">{format(arrivalDate, 'EEE, MMM d, yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Flight Details */}
        <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
          <div>
            <p className="text-xs text-gray-600 font-medium mb-1">STOPS</p>
            <p className="text-lg font-bold text-japan-slate">{flight.stops === 0 ? 'Direct' : flight.stops === 1 ? '1 Stop' : `${flight.stops} Stops`}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium mb-1">DURATION</p>
            <p className="text-lg font-bold text-japan-slate">{flight.duration}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium mb-1">AIRCRAFT</p>
            <p className="text-lg font-bold text-japan-slate">{flight.flightNumber}</p>
          </div>
        </div>

        {/* Booking Reference */}
        <div className="bg-japan-cream border-2 border-japan-red rounded-lg p-4 mb-6">
          <p className="text-xs text-gray-600 font-medium mb-1">BOOKING REFERENCE</p>
          <p className="text-2xl font-bold text-japan-red tracking-widest">{flight.bookingReference}</p>
          <p className="text-xs text-gray-600 mt-2">Save this code for check-in and when contacting the airline</p>
        </div>

        {/* Passengers */}
        {flight.passengers.length > 0 && (
          <div>
            <h4 className="font-bold text-japan-slate mb-3 flex items-center gap-2">
              <Users size={20} className="text-japan-red" />
              Passengers ({flight.passengers.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {flight.passengers.map((passenger, idx) => (
                <div key={idx} className="bg-gray-50 rounded px-3 py-2 text-sm text-japan-slate font-medium">
                  {passenger}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Check-in Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• Check in online 24 hours before departure</li>
              <li>• Arrive at the airport 3 hours before international flights</li>
              <li>• Have your passport and booking reference ready</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
