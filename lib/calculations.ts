import type { JobCosts, JobWithCosts, Job, CompanyExpense, ExpenseFrequency } from './types'

export function calcLabourTotal(costs: JobCosts): number {
  return costs.labour.reduce((sum, l) => sum + l.hours * l.hourly_rate, 0)
}

export function calcMaterialsTotal(costs: JobCosts): number {
  return costs.materials.reduce((sum, m) => sum + m.quantity * m.unit_cost, 0)
}

export function calcSealerTotal(costs: JobCosts): number {
  return costs.sealers.reduce((sum, s) => sum + s.quantity * s.unit_cost, 0)
}

export function calcTravelTotal(costs: JobCosts): number {
  return costs.travel.reduce(
    (sum, t) => sum + t.fuel_cost + t.tolls + t.parking,
    0
  )
}

export function calcEquipmentTotal(costs: JobCosts): number {
  return costs.equipment.reduce(
    (sum, e) => sum + e.usage_cost + e.hire_cost + e.wear_and_tear_cost,
    0
  )
}

export function calcOtherTotal(costs: JobCosts): number {
  return costs.other.reduce((sum, o) => sum + o.amount, 0)
}

export function calcTotalDirectCost(costs: JobCosts): number {
  return (
    calcLabourTotal(costs) +
    calcMaterialsTotal(costs) +
    calcSealerTotal(costs) +
    calcTravelTotal(costs) +
    calcEquipmentTotal(costs) +
    calcOtherTotal(costs)
  )
}

export function calcGrossProfit(invoiceAmount: number, totalDirectCost: number): number {
  return invoiceAmount - totalDirectCost
}

export function calcGrossMarginPct(invoiceAmount: number, grossProfit: number): number {
  if (invoiceAmount === 0) return 0
  return (grossProfit / invoiceAmount) * 100
}

export function buildJobWithCosts(job: Job, costs: JobCosts): JobWithCosts {
  const totalLabour = calcLabourTotal(costs)
  const totalMaterials = calcMaterialsTotal(costs)
  const totalSealer = calcSealerTotal(costs)
  const totalTravel = calcTravelTotal(costs)
  const totalEquipment = calcEquipmentTotal(costs)
  const totalOther = calcOtherTotal(costs)
  const totalDirect = totalLabour + totalMaterials + totalSealer + totalTravel + totalEquipment + totalOther
  const grossProfit = calcGrossProfit(job.invoice_amount, totalDirect)
  const grossMarginPct = calcGrossMarginPct(job.invoice_amount, grossProfit)
  return {
    ...job,
    costs,
    total_labour_cost: totalLabour,
    total_materials_cost: totalMaterials,
    total_sealer_cost: totalSealer,
    total_travel_cost: totalTravel,
    total_equipment_cost: totalEquipment,
    total_other_cost: totalOther,
    total_direct_cost: totalDirect,
    gross_profit: grossProfit,
    gross_margin_pct: grossMarginPct,
  }
}

// Convert an expense to monthly equivalent
export function toMonthlyAmount(amount: number, frequency: ExpenseFrequency): number {
  switch (frequency) {
    case 'weekly': return amount * 52 / 12
    case 'monthly': return amount
    case 'quarterly': return amount / 3
    case 'yearly': return amount / 12
  }
}

export function calcMonthlyOverhead(expenses: CompanyExpense[]): number {
  return expenses.reduce((sum, e) => sum + toMonthlyAmount(e.amount, e.frequency), 0)
}

export function calcYearlyOverhead(expenses: CompanyExpense[]): number {
  return calcMonthlyOverhead(expenses) * 12
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPct(pct: number): string {
  return `${pct.toFixed(1)}%`
}
