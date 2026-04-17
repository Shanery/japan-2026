import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { X } from 'lucide-react'

const CATEGORIES = ['Flights', 'Hotels', 'Transport', 'Food', 'Activities', 'Shopping', 'Other']

interface AddLinkedBudgetItemModalProps {
  activityId: Id<'activities'>
  activityName: string
  dayNumber: number
  defaultCategory: string
  onClose: () => void
}

export default function AddLinkedBudgetItemModal({
  activityId,
  activityName,
  dayNumber,
  defaultCategory,
  onClose,
}: AddLinkedBudgetItemModalProps) {
  const createBudget = useMutation(api.budget.create)
  const [form, setForm] = useState({
    description: activityName,
    category: defaultCategory,
    amountAUD: '',
    amountJPY: '',
    notes: '',
    isPaid: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.description.trim()) return
    setIsSubmitting(true)
    try {
      await createBudget({
        category: form.category,
        description: form.description,
        amountAUD: form.amountAUD ? parseFloat(form.amountAUD) : undefined,
        amountJPY: form.amountJPY ? parseFloat(form.amountJPY) : undefined,
        isPaid: form.isPaid,
        dayNumber,
        activityId,
        notes: form.notes || undefined,
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-sumi-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-washi-50 border border-washi-200 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in shadow-washi-hover">
        <div className="sticky top-0 bg-washi-50 border-b border-washi-200 px-8 py-5 flex items-center justify-between z-10">
          <div>
            <p className="mincho-label">費用 · Cost</p>
            <h2 className="font-serif text-2xl text-sumi-900">Add expense</h2>
          </div>
          <button
            onClick={onClose}
            className="text-sumi-500 hover:text-sumi-900 transition-colors p-2"
            aria-label="Close"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
          <p className="text-xs text-sumi-500 tracking-wide">
            Linked to <span className="font-serif text-sumi-900">「{activityName}」</span>
          </p>

          <div>
            <label className="mincho-label block mb-2">Description</label>
            <input
              type="text"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-minimal"
            />
          </div>

          <div>
            <label className="mincho-label block mb-2">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-bordered"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="mincho-label block mb-2">AUD</label>
              <input
                type="number"
                value={form.amountAUD}
                onChange={(e) => setForm({ ...form, amountAUD: e.target.value })}
                className="input-minimal font-serif text-xl"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <label className="mincho-label block mb-2">JPY</label>
              <input
                type="number"
                value={form.amountJPY}
                onChange={(e) => setForm({ ...form, amountJPY: e.target.value })}
                className="input-minimal font-serif text-xl"
                placeholder="0"
                step="1"
              />
            </div>
          </div>

          <div>
            <label className="mincho-label block mb-2">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-bordered h-20 resize-none leading-relaxed"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isPaid}
              onChange={(e) => setForm({ ...form, isPaid: e.target.checked })}
              className="w-4 h-4 accent-ai-500 cursor-pointer"
            />
            <span className="text-sm text-sumi-800 tracking-wide">Mark as paid</span>
          </label>

          <div className="flex gap-3 pt-6 border-t border-washi-200">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving…' : 'Add cost'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
