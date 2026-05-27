/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b', // Đen sâu thẳm
        cardBg: '#121214',     // Đen xám cho card nội dung
        deepRed: '#7f1d1d',    // Đỏ đô
        neonBlue: '#00d2ff',   // Xanh dương sáng để làm điểm nhấn
        cyberBlue: '#0066ff',  // Xanh dương công nghệ
      },
    },
  },
  plugins: [],
}