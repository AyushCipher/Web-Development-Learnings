// Shared "label + input + error message" layout for every plain text-like
// field (text, email, password, tel, date). Pulling this out avoids repeating
// the same label/error markup six times inside RegistrationForm - the select,
// radio group and checkbox still get their own markup below since their
// structure genuinely differs.
export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  autoComplete,
}) {
  // Only surface an error once the user has actually left the field (or
  // tried to submit). Showing "required" errors while someone is still
  // typing their first character would be premature and annoying.
  const showError = Boolean(touched && error);
  const errorId = `${name}-error`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={showError}
        aria-describedby={showError ? errorId : undefined}
        className={`rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:ring-2 ${
          showError
            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
            : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
        }`}
      />
      {showError && (
        <p id={errorId} className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
