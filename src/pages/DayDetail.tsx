import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { format } from 'date-fns'
import { ArrowLeft, Clock, MapPin, ExternalLink, Trash2, Edit2, Plus, Utensils, Navigation, Ticket, MapIcon, Camera } from 'lucide-react'
import AddActivityModal from '../components/AddActivityModal'
import ActivityCard from '../components/ActivityCard'

const TRIP_START = new Date('2026-06-01')

function getDayDate(dayNumber: number): Date {
  const date = new Date(TRIP_START)
  date.setDate(date.getDate() + (dayNumber - 1))
  return date
}

interface Activity {
  _id: string
  dayId: string
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
}

type TabType = 'itinerary' | 'food' | 'logistics' | 'files'

export default function DayDetail() {
  const { dayNumber } = useParams<{ dayNumber: string }>()
  const [activeTab, setActiveTab] = useState<TabType>('itinerary')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)

  const dayNum = parseInt(dayNumber || '1')
  const dayData = useQuery(api.days.getByNumber, { dayNumber: dayNum })
  const activities = useQuery(
    api.activities.listByDayWithTotals,
    dayData ? { dayId: dayData._id } : "skip"
  )

  const dayDate = getDayDate(dayNum)

  const sortedActivities = activities?.sort((a: Activity, b: Activity) => (a.order || 0) - (b.order || 0)) || []
  const foodActivities = sortedActivities.filter((a: Activity) => a.type === 'food')
  const logisticsActivities = sortedActivities.filter((a: Activity) => a.type === 'logistics')
  const ticketActivities = sortedActivities.filter((a: Activity) => a.type === 'ticket')

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity)
    setShowAddModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingActivity(null)
  }

  return (
    <div className="animate-fade-in pb-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/" className="flex items-center gap-2 text-japan-red hover:text-japan-slate transition-colors mb-4">
          <ArrowLeft size={20} />
          <span>Back to Trip</span>
        </Link>

        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-100 mb-6">
          <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
            <div>
              <h1 className="text-4xl font-bold text-japan-slate mb-2">Day {dayNum}</h1>
              <p className="text-gray-600 flex items-center gap-2 text-lg mb-4">
                <Calendar size={20} className="text-japan-red" />
                {format(dayDate, 'EEEE, MMMM d, yyyy')}
              </p>
              {dayData && (
                <>
                  <p className="text-lg flex items-center gap-2 text-japan-slate font-medium">
                    <MapPin size={20} className="text-japan-red" />
                    {dayData.city}
                  </p>
                  <p className="text-gray-600 mt-3 max-w-2xl">{dayData.summary}</p>
                </>
              )}
            </div>
            <Link
              to={`/memories/${dayNum}`}
              className="bg-japan-red text-white px-6 py-2 rounded-lg hover:bg-japan-slate transition-colors flex items-center gap-2 font-medium"
            >
              <Camera size={20} />
              <span>Day Memories</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`flex-1 py-4 px-6 font-medium border-b-2 transition-colors ${
              activeTab === 'itinerary'
                ? 'text-japan-red border-japan-red'
                : 'text-gray-600 border-transparent hover:border-gray-300'
            }`}
          >
            Itinerary
          </button>
          <button
            onClick={() => setActiveTab('food')}
            className={`flex-1 py-4 px-6 font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'food'
                ? 'text-japan-red border-japan-red'
                : 'text-gray-600 border-transparent hover:border-gray-300'
            }`}
          >
            <Utensils size={18} />
            Food
          </button>
          <button
            onClick={() => setActiveTab('logistics')}
            className={`flex-1 py-4 px-6 font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'logistics'
                ? 'text-japan-red border-japan-red'
                : 'text-gray-600 border-transparent hover:border-gray-300'
            }`}
          >
            <Navigation size={18} />
            Logistics
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex-1 py-4 px-6 font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'files'
                ? 'text-japan-red border-japan-red'
                : 'text-gray-600 border-transparent hover:border-gray-300'
            }`}
          >
            <Ticket size={18} />
            Files
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'itinerary' && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  setEditingActivity(null)
                  setShowAddModal(true)
                }}
                className="bg-japan-red text-white px-4 py-2 rounded-lg hover:bg-japan-slate transition-colors flex items-center gap-2 font-medium mb-6"
              >
                <Plus size={18} />
                Add Activity
              </button>
              {sortedActivities.length === 0 ? (
                <p className="text-gray-500 py-8 text-center">No activities planned for this day yet.</p>
              ) : (
                <div className="space-y-4">
                  {sortedActivities.map((activity) => (
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
          )}

          {activeTab === 'food' && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  setEditingActivity(null)
                  setShowAddModal(true)
                }}
                className="bg-japan-red text-white px-4 py-2 rounded-lg hover:bg-japan-slate transition-colors flex items-center gap-2 font-medium mb-6"
              >
                <Plus size={18} />
                Add Food
              </button>
              {foodActivities.length === 0 ? (
                <p className="text-gray-500 py-8 text-center">No food items planned for this day yet.</p>
              ) : (
                <div className="space-y-4">
                  {foodActivities.map((activity) => (
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
          )}

          {activeTab === 'logistics' && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  setEditingActivity(null)
                  setShowAddModal(true)
                }}
                className="bg-japan-red text-white px-4 py-2 rounded-lg hover:bg-japan-slate transition-colors flex items-center gap-2 font-medium mb-6"
              >
                <Plus size={18} />
                Add Logistics
              </button>
              {logisticsActivities.length === 0 ? (
                <p className="text-gray-500 py-8 text-center">No logistics items planned for this day yet.</p>
              ) : (
                <div className="space-y-4">
                  {logisticsActivities.map((activity) => (
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
          )}

          {activeTab === 'files' && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  setEditingActivity(null)
                  setShowAddModal(true)
                }}
                className="bg-japan-red text-white px-4 py-2 rounded-lg hover:bg-japan-slate transition-colors flex items-center gap-2 font-medium mb-6"
              >
                <Plus size={18} />
                Add Ticket
              </button>
              {ticketActivities.length === 0 ? (
                <p className="text-gray-500 py-8 text-center">No tickets or files uploaded for this day yet.</p>
              ) : (
                <div className="space-y-4">
                  {ticketActivities.map((activity) => (
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
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
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

function Calendar({ size, className }: { size: number; className: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h18"></path></svg>
}
