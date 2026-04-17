import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { X } from 'lucide-react'

const CATEGORIES = ['Flights', 'Hotels', 'Transport', 'Food', 'Activities', 'Shopping', 'Other']

interface AddLinkedBudgetItemModalProps {
  activityId: string
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
        activityId: activityId as any,
        notes: form.notes || undefined,
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-japan-slate">Add Cost</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-japan-slate transition-colors">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Linked to: <span className="font-medium text-japan-slate">{activityName}</span>
          </p>

          <div>
            <label className="block text-sm font-bold text-japan-slate mb-2">Description *</label>
            <input
              type="text"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-japan-red"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-japan-slate mb-2">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-japan-red"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-japan-slate mb-2">AUD</label>
              <input
                type="number"
                value={form.amountAUD}
                onChange={(e) => setForm({ ...form, amountAUD: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-japan-red"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-japan-slate mb-2">JPY</label>
              <input
                type="number"
                value={form.amountJPY}
                onChange={(e) => setForm({ ...form, amountJPY: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-japan-red"
                placeholder="0"
                step="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-japan-slate mb-2">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-japan-red h-20 resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPaid"
              checked={form.isPaid}
              onChange={(e) => setForm({ ...form, isPaid: e.target.checked })}
              className="w-4 h-4 accent-japan-red cursor-pointer"
            />
            <label htmlFor="isPaid" className="font-medium text-japan-slate cursor-pointer">
              Mark as paid
            </label>
          </div>

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
              {isSubmitting ? 'Saving...' : 'Add Cost'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
