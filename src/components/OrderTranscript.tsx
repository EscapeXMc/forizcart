type OrderItem = {
  id?: string | number
  name?: string
  title?: string
  price?: number
  quantity?: number
  image?: string
  [key: string]: any
}

type Order = {
  id: string
  order_number?: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_address: any
  items: OrderItem[]
  total: number
  subtotal?: number
  order_status?: string
  status?: string
  payment_method?: string
  payment_id?: string
  razorpay_order_id?: string
  razorpay_payment_id?: string
  created_at: string
  [key: string]: any
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusLabel(status: string) {
  if (!status) return 'Pending'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function OrderTranscript({ order }: { order: Order }) {
  const subtotal = order.subtotal || order.items?.reduce((sum: number, item: OrderItem) => sum + ((item.price || 0) * (item.quantity || 1)), 0) || 0
  const tax = 0
  const shipping = 0
  const total = order.total || subtotal + tax + shipping
  const status = order.status || order.order_status || 'pending'

  const renderAddress = () => {
    if (!order.shipping_address) return '-'
    if (typeof order.shipping_address === 'string') return order.shipping_address
    if (typeof order.shipping_address === 'object') {
      const addr = order.shipping_address
      return [addr.street, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean).join(', ') || JSON.stringify(addr)
    }
    return '-'
  }

  return (
    <div className="order-transcript">
      <style>{`
        .order-transcript {
          font-family: var(--font-ayu), 'JetBrains Mono', 'Fira Code', monospace;
          color: var(--color-ayu-text);
        }
        .order-transcript * {
          box-sizing: border-box;
        }
        .order-transcript .transcript-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid var(--color-ayu-border-bright);
          padding-bottom: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .order-transcript .store-info h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-ayu-text-bright);
          margin: 0 0 0.25rem 0;
        }
        .order-transcript .store-info p {
          margin: 0;
          font-size: 0.75rem;
          color: var(--color-ayu-text);
        }
        .order-transcript .order-meta {
          text-align: right;
        }
        .order-transcript .order-meta .order-id-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-ayu-text);
          margin-bottom: 0.25rem;
        }
        .order-transcript .order-meta .order-id-value {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-ayu-text-bright);
          word-break: break-all;
          margin-bottom: 0.5rem;
        }
        .order-transcript .order-meta .order-date {
          font-size: 0.75rem;
          color: var(--color-ayu-text);
        }
        .order-transcript .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .order-transcript .info-box {
          border: 1px solid var(--color-ayu-border);
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
        }
        .order-transcript .info-box .info-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-ayu-text);
          margin-bottom: 0.25rem;
        }
        .order-transcript .info-box .info-value {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-ayu-text-bright);
        }
        .order-transcript .section-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-ayu-primary);
          border-bottom: 1px solid var(--color-ayu-border);
          padding-bottom: 0.5rem;
          margin-bottom: 0.75rem;
        }
        .order-transcript .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.5rem;
        }
        .order-transcript .items-table th {
          text-align: left;
          padding: 0.5rem 0.75rem;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-ayu-primary);
          border-bottom: 2px solid var(--color-ayu-border);
          background: var(--color-ayu-surface);
        }
        .order-transcript .items-table td {
          padding: 0.6rem 0.75rem;
          font-size: 0.8rem;
          border-bottom: 1px solid var(--color-ayu-border);
          color: var(--color-ayu-text);
        }
        .order-transcript .items-table .item-name {
          color: var(--color-ayu-text-bright);
          font-weight: 600;
        }
        .order-transcript .items-table .text-right {
          text-align: right;
        }
        .order-transcript .totals-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1.5rem;
        }
        .order-transcript .totals-box {
          width: 100%;
          max-width: 280px;
        }
        .order-transcript .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 0.35rem 0;
          font-size: 0.8rem;
          color: var(--color-ayu-text);
        }
        .order-transcript .totals-row.total {
          border-top: 2px solid var(--color-ayu-border-bright);
          margin-top: 0.5rem;
          padding-top: 0.75rem;
          font-weight: 700;
          font-size: 1rem;
          color: var(--color-ayu-text-bright);
        }
        .order-transcript .payment-section {
          border: 1px solid var(--color-ayu-border);
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }
        .order-transcript .payment-section .section-title {
          margin-top: 0;
        }
        .order-transcript .footer-note {
          text-align: center;
          font-size: 0.65rem;
          color: var(--color-ayu-text);
          border-top: 1px solid var(--color-ayu-border);
          padding-top: 1rem;
          margin-top: 1.5rem;
        }
        .order-transcript .badge {
          display: inline-flex;
          padding: 0.15rem 0.5rem;
          font-size: 0.65rem;
          font-weight: 700;
          border: 1px solid;
          border-radius: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .order-transcript .badge-success {
          border-color: var(--color-ayu-success);
          color: var(--color-ayu-success);
        }
        .order-transcript .badge-warning {
          border-color: var(--color-ayu-warning);
          color: var(--color-ayu-warning);
        }
        .order-transcript .badge-primary {
          border-color: var(--color-ayu-primary);
          color: var(--color-ayu-primary);
        }
        .order-transcript .badge-secondary {
          border-color: var(--color-ayu-secondary);
          color: var(--color-ayu-secondary);
        }
        .order-transcript .badge-error {
          border-color: var(--color-ayu-error);
          color: var(--color-ayu-error);
        }

        @media print {
          body * {
            visibility: hidden;
          }
          .order-transcript, .order-transcript * {
            visibility: visible;
          }
          .order-transcript {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="transcript-header">
        <div className="store-info">
          <h2>ForizCart</h2>
          <p>Shop smart, pay less.</p>
          <p>Professional E-Commerce Store</p>
        </div>
        <div className="order-meta">
          <div className="order-id-label">Order ID</div>
          <div className="order-id-value">{order.id}</div>
          {order.order_number && <div className="order-id-value" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>{order.order_number}</div>}
          <div className="order-date">{formatDate(order.created_at)}</div>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-box">
          <div className="info-label">Customer</div>
          <div className="info-value">{order.customer_name}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-ayu-text)', marginTop: '0.15rem' }}>{order.customer_email}</div>
          {order.customer_phone && <div style={{ fontSize: '0.7rem', color: 'var(--color-ayu-text)', marginTop: '0.15rem' }}>{order.customer_phone}</div>}
        </div>
        <div className="info-box">
          <div className="info-label">Shipping Address</div>
          <div className="info-value" style={{ fontSize: '0.75rem', lineHeight: '1.5' }}>{renderAddress()}</div>
        </div>
        <div className="info-box">
          <div className="info-label">Status</div>
          <div className="info-value" style={{ marginTop: '0.25rem' }}>
            <span className={`badge ${status === 'delivered' ? 'badge-success' : status === 'shipped' ? 'badge-secondary' : status === 'cancelled' ? 'badge-error' : status === 'processing' ? 'badge-primary' : 'badge-warning'}`}>
              {getStatusLabel(status)}
            </span>
          </div>
        </div>
        <div className="info-box">
          <div className="info-label">Payment</div>
          <div className="info-value">{order.payment_method || 'Razorpay'}</div>
          {order.payment_id && <div style={{ fontSize: '0.7rem', color: 'var(--color-ayu-text)', marginTop: '0.15rem' }}>{order.payment_id}</div>}
        </div>
      </div>

      <div className="section-title">Order Items</div>
      <table className="items-table">
        <thead>
          <tr>
            <th style={{ width: '40%' }}>Item</th>
            <th className="text-right">Price</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item: OrderItem, idx: number) => (
            <tr key={idx}>
              <td className="item-name">{item.name || item.title || `Item ${idx + 1}`}</td>
              <td className="text-right">{formatCurrency(item.price || 0)}</td>
              <td className="text-right">{item.quantity || 1}</td>
              <td className="text-right">{formatCurrency((item.price || 0) * (item.quantity || 1))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="totals-section">
        <div className="totals-box">
          <div className="totals-row">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {tax > 0 && (
            <div className="totals-row">
              <span>Tax</span>
              <span>{formatCurrency(tax)}</span>
            </div>
          )}
          {shipping > 0 && (
            <div className="totals-row">
              <span>Shipping</span>
              <span>{formatCurrency(shipping)}</span>
            </div>
          )}
          <div className="totals-row total">
            <span>Grand Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className="payment-section">
        <div className="section-title">Payment Details</div>
        <div className="info-grid" style={{ marginBottom: 0 }}>
          <div className="info-box" style={{ padding: '0.5rem 0.75rem' }}>
            <div className="info-label">Payment Method</div>
            <div className="info-value">{order.payment_method || 'Razorpay'}</div>
          </div>
          <div className="info-box" style={{ padding: '0.5rem 0.75rem' }}>
            <div className="info-label">Payment ID</div>
            <div className="info-value" style={{ fontSize: '0.7rem', wordBreak: 'break-all' }}>{order.payment_id || '-'}</div>
          </div>
          <div className="info-box" style={{ padding: '0.5rem 0.75rem' }}>
            <div className="info-label">Razorpay Order ID</div>
            <div className="info-value" style={{ fontSize: '0.7rem', wordBreak: 'break-all' }}>{order.razorpay_order_id || '-'}</div>
          </div>
          <div className="info-box" style={{ padding: '0.5rem 0.75rem' }}>
            <div className="info-label">Razorpay Payment ID</div>
            <div className="info-value" style={{ fontSize: '0.7rem', wordBreak: 'break-all' }}>{order.razorpay_payment_id || '-'}</div>
          </div>
        </div>
      </div>

      <div className="footer-note">
        <p>Thank you for shopping with ForizCart!</p>
        <p style={{ marginTop: '0.25rem' }}>For support, contact us at forizcart@gmail.com</p>
        <p style={{ marginTop: '0.25rem' }}>This is a computer-generated transcript and does not require a signature.</p>
      </div>
    </div>
  )
}
