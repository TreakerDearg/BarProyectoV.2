type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

export default function Button({
  children,
  onClick,
  disabled = false,
}: Props) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-lg font-medium transition

        ${
          disabled
            ? `
              bg-zinc-700
              text-zinc-400
              cursor-not-allowed
            `
            : `
              bg-[var(--neon-purple)]
              text-black
              hover:bg-[var(--neon-purple-soft)]
              hover:shadow-[var(--glow-purple)]
              active:scale-95
            `
        }
      `}
    >
      {children}
    </button>
  );
}