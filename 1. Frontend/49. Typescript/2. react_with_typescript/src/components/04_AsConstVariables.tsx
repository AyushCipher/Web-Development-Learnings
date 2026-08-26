const VARIANTS = ["primary", "secondary", "ghost"] as const;    // making it as readonly literals
type Variant = (typeof VARIANTS)[number];

type BadgeProps = {
  label: string;
  variant?: Variant;
};

export function Badge({ label, variant = "primary" }: BadgeProps) {
  const styles: Record<Variant, React.CSSProperties> = {
    primary: {
      color: "red",
    },
    secondary: {
      color: "yellow",
    },
    ghost: {
      color: "black",
    },
  };

  return <span style={styles[variant]}>{label}</span>;
}

// HW:- Just pass label and not variant will not cause any error because of the default value provided.