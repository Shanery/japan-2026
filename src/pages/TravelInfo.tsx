import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Plane, MapPin, ExternalLink, Hotel, Train } from 'lucide-react'

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

const TIPS = [
  'Download offline maps in Google Maps before departure.',
  'Pick up a pocket WiFi or eSIM at the airport on arrival.',
  'Buy a Suica or Pasmo card for quiet, contactless transit.',
  'Keep a hotel business card on you for taxi drivers.',
  'Pack layers — June weather shifts from mild to humid.',
]

function SectionHeading({ jp, en, title, icon: Icon }: { jp: string; en: string; title: string; icon: typeof Plane }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Icon size={18} strokeWidth={1.5} className="text-ai-500" />
      <div>
        <p className="mincho-label">{jp} · {en}</p>
        <h2 className="font-serif text-2xl text-sumi-900">{title}</h2>
      </div>
    </div>
  )
}

export default function TravelInfo() {
  const travelData = useQuery(api.travelInfo.list) as TravelInfo[] | undefined

  const flights = travelData?.filter((t) => t.type === 'flight') || []
  const outboundFlight = flights.find((f) => f.title.includes('Outbound'))
  const returnFlights = flights.filter((f) => f.title.includes('Return'))
  const hotels = travelData?.filter((t) => t.type === 'hotel') || []

  return (
    <div className="space-y-16 pb-8">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="kanji-watermark text-[16rem] md:text-[22rem] leading-none -top-12 -right-4">
          旅
        </div>
        <div className="relative">
          <p className="mincho-label mb-4">旅情報 · Travel</p>
          <h1 className="font-serif text-5xl md:text-6xl text-sumi-900 leading-none tracking-mincho mb-4">
            Getting there.<br />Getting around.
          </h1>
          <p className="text-sumi-600 max-w-xl leading-relaxed">
            Flights, rail, hotels, and the small rituals of moving through Japan.
          </p>
        </div>
      </section>

      {/* Flights */}
      <section>
        <SectionHeading jp="空" en="Flights" title="Flights" icon={Plane} />

        <div className="space-y-6">
          {outboundFlight && <FlightDetail flight={outboundFlight} />}
          {returnFlights.map((flight) => (
            <FlightDetail key={flight._id} flight={flight} />
          ))}

          {flights.length === 0 && (
            <div className="border border-dashed border-washi-200 py-16 text-center">
              <Plane size={28} strokeWidth={1} className="mx-auto text-sumi-300 mb-3" />
              <p className="text-sm text-sumi-500 tracking-wide">No flight information yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Transport */}
      <section>
        <SectionHeading jp="交通" en="Transit" title="Getting around" icon={Train} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-washi-200 border border-washi-200">
          <TransportCard title="JR Pass" subtitle="Nationwide rail network" href="https://www.jrpass.com" label="Learn more" />
          <TransportCard title="Hyperdia" subtitle="Train timetable search" href="https://www.hyperdia.com/en/" label="Search" />
          <TransportCard title="Tokyo Metro" subtitle="Subway map & fares" href="https://www.tokyometro.jp/en/" label="Open" />
        </div>
      </section>

      {/* Hotels */}
      {hotels.length > 0 && (
        <section>
          <SectionHeading jp="宿" en="Hotels" title="Accommodations" icon={Hotel} />

          <div className="space-y-4">
            {hotels.map((hotel) => (
              <div key={hotel._id} className="border border-washi-200 bg-white/60 p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-serif text-xl text-sumi-900">{hotel.title}</h3>
                  {hotel.bookingReference && (
                    <div className="text-right">
                      <p className="mincho-label">Ref</p>
                      <p className="font-serif text-sm text-ai-500 tracking-wider">
                        {hotel.bookingReference}
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-sm text-sumi-700 whitespace-pre-wrap leading-relaxed">
                  {hotel.details}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tips */}
      <section>
        <SectionHeading jp="心得" en="Tips" title="Small knowings" icon={MapPin} />

        <ul className="border-t border-washi-200">
          {TIPS.map((tip, idx) => (
            <li
              key={idx}
              className="border-b border-washi-200 py-4 flex items-baseline gap-4 text-sumi-700 leading-relaxed"
            >
              <span className="font-serif text-ai-500 text-sm tracking-mincho-wide">
                {(idx + 1).toString().padStart(2, '0')}
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function FlightDetail({ flight }: { flight: TravelInfo }) {
  return (
    <div className="border border-washi-200 bg-white/60">
      <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-washi-200">
        <div>
          <p className="mincho-label mb-1">Flight</p>
          <h3 className="font-serif text-2xl text-sumi-900">{flight.title}</h3>
        </div>
        {flight.bookingReference && (
          <div className="text-right border-l border-washi-200 pl-6">
            <p className="mincho-label mb-1">Booking Ref</p>
            <p className="font-serif text-lg text-ai-500 tracking-wider">
              {flight.bookingReference}
            </p>
          </div>
        )}
      </div>
      <div className="px-6 py-5">
        <p className="text-sm text-sumi-700 whitespace-pre-wrap leading-relaxed">{flight.details}</p>
      </div>
    </div>
  )
}

function TransportCard({
  title,
  subtitle,
  href,
  label,
}: {
  title: string
  subtitle: string
  href: string
  label: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-washi-50 hover:bg-white transition-smooth px-6 py-8 group block"
    >
      <p className="font-serif text-lg text-sumi-900 mb-1">{title}</p>
      <p className="text-xs text-sumi-500 tracking-wide mb-4">{subtitle}</p>
      <span className="inline-flex items-center gap-1.5 text-xs text-ai-500 tracking-wide group-hover:gap-2 transition-all">
        {label}
        <ExternalLink size={12} strokeWidth={1.5} />
      </span>
    </a>
  )
}
