export default function Modal({ open, isOpen, onClose, title, children, maxWidthClass = "max-w-lg" }) {
  // support either `open` or `isOpen` prop (some pages use isOpen)
  const visible = open || isOpen;
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className={`bg-white rounded-xl p-6 w-full ${maxWidthClass} shadow-lg`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
