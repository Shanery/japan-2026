import { useState, useRef } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { X, Utensils, MapPin, Navigation, Ticket, Paperclip, Upload, Trash2 } from 'lucide-react'

interface Attachment {
  storageId: Id<'_storage'>
  name: string
  contentType?: string
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
  isBooked?: boolean
  order?: number
  attachments?: Attachment[]
}

interface AddActivityModalProps {
  dayNumber: number
  dayId: Id<'days'>
  editingActivity: Activity | null
  onClose: () => void
}

const ACTIVITY_TYPES = [
  { value: 'activity', label: 'Activity', jp: '体験', icon: MapPin },
  { value: 'food', label: 'Food', jp: '食', icon: Utensils },
  { value: 'logistics', label: 'Logistics', jp: '移動', icon: Navigation },
  { value: 'ticket', label: 'Ticket', jp: '切符', icon: Ticket },
] as const

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
  const [attachments, setAttachments] = useState<Attachment[]>(
    editingActivity?.attachments?.map((a) => ({
      storageId: a.storageId,
      name: a.name,
      contentType: a.contentType,
    })) || []
  )
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const createActivity = useMutation(api.activities.create)
  const updateActivity = useMutation(api.activities.update)
  const generateUploadUrl = useMutation(api.activities.generateUploadUrl)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setIsUploading(true)
    try {
      const uploaded: Attachment[] = []
      for (const file of files) {
        const uploadUrl = await generateUploadUrl({})
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        })
        if (response.ok) {
          const { storageId } = await response.json()
          uploaded.push({ storageId, name: file.name, contentType: file.type })
        }
      }
      setAttachments((prev) => [...prev, ...uploaded])
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveAttachment = (storageId: Id<'_storage'>) => {
    setAttachments((prev) => prev.filter((a) => a.storageId !== storageId))
  }

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
        attachments: attachments.length > 0 ? attachments : undefined,
      }

      if (editingActivity) {
        await updateActivity({ id: editingActivity._id, ...activityData })
      } else {
        await createActivity({ dayId, ...activityData, order: 0 })
      }
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-sumi-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-washi-50 border border-washi-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in shadow-washi-hover">
        {/* Header */}
        <div className="sticky top-0 bg-washi-50 border-b border-washi-200 px-8 py-5 flex items-center justify-between z-10">
          <div>
            <p className="mincho-label">Day {dayNumber.toString().padStart(2, '0')}</p>
            <h2 className="font-serif text-2xl text-sumi-900">
              {editingActivity ? 'Edit entry' : 'New entry'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-sumi-500 hover:text-sumi-900 transition-colors p-2"
            aria-label="Close"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-7">
          {/* Name */}
          <div>
            <label className="mincho-label block mb-2">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-minimal text-lg"
              placeholder="Senso-ji Temple"
            />
          </div>

          {/* Type */}
          <div>
            <label className="mincho-label block mb-3">Type</label>
            <div className="grid grid-cols-4 gap-3">
              {ACTIVITY_TYPES.map((typeOption) => {
                const Icon = typeOption.icon
                const active = formData.type === typeOption.value
                return (
                  <button
                    key={typeOption.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: typeOption.value })}
                    className={`p-4 border transition-all flex flex-col items-center gap-2 ${
                      active
                        ? 'border-ai-500 bg-ai-50 text-ai-500'
                        : 'border-washi-200 bg-white/40 text-sumi-600 hover:border-sumi-400'
                    }`}
                  >
                    <span className={`font-serif text-sm tracking-mincho-wide ${active ? 'text-ai-500' : 'text-sumi-500'}`}>
                      {typeOption.jp}
                    </span>
                    <Icon size={14} strokeWidth={1.5} />
                    <span className="text-xs tracking-wide">{typeOption.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time + Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="mincho-label block mb-2">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="input-minimal"
              />
            </div>
            <div>
              <label className="mincho-label block mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input-minimal"
                placeholder="Asakusa, Tokyo"
              />
            </div>
          </div>

          {/* URLs */}
          <div>
            <label className="mincho-label block mb-2">Google Maps</label>
            <input
              type="url"
              value={formData.googleMapsUrl}
              onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
              className="input-minimal text-sm"
              placeholder="https://maps.google.com/…"
            />
          </div>
          <div>
            <label className="mincho-label block mb-2">External link</label>
            <input
              type="url"
              value={formData.externalUrl}
              onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
              className="input-minimal text-sm"
              placeholder="https://example.com/…"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mincho-label block mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-bordered h-24 resize-none leading-relaxed"
              placeholder="Any additional details…"
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="mincho-label block mb-2">Attachments</label>
            {attachments.length > 0 && (
              <ul className="space-y-2 mb-3">
                {attachments.map((attachment) => (
                  <li
                    key={attachment.storageId}
                    className="flex items-center gap-3 px-3 py-2 border border-washi-200 bg-white/60 text-sm"
                  >
                    <Paperclip size={14} strokeWidth={1.5} className="text-sumi-500 flex-shrink-0" />
                    <span className="flex-1 truncate text-sumi-800">{attachment.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(attachment.storageId)}
                      className="text-sumi-500 hover:text-shu transition-colors"
                      aria-label="Remove attachment"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <label className="block border border-dashed border-washi-300 hover:border-ai-500 hover:bg-washi-100/40 transition-colors p-5 cursor-pointer text-center">
              <Upload size={16} strokeWidth={1.5} className="mx-auto text-ai-500 mb-2" />
              <p className="text-sm text-sumi-700 tracking-wide">
                {isUploading ? 'Uploading…' : 'Click to attach files'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>

          {/* Booked */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.isBooked}
              onChange={(e) => setFormData({ ...formData, isBooked: e.target.checked })}
              className="w-4 h-4 accent-ai-500 cursor-pointer"
            />
            <span className="text-sm text-sumi-800 tracking-wide">Mark as booked</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-washi-200">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || isUploading} className="btn-primary flex-1">
              {isSubmitting ? 'Saving…' : editingActivity ? 'Update' : 'Add entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
