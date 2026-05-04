import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { Utensils, MapPin, Navigation, Ticket, ExternalLink, Trash2, Edit2, MapIcon, Clock, Plus, Paperclip } from 'lucide-react'
import { useState } from 'react'
import AddLinkedBudgetItemModal from './AddLinkedBudgetItemModal'

interface AttachmentWithUrl {
  storageId: Id<'_storage'>
  name: string
  contentType?: string
  url: string | null
}

interface ActivityCardProps {
  activity: {
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
    isBooked?: boolean
    attachments?: AttachmentWithUrl[]
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

const TYPE_META: Record<
  ActivityCardProps['activity']['type'],
  { icon: typeof MapPin; label: string; jp: string }
> = {
  activity: { icon: MapPin, label: 'Activity', jp: '体験' },
  food: { icon: Utensils, label: 'Food', jp: '食' },
  logistics: { icon: Navigation, label: 'Logistics', jp: '移動' },
  ticket: { icon: Ticket, label: 'Ticket', jp: '切符' },
}

export default function ActivityCard({ activity, dayNumber, onEdit }: ActivityCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCostModal, setShowCostModal] = useState(false)
  const deleteActivity = useMutation(api.activities.remove)

  const meta = TYPE_META[activity.type]
  const Icon = meta.icon

  const handleDelete = async () => {
    if (confirm('Delete this activity?')) {
      setIsDeleting(true)
      try {
        await deleteActivity({ id: activity._id })
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const hasCost = !!(activity.totalAUD || activity.totalJPY)

  return (
    <div className="group border border-washi-200 bg-white/60 hover:bg-white transition-smooth">
      <div className="flex gap-5 p-6">
        {/* Type gutter */}
        <div className="flex flex-col items-center gap-2 pt-1">
          <span className="font-serif text-xs text-ai-500 tracking-mincho-wide">{meta.jp}</span>
          <Icon size={16} strokeWidth={1.5} className="text-sumi-500" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h4 className="font-serif text-lg text-sumi-900 leading-snug">{activity.name}</h4>
                {activity.isBooked && (
                  <span className="inline-flex items-center text-[10px] tracking-mincho-wide uppercase text-matcha-600 border border-matcha-400/50 px-2 py-0.5 rounded-sm">
                    Booked
                  </span>
                )}
              </div>
              <p className="text-xs text-sumi-500 tracking-wide uppercase">{meta.label}</p>
            </div>

            <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onEdit}
                className="p-1.5 text-sumi-500 hover:text-ai-500 transition-colors"
                title="Edit"
              >
                <Edit2 size={14} strokeWidth={1.5} />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1.5 text-sumi-500 hover:text-shu transition-colors disabled:opacity-50"
                title="Delete"
              >
                <Trash2 size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-sumi-600 mb-3">
            {activity.time && (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={13} strokeWidth={1.5} className="text-ai-400" />
                {activity.time}
              </span>
            )}
            {activity.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} strokeWidth={1.5} className="text-ai-400" />
                {activity.location}
              </span>
            )}
          </div>

          {activity.notes && (
            <p className="text-sm text-sumi-700 mb-3 leading-relaxed accent-rule">{activity.notes}</p>
          )}

          {activity.attachments && activity.attachments.length > 0 && (
            <ul className="space-y-1.5 mb-3">
              {activity.attachments.map((attachment) => (
                <li key={attachment.storageId}>
                  {attachment.url ? (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs text-sumi-700 hover:text-ai-500 transition-colors"
                    >
                      <Paperclip size={12} strokeWidth={1.5} className="text-ai-400" />
                      <span className="truncate max-w-xs">{attachment.name}</span>
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-xs text-sumi-500">
                      <Paperclip size={12} strokeWidth={1.5} />
                      <span className="truncate max-w-xs">{attachment.name}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-4 flex-wrap mt-3 pt-3 border-t border-washi-200 text-xs tracking-wide">
            {hasCost ? (
              <span className="font-serif text-sm text-sumi-900">
                {activity.totalAUD && <>A${activity.totalAUD.toFixed(2)}</>}
                {activity.totalAUD && activity.totalJPY && <span className="text-sumi-400 mx-2">·</span>}
                {activity.totalJPY && <>¥{Math.round(activity.totalJPY).toLocaleString()}</>}
              </span>
            ) : null}

            <button
              onClick={() => setShowCostModal(true)}
              className="inline-flex items-center gap-1 text-ai-500 hover:text-ai-700 transition-colors"
            >
              <Plus size={12} strokeWidth={1.5} />
              Add cost
            </button>

            <div className="ml-auto flex gap-4">
              {activity.googleMapsUrl && (
                <a
                  href={activity.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sumi-500 hover:text-ai-500 transition-colors"
                >
                  <MapIcon size={12} strokeWidth={1.5} />
                  Maps
                </a>
              )}
              {activity.externalUrl && (
                <a
                  href={activity.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sumi-500 hover:text-ai-500 transition-colors"
                >
                  <ExternalLink size={12} strokeWidth={1.5} />
                  Link
                </a>
              )}
            </div>
          </div>
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
