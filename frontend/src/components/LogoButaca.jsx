// Ícono propio de Butaca: una butaca de cine vista de frente.
export default function LogoButaca({ tamano = 28, className = '' }) {
  return (
    <svg
      className={className}
      width={tamano}
      height={tamano}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Respaldo */}
      <path d="M9 3h14a4 4 0 0 1 4 4v10H5V7a4 4 0 0 1 4-4Z" fill="currentColor" />
      <path d="M16 7v7" stroke="var(--color-fondo)" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round" />
      {/* Brazos */}
      <rect x="1.5" y="13" width="5" height="11" rx="2.5" fill="currentColor" opacity="0.75" />
      <rect x="25.5" y="13" width="5" height="11" rx="2.5" fill="currentColor" opacity="0.75" />
      {/* Asiento */}
      <rect x="5" y="17" width="22" height="7" rx="3" fill="currentColor" opacity="0.9" />
      {/* Patas */}
      <rect x="8" y="24" width="3" height="5" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="21" y="24" width="3" height="5" rx="1" fill="currentColor" opacity="0.6" />
    </svg>
  )
}
