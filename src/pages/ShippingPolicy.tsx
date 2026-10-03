export default function ShippingPolicy() {
  return (
    <div className="pt-24 pb-12 min-h-screen bg-ayu-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-ayu-border" />
          <h1 className="text-2xl md:text-3xl font-bold text-ayu-text-bright uppercase tracking-wider">
            &gt; Shipping Policy
          </h1>
          <div className="h-px flex-1 bg-ayu-border" />
        </div>
        <div className="ayu-card p-6 space-y-4 text-sm text-ayu-text leading-relaxed">
          <p>At ForizCart, we strive to deliver your Ayurvedic products safely and on time. Please review our shipping policy below:</p>
          <h2 className="text-ayu-text-bright font-semibold uppercase tracking-wider">1. Shipping Areas</h2>
          <p>We currently ship across India. International shipping is not available at this time. We are continuously expanding our reach and will notify customers when new regions become available.</p>
          <h2 className="text-ayu-text-bright font-semibold uppercase tracking-wider">2. Processing Time</h2>
          <p>Orders are typically processed within 1-2 business days. During peak seasons or promotional periods, processing may take up to 3-4 business days. You will receive a confirmation email once your order has been dispatched.</p>
          <h2 className="text-ayu-text-bright font-semibold uppercase tracking-wider">3. Delivery Timeframes</h2>
          <p>Standard delivery takes 3-7 business days depending on your location. Metro cities usually receive deliveries within 3-4 business days, while remote areas may take up to 7 business days.</p>
          <h2 className="text-ayu-text-bright font-semibold uppercase tracking-wider">4. Shipping Charges</h2>
          <p>Free shipping is available on orders above a minimum threshold. Orders below the threshold are charged a nominal shipping fee calculated at checkout. Shipping charges are non-refundable in case of order cancellation.</p>
          <h2 className="text-ayu-text-bright font-semibold uppercase tracking-wider">5. Order Tracking</h2>
          <p>Once dispatched, you will receive a tracking number via email. You can use this number to track your shipment on our courier partner's website. Please allow 24 hours for the tracking information to update.</p>
          <h2 className="text-ayu-text-bright font-semibold uppercase tracking-wider">6. Failed Deliveries</h2>
          <p>If a delivery fails due to an incorrect address or unavailability at the time of delivery, the courier will attempt delivery again. After 2-3 attempts, the package may be returned to us. Additional shipping charges may apply for re-delivery.</p>
          <h2 className="text-ayu-text-bright font-semibold uppercase tracking-wider">7. Damaged or Lost Packages</h2>
          <p>If your package arrives damaged or is lost in transit, please contact us within 48 hours of delivery attempt. We will initiate a replacement or refund after verifying the claim with our courier partner.</p>
          <h2 className="text-ayu-text-bright font-semibold uppercase tracking-wider">8. Contact for Shipping Issues</h2>
          <p>For any shipping-related queries, please reach out to our support team at <strong>forizcart@gmail.com</strong> or WhatsApp <strong>+91 76579 42799</strong>.</p>
          <div className="border-t border-ayu-border pt-4 mt-6">
            <p className="text-xs text-ayu-text">Last updated: October 2026</p>
          </div>
        </div>
      </div>
    </div>
  )
}
