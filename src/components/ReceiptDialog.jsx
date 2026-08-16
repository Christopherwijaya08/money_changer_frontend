import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import PrintIcon from '@mui/icons-material/Print'

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function Row({ label, value, strong }) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? 'font-bold' : ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

export default function ReceiptDialog({ open, onClose, transaction }) {
  if (!transaction) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent>
        <div id="receipt-print-area" className="flex flex-col gap-1 font-mono text-sm">
          <div className="text-center mb-2">
            <div className="text-base font-bold">MONEY CHANGER</div>
            <div>Nota Transaksi Penukaran Valas</div>
          </div>
          <div className="border-t border-dashed border-gray-400 my-1" />
          <Row label="No. Transaksi" value={transaction.transactionNumber} />
          <Row label="Tanggal" value={transaction.createdAt} />
          <div className="border-t border-dashed border-gray-400 my-1" />
          <Row label="Tipe" value={transaction.type === 'buy' ? 'Beli dari Customer' : 'Jual ke Customer'} />
          <Row label="Mata Uang" value={transaction.currencyCode} />
          <Row label="Nominal" value={transaction.amount.toLocaleString('id-ID')} />
          <Row label="Kurs" value={transaction.rateActual.toLocaleString('id-ID')} />
          <div className="border-t border-dashed border-gray-400 my-1" />
          <Row label="TOTAL" value={formatRupiah(transaction.totalAmount)} strong />
          <div className="border-t border-dashed border-gray-400 my-1" />
          <Row label="Customer" value={transaction.customerName} />
          <Row label="Dilayani oleh" value={transaction.employeeName} />
          <div className="border-t border-dashed border-gray-400 my-1" />
          <div className="text-center mt-2">Terima kasih</div>
        </div>
      </DialogContent>
      <DialogActions className="print:hidden">
        <Button onClick={onClose}>Tutup</Button>
        <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>
          Cetak
        </Button>
      </DialogActions>
    </Dialog>
  )
}
