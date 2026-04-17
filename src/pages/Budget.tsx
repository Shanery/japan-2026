import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Plus, ChevronDown, ChevronUp, Trash2, Edit2 } from 'lucide-react'
import BudgetItemRow from '../components/BudgetItemRow'

interface BudgetItem {
  _id: string
  description: string
  category: string
  amountAUD?: number
  amountJPY?: number
  isPaid: boolean
}

const CATEGORIES = [
  { name: 'Flights', color: 'bg-blue-50 border-blue-200' },
  { name: 'Hotels', color: 'bg-purple-50 border-purple-200' },
  { name: 'Transport', color: 'bg-green-50 border-green-200' },
  { name: 'Food', color: 'bg-orange-50 border-orange-200' },
  { name: 'Activities', color: 'bg-pink-50 border-pink-200' },
  { name: 'Shopping', color: 'bg-yellow-50 border-yellow-200' },
  { name: 'Other', color: 'bg-gray-50 border-gray-200' },
]

interface BudgetData {
  _id: string
  description: string
  category: string
  amountAUD?: number
  amountJPY?: number
  isPaid: boolean
}

interface BudgetTotals {
  totalAUD: number
  totalJPY: number
  paidAUD: number
  paidJPY: number
  remainingAUD: number
  remainingJPY: number
}

export default function Budget() {
  const budgetItems = useQuery(api.budget.list) as BudgetData[] | undefined
  const budgetTotals = useQuery(api.budget.getTotals) as BudgetTotals | undefined
  const exchangeRate = useQuery(api.settings.getExchangeRate) as number | undefined

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Flights', 'Hotels', 'Transport']))
  const [exchangeRateInput, setExchangeRateInput] = useState(exchangeRate?.toString() || '90')
  const [newItem, setNewItem] = useState({
    description: '',
    category: 'Other',
    amountAUD: '',
    amountJPY: '',
  })

  const createBudget = useMutation(api.budget.create)
  const updateExchangeRate = useMutation(api.settings.set)

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.description.trim()) return

    const audAmount = newItem.amountAUD ? parseFloat(newItem.amountAUD) : undefined
    const jpyAmount = newItem.amountJPY ? parseFloat(newItem.amountJPY) : undefined

    await createBudget({
      description: newItem.description,
      category: newItem.category,
      amountAUD: audAmount,
      amountJPY: jpyAmount,
      isPaid: false,
    })

    setNewItem({ description: '', category: 'Other', amountAUD: '', amountJPY: '' })
  }

  const handleUpdateExchangeRate = async () => {
    const rate = parseFloat(exchangeRateInput)
    if (rate > 0) {
      await updateExchangeRate({ key: 'exchangeRate', value: rate.toString() })
    }
  }

  const itemsByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat.name] = (budgetItems || []).filter((item) => item.category === cat.name)
    return acc
  }, {} as Record<string, BudgetData[]>)

  const getCategoryTotal = (category: string) => {
    return (itemsByCategory[category] || []).reduce((sum, item) => sum + (item.amountAUD || 0), 0)
  }

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-japan-slate mb-2">Budget Tracker</h1>
        <p className="text-gray-600">Track your trip expenses and stay within budget</p>
      </div>

      {/* Summary Cards */}
      {budgetTotals && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 card-shadow border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Budget AUD</p>
            <p className="text-3xl font-bold text-japan-slate">A${budgetTotals.totalAUD.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-6 card-shadow border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Budget JPY</p>
            <p className="text-3xl font-bold text-japan-slate">¥{Math.round(budgetTotals.totalJPY)}</p>
          </div>
          <div className="bg-white rounded-lg p-6 card-shadow border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">Paid</p>
            <p className="text-3xl font-bold text-japan-red">A${budgetTotals.paidAUD.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-6 card-shadow border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">Remaining</p>
            <p className="text-3xl font-bold text-japan-slate">A${budgetTotals.remainingAUD.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Exchange Rate Settings */}
      <div className="bg-white rounded-lg p-6 card-shadow border border-gray-100">
        <h3 className="text-xl font-bold text-japan-slate mb-4">Exchange Rate</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2">AUD to JPY Rate</label>
            <input
              type="number"
              value={exchangeRateInput}
              onChange={(e) => setExchangeRateInput(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-japan-red"
              placeholder="90"
            />
          </div>
          <button
            onClick={handleUpdateExchangeRate}
            className="bg-japan-red text-white px-6 py-2 rounded-lg hover:bg-japan-slate transition-colors font-medium"
          >
            Update
          </button>
        </div>
      </div>

      {/* Add New Item Form */}
      <div className="bg-white rounded-lg p-6 card-shadow border border-gray-100">
        <h3 className="text-xl font-bold text-japan-slate mb-4">Add Budget Item</h3>
        <form onSubmit={handleAddItem} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-japan-red"
              required
            />
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-japan-red"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount AUD"
              value={newItem.amountAUD}
              onChange={(e) => setNewItem({ ...newItem, amountAUD: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-japan-red"
              step="0.01"
            />
            <input
              type="number"
              placeholder="Amount JPY"
              value={newItem.amountJPY}
              onChange={(e) => setNewItem({ ...newItem, amountJPY: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-japan-red"
              step="1"
            />
            <button
              type="submit"
              className="bg-japan-red text-white px-4 py-2 rounded-lg hover:bg-japan-slate transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </form>
      </div>

      {/* Budget Categories */}
      <div className="space-y-4">
        {CATEGORIES.map((category) => {
          const items = itemsByCategory[category.name] || []
          const categoryTotal = getCategoryTotal(category.name)
          const categorySpent = items.filter((i) => i.isPaid).reduce((sum, item) => sum + (item.amountAUD || 0), 0)
          const isExpanded = expandedCategories.has(category.name)

          return (
            <div key={category.name} className={`${category.color} border-2 rounded-lg overflow-hidden`}>
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/50 transition-colors"
              >
                <div className="flex items-center gap-4 text-left flex-1">
                  <div>
                    <h4 className="font-bold text-japan-slate text-lg">{category.name}</h4>
                    <p className="text-sm text-gray-600">
                      A${categorySpent.toFixed(2)} / A${categoryTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="text-japan-slate" size={24} />
                ) : (
                  <ChevronDown className="text-japan-slate" size={24} />
                )}
              </button>

              {isExpanded && (
                <div className="border-t-2 border-inherit px-6 py-4 space-y-3 bg-white/50">
                  {items.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4 text-center">No items in this category</p>
                  ) : (
                    items.map((item) => <BudgetItemRow key={item._id} item={item} />)
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
