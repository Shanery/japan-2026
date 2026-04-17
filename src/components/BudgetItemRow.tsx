import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Trash2, Edit2 } from 'lucide-react'
import { useState } from 'react'

interface BudgetItemRowProps {
  item: {
    _id: string
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
    await updateBudget({
      id: item._id,
      isPaid: !item.isPaid,
    })
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
      <div className="flex gap-3 items-center p-3 bg-white rounded border-2 border-japan-red">
        <input
          type="text"
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-japan-red"
        />
        <input
          type="number"
          value={editedAmountAUD}
          onChange={(e) => setEditedAmountAUD(e.target.value)}
          className="w-24 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-japan-red"
          step="0.01"
        />
        <button
          onClick={handleSaveEdit}
          className="px-3 py-1 bg-japan-red text-white rounded text-sm font-medium hover:bg-japan-slate transition-colors"
        >
          Save
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center justify-between p-3 rounded transition-colors ${
        item.isPaid ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        <input
          type="checkbox"
          checked={item.isPaid}
          onChange={handleTogglePaid}
          className="w-5 h-5 accent-japan-red cursor-pointer"
        />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${item.isPaid ? 'text-gray-500 line-through' : 'text-japan-slate'}`}>
            {item.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <div className="text-right whitespace-nowrap">
          <p className="text-sm font-bold text-japan-slate">A${(item.amountAUD || 0).toFixed(2)}</p>
          <p className="text-xs text-gray-600">¥{Math.round(item.amountJPY || 0)}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-gray-600 hover:bg-blue-100 hover:text-blue-600 rounded transition-colors"
            title="Edit item"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
            title="Delete item"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
