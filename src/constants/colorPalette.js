// ── Shared Color Palette for Product Colors ────────────────────────────────────
// Used across Admin Dashboard, Product Grid (public store), and Cart
export const COLOR_PALETTE = [
  { name: 'Negro', hex: '#000000' },
  { name: 'Blanco', hex: '#FFFFFF' },
  { name: 'Gris', hex: '#9CA3AF' },
  { name: 'Azul Marino', hex: '#1E3A5F' },
  { name: 'Bordo', hex: '#722F37' },
  { name: 'Beige', hex: '#D4B896' },
  { name: 'Verde Militar', hex: '#4B5320' },
  { name: 'Celeste', hex: '#87CEEB' },
  { name: 'Rojo', hex: '#DC2626' },
  { name: 'Rosa', hex: '#F9A8D4' },
  { name: 'Amarillo', hex: '#FBBF24' },
  { name: 'Naranja', hex: '#F97316' },
  { name: 'Marrón', hex: '#8B4513' },
  { name: 'Violeta', hex: '#7C3AED' },
  { name: 'Crudo', hex: '#F5F0E1' }
];

// Helper: determine if a color is "light" (for border contrast)
export const isLightColor = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
};
