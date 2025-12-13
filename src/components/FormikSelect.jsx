import { useField } from "formik";

export default function FormikSelect({ label, options = [], ...props }) {
  const [field, meta] = useField(props);

  return (
    <div className="flex flex-col">
      {label && <label className="mb-1 font-medium">{label}</label>}

      <select
        {...field}
        {...props}
        className={`border rounded-lg px-3 py-2 outline-none
          ${meta.touched && meta.error ? "border-red-500" : "border-gray-300"}
          focus:ring-2 focus:ring-blue-500`}
      >
        <option value="">Choisir…</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {meta.touched && meta.error && (
        <span className="text-red-600 text-sm mt-1">{meta.error}</span>
      )}
    </div>
  );
}
