import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Utensils, MapPin, Navigation, Ticket, ExternalLink, Trash2, Edit2, MapIcon, Clock, DollarSign, Plus } from 'lucide-react'
import { useState } from 'react'
import AddLinkedBudgetItemModal from './AddLinkedBudgetItemModal'

interface ActivityCardProps {
  activity: {
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
    isBooked?: boolean
  }
  dayNumber: number
  onEdit: () => void
}

const DEFAULT_CATEGORY_BY_TYPE: Record<ActivityCardProps['activity']['type'], string> = {
  food: 'Food',
  logistics: 'Transport',
  ticket: 'Activities',
  activity: 'Activities',
}

export default function ActivityCard({ activity, dayNumber, onEdit }: ActivityCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCostModal, setShowCostModal] = useState(false)
  const deleteActivity = useMutation(api.activities.remove)

  const getTypeIcon = () => {
    switch (activity.type) {
      case 'food':
        return <Utensils size={20} className="text-orange-600" />
      case 'logistics':
        return <Navigation size={20} className="text-blue-600" />
      case 'ticket':
        return <Ticket size={20} className="text-purple-600" />
      default:
        return <MapPin size={20} className="text-green-600" />
    }
  }

  const getTypeBadgeColor = () => {
    switch (activity.type) {
      case 'food':
        return 'bg-orange-100 text-orange-700'
      case 'logistics':
        return 'bg-blue-100 text-blue-700'
      case 'ticket':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-green-100 text-green-700'
    }
  }

  const getTypeLabel = () => {
    switch (activity.type) {
      case 'food':
        return 'Food'
      case 'logistics':
        return 'Logistics'
      case 'ticket':
        return 'Ticket'
      default:
        return 'Activity'
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this activity?')) {
      setIsDeleting(true)
      try {
        await deleteActivity({ id: activity._id })
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 card-shadow border border-gray-100 hover:shadow-lg transition-smooth">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 flex-1">
          <div className="flex-shrink-0 mt-1">{getTypeIcon()}</div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h4 className="text-lg font-bold text-japan-slate">{activity.name}</h4>
              <span className={`${getTypeBadgeColor()} text-xs font-medium px-2 py-1 rounded`}>{getTypeLabel()}</span>
              {activity.isBooked && <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">Booked</span>}
            </div>

            {activity.time && (
              <p className="text-sm text-gray-600 flex items-center gap-2 mb-2">
                <Clock size={16} className="text-japan-red" />
                {activity.time}
              </p>
            )}

            {activity.location && (
              <p className="text-sm text-gray-600 flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-japan-red" />
                {activity.location}
              </p>
            )}

            {activity.notes && <p className="text-sm text-gray-700 mb-3">{activity.notes}</p>}

            <div className="text-sm text-gray-600 flex items-center gap-2 mb-3 flex-wrap">
              {(activity.totalAUD || activity.totalJPY) ? (
                <>
                  <DollarSign size={16} className="text-japan-red" />
                  {activity.totalAUD ? <span>A${activity.totalAUD.toFixed(2)}</span> : null}
                  {activity.totalAUD && activity.totalJPY ? <span>•</span> : null}
                  {activity.totalJPY ? <span>¥{Math.round(activity.totalJPY)}</span> : null}
                </>
              ) : null}
              <button
                onClick={() => setShowCostModal(true)}
                className="text-japan-red hover:text-japan-slate transition-colors font-medium flex items-center gap-1"
                title="Add linked budget item"
              >
                <Plus size={14} />
                {(activity.totalAUD || activity.totalJPY) ? 'Add cost' : 'Add cost'}
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {activity.googleMapsUrl && (
                <a
                  href={activity.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-japan-red hover:text-japan-slate transition-colors text-sm font-medium flex items-center gap-1"
                >
                  <MapIcon size={16} />
                  Maps
                  <ExternalLink size={14} />
                </a>
              )}

              {activity.externalUrl && (
                <a
                  href={activity.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-japan-red hover:text-japan-slate transition-colors text-sm font-medium flex items-center gap-1"
                >
                  <ExternalLink size={16} />
                  Link
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors"
            title="Edit activity"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
            title="Delete activity"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {showCostModal && (
        <AddLinkedBudgetItemModal
          activityId={activity._id}
          activityName={activity.name}
          dayNumber={dayNumber}
          defaultCategory={DEFAULT_CATEGORY_BY_TYPE[activity.type]}
          onClose={() => setShowCostModal(false)}
        />
      )}
    </div>
  )
}
