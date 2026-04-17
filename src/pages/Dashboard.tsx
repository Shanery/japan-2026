import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Link } from 'react-router-dom'
import { format, differenceInDays } from 'date-fns'
import { Calendar, MapPin, DollarSign } from 'lucide-react'

const TRIP_START = new Date('2026-06-01')
const TRIP_END = new Date('2026-06-17')

const REGIONS = [
  { name: 'Tokyo', days: '1-8', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  { name: 'Kyoto', days: '9-12', color: 'bg-purple-50 border-purple-200', textColor: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  { name: 'Kyushu', days: '13-15', color: 'bg-green-50 border-green-200', textColor: 'text-green-700', badge: 'bg-green-100 text-green-700' },
  { name: 'Return', days: '16-17', color: 'bg-gray-50 border-gray-200', textColor: 'text-gray-700', badge: 'bg-gray-100 text-gray-700' },
]

function getRegionForDay(dayNumber: number): typeof REGIONS[0] {
  if (dayNumber <= 8) return REGIONS[0]
  if (dayNumber <= 12) return REGIONS[1]
  if (dayNumber <= 15) return REGIONS[2]
  return REGIONS[3]
}

function getDayDate(dayNumber: number): Date {
  const date = new Date(TRIP_START)
  date.setDate(date.getDate() + (dayNumber - 1))
  return date
}

export default function Dashboard() {
  const days = useQuery(api.days.list)
  const budgetTotals = useQuery(api.budget.getTotals)

  const daysUntilTrip = differenceInDays(TRIP_START, new Date())
  const tripDuration = differenceInDays(TRIP_END, TRIP_START) + 1

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-japan-slate to-japan-slate/90 text-white rounded-xl p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Ready for Japan!</h2>
          {daysUntilTrip > 0 ? (
            <p className="text-lg text-gray-200">
              <span className="text-3xl font-bold text-sakura-pink">{daysUntilTrip}</span> days until your adventure begins
            </p>
          ) : (
            <p className="text-lg text-gray-200">Your trip is here!</p>
          )}
          <p className="text-sm text-gray-300 mt-2">{tripDuration} days | {format(TRIP_START, 'MMM d')} - {format(TRIP_END, 'MMM d, yyyy')}</p>
        </div>
      </section>

      {/* Quick Budget Summary */}
      {budgetTotals && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-6 card-shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Budget</p>
                <p className="text-2xl font-bold text-japan-slate mt-2">A${budgetTotals.totalAUD.toFixed(2)}</p>
              </div>
              <DollarSign className="text-japan-red" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 card-shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">JPY Budget</p>
                <p className="text-2xl font-bold text-japan-slate mt-2">¥{Math.round(budgetTotals.totalJPY)}</p>
              </div>
              <DollarSign className="text-japan-red" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 card-shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Paid</p>
                <p className="text-2xl font-bold text-japan-slate mt-2">A${budgetTotals.paidAUD.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Remaining: A${budgetTotals.remainingAUD.toFixed(2)}</p>
              </div>
              <DollarSign className="text-japan-red" size={32} />
            </div>
          </div>
        </section>
      )}

      {/* Region Overview Cards */}
      <section>
        <h3 className="text-2xl font-bold mb-4 text-japan-slate">Trip Regions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {REGIONS.map((region) => (
            <div
              key={region.name}
              className={`${region.color} border rounded-lg p-4 card-shadow hover:shadow-lg transition-smooth cursor-default`}
            >
              <h4 className={`text-xl font-bold ${region.textColor} mb-2`}>{region.name}</h4>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className={region.textColor} />
                <span className={region.textColor}>Days {region.days}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Day-by-Day Timeline */}
      <section>
        <h3 className="text-2xl font-bold mb-4 text-japan-slate">17-Day Itinerary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 17 }).map((_, i) => {
            const dayNumber = i + 1
            const dayData = days?.find((d: any) => d.dayNumber === dayNumber)
            const region = getRegionForDay(dayNumber)
            const dayDate = getDayDate(dayNumber)

            return (
              <Link
                key={dayNumber}
                to={`/day/${dayNumber}`}
                className={`${region.color} border-2 ${region.textColor.replace('text-', 'border-')} rounded-lg p-6 card-shadow hover:shadow-lg transition-smooth group`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-3xl font-bold text-japan-slate group-hover:text-japan-red transition-smooth">Day {dayNumber}</h4>
                    <p className="text-sm text-gray-600">{format(dayDate, 'EEE, MMM d')}</p>
                  </div>
                  <span className={`${region.badge} px-3 py-1 rounded-full text-xs font-medium`}>{region.name}</span>
                </div>
                {dayData && (
                  <>
                    <div className="flex items-center gap-2 mb-2 text-sm">
                      <MapPin size={16} />
                      <span className="font-medium">{dayData.city}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{dayData.summary}</p>
                  </>
                )}
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
