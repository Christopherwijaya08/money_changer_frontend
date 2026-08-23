import { API_BASE_URL } from './apiClient'
import { formatDateTime } from '../utils/formatDateTime'

export function mapCustomer(c) {
  return {
    id: c.id,
    name: c.name,
    identityNumber: c.identity_number,
    phone: c.phone,
    address: c.address,
    idPhotoUrl: c.has_ktp_photo ? `${API_BASE_URL}/customers/${c.id}/ktp-photo` : null,
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
