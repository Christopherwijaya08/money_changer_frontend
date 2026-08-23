// Converts a Laravel ISO timestamp ("2026-08-23T04:31:34.000000Z") into the
// "YYYY-MM-DD HH:mm" shape used throughout the UI.
export function formatDateTime(iso) {
  return iso ? iso.slice(0, 16).replace('T', ' ') : ''
}
