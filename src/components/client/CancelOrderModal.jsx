/* FixMate — מודל ביטול הזמנה (לקוח) */
export default function CancelOrderModal({ order, onClose, reason, setReason, chargesFee, freeHoursLeft, fee, onConfirm, t, dir, lang, isHe }) {
  if (!order) return null;
  const leftH = freeHoursLeft ? freeHoursLeft(order) : null;   // שעות שנותרו לביטול חינם
  return (
    <div className="cd-modal-overlay" onClick={onClose}>
      <div className="cd-modal cd-modal--small" onClick={(e) => e.stopPropagation()} style={{ direction: dir }}>
        <div className="cd-modal-header">
          <h3 className="cd-modal-title">{t("cd_cancel_order")}</h3>
          <button className="cd-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="cd-modal-body">
          <p className="cd-cancel-text">{t("cd_cancel_confirm")} <strong>{order.proName}</strong> ({order.id})?</p>
          {chargesFee(order) ? (
            <div className="cd-cancel-fee-box cd-cancel-fee-box--paid">
              <div className="cd-cancel-fee-icon">💰</div>
              <div>
                <p className="cd-cancel-fee-title">{t("cd_cancel_fee_title")} ₪{fee}</p>
                <p className="cd-cancel-fee-desc">
                  {isHe
                    ? "עברו יותר מ-48 שעות מרגע ההזמנה — ולכן ייגבו דמי ביטול."
                    : "More than 48 hours have passed since booking — a cancellation fee applies."}
                </p>
              </div>
            </div>
          ) : (
            <div className="cd-cancel-fee-box cd-cancel-fee-box--free">
              <div className="cd-cancel-fee-icon">✓</div>
              <div>
                <p className="cd-cancel-fee-title">{t("cd_free_cancel_title")}</p>
                <p className="cd-cancel-fee-desc">
                  {leftH != null
                    ? (isHe
                        ? `נותרו כ-${leftH} שעות לביטול חינם (עד 48 שעות מרגע ההזמנה). 🎉`
                        : `~${leftH} hours left for free cancellation (within 48h of booking). 🎉`)
                    : t("cd_free_cancel_desc")}
                </p>
              </div>
            </div>
          )}

          <div style={{ marginTop: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 6 }}>
              {isHe ? "סיבת הביטול (יופיע לבעל המקצוע)" : "Reason for cancellation (shown to the professional)"}
            </label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
              placeholder={isHe ? "לדוגמה: שיניתי תוכניות, מצאתי פתרון אחר..." : "e.g. Changed my plans, found another solution..."}
              style={{ width: "100%", border: "1.5px solid #E8ECF4", borderRadius: 12, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", color: "#1A2B4A", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>
        </div>
        <div className="cd-modal-footer">
          <button className="cd-modal-btn cd-modal-btn--secondary" onClick={onClose}>{t("cd_go_back")}</button>
          <button className="cd-modal-btn cd-modal-btn--danger" onClick={onConfirm}>
            {t("cd_cancel")} {chargesFee(order) ? `(₪${fee})` : (lang === "he" ? "— חינם" : "— Free")}
          </button>
        </div>
      </div>
    </div>
  );
}
