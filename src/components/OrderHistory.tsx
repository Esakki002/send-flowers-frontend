import React, { useEffect, useState } from 'react';
import * as QRCode from 'qrcode';
import { getDeviceId } from '../utils/device';
import { getApiUrl } from '../utils/api';
import RoseIcon from '../icons/RoseIcon';
import CloseIcon from '../icons/CloseIcon';
import CheckIcon from '../icons/CheckIcon';
import LinkIcon from '../icons/LinkIcon';
import { resolveProperShareUrl } from '../utils/url';

interface OrderItem {
  order_id: string;
  payment_id: string;
  card_id: string;
  sender_name: string;
  recipient_name: string;
  message: string;
  delivery: string;
  email?: string;
  share_url: string;
  paid_at?: string;
  status: string;
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedQrOrder, setSelectedQrOrder] = useState<OrderItem | null>(null);
  const [modalQrImage, setModalQrImage] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string>('');

  const [showEmailLookup, setShowEmailLookup] = useState<boolean>(false);
  const [lookupEmail, setLookupEmail] = useState<string>('');

  const fetchOrders = async (searchEmail?: string) => {
    try {
      setLoading(true);
      const deviceId = getDeviceId();
      let url = `/api/orders?device_id=${encodeURIComponent(deviceId)}`;
      if (searchEmail && searchEmail.trim()) {
        url = `/api/orders?email=${encodeURIComponent(searchEmail.trim())}`;
      }
      const res = await fetch(getApiUrl(url));
      if (!res.ok) {
        throw new Error('Failed to load orders');
      }
      const data: OrderItem[] = await res.json();
      const sanitized = (Array.isArray(data) ? data : []).map((order) => ({
        ...order,
        share_url: resolveProperShareUrl(order.share_url, order.card_id, {
          senderName: order.sender_name,
          recipientName: order.recipient_name,
          message: order.message,
        }),
      }));
      setOrders(sanitized);
    } catch {
      // Quiet fail if network error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleOrderCompleted = () => {
      fetchOrders();
    };

    window.addEventListener('order-completed', handleOrderCompleted);
    return () => {
      window.removeEventListener('order-completed', handleOrderCompleted);
    };
  }, []);

  const handleCopyLink = async (order: OrderItem) => {
    try {
      await navigator.clipboard.writeText(order.share_url);
      setCopiedId(order.order_id);
      setTimeout(() => setCopiedId(''), 2500);
    } catch {
      // Fallback
    }
  };

  const handleOpenQr = (order: OrderItem) => {
    setSelectedQrOrder(order);
    try {
      const qr = QRCode.create(order.share_url, { errorCorrectionLevel: 'H' });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;

      const quietZone = 4;
      const moduleCount = qr.modules.size;
      const cellSize = 8;
      const size = (moduleCount + quietZone * 2) * cellSize;

      canvas.width = size;
      canvas.height = size;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, size, size);
      context.fillStyle = '#5B1835';
      for (let y = 0; y < moduleCount; y += 1) {
        for (let x = 0; x < moduleCount; x += 1) {
          const index = y * moduleCount + x;
          if (!qr.modules.data[index]) continue;
          context.fillRect(
            (x + quietZone) * cellSize,
            (y + quietZone) * cellSize,
            cellSize,
            cellSize
          );
        }
      }
      setModalQrImage(canvas.toDataURL('image/png'));
    } catch {
      setModalQrImage('');
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // Completely hide the component if user has 0 purchases
  if (orders.length === 0) {
    return null;
  }

  return (
    <section id="history" className="py-16 bg-[var(--background)] border-t border-[var(--muted)]/20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)] font-semibold">
              YOUR SENT ROSES
            </p>
            <h2 className="text-3xl font-serif text-[var(--primary)] mt-1">
              Order History ({orders.length})
            </h2>
            <p className="text-sm text-[var(--muted)] mt-1">
              Your purchased 3D roses, shareable links, and QR codes.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setShowEmailLookup(!showEmailLookup)}
              className="px-3 py-2 text-xs font-semibold rounded-md border border-[var(--secondary)]/30 hover:bg-[var(--soft-pink)] text-[var(--primary)] transition"
            >
              {showEmailLookup ? 'Hide Email Lookup' : '🔍 Find by Email'}
            </button>
            <button
              type="button"
              onClick={() => fetchOrders(showEmailLookup ? lookupEmail : undefined)}
              className="px-3 py-2 text-xs font-semibold rounded-md border border-[var(--secondary)]/30 hover:bg-[var(--soft-pink)] text-[var(--primary)] transition flex items-center gap-1.5"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Optional Email Lookup Input */}
        {showEmailLookup && (
          <div className="glass-panel p-4 mb-6 rounded-xl border border-[var(--secondary)]/30 flex flex-col sm:flex-row gap-2 items-center">
            <input
              type="email"
              placeholder="Enter recipient email used when ordering..."
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              className="glass-control flex-1 w-full rounded-md p-2 text-xs text-[var(--text)]"
            />
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => fetchOrders(lookupEmail)}
                className="flex-1 sm:flex-initial px-4 py-2 bg-[var(--primary)] text-[var(--background)] rounded-md text-xs font-semibold hover:bg-[var(--secondary)] transition"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => {
                  setLookupEmail('');
                  fetchOrders();
                }}
                className="px-3 py-2 text-xs text-[var(--muted)] hover:text-[var(--text)] transition"
              >
                Reset to Device
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="glass-panel p-5 rounded-2xl border border-[var(--secondary)]/20 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                    ✓ Paid ₹100
                  </span>
                  <span className="text-[0.7rem] uppercase tracking-wider text-[var(--muted)]">
                    {order.delivery === 'email' ? '✉️ Email' : order.delivery === 'qr' ? '📱 QR Code' : '🔗 Link'}
                  </span>
                </div>

                <div className="mb-2">
                  <p className="text-xs text-[var(--muted)]">To:</p>
                  <h3 className="text-lg font-semibold text-[var(--primary)] truncate">
                    {order.recipient_name}
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    From: <span className="text-[var(--text)]">{order.sender_name}</span>
                  </p>
                </div>

                <div className="p-3 bg-[var(--soft-pink)] rounded-xl my-3 text-xs italic text-[var(--text)] line-clamp-3">
                  &ldquo;{order.message}&rdquo;
                </div>

                <p className="text-[0.7rem] text-[var(--muted)] mb-4">
                  {formatDate(order.paid_at)}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--secondary)]/15 space-y-2">
                <div className="flex gap-2">
                  <a
                    href={order.share_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 text-center text-xs font-semibold rounded-lg bg-[var(--primary)] text-[var(--background)] hover:bg-[var(--secondary)] transition flex items-center justify-center gap-1.5"
                  >
                    <span>View Rose</span>
                    <RoseIcon className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(order)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg border border-[var(--secondary)]/30 hover:bg-[var(--soft-pink)] text-[var(--primary)] transition flex items-center gap-1"
                    title="Copy Card Link"
                  >
                    {copiedId === order.order_id ? (
                      <>
                        <CheckIcon className="w-3 h-3 text-emerald-700" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-3 h-3" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenQr(order)}
                  className="w-full py-1.5 text-xs text-[var(--muted)] hover:text-[var(--primary)] text-center transition"
                >
                  View QR Code →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Code Modal */}
      {selectedQrOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedQrOrder(null);
          }}
        >
          <div className="glass-panel relative max-w-sm w-full p-6 rounded-2xl text-center space-y-4">
            <button
              type="button"
              onClick={() => setSelectedQrOrder(null)}
              aria-label="Close"
              className="absolute right-4 top-4 p-1.5 rounded-full text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--soft-pink)] transition"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-[var(--primary)]">
              Rose for {selectedQrOrder.recipient_name}
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Scan this QR code with a phone to open the 3D rose card
            </p>
            {modalQrImage ? (
              <div className="p-3 bg-white rounded-xl inline-block shadow-md">
                <img
                  src={modalQrImage}
                  alt={`QR code for ${selectedQrOrder.recipient_name}`}
                  className="w-56 h-56 object-contain"
                />
              </div>
            ) : (
              <p className="text-xs text-[var(--muted)]">Generating QR code...</p>
            )}
            <div className="pt-2">
              <a
                href={selectedQrOrder.share_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[var(--accent)] hover:underline inline-block"
              >
                Open direct rose link →
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default OrderHistory;
