import { formatDateTime } from '../utils/formatDateTime'

export function mapCustomer(c) {
  return {
    id: c.id,
    name: c.name,
    identityNumber: c.identity_number,
    phone: c.phone,
    address: c.address,
    hasKtpPhoto: c.has_ktp_photo,
  }
}

export function mapAccount(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.is_active,
  }
}

export function mapCurrency(c) {
  return {
    id: c.id,
    code: c.code,
    name: c.name,
    isActive: c.is_active,
  }
}

export function mapBranch(b) {
  return {
    id: b.id,
    name: b.name,
    address: b.address,
    isActive: b.is_active,
  }
}

export function mapEmployee(e) {
  return {
    id: e.id,
    name: e.name,
    position: e.position,
    isActive: e.is_active,
    branchId: e.branch_id,
    branchName: e.branch_name,
  }
}

export function mapTransaction(t) {
  return {
    id: t.id,
    transactionNumber: t.transaction_number,
    type: t.type,
    currencyCode: t.currency_code,
    amount: Number(t.amount),
    rateActual: Number(t.rate_actual),
    totalAmount: Number(t.total_amount),
    customerName: t.customer_name,
    employeeName: t.employee_name,
    requiresReview: t.requires_review,
    createdAt: formatDateTime(t.created_at),
  }
}
