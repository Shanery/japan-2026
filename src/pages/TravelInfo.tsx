import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { format, parse } from 'date-fns'
import { Plane, Users, MapPin, Clock, ExternalLink, Hotel, Train } from 'lucide-react'
import FlightCard from '../components/FlightCard'

interface TravelInfo {
  _id: string
  type: 'flight' | 'train' | 'hotel' | 'car'
  title: string
  details: string
  bookingReference?: string
  confirmationNumber?: string
  fileUrl?: string
  dayNumber?: number
  order: number
}

export default function TravelInfo() {
  const travelData = useQuery(api.travelInfo.list) as TravelInfo[] | undefined

  const flights = travelData?.filter((t) => t.type === 'flight') || []
  const outboundFlight = flights.find((f) => f.title.includes('Outbound'))
  const returnFlights = flights.filter((f) => f.title.includes('Return'))

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-japan-slate mb-2">Travel Information</h1>
        <p className="text-gray-600">All your flight, hotel, and transportation details in one place</p>
      </div>

      {/* Flights Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-japan-slate flex items-center gap-2">
          <Plane size={28} className="text-japan-red" />
          Flights
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {outboundFlight && (
            <div className="bg-white rounded-lg p-8 card-shadow border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-japan-slate">{outboundFlight.title}</h3>
                {outboundFlight.bookingReference && (
                  <div className="bg-japan-cream border-2 border-japan-red rounded-lg px-4 py-2">
                    <p className="text-xs text-gray-600">Booking Ref</p>
                    <p className="text-lg font-bold text-japan-red">{outboundFlight.bookingReference}</p>
                  </div>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{outboundFlight.details}</p>
            </div>
          )}

          {returnFlights.map((flight) => (
            <div key={flight._id} className="bg-white rounded-lg p-8 card-shadow border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-japan-slate">{flight.title}</h3>
                {flight.bookingReference && (
                  <div className="bg-japan-cream border-2 border-japan-red rounded-lg px-4 py-2">
                    <p className="text-xs text-gray-600">Booking Ref</p>
                    <p className="text-lg font-bold text-japan-red">{flight.bookingReference}</p>
                  </div>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{flight.details}</p>
            </div>
          ))}

          {flights.length === 0 && (
            <div className="bg-white rounded-lg p-8 text-center card-shadow border border-gray-100">
              <Plane size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No flight information available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Transport Information */}
      <section className="space-y-4">
        <h3 className="text-2xl font-bold text-japan-slate flex items-center gap-2">
          <Train size={28} className="text-japan-red" />
          Getting Around
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {/* JR Pass */}
          <div className="bg-white rounded-lg p-6 card-shadow border border-gray-100 hover:shadow-lg transition-smooth">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-japan-slate text-lg mb-2">JR Pass (Japan Rail Pass)</h4>
                <p className="text-gray-600 text-sm mb-4">Nationwide rail network for trains and buses</p>
              </div>
              <Train className="text-japan-red flex-shrink-0" size={28} />
            </div>
            <a
              href="https://www.jrpass.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-japan-red hover:text-japan-slate transition-colors font-medium"
            >
              Learn More <ExternalLink size={16} />
            </a>
          </div>

          {/* Scenic Trains */}
          <div className="bg-white rounded-lg p-6 card-shadow border border-gray-100 hover:shadow-lg transition-smooth">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-japan-slate text-lg mb-2">Scenic Train Routes</h4>
                <p className="text-gray-600 text-sm mb-4">Beautiful train journeys with stunning views</p>
              </div>
              <Train className="text-japan-red flex-shrink-0" size={28} />
            </div>
            <div className="space-y-3">
              <a
                href="https://www.hyperdia.com/en/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-japan-red hover:text-japan-slate transition-colors text-sm font-medium flex items-center gap-2"
              >
                Hyperdia - Train Schedule Search <ExternalLink size={14} />
              </a>
              <a
                href="https://tabist.com/en/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-japan-red hover:text-japan-slate transition-colors text-sm font-medium flex items-center gap-2"
              >
                Tabist - Travel Planning <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Local Transport */}
          <div className="bg-white rounded-lg p-6 card-shadow border border-gray-100 hover:shadow-lg transition-smooth">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-japan-slate text-lg mb-2">City Transport</h4>
                <p className="text-gray-600 text-sm mb-4">Subways, buses, and taxis in major cities</p>
              </div>
              <MapPin className="text-japan-red flex-shrink-0" size={28} />
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-japan-slate mb-1">Tokyo</p>
                <a
                  href="https://www.tokyometro.jp/en/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-japan-red hover:text-japan-slate transition-colors flex items-center gap-2"
                >
                  Tokyo Metro <ExternalLink size={14} />
                </a>
              </div>
              <div>
                <p className="font-medium text-japan-slate mb-1">Kyoto</p>
                <a
                  href="https://en.kyoto-bus.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-japan-red hover:text-japan-slate transition-colors flex items-center gap-2"
                >
                  Kyoto Bus System <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hotels Section */}
      {travelData && travelData.filter((t) => t.type === 'hotel').length > 0 && (
        <section className="space-y-4">
          <h3 className="text-2xl font-bold text-japan-slate flex items-center gap-2">
            <Hotel size={28} className="text-japan-red" />
            Accommodations
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {travelData.filter((t) => t.type === 'hotel').map((hotel) => (
              <div key={hotel._id} className="bg-white rounded-lg p-6 card-shadow border border-gray-100">
                <h4 className="font-bold text-japan-slate text-lg mb-2">{hotel.title}</h4>
                <p className="text-gray-700 whitespace-pre-wrap mb-3">{hotel.details}</p>
                {hotel.bookingReference && (
                  <p className="text-sm font-medium text-japan-slate">Booking Ref: {hotel.bookingReference}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Travel Tips */}
      <section className="bg-gradient-to-r from-sakura-pink/10 to-japan-red/10 rounded-lg p-8 border-2 border-sakura-pink/30">
        <h3 className="text-2xl font-bold text-japan-slate mb-4">Travel Tips</h3>
        <ul className="space-y-3 text-gray-700">
          <li className="flex gap-3">
            <span className="text-japan-red font-bold flex-shrink-0">✓</span>
            <span>Download offline maps for Google Maps before your trip</span>
          </li>
          <li className="flex gap-3">
            <span className="text-japan-red font-bold flex-shrink-0">✓</span>
            <span>Get a SIM card or pocket WiFi at the airport</span>
          </li>
          <li className="flex gap-3">
            <span className="text-japan-red font-bold flex-shrink-0">✓</span>
            <span>Purchase an IC card (Suica/Pasmo) for convenient transit payments</span>
          </li>
          <li className="flex gap-3">
            <span className="text-japan-red font-bold flex-shrink-0">✓</span>
            <span>Keep hotel business cards with you for taxi drivers</span>
          </li>
          <li className="flex gap-3">
            <span className="text-japan-red font-bold flex-shrink-0">✓</span>
            <span>Check weather forecasts and pack accordingly</span>
          </li>
        </ul>
      </section>
    </div>
  )
}
