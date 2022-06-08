module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        "3xl": "1800px",
        "4xl": "2200px",
        "5xl": "2600px",
      },
      spacing: {
        100: "32rem",
        110: "40rem",
        120: "48rem",
        "4/5": "80%",
        "3/4": "75%",
        "1/2": "50%",
        "2/3": "66%",
        "1/3": "33%",
        "1/4": "25%",
        "1/5": "20%",
        "1/6": "15%",
        "1/7": "12.5%",
        "1/10": "10%",
      },
      colors: {
        black: "#1e1e1e",
        main1: "#0022EE",
        main2: "#ec912b",
        main3: "#011359",
        sub1: "#deeefc",
        sub2: "#ffeedb",
      },
      keyframes: {
        rotate: {
          "0%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(90deg)" },
          "99%": { transform: "rotate(180deg)" },
          "100%": { display: "none" },
        },
        jumpIn: {
          "100%": { display: "block" },
        },
        slideDown: {
          "0%": { transform: "translateY(0%)" },
          "100%": { transform: "translateY(10%)" },
        },
        // enterFrom="opacity-0 -translate-y-full"
        // enterTo="opacity-100 translate-y-0"
        slideUp: {
          "0%": { display: "hidden" },
          "20%": { display: "block", opacity: 0 },
          "25%": { transform: "translateY(25%)", opacity: 0.2 },
          // '50%': { transform: 'translateY(50%)' },
          "100%": { transform: "translateY(0%)", opacity: 1 },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slowBounce: {
          "0%": {
            transform: "translateY(-5%)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
          "100%": {
            transform: "translateY(-5%)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
        },
      },
      animation: {
        rotate: "rotate 0.5s ease-in-out",
        jumpIn: "jumpIn 0.5s ease-in-out",
        slideDown: "slideDown 0.5s ease-in-out",
        slideUp: "slideUp 1s ease-in-out",
        fadeIn: "fadeIn 1s ease-in-out",
        bounce: "bounce 3s infinite",
        slowBounce: "slowBounce 2s infinite",
      },
    },
  },
  plugins: [],
};
