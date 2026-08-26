function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  );
}

// Rendered instead of the form once a submission passes validation. We echo
// the data back so the "learning" point lands visually: this is exactly what
// a real app would send to an API. Password is deliberately left out - never
// redisplay a password, even one the user just typed themselves.
export default function SuccessPanel({ data, onReset }) {
  return (
    <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
      <div className="mb-2 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg text-green-600">
          ✓
        </span>
        <h2 className="text-xl font-semibold text-slate-800">
          Registration submitted!
        </h2>
      </div>
      <p className="mb-4 text-sm text-slate-500">
        Here's what would be sent to the server.
      </p>

      <dl className="divide-y divide-slate-100 border-t border-slate-100">
        <Row label="Full name" value={data.fullName} />
        <Row label="Email" value={data.email} />
        <Row label="Phone" value={data.phone} />
        <Row label="Date of birth" value={data.dob} />
        <Row label="Country" value={data.country} />
        <Row label="Gender" value={data.gender} />
      </dl>

      <button
        type="button"
        onClick={onReset}
        className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:bg-indigo-800"
      >
        Register another account
      </button>
    </div>
  );
}
