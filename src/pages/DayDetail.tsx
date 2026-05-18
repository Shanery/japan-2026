import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { format } from 'date-fns'
import { ArrowLeft, ArrowRight, MapPin, Plus, Utensils, Navigation, Ticket, Camera, Calendar, Paperclip, Map } from 'lucide-react'
import AddActivityModal from '../components/AddActivityModal'
import ActivityCard from '../components/ActivityCard'

const TRIP_START = new Date('2026-06-01')
const TRIP_DAYS = 17

function getDayDate(dayNumber: number): Date {
  const date = new Date(TRIP_START)
  date.setDate(date.getDate() + (dayNumber - 1))
  return date
}

interface Attachment {
  storageId: Id<'_storage'>
  name: string
  contentType?: string
  url: string | null
}

interface Activity {
  _id: Id<'activities'>
  dayId: Id<'days'>
  name: string
  type: 'activity' | 'food' | 'logistics' | 'ticket'
  time?: string
  location?: string
  googleMapsUrl?: string
  externalUrl?: string
  notes?: string
  totalAUD?: number
  totalJPY?: number
  budgetItemCount?: number
  isBooked?: boolean
  order?: number
  attachments?: Attachment[]
}

type TabType = 'itinerary' | 'food' | 'logistics' | 'map' | 'files' | 'attachments'

const TABS: { id: TabType; label: string; jp: string; icon: typeof Utensils | null }[] = [
  { id: 'itinerary', label: 'Itinerary', jp: '旅程', icon: null },
  { id: 'food', label: 'Food', jp: '食', icon: Utensils },
  { id: 'logistics', label: 'Logistics', jp: '移動', icon: Navigation },
  { id: 'map', label: 'Map', jp: '地図', icon: Map },
  { id: 'files', label: 'Tickets', jp: '切符', icon: Ticket },
  { id: 'attachments', label: 'Attachments', jp: '添付', icon: Paperclip },
]

function buildDirectionsUrl(locations: string[]): string {
  if (locations.length === 0) return ''
  if (locations.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locations[0])}`
  }
  const origin = encodeURIComponent(locations[0])
  const destination = encodeURIComponent(locations[locations.length - 1])
  const waypoints = locations.slice(1, -1).map(encodeURIComponent).join('|')
  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=transit`
  if (waypoints) url += `&waypoints=${waypoints}`
  return url
}

function buildEmbedUrl(locations: string[]): string {
  if (locations.length === 0) return ''
  if (locations.length === 1) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(locations[0])}&output=embed`
  }
  const saddr = encodeURIComponent(locations[0])
  const rest = locations.slice(1)
  const daddr = rest
    .map((loc, i) => (i === 0 ? encodeURIComponent(loc) : `to:${encodeURIComponent(loc)}`))
    .join('+')
  return `https://maps.google.com/maps?saddr=${saddr}&daddr=${daddr}&dirflg=r&output=embed`
}

export default function DayDetail() {
  const { dayNumber } = useParams<{ dayNumber: string }>()
  const [activeTab, setActiveTab] = useState<TabType>('itinerary')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)

  const dayNum = parseInt(dayNumber || '1')
  const dayData = useQuery(api.days.getByNumber, { dayNumber: dayNum })
  const activities = useQuery(
    api.activities.listByDayWithTotals,
    dayData ? { dayId: dayData._id } : 'skip',
  )

  const dayDate = getDayDate(dayNum)
  const prevDay = dayNum > 1 ? dayNum - 1 : null
  const nextDay = dayNum < TRIP_DAYS ? dayNum + 1 : null

  const sortedActivities = activities?.slice().sort((a: Activity, b: Activity) => {
    if (a.time && b.time) return a.time.localeCompare(b.time)
    if (a.time) return -1
    if (b.time) return 1
    return (a.order || 0) - (b.order || 0)
  }) || []
  const foodActivities = sortedActivities.filter((a: Activity) => a.type === 'food')
  const logisticsActivities = sortedActivities.filter((a: Activity) => a.type === 'logistics')
  const ticketActivities = sortedActivities.filter((a: Activity) => a.type === 'ticket')

  const allAttachments = sortedActivities.flatMap((a: Activity) =>
    (a.attachments || []).map((att) => ({
      ...att,
      activityId: a._id,
      activityName: a.name,
    }))
  )

  const mapStops = sortedActivities.filter((a: Activity) => !!a.location?.trim())
  const mapLocations = mapStops.map((a: Activity) => a.location as string)
  const directionsUrl = buildDirectionsUrl(mapLocations)
  const embedUrl = buildEmbedUrl(mapLocations)

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity)
    setShowAddModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingActivity(null)
  }

  const tabData = {
    itinerary: { list: sortedActivities, empty: 'No activities planned for this day yet.', addLabel: 'Add activity' },
    food: { list: foodActivities, empty: 'No food plans yet.', addLabel: 'Add food' },
    logistics: { list: logisticsActivities, empty: 'No logistics yet.', addLabel: 'Add logistics' },
    files: { list: ticketActivities, empty: 'No tickets yet.', addLabel: 'Add ticket' },
  }

  const isAttachmentsTab = activeTab === 'attachments'
  const isMapTab = activeTab === 'map'
  const current = isAttachmentsTab || isMapTab ? null : tabData[activeTab]

  return (
    <div className="pb-8">
      {/* Top nav */}
      <div className="flex items-center justify-between gap-4 mb-10 flex-wrap">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-sumi-500 hover:text-ai-500 tracking-wide transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          <span>Back to itinerary</span>
        </Link>
        <div className="flex items-center gap-1">
          {prevDay !== null ? (
            <Link
              to={`/day/${prevDay}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-sumi-700 hover:text-ai-500 hover:bg-washi-100 tracking-wide transition-colors border border-washi-200"
            >
              <ArrowLeft size={14} strokeWidth={1.5} />
              <span>Day {prevDay.toString().padStart(2, '0')}</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-sumi-300 tracking-wide border border-washi-200">
              <ArrowLeft size={14} strokeWidth={1.5} />
              <span>Day {dayNum.toString().padStart(2, '0')}</span>
            </span>
          )}
          {nextDay !== null ? (
            <Link
              to={`/day/${nextDay}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-sumi-700 hover:text-ai-500 hover:bg-washi-100 tracking-wide transition-colors border border-washi-200 border-l-0"
            >
              <span>Day {nextDay.toString().padStart(2, '0')}</span>
              <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-sumi-300 tracking-wide border border-washi-200 border-l-0">
              <span>Day {dayNum.toString().padStart(2, '0')}</span>
              <ArrowRight size={14} strokeWidth={1.5} />
            </span>
          )}
        </div>
      </div>

      {/* Day header */}
      <section className="relative overflow-hidden mb-16">
        <div className="kanji-watermark text-[16rem] md:text-[22rem] leading-none -top-16 -right-4">
          日
        </div>
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="mincho-label mb-4">Day {dayNum.toString().padStart(2, '0')}</p>
            <h1 className="font-serif text-5xl md:text-6xl text-sumi-900 leading-none tracking-mincho mb-5">
              {dayData?.city || '—'}
            </h1>
            <div className="flex flex-wrap gap-6 text-sm text-sumi-600">
              <span className="inline-flex items-center gap-2 tracking-wide">
                <Calendar size={14} strokeWidth={1.5} className="text-ai-500" />
                {format(dayDate, 'EEEE, MMMM d, yyyy')}
              </span>
              {dayData && (
                <span className="inline-flex items-center gap-2 tracking-wide">
                  <MapPin size={14} strokeWidth={1.5} className="text-ai-500" />
                  {dayData.city}
                </span>
              )}
            </div>
            {dayData?.summary && (
              <p className="mt-6 max-w-2xl text-sumi-600 leading-relaxed accent-rule">
                {dayData.summary}
              </p>
            )}
          </div>
          <Link to={`/memories/${dayNum}`} className="btn-ghost self-start md:self-auto">
            <Camera size={16} strokeWidth={1.5} />
            Day memories
          </Link>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-washi-200 mb-10">
        <div className="flex gap-8 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-4 flex items-center gap-2 text-sm tracking-wide transition-colors whitespace-nowrap ${
                  active ? 'text-ai-500' : 'text-sumi-500 hover:text-sumi-900'
                }`}
              >
                <span className={`font-serif text-[11px] tracking-mincho-wide ${active ? 'text-ai-400' : 'text-sumi-400'}`}>
                  {tab.jp}
                </span>
                {Icon && <Icon size={14} strokeWidth={1.5} />}
                <span>{tab.label}</span>
                {active && <span className="absolute bottom-0 left-0 right-0 h-px bg-ai-500" aria-hidden />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      {isAttachmentsTab ? (
        <div>
          <p className="text-xs text-sumi-500 tracking-wide mb-6">
            {allAttachments.length} {allAttachments.length === 1 ? 'attachment' : 'attachments'}
          </p>
          {allAttachments.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-washi-200 rounded-sm">
              <p className="text-sumi-400 text-sm tracking-wide">No attachments for this day yet.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {allAttachments.map((attachment) => (
                <li
                  key={`${attachment.activityId}-${attachment.storageId}`}
                  className="flex items-center gap-4 px-4 py-3 border border-washi-200 bg-white/60 hover:bg-white transition-smooth"
                >
                  <Paperclip size={14} strokeWidth={1.5} className="text-ai-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    {attachment.url ? (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-sumi-800 hover:text-ai-500 transition-colors truncate block"
                      >
                        {attachment.name}
                      </a>
                    ) : (
                      <span className="text-sm text-sumi-500 truncate block">{attachment.name}</span>
                    )}
                    <p className="text-xs text-sumi-500 tracking-wide truncate">
                      {attachment.activityName}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : isMapTab ? (
        <div>
          {mapStops.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-washi-200 rounded-sm">
              <p className="text-sumi-400 text-sm tracking-wide">
                No activities with locations yet. Add a location to an activity to see it on the map.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <p className="text-xs text-sumi-500 tracking-wide">
                  {mapStops.length} {mapStops.length === 1 ? 'stop' : 'stops'}
                </p>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <Map size={14} strokeWidth={1.5} />
                  {mapStops.length === 1 ? 'Open in Google Maps' : 'Open route in Google Maps'}
                </a>
              </div>

              <div className="aspect-video w-full border border-washi-200 bg-washi-50 mb-8 overflow-hidden">
                <iframe
                  title="Day route preview"
                  src={embedUrl}
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <ol className="space-y-0">
                {mapStops.map((act: Activity, i: number) => {
                  const isLast = i === mapStops.length - 1
                  return (
                    <li key={act._id}>
                      <div className="flex gap-5 p-5 border border-washi-200 bg-white/60">
                        <div className="flex flex-col items-center pt-0.5 w-10 flex-shrink-0">
                          <span className="font-serif text-2xl text-ai-500 leading-none">
                            {(i + 1).toString().padStart(2, '0')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-3 flex-wrap mb-1">
                            <h4 className="font-serif text-base text-sumi-900">{act.name}</h4>
                            {act.time && (
                              <span className="text-xs text-sumi-500 tracking-wide">{act.time}</span>
                            )}
                          </div>
                          <p className="text-sm text-sumi-600 inline-flex items-center gap-1.5">
                            <MapPin size={12} strokeWidth={1.5} className="text-ai-400 flex-shrink-0" />
                            <span className="truncate">{act.location}</span>
                          </p>
                        </div>
                        {act.googleMapsUrl && (
                          <a
                            href={act.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-sumi-500 hover:text-ai-500 transition-colors self-center tracking-wide flex-shrink-0"
                          >
                            View
                          </a>
                        )}
                      </div>
                      {!isLast && (
                        <div className="flex items-center gap-3 pl-12 py-2 text-xs text-sumi-400 tracking-wide">
                          <span className="h-px w-6 bg-washi-300" />
                          <Navigation size={11} strokeWidth={1.5} />
                          <span>to next stop</span>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ol>
            </>
          )}
        </div>
      ) : current ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-sumi-500 tracking-wide">
              {current.list.length} {current.list.length === 1 ? 'item' : 'items'}
            </p>
            <button
              onClick={() => {
                setEditingActivity(null)
                setShowAddModal(true)
              }}
              className="btn-primary"
            >
              <Plus size={14} strokeWidth={1.5} />
              {current.addLabel}
            </button>
          </div>

          {current.list.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-washi-200 rounded-sm">
              <p className="text-sumi-400 text-sm tracking-wide">{current.empty}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {current.list.map((activity) => (
                <ActivityCard
                  key={activity._id}
                  activity={activity}
                  dayNumber={dayNum}
                  onEdit={() => handleEditActivity(activity)}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}

      {showAddModal && dayData && (
        <AddActivityModal
          dayNumber={dayNum}
          dayId={dayData._id}
          editingActivity={editingActivity}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
