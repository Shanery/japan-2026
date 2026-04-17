import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
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

  const dayData = dayNumber ? useQuery(api.days.getByNumber, { dayNumber }) : undefined
  const memories = dayData ? useQuery(api.memories.listByDay, { dayId: dayData._id }) : undefined

  const createMemory = useMutation(api.memories.create)
  const generateUploadUrl = useMutation(api.memories.generateUploadUrl)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetDayId: Id<'days'>) => {
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
        await createMemory({
          dayId: targetDayId,
          note: '',
          photoIds: [result.storageId],
          timestamp: Date.now(),
        })
      }
    } finally {
      setUploadingDayNumber(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleAddNote = async (targetDayId: Id<'days'>) => {
    if (!noteText.trim()) return
    await createMemory({
      dayId: targetDayId,
      note: noteText,
      photoIds: [],
      timestamp: Date.now(),
    })
    setNoteText('')
  }

  // Index view — all days
  if (!dayNumber) {
    const daysWithMemories = Array.from({ length: 17 }).map((_, i) => ({ dayNumber: i + 1 }))

    return (
      <div className="space-y-16 pb-8">
        <section className="relative overflow-hidden">
          <div className="kanji-watermark text-[16rem] md:text-[22rem] leading-none -top-12 -right-4">
            思
          </div>
          <div className="relative">
            <p className="mincho-label mb-4">思い出 · Memories</p>
            <h1 className="font-serif text-5xl md:text-6xl text-sumi-900 leading-none tracking-mincho mb-4">
              Moments, kept.
            </h1>
            <p className="text-sumi-600 max-w-xl leading-relaxed">
              A quiet archive of photographs and notes — one day at a time.
            </p>
          </div>
        </section>

        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-px bg-washi-200 border border-washi-200">
            {daysWithMemories.map((day) => {
              const totalPhotos = 0
              return (
                <Link
                  key={day.dayNumber}
                  to={`/memories/${day.dayNumber}`}
                  className="bg-washi-50 hover:bg-white transition-smooth px-5 py-6 text-center group"
                >
                  <p className="mincho-label mb-2">Day</p>
                  <p className="font-serif text-3xl text-sumi-900 group-hover:text-ai-500 transition-colors leading-none mb-2">
                    {day.dayNumber.toString().padStart(2, '0')}
                  </p>
                  <p className="text-xs text-sumi-500 tracking-wide mb-4">
                    {format(getDayDate(day.dayNumber), 'MMM d')}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-sumi-600">
                    <ImageIcon size={12} strokeWidth={1.5} />
                    <span>{totalPhotos}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    )
  }

  if (!dayData) return null

  const dayMemories = memories || []
  const allPhotoIds = dayMemories.flatMap((m: Memory) => m.photoIds)
  const allNotes = dayMemories
    .filter((m: Memory) => m.note && m.note.trim())
    .map((m: Memory) => ({ _id: m._id, note: m.note, timestamp: m.timestamp }))

  return (
    <div className="space-y-16 pb-8">
      {/* Back link */}
      <Link
        to="/memories"
        className="inline-flex items-center gap-2 text-sm text-sumi-500 hover:text-ai-500 tracking-wide transition-colors"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        <span>All memories</span>
      </Link>

      {/* Header */}
      <section>
        <p className="mincho-label mb-4">Day {dayNumber.toString().padStart(2, '0')}</p>
        <h1 className="font-serif text-5xl md:text-6xl text-sumi-900 leading-none tracking-mincho mb-4">
          {dayData.city}
        </h1>
        <p className="text-sumi-500 tracking-wide text-sm">
          {format(getDayDate(dayNumber), 'EEEE, MMMM d, yyyy')}
        </p>
      </section>

      {/* Photos */}
      <section>
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <p className="mincho-label mb-1">写真 · Photographs</p>
            <h2 className="font-serif text-2xl text-sumi-900">Photos</h2>
          </div>
          <p className="text-xs text-sumi-500 tracking-wide">{allPhotoIds.length} saved</p>
        </div>

        {allPhotoIds.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {allPhotoIds.map((photoId, idx) => (
              <div
                key={idx}
                className="group relative cursor-pointer overflow-hidden aspect-square border border-washi-200 bg-washi-100"
                onClick={() => setLightboxImage(photoId)}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={32} strokeWidth={1} className="text-sumi-300" />
                </div>
                <div className="absolute inset-0 bg-sumi-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-washi-50 text-xs tracking-mincho-wide uppercase">View</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <label className="block border border-dashed border-washi-300 hover:border-ai-500 hover:bg-washi-100/40 transition-colors p-10 cursor-pointer text-center">
          <Upload size={20} strokeWidth={1.5} className="mx-auto text-ai-500 mb-3" />
          <p className="font-serif text-sumi-900">Upload a photograph</p>
          <p className="text-xs text-sumi-500 mt-1 tracking-wide">Click to select a file</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handlePhotoUpload(e, dayData._id)}
            disabled={uploadingDayNumber !== null}
            className="hidden"
          />
          {uploadingDayNumber === dayNumber && (
            <p className="text-sm text-sumi-500 mt-3 tracking-wide">Uploading…</p>
          )}
        </label>
      </section>

      {/* Notes */}
      <section>
        <div className="mb-6">
          <p className="mincho-label mb-1">日記 · Journal</p>
          <h2 className="font-serif text-2xl text-sumi-900">Notes</h2>
        </div>

        {allNotes.length > 0 && (
          <div className="space-y-3 mb-6">
            {allNotes.map((noteEntry) => (
              <div key={noteEntry._id} className="accent-rule py-3">
                <p className="mincho-label mb-2">{format(new Date(noteEntry.timestamp), 'p')}</p>
                <p className="text-sumi-800 whitespace-pre-wrap leading-relaxed">{noteEntry.note}</p>
              </div>
            ))}
          </div>
        )}

        <div>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Write about the day — what you ate, what you saw, who you met…"
            className="input-bordered h-32 resize-none leading-relaxed"
          />
          <button
            onClick={() => handleAddNote(dayData._id)}
            className="btn-primary mt-4"
          >
            <Plus size={14} strokeWidth={1.5} />
            Save note
          </button>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-sumi-900/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 text-washi-50 hover:text-washi-200 transition-colors"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
          <div className="max-w-4xl max-h-[80vh] w-full aspect-square flex items-center justify-center bg-washi-100">
            <ImageIcon size={60} strokeWidth={1} className="text-sumi-300" />
          </div>
        </div>
      )}
    </div>
  )
}
