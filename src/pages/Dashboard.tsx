import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Link } from 'react-router-dom'
import { format, differenceInDays } from 'date-fns'
import { ArrowRight } from 'lucide-react'

const TRIP_START = new Date('2026-06-01')
const TRIP_END = new Date('2026-06-17')

const REGIONS = [
  { name: 'Tokyo', jp: '東京', days: '1–8' },
  { name: 'Kyoto', jp: '京都', days: '9–12' },
  { name: 'Kyushu', jp: '九州', days: '13–15' },
  { name: 'Return', jp: '帰路', days: '16–17' },
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
    <div className="space-y-20 pb-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="kanji-watermark text-[18rem] md:text-[24rem] leading-none -top-12 -right-6 md:right-0">
          旅
        </div>
        <div className="relative py-8 md:py-12">
          <p className="mincho-label mb-6">序 · Prologue</p>
          <h1 className="font-serif text-5xl md:text-7xl text-sumi-900 leading-tight tracking-mincho mb-8 max-w-2xl">
            A journey <br className="hidden md:block" />
            <span className="text-ai-500">into Japan.</span>
          </h1>

          <div className="flex flex-wrap items-end gap-x-12 gap-y-6 mt-10">
            <div className="accent-rule">
              <p className="mincho-label mb-1">Countdown</p>
              {daysUntilTrip > 0 ? (
                <p>
                  <span className="font-serif text-5xl text-sumi-900">{daysUntilTrip}</span>
                  <span className="ml-2 text-sm text-sumi-500 tracking-wide">days remaining</span>
                </p>
              ) : (
                <p className="font-serif text-3xl text-sumi-900">Now</p>
              )}
            </div>

            <div className="accent-rule">
              <p className="mincho-label mb-1">Duration</p>
              <p>
                <span className="font-serif text-5xl text-sumi-900">{tripDuration}</span>
                <span className="ml-2 text-sm text-sumi-500 tracking-wide">days</span>
              </p>
            </div>

            <div className="accent-rule">
              <p className="mincho-label mb-1">Dates</p>
              <p className="font-serif text-2xl text-sumi-900">
                {format(TRIP_START, 'MMM d')} — {format(TRIP_END, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Budget Summary */}
      {budgetTotals && (
        <section>
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <p className="mincho-label mb-1">予算 · Budget</p>
              <h2 className="font-serif text-2xl md:text-3xl text-sumi-900">At a glance</h2>
            </div>
            <Link
              to="/budget"
              className="text-sm text-ai-500 hover:text-ai-700 flex items-center gap-1 tracking-wide"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-y border-washi-200">
            <div className="px-6 py-8 border-b md:border-b-0 md:border-r border-washi-200">
              <p className="mincho-label mb-3">Total · AUD</p>
              <p className="font-serif text-3xl text-sumi-900">
                A${budgetTotals.totalAUD.toFixed(0)}
                <span className="text-base text-sumi-400">
                  .{budgetTotals.totalAUD.toFixed(2).split('.')[1]}
                </span>
              </p>
            </div>
            <div className="px-6 py-8 border-b md:border-b-0 md:border-r border-washi-200">
              <p className="mincho-label mb-3">Total · JPY</p>
              <p className="font-serif text-3xl text-sumi-900">
                ¥{Math.round(budgetTotals.totalJPY).toLocaleString()}
              </p>
            </div>
            <div className="px-6 py-8">
              <p className="mincho-label mb-3">Paid · AUD</p>
              <p className="font-serif text-3xl text-ai-500">
                A${budgetTotals.paidAUD.toFixed(0)}
                <span className="text-base text-ai-300">
                  .{budgetTotals.paidAUD.toFixed(2).split('.')[1]}
                </span>
              </p>
              <p className="text-xs text-sumi-500 mt-2 tracking-wide">
                A${budgetTotals.remainingAUD.toFixed(2)} remaining
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Region Overview */}
      <section>
        <div className="mb-8">
          <p className="mincho-label mb-1">地方 · Regions</p>
          <h2 className="font-serif text-2xl md:text-3xl text-sumi-900">Four chapters</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-washi-200 border border-washi-200">
          {REGIONS.map((region) => (
            <div key={region.name} className="bg-washi-50 px-6 py-8 group">
              <p className="font-serif text-3xl text-ai-500 mb-2 tracking-mincho-wide">{region.jp}</p>
              <p className="font-serif text-lg text-sumi-900">{region.name}</p>
              <p className="text-xs text-sumi-500 mt-1 tracking-wide">Days {region.days}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Day-by-Day Itinerary */}
      <section>
        <div className="mb-8">
          <p className="mincho-label mb-1">旅程 · Itinerary</p>
          <h2 className="font-serif text-2xl md:text-3xl text-sumi-900">Seventeen days</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-washi-200 border border-washi-200">
          {Array.from({ length: 17 }).map((_, i) => {
            const dayNumber = i + 1
            const dayData = days?.find((d: any) => d.dayNumber === dayNumber)
            const region = getRegionForDay(dayNumber)
            const dayDate = getDayDate(dayNumber)

            return (
              <Link
                key={dayNumber}
                to={`/day/${dayNumber}`}
                className="group bg-washi-50 hover:bg-white transition-smooth px-6 py-7 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className="mincho-label">Day</span>
                    <span className="font-serif text-4xl text-sumi-900 group-hover:text-ai-500 transition-colors leading-none">
                      {dayNumber.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <span className="font-serif text-xs text-sumi-500 tracking-mincho-wide pt-2">
                    {region.jp}
                  </span>
                </div>

                <p className="text-xs text-sumi-500 tracking-wide">
                  {format(dayDate, 'EEE · MMM d')}
                </p>

                {dayData && (
                  <div className="pt-2 border-t border-washi-200">
                    <p className="font-serif text-base text-sumi-900 mb-1">{dayData.city}</p>
                    <p className="text-xs text-sumi-600 line-clamp-2 leading-relaxed">
                      {dayData.summary}
                    </p>
                  </div>
                )}

                <div className="mt-auto pt-2 flex items-center gap-1 text-xs text-ai-500 opacity-0 group-hover:opacity-100 transition-opacity tracking-wide">
                  Read day <ArrowRight size={12} />
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
