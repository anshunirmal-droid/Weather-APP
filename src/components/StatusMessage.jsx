/** Reusable loading / empty / error message. */
export default function StatusMessage({ icon, title, text, action, loading }) {
  return (
    <div className="status" role={loading ? 'status' : undefined}>
      {loading ? <div className="spinner" aria-hidden="true" /> : icon && <div className="status-icon">{icon}</div>}
      {title && <h2>{title}</h2>}
      {text && <p>{text}</p>}
      {action && (
        <button className="btn primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
