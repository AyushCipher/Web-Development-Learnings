import { useEffect, useRef, useState } from "react";
import FormField from "./FormField";
import SuccessPanel from "./SuccessPanel";
import {
  COUNTRIES,
  GENDERS,
  initialValues,
  validateField,
  validateForm,
} from "../utils/validation";

export default function RegistrationForm() {
  const [values, setValues] = useState(initialValues);
  // Error and "touched" state are separate objects, both keyed by field
  // name, rather than nesting them inside `values`. That keeps the shape a
  // plain controlled input can bind to (`value={values.email}`) instead of
  // every input needing to unwrap `.value`/`.error` from a combined object,
  // and it lets us update one concern (e.g. mark a field touched) without
  // touching the data the user actually typed.
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const debounceTimer = useRef(null);

  // Re-validate already-touched fields ~350ms after the user stops typing,
  // instead of on every keystroke. Validating synchronously on each keystroke
  // makes an error flash in and out mid-edit (e.g. the email error clears
  // for a moment every time a valid-looking prefix is typed), which reads as
  // the form "fighting" the user rather than helping them. Debouncing lets
  // the value settle first.
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      setErrors((prevErrors) => {
        const nextErrors = { ...prevErrors };
        Object.keys(touched).forEach((field) => {
          if (touched[field]) {
            nextErrors[field] = validateField(field, values[field], values);
          }
        });
        return nextErrors;
      });
    }, 350);

    return () => clearTimeout(debounceTimer.current);
  }, [values, touched]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Validate immediately on blur (no debounce here) - the user has already
  // finished with the field, so there's no "still typing" flicker risk, and
  // instant feedback is exactly what you want the moment focus leaves.
  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, values[name], values),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formErrors = validateForm(values);
    setErrors(formErrors);
    setHasAttemptedSubmit(true);

    // Mark every field touched on submit, not just the ones the user
    // visited. Otherwise a field they tabbed past entirely (e.g. the
    // country <select>) would fail validation silently - the error would
    // exist in state but FormField hides errors until `touched` is true.
    const allTouched = Object.keys(initialValues).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {},
    );
    setTouched(allTouched);

    // Block "submission" (and the form reset that comes with it) until the
    // form is actually valid, per the two accepted patterns for this: either
    // disable the button pre-emptively or validate-and-block on submit. We
    // use the latter so the button isn't permanently disabled the instant
    // the page loads, before the user has had a chance to type anything.
    if (Object.keys(formErrors).length === 0) {
      setSubmittedData(values);
      setValues(initialValues);
      setTouched({});
      setErrors({});
      setHasAttemptedSubmit(false);
    }
  };

  const handleReset = () => setSubmittedData(null);

  if (submittedData) {
    return <SuccessPanel data={submittedData} onReset={handleReset} />;
  }

  const fieldError = (name) => (touched[name] ? errors[name] : "");

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl"
    >
      <h2 className="text-xl font-semibold text-slate-800">
        Create your account
      </h2>
      <p className="mb-6 text-sm text-slate-500">
        All fields are required. We'll validate as you go.
      </p>

      {hasAttemptedSubmit && Object.keys(errors).length > 0 && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
        >
          Please fix the highlighted fields before submitting.
        </div>
      )}

      <div className="flex flex-col gap-4">
        <FormField
          label="Full name"
          name="fullName"
          value={values.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError("fullName")}
          touched={touched.fullName}
          placeholder="Jane Doe"
          autoComplete="name"
        />

        <FormField
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError("email")}
          touched={touched.email}
          placeholder="jane@example.com"
          autoComplete="email"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={fieldError("password")}
            touched={touched.password}
            placeholder="••••••••"
            autoComplete="new-password"
          />

          <FormField
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={fieldError("confirmPassword")}
            touched={touched.confirmPassword}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Phone number"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={fieldError("phone")}
            touched={touched.phone}
            placeholder="98765 43210"
            autoComplete="tel"
          />

          <FormField
            label="Date of birth"
            name="dob"
            type="date"
            value={values.dob}
            onChange={handleChange}
            onBlur={handleBlur}
            error={fieldError("dob")}
            touched={touched.dob}
            autoComplete="bday"
          />
        </div>

        {/* Select and radio group are handled with their own markup here
            rather than through FormField, since a <select>'s option list and
            a radio group's repeated inputs don't fit the single-<input>
            shape FormField was built around. */}
        <div className="flex flex-col gap-1">
          <label htmlFor="country" className="text-sm font-medium text-slate-700">
            Country
          </label>
          <select
            id="country"
            name="country"
            value={values.country}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(fieldError("country"))}
            className={`rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:ring-2 ${
              fieldError("country")
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
            }`}
          >
            <option value="">Select a country…</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          {fieldError("country") && (
            <p className="text-xs font-medium text-red-600">
              {fieldError("country")}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Gender</span>
          <div className="flex flex-wrap gap-4">
            {GENDERS.map((option) => (
              <label
                key={option}
                htmlFor={`gender-${option}`}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <input
                  id={`gender-${option}`}
                  type="radio"
                  name="gender"
                  value={option}
                  checked={values.gender === option}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="h-4 w-4 accent-indigo-600"
                />
                {option}
              </label>
            ))}
          </div>
          {fieldError("gender") && (
            <p className="text-xs font-medium text-red-600">
              {fieldError("gender")}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="acceptTerms"
            className="flex items-start gap-2 text-sm text-slate-700"
          >
            <input
              id="acceptTerms"
              type="checkbox"
              name="acceptTerms"
              checked={values.acceptTerms}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-0.5 h-4 w-4 accent-indigo-600"
            />
            I accept the terms of service and privacy policy.
          </label>
          {fieldError("acceptTerms") && (
            <p className="text-xs font-medium text-red-600">
              {fieldError("acceptTerms")}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:bg-indigo-800"
      >
        Create account
      </button>
    </form>
  );
}
