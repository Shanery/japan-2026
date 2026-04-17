import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { format } from 'date-fns'
import { Upload, Plus, X, ArrowLeft, Image as ImageIcon } from 'lucide-react'

const TRIP_START = new Date('2026-06-01')

function getDayDate(dayNumber: number): Date {
  const date = new Date(TRIP_START)
  date.setDate(date.getDate() + (dayNumber - 1))
  return date
}

interface Memory {
  _id: string
  dayId: string
  note?: string
  photoIds: string[]
  timestamp: number
}

export default function Memories() {
  const { dayNumber: dayNumberParam } = useParams<{ dayNumber?: string }>()
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [uploadingDayNumber, setUploadingDayNumber] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [noteText, setNoteText] = useState('')

  const dayNumber = dayNumberParam ? parseInt(dayNumberParam) : undefined

  // Get the day first to get its ID
  const dayData = dayNumber ? useQuery(api.days.getByNumber, { dayNumber }) : undefined
  const memories = dayData ? useQuery(api.memories.listByDay, { dayId: dayData._id }) : undefined

  const createMemory = useMutation(api.memories.create)
  const generateUploadUrl = useMutation(api.memories.generateUploadUrl)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetDayId: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingDayNumber(dayNumber || null)
    try {
      const uploadUrl = await generateUploadUrl({})
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (response.ok) {
        const result = await response.json()
        // Create a memory with just the photo
        await createMemory({
          dayId: targetDayId,
          note: '',
          photoIds: [result.storageId],
          timestamp: Date.now(),
        })
      }
    } finally {
      setUploadingDayNumber(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleAddNote = async (targetDayId: string) => {
    if (!noteText.trim()) return

    await createMemory({
      dayId: targetDayId,
      note: noteText,
      photoIds: [],
      timestamp: Date.now(),
    })
    setNoteText('')
  }

  if (!dayNumber) {
    // Show all days with memory count
    const daysWithMemories = Array.from({ length: 17 }).map((_, i) => {
      const num = i + 1
      return { dayNumber: num }
    })

    return (
      <div className="space-y-8 animate-fade-in pb-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-japan-slate mb-2">Trip Memories</h1>
          <p className="text-gray-600">Relive your favorite moments from each day</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {daysWithMemories.map((day) => {
            const dayMemories = memories?.filter((m: Memory) => {
              // This is a simplified view - in reality we'd need to check if memory belongs to this day
              return true
            }) || []
            const totalPhotos = dayMemories.reduce((sum, m) => sum + m.photoIds.length, 0)

            return (
              <Link
                key={day.dayNumber}
                to={`/memories/${day.dayNumber}`}
                className="bg-white rounded-lg p-4 card-shadow hover:shadow-lg transition-smooth border border-gray-100 text-center group"
              >
                <div className="text-3xl font-bold text-japan-red group-hover:text-japan-slate transition-colors mb-2">
                  Day {day.dayNumber}
                </div>
                <p className="text-sm text-gray-600 mb-3">{format(getDayDate(day.dayNumber), 'MMM d')}</p>
                <div className="flex items-center justify-center gap-2 bg-japan-cream rounded px-3 py-2">
                  <ImageIcon size={16} className="text-japan-red" />
                  <span className="font-bold text-japan-slate">{totalPhotos}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  // Show single day memories
  if (!dayNumber || !dayData) return null

  const dayMemories = memories || []
  const allPhotoIds = dayMemories.flatMap((m: Memory) => m.photoIds)
  const allNotes = dayMemories.filter((m: Memory) => m.note && m.note.trim()).map((m: Memory) => ({ _id: m._id, note: m.note, timestamp: m.timestamp }))

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/memories" className="flex items-center gap-2 text-japan-red hover:text-japan-slate transition-colors mb-4">
          <ArrowLeft size={20} />
          <span>Back to All Memories</span>
        </Link>

        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-100">
          <h1 className="text-4xl font-bold text-japan-slate mb-2">Day {dayNumber} Memories</h1>
          <p className="text-gray-600">{format(getDayDate(dayNumber), 'EEEE, MMMM d, yyyy')}</p>
        </div>
      </div>

      {/* Photo Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-japan-slate">Photos</h2>

        {allPhotoIds.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {allPhotoIds.map((photoId, idx) => (
              <div
                key={idx}
                className="group cursor-pointer rounded-lg overflow-hidden card-shadow hover:shadow-lg transition-smooth bg-gray-200 aspect-square flex items-center justify-center"
                onClick={() => setLightboxImage(photoId)}
              >
                <div className="w-full h-full bg-gradient-to-br from-japan-cream to-gray-100 flex items-center justify-center">
                  <ImageIcon size={40} className="text-gray-400" />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-medium">View</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-lg p-6 card-shadow border border-gray-100">
          <label className="flex items-center justify-center gap-3 cursor-pointer hover:bg-japan-cream/50 transition-colors p-6 rounded-lg border-2 border-dashed border-japan-red/30">
            <Upload size={24} className="text-japan-red" />
            <div>
              <p className="font-medium text-japan-slate">Upload Photo</p>
              <p className="text-sm text-gray-600">Click to select a photo</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoUpload(e, dayData._id)}
              disabled={uploadingDayNumber !== null}
              className="hidden"
            />
          </label>
          {uploadingDayNumber === dayNumber && <p className="text-center text-gray-600 mt-4">Uploading...</p>}
        </div>
      </section>

      {/* Notes Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-japan-slate">Journal Notes</h2>

        {allNotes.length > 0 && (
          <div className="space-y-4 mb-6">
            {allNotes.map((noteEntry) => (
              <div key={noteEntry._id} className="bg-white rounded-lg p-6 card-shadow border border-gray-100">
                <p className="text-sm text-gray-500 mb-2">{format(new Date(noteEntry.timestamp), 'p')}</p>
                <p className="text-gray-700 whitespace-pre-wrap">{noteEntry.note}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-lg p-6 card-shadow border border-gray-100">
          <label className="block font-medium text-japan-slate mb-3">Add a Note</label>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Write about your favorite moments, food you tried, people you met..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-japan-red h-24 resize-none"
          />
          <button
            onClick={() => handleAddNote(dayData._id)}
            className="mt-4 bg-japan-red text-white px-4 py-2 rounded-lg hover:bg-japan-slate transition-colors font-medium flex items-center gap-2"
          >
            <Plus size={18} />
            Save Note
          </button>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <X size={24} className="text-japan-slate" />
          </button>
          <div className="max-w-4xl max-h-[80vh] flex items-center justify-center">
            <div className="bg-gradient-to-br from-japan-cream to-gray-100 rounded-lg flex items-center justify-center w-full h-full">
              <ImageIcon size={80} className="text-gray-400" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
