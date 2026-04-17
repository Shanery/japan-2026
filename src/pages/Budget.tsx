import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { Plus, ChevronDown } from 'lucide-react'
import BudgetItemRow from '../components/BudgetItemRow'

const CATEGORIES = [
  { name: 'Flights', jp: '航空' },
  { name: 'Hotels', jp: '宿' },
  { name: 'Transport', jp: '交通' },
  { name: 'Food', jp: '食' },
  { name: 'Activities', jp: '体験' },
  { name: 'Shopping', jp: '買物' },
  { name: 'Other', jp: '他' },
]

interface BudgetData {
  _id: Id<'budgetItems'>
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

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Flights', 'Hotels', 'Transport']),
  )
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
    const next = new Set(expandedCategories)
    next.has(category) ? next.delete(category) : next.add(category)
    setExpandedCategories(next)
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.description.trim()) return
    await createBudget({
      description: newItem.description,
      category: newItem.category,
      amountAUD: newItem.amountAUD ? parseFloat(newItem.amountAUD) : undefined,
      amountJPY: newItem.amountJPY ? parseFloat(newItem.amountJPY) : undefined,
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

  const getCategoryTotal = (category: string) =>
    (itemsByCategory[category] || []).reduce((sum, item) => sum + (item.amountAUD || 0), 0)

  const paidPct = budgetTotals && budgetTotals.totalAUD > 0
    ? Math.min(100, (budgetTotals.paidAUD / budgetTotals.totalAUD) * 100)
    : 0

  return (
    <div className="space-y-16 pb-8">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="kanji-watermark text-[16rem] md:text-[22rem] leading-none -top-12 -right-4">
          円
        </div>
        <div className="relative">
          <p className="mincho-label mb-4">予算 · Budget</p>
          <h1 className="font-serif text-5xl md:text-6xl text-sumi-900 leading-none tracking-mincho mb-4">
            Plan the spend.
          </h1>
          <p className="text-sumi-600 max-w-xl leading-relaxed">
            A calm ledger of expenses, tracked across yen and Australian dollars.
          </p>
        </div>
      </section>

      {/* Summary */}
      {budgetTotals && (
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-y border-washi-200">
            <div className="px-6 py-8 border-r border-washi-200">
              <p className="mincho-label mb-3">Total · AUD</p>
              <p className="font-serif text-3xl text-sumi-900">A${budgetTotals.totalAUD.toFixed(0)}</p>
            </div>
            <div className="px-6 py-8 md:border-r border-washi-200">
              <p className="mincho-label mb-3">Total · JPY</p>
              <p className="font-serif text-3xl text-sumi-900">
                ¥{Math.round(budgetTotals.totalJPY).toLocaleString()}
              </p>
            </div>
            <div className="px-6 py-8 border-t md:border-t-0 border-r border-washi-200">
              <p className="mincho-label mb-3">Paid</p>
              <p className="font-serif text-3xl text-ai-500">A${budgetTotals.paidAUD.toFixed(0)}</p>
            </div>
            <div className="px-6 py-8 border-t md:border-t-0">
              <p className="mincho-label mb-3">Remaining</p>
              <p className="font-serif text-3xl text-sumi-900">
                A${budgetTotals.remainingAUD.toFixed(0)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-xs text-sumi-500 tracking-wide mb-2">
              <span>Progress</span>
              <span>{paidPct.toFixed(0)}% paid</span>
            </div>
            <div className="h-px bg-washi-200 relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-ai-500 transition-all duration-700"
                style={{ width: `${paidPct}%`, height: '2px', top: '-0.5px' }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Exchange Rate */}
      <section>
        <p className="mincho-label mb-3">為替 · Exchange</p>
        <h2 className="font-serif text-2xl text-sumi-900 mb-6">AUD to JPY rate</h2>
        <div className="flex items-end gap-4 max-w-md">
          <div className="flex-1">
            <input
              type="number"
              value={exchangeRateInput}
              onChange={(e) => setExchangeRateInput(e.target.value)}
              className="input-minimal font-serif text-3xl"
              placeholder="90"
            />
          </div>
          <button onClick={handleUpdateExchangeRate} className="btn-primary">
            Update
          </button>
        </div>
      </section>

      {/* Add new item */}
      <section>
        <p className="mincho-label mb-3">追加 · Add</p>
        <h2 className="font-serif text-2xl text-sumi-900 mb-6">New expense</h2>
        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Description"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            className="input-bordered md:col-span-2"
            required
          />
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            className="input-bordered"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="AUD"
            value={newItem.amountAUD}
            onChange={(e) => setNewItem({ ...newItem, amountAUD: e.target.value })}
            className="input-bordered"
            step="0.01"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="JPY"
              value={newItem.amountJPY}
              onChange={(e) => setNewItem({ ...newItem, amountJPY: e.target.value })}
              className="input-bordered flex-1"
              step="1"
            />
            <button type="submit" className="btn-primary !px-3" title="Add">
              <Plus size={16} strokeWidth={1.5} />
            </button>
          </div>
        </form>
      </section>

      {/* Categories */}
      <section className="border-t border-washi-200">
        {CATEGORIES.map((category) => {
          const items = itemsByCategory[category.name] || []
          const categoryTotal = getCategoryTotal(category.name)
          const categorySpent = items
            .filter((i) => i.isPaid)
            .reduce((sum, item) => sum + (item.amountAUD || 0), 0)
          const isExpanded = expandedCategories.has(category.name)

          return (
            <div key={category.name} className="border-b border-washi-200">
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full px-1 py-6 flex items-center justify-between hover:bg-washi-100/50 transition-colors group"
              >
                <div className="flex items-baseline gap-5 text-left">
                  <span className="font-serif text-2xl text-ai-500 tracking-mincho-wide">
                    {category.jp}
                  </span>
                  <div>
                    <h3 className="font-serif text-lg text-sumi-900">{category.name}</h3>
                    <p className="text-xs text-sumi-500 tracking-wide mt-0.5">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-serif text-lg text-sumi-900">
                      A${categorySpent.toFixed(0)}
                      <span className="text-sumi-400 mx-1">/</span>
                      A${categoryTotal.toFixed(0)}
                    </p>
                  </div>
                  <ChevronDown
                    size={18}
                    strokeWidth={1.5}
                    className={`text-sumi-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="pb-6 pl-14 pr-1 space-y-2">
                  {items.length === 0 ? (
                    <p className="text-sumi-400 text-sm py-4 tracking-wide">Nothing here yet.</p>
                  ) : (
                    items.map((item) => <BudgetItemRow key={item._id} item={item} />)
                  )}
                </div>
              )}
            </div>
          )
        })}
      </section>
    </div>
  )
}
