import React, { useMemo } from 'react';

export default function ThermalInvoice({
  storeDetails = {},
  customerDetails = {},
  invoiceDetails = {},
  billingItems = [],
  summary = {},
  terms = [],
}) {
  // Helpers
  const formatAmount = (val) => {
    if (val === null || val === undefined) return '';
    const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''));
    if (Number.isNaN(num)) return String(val);
    return num.toFixed(2);
  };

  const store = useMemo(() => ({
    name: 'BillBookPlus',
    addressLines: [],
    phones: [],
    gst: '',
    ...storeDetails,
  }), [storeDetails]);

  // Normalize customer fields (ensure name and phone render reliably)
  const customer = { ...customerDetails };
  const customerName = customer.name || customer.customerName || customer.fullName || '';
  const customerPhone = customer.contactNo || customer.number || customer.phoneNumber || customer.phone || customer.mobileNo || customer.mobile || '';
  const invoice = { ...invoiceDetails };
  const items = billingItems || [];
  const finalTerms = terms && terms.length ? terms : null;

  // Artist display removed for thermal invoice

  // Helpers to normalize item amounts
  const getItemPrice = (it) => {
    const raw = it?.unit_price ?? it?.unitPrice ?? it?.price;
    if (raw == null) return 0;
    const num = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^0-9.-]/g, ''));
    return Number.isNaN(num) ? 0 : num;
  };
  const getItemQty = (it) => {
    const raw = it?.qty ?? it?.quantity ?? 1;
    const num = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^0-9.-]/g, ''));
    return Number.isNaN(num) ? 1 : num;
  };
  const getItemDiscount = (it) => (it?.discountValue ?? it?.discount_amount ?? it?.discountAmount ?? it?.discount_value ?? it?.discount);
  const getItemDiscountInfo = (it) => {
    const percentRaw = it?.discountPercent ?? it?.discount_percent ?? it?.discount_percentage ?? it?.percentDiscount ?? it?.percentage ?? it?.discountRate;
    const typeRaw = it?.discountType ?? it?.discount_type ?? it?.discountMode ?? it?.discount_unit;
    const isPercentFlag = it?.discountIsPercent ?? it?.isPercentDiscount ?? it?.is_percentage;
    let isPercent = false;
    if (typeof isPercentFlag === 'boolean') {
      isPercent = isPercentFlag;
    } else if (typeof typeRaw === 'string') {
      const t = typeRaw.toLowerCase();
      isPercent = t.includes('percent') || t === '%';
    }
    if (percentRaw != null) {
      const pv = typeof percentRaw === 'number' ? percentRaw : parseFloat(String(percentRaw).replace(/[^0-9.-]/g, ''));
      if (!Number.isNaN(pv)) return { value: pv, isPercent: true };
    }
    const amountRaw = getItemDiscount(it);
    if (amountRaw != null) {
      const av = typeof amountRaw === 'number' ? amountRaw : parseFloat(String(amountRaw).replace(/[^0-9.-]/g, ''));
      if (!Number.isNaN(av)) return { value: av, isPercent };
    }
    return { value: null, isPercent: false };
  };
  const getItemTotal = (it) => {
    const explicit = it?.totalPrice ?? it?.total_price ?? it?.line_total ?? it?.total ?? null;
    if (explicit == null) return null;
    const num = typeof explicit === 'number' ? explicit : parseFloat(String(explicit).replace(/[^0-9.-]/g, ''));
    return Number.isNaN(num) ? null : num;
  };

  return (
    <div id="thermal-print-area" className="thermal-receipt mx-auto" style={{ width: '80mm', padding: '4mm', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace', fontSize: '12px', background: 'white' }}>
      <style>{`
        @media print {
          @page { size: 80mm auto; margin: 2mm; }
        }
        .t-center { text-align: center; }
        .t-right { text-align: right; }
        .t-left { text-align: left; }
        .row { display: flex; justify-content: space-between; }
        .muted { color: #444; }
        .hr { border-top: 1px dashed #999; margin: 6px 0; }
        .bold { font-weight: 700; }
      `}</style>

      {/* Header */}
      <div className="t-center">
        {store.name && <div className="bold" style={{ fontSize: '14px' }}>{store.name}</div>}
        {store.addressLines?.length > 0 && (
          <div className="muted">
            {store.addressLines.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        )}
        {store.phones?.length > 0 && <div className="muted">Ph: {store.phones.join(', ')}</div>}
        {store.gst && <div className="muted">GST: {store.gst}</div>}
      </div>

      <div className="hr" />

      {/* Bill meta */}
      <div className="row">
        <div>Invoice: <span className="bold">{invoice.invoiceNo}</span></div>
        <div className="t-right">{invoice.dateTime}</div>
      </div>
  <div>Customer: <span className="bold">{customerName}</span></div>
  {customerPhone && <div className="muted">Mob: {customerPhone}</div>}

      <div className="hr" />

      {/* Items */}
      <div>
        {items.map((it, idx) => (
          <div key={it.id || idx} style={{ marginBottom: '6px' }}>
            {/* Type above the item name */}
            {(it.type || it.itemType || it.category) ? (
              <div className="muted" style={{ fontSize: '11px' }}>{it.type || it.itemType || it.category}</div>
            ) : null}
            <div className="row">
              <div className="bold" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '50mm' }}>{it.name}</div>
              <div className="t-right">{(() => { const t = getItemTotal(it); return t == null ? '' : formatAmount(t); })()}</div>
            </div>
            <div className="row muted" style={{ fontSize: '11px' }}>
              <div>Qty: {getItemQty(it)}</div>
              <div>Rate: {formatAmount(getItemPrice(it))}</div>
            </div>
            {/* Artist removed in thermal invoice */}
            {(() => { const { value, isPercent } = getItemDiscountInfo(it); return (value != null) ? <div className="muted" style={{ fontSize: '11px' }}>Disc: {formatAmount(value)}{isPercent ? '%' : ''}</div> : null; })()}
          </div>
        ))}
      </div>

      <div className="hr" />

      {/* Summary */}
      <div className="row"><div className="bold">Sub Total</div><div className="bold">{formatAmount(summary.subTotal)}</div></div>
      {summary.CGST != null && (
        <div className="row"><div>CGST {summary.cgstPercent != null ? `${summary.cgstPercent}%` : ''}</div><div>{formatAmount(summary.CGST)}</div></div>
      )}
      {summary.SGST != null && (
        <div className="row"><div>SGST {summary.sgstPercent != null ? `${summary.sgstPercent}%` : ''}</div><div>{formatAmount(summary.SGST)}</div></div>
      )}
      {summary.discount ? (
        <div className="row"><div>Discount</div><div>-{formatAmount(summary.discount)}</div></div>
      ) : null}
      <div className="row bold" style={{ fontSize: '13px' }}><div>Total</div><div>{formatAmount(summary.total)}</div></div>
      {Array.isArray(summary.payments) && summary.payments.length > 0 && (
        <div style={{ marginTop: '6px' }}>
          {summary.payments.map((p, i) => (
            <div className="row" key={i}><div>Paid ({p.mode})</div><div>{formatAmount(p.amount)}</div></div>
          ))}
        </div>
      )}
      {summary.dues != null && (
        <div className="row bold"><div>Dues</div><div>{formatAmount(summary.dues)}</div></div>
      )}

      {finalTerms && (
        <>
          <div className="hr" />
          <div style={{ fontSize: '11px' }}>
            {finalTerms.map((t, i) => (<div key={i}>• {t}</div>))}
          </div>
        </>
      )}

      <div className="t-center" style={{ marginTop: '8px' }}>Thank you! Visit again</div>
    </div>
  );
}
