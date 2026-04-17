import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { Trash2, Edit2, Check } from 'lucide-react'
import { useState } from 'react'

interface BudgetItemRowProps {
  item: {
    _id: Id<'budgetItems'>
    description: string
    category: string
    amountAUD?: number
    amountJPY?: number
    isPaid: boolean
  }
}

export default function BudgetItemRow({ item }: BudgetItemRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedDescription, setEditedDescription] = useState(item.description)
  const [editedAmountAUD, setEditedAmountAUD] = useState((item.amountAUD || 0).toString())
  const updateBudget = useMutation(api.budget.update)
  const deleteBudget = useMutation(api.budget.remove)

  const handleTogglePaid = async () => {
    await updateBudget({ id: item._id, isPaid: !item.isPaid })
  }

  const handleSaveEdit = async () => {
    await updateBudget({
      id: item._id,
      description: editedDescription,
      amountAUD: parseFloat(editedAmountAUD),
    })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (confirm(`Delete "${item.description}"?`)) {
      await deleteBudget({ id: item._id })
    }
  }

  if (isEditing) {
    return (
      <div className="flex gap-3 items-center py-3 border-b border-washi-200">
        <input
          type="text"
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          className="input-minimal flex-1 text-sm"
        />
        <input
          type="number"
          value={editedAmountAUD}
          onChange={(e) => setEditedAmountAUD(e.target.value)}
          className="input-minimal w-24 text-sm font-serif"
          step="0.01"
        />
        <button
          onClick={handleSaveEdit}
          className="px-3 py-1 bg-ai-500 text-washi-50 text-xs rounded-sm hover:bg-ai-600 tracking-wide transition-colors"
        >
          Save
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="px-3 py-1 border border-sumi-300 text-sumi-700 text-xs rounded-sm hover:border-sumi-500 tracking-wide transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-4 py-3 border-b border-washi-200 last:border-b-0">
      <button
        onClick={handleTogglePaid}
        className={`flex-shrink-0 w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${
          item.isPaid
            ? 'bg-ai-500 border-ai-500'
            : 'border-sumi-300 hover:border-ai-500'
        }`}
        title={item.isPaid ? 'Mark unpaid' : 'Mark paid'}
      >
        {item.isPaid && <Check size={10} strokeWidth={2.5} className="text-washi-50" />}
      </button>

      <p
        className={`flex-1 text-sm min-w-0 truncate ${
          item.isPaid ? 'text-sumi-400 line-through' : 'text-sumi-800'
        }`}
      >
        {item.description}
      </p>

      <div className="text-right whitespace-nowrap">
        <p className={`font-serif text-sm ${item.isPaid ? 'text-sumi-400' : 'text-sumi-900'}`}>
          A${(item.amountAUD || 0).toFixed(2)}
        </p>
        <p className="text-[10px] text-sumi-500 tracking-wide">
          ¥{Math.round(item.amountJPY || 0).toLocaleString()}
        </p>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 text-sumi-500 hover:text-ai-500 transition-colors"
          title="Edit"
        >
          <Edit2 size={13} strokeWidth={1.5} />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 text-sumi-500 hover:text-shu transition-colors"
          title="Delete"
        >
          <Trash2 size={13} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
