// Central place for every regex + rule the form uses. Keeping validation logic
// out of the component means the same rules can be unit-tested or reused by a
// different field renderer without touching any JSX.

// A simple "one @, one dot, no spaces" check. This deliberately is NOT a full
// RFC 5322 email regex (those are notoriously huge and still let garbage
// through) - client-side validation only needs to catch obvious typos and
// give fast feedback. The real, authoritative check (e.g. a confirmation
// email) always has to happen on the server anyway.
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Lookahead groups let us require four different character classes (lower,
// upper, digit, symbol) in a single pass instead of writing four separate
// .test() calls. Anchored with .{8,} at the end so length is enforced too.
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

// Indian 10-digit mobile numbers start with 6-9. Users may type spaces,
// dashes or a leading +91, so we strip that formatting before testing rather
// than trying to encode every separator into the regex itself.
export const PHONE_REGEX = /^[6-9]\d{9}$/;

export const NAME_REGEX = /^[A-Za-z][A-Za-z ]{1,49}$/;

export const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "Other",
];

export const GENDERS = ["Female", "Male", "Other / prefer not to say"];

export const initialValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  dob: "",
  country: "",
  gender: "",
  acceptTerms: false,
};

// Age is derived from the day/month/year diff rather than a rough
// "(today - dob) / msPerYear" division, because that shortcut drifts across
// leap years and can misjudge someone by a day right around their birthday.
function calculateAge(dobString) {
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

// A single switch keeps "what makes field X valid" in one readable place, and
// lets us re-run the exact same rule for one field (on blur / debounce) or
// every field (on submit) without duplicating logic in two places.
export function validateField(name, value, values = {}) {
  switch (name) {
    case "fullName": {
      const trimmed = value.trim();
      if (!trimmed) return "Full name is required.";
      if (!NAME_REGEX.test(trimmed)) {
        return "Enter 2-50 letters only (no numbers or symbols).";
      }
      return "";
    }

    case "email": {
      const trimmed = value.trim();
      if (!trimmed) return "Email is required.";
      if (!EMAIL_REGEX.test(trimmed)) return "Enter a valid email address.";
      return "";
    }

    case "password": {
      if (!value) return "Password is required.";
      if (!PASSWORD_REGEX.test(value)) {
        return "Min 8 characters, with upper, lower, a number and a symbol.";
      }
      return "";
    }

    case "confirmPassword": {
      if (!value) return "Please confirm your password.";
      // Compared against the *live* password value (passed in via `values`)
      // so this stays correct even if the user goes back and edits the
      // original password after already filling in the confirmation.
      if (value !== values.password) return "Passwords do not match.";
      return "";
    }

    case "phone": {
      const digitsOnly = value.replace(/[\s-]/g, "").replace(/^\+91/, "");
      if (!value.trim()) return "Phone number is required.";
      if (!PHONE_REGEX.test(digitsOnly)) {
        return "Enter a valid 10-digit mobile number.";
      }
      return "";
    }

    case "dob": {
      if (!value) return "Date of birth is required.";
      if (new Date(value) > new Date()) {
        return "Date of birth cannot be in the future.";
      }
      if (calculateAge(value) < 13) {
        return "You must be at least 13 years old to register.";
      }
      return "";
    }

    case "country":
      return value ? "" : "Please select your country.";

    case "gender":
      return value ? "" : "Please select a gender.";

    case "acceptTerms":
      return value ? "" : "You must accept the terms to continue.";

    default:
      return "";
  }
}

// Runs validateField over every key in `values` and collects only the
// non-empty results, so callers can just check `Object.keys(errors).length`.
export function validateForm(values) {
  const errors = {};
  Object.keys(values).forEach((key) => {
    const error = validateField(key, values[key], values);
    if (error) errors[key] = error;
  });
  return errors;
}
