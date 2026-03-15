# Quiz Lab (Quiz-Host-Live)

A modern, interactive, and customizable quiz hosting application built with React and Electron. Quiz Lab is designed for live events, allowing hosts to create diverse rounds, assign teams, and manage live scores through a highly polished, broadcast-ready interface.

## 🌟 Key Features

*   **📺 Broadcast-Ready UI:** Stunning visuals, crisp typography, and fluid animations using Framer Motion.
*   **🛠️ Robust Event Editor:** Build your quiz visually. Add questions, custom media, and configure round rules.
*   **🎮 Diverse Round Types:**
    *   **Q&A Round:** Classic text or media-based questions.
    *   **Identify Round:** Guess the blurred image, audio clip, or video before time runs out.
    *   **Buzzer Round:** Fast-paced trivia with team lockouts.
    *   **Lightning Round:** Rapid-fire questions aimed at specific teams.
    *   **Wipeout Round:** High-risk wagering where one wrong answer wipes the points for the round.
    *   **Rapid Fire (Duel):** Two teams go head-to-head in a fast-paced showdown.
    *   **Card Flip Round:** Teams pick from a giant grid of custom-styled cards to reveal challenges.
    *   **Master Questions:** Deduction-based round with progressive hints and tiered scoring.
*   **🔉 Integrated SFX System:** Live, manageable sound effects for correct answers, wrong buzzers, transitions, and suspense.
*   **💾 Local & Portable Saving:** Save your entire quiz (including base64-encoded media) into a single `.json` file that you can load instantly on any machine.
*   **🏆 Live Dynamic Scoreboard:** Real-time scoring updates with a full-screen overlay option.
*   **🖥️ Desktop Packages:** Build standalone `.dmg` (Mac) and `.exe` (Windows) apps for offline event hosting.

## 🚀 Getting Started (Development)

This project uses [Vite](https://vitejs.dev/) for fast frontend tooling and [Electron](https://www.electronjs.org/) for the desktop shell.

### Prerequisites
*   Node.js (v18+ recommended)
*   npm or yarn

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/quiz-host-live.git
    cd quiz-host-live
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the App
*   **Browser Development Mode (Fast UI iteration):**
    ```bash
    npm run dev
    ```
*   **Electron Desktop Mode (Testing native integrations):**
    ```bash
    npm run electron:start
    ```
    *(Note: Ensure Vite is running concurrently or the build is generated first).*

## 📦 Building for Production

You can package the application into standalone, distributable installers using `electron-builder`.

*   **Build for macOS (.dmg / .app):**
    ```bash
    npm run package
    ```
*   **Build for Windows (.exe):**
    ```bash
    npm run build && npx electron-builder --win
    ```

The built executables will be available in the `dist/` and `dist/win-unpacked/` directories.

## 🎨 Technology Stack

*   **Core:** React 19, DOM API
*   **State Management:** Zustand
*   **Styling & UI:** Custom CSS, Tailwind CSS (forms), Lucide React (Icons)
*   **Animations:** Framer Motion, tsParticles
*   **Audio/Media:** Howler.js
*   **Build Tooling:** Vite, Electron Forge / Electron Builder

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
