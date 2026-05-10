# TrackApp 📈

A secure personal finance dashboard designed to help users seamlessly track daily income and expenditures. TrackApp features passwordless OTP registration, secure profile management, and interactive data visualization.

---

## 🛠 Tech Stack

*   **Frontend:** [Next.js](https://nextjs.org/) (Pages Router), React, Tailwind CSS
*   **Backend & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, GoTrue Auth)
*   **Data Visualization:** Recharts
*   **Icons:** Lucide React
*   **Email Testing:** Mailtrap (for Sandbox OTP routing)

---

## ✨ Key Features

*   **Secure Authentication:** OTP-based registration flow via email, transitioning into secure session management.
*   **Interactive Dashboard:** Real-time calculation of **Total Income**, **Total Expenditure**, and **Remaining Balance**.
*   **Visual Analytics:** Dynamic Donut Charts breaking down expenses by customizable categories using Recharts.
*   **Data Security:** Strict **Row Level Security (RLS)** policies implemented via Supabase, ensuring users can only access their own financial records.
*   **Modern UI:** A clean, intuitive interface featuring fully controlled forms and a mobile-responsive layout.

---

## 🚀 Getting Started

1.  **Clone the repo:** `git clone https://github.com/youruser/trackapp.git`
2.  **Install dependencies:** `npm install`
3.  **Set up Environment Variables:** Create a `.env.local` with your Supabase URL and Anon Key.
4.  **Run the app:** `npm run dev`
