import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { X, Utensils, MapPin, Navigation, Ticket } from 'lucide-react'

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
  isBooked?: boolean
  order?: number
}

interface AddActivityModalProps {
  dayNumber: number
  dayId: string
  editingActivity: Activity | null
  onClose: () => void
}

const ACTIVITY_TYPES = [
  { value: 'activity', label: 'Activity', icon: MapPin, color: 'text-green-600' },
  { value: 'food', label: 'Food', icon: Utensils, color: 'text-orange-600' },
  { value: 'logistics', label: 'Logistics', icon: Navigation, color: 'text-blue-600' },
  { value: 'ticket', label: 'Ticket', icon: Ticket, color: 'text-purple-600' },
]

export default function AddActivityModal({ dayNumber, dayId, editingActivity, onClose }: AddActivityModalProps) {
  const [formData, setFormData] = useState({
    name: editingActivity?.name || '',
    type: (editingActivity?.type || 'activity') as 'activity' | 'food' | 'logistics' | 'ticket',
    time: editingActivity?.time || '',
    location: editingActivity?.location || '',
    googleMapsUrl: editingActivity?.googleMapsUrl || '',
    externalUrl: editingActivity?.externalUrl || '',
    notes: editingActivity?.notes || '',
    isBooked: editingActivity?.isBooked || false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const createActivity = useMutation(api.activities.create)
  const updateActivity = useMutation(api.activities.update)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsSubmitting(true)
    try {
      const activityData = {
        name: formData.name,
        type: formData.type,
        time: formData.time || undefined,
        location: formData.location || undefined,
        googleMapsUrl: formData.googleMapsUrl || undefined,
        externalUrl: formData.externalUrl || undefined,
        notes: formData.notes || undefined,
        isBooked: formData.isBooked,
      }

      if (editingActivity) {
        await updateActivity({
          id: editingActivity._id,
          ...activityData,
        })
      } else {
        await createActivity({
          dayId,
          ...activityData,
          order: 0,
        })
      }

      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedTypeIcon = ACTIVITY_TYPES.find((t) => t.value === formData.type)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-japan-slate">
            {editingActivity ? 'Edit Activity' : 'Add Activity'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-japan-slate transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Activity Name */}
          <div>
            <label className="block text-sm font-bold text-japan-slate mb-2">Activity Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-japan-red"
              placeholder="e.g., Senso-ji Temple"
            />
          </div>

          {/* Activity Type */}
          <div>
            <label className="block text-sm font-bold text-japan-slate mb-3">Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ACTIVITY_TYPES.map((typeOption) => {
                const IconComponent = typeOption.icon
                return (
                  <button
                    key={typeOption.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: typeOption.value as any })}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      formData.type === typeOption.value
                        ? 'border-japan-red bg-japan-cream'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <IconComponent size={24} className={typeOption.color} />
                    <span className="text-sm font-medium text-japan-slate">{typeOption.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-bold text-japan-slate mb-2">Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-japan-red"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-bold text-japan-slate mb-2">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-japan-red"
              placeholder="e.g., Asakusa, Tokyo"
            />
          </div>

          {/* Google Maps URL */}
          <div>
            <label className="block text-sm font-bold text-japan-slate mb-2">Google Maps URL</label>
            <input
              type="url"
              value={formData.googleMapsUrl}
              onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-japan-red"
              placeholder="https://maps.google.com/..."
            />
          </div>

          {/* External URL */}
          <div>
            <label className="block text-sm font-bold text-japan-slate mb-2">External Link</label>
            <input
              type="url"
              value={formData.externalUrl}
              onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-japan-red"
              placeholder="https://example.com/..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-japan-slate mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-japan-red h-20 resize-none"
              placeholder="Add any additional details..."
            />
          </div>

          {/* Booked Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isBooked"
              checked={formData.isBooked}
              onChange={(e) => setFormData({ ...formData, isBooked: e.target.checked })}
              className="w-4 h-4 accent-japan-red cursor-pointer"
            />
            <label htmlFor="isBooked" className="font-medium text-japan-slate cursor-pointer">
              Mark as booked
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-japan-slate font-medium hover:border-japan-slate transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-lg bg-japan-red text-white font-medium hover:bg-japan-slate transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingActivity ? 'Update Activity' : 'Add Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
