import { useState, useEffect, useRef, useCallback } from "react";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase.jsx";
import "./App.css";

const GOAL = 500;
const DEBOUNCE = 300;

function App() {
  const [count, setCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pressing, setPressing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const bannerAnim = useRef({ transform: `translateY(-25vh)` });
  const buttonScale = useRef(1);
  const progressAnim = useRef(0);
  const lastTap = useRef(0);

  const progressRatio = Math.min(count / GOAL, 1);
  const counterRef = doc(db, "counters", "main");

  const init = useCallback(async () => {
    try {
      const snapshot = await getDoc(counterRef);
      if (!snapshot.exists()) {
        await setDoc(counterRef, {
          value: 0,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        });
      }
      setLoading(false);
    } catch {
      setError("Failed to initialize counter");
      setLoading(false);
    }
  }, [counterRef]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      counterRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const value = data.value || 0;
          setCount(value);
          progressAnim.current = Math.min(value / GOAL, 1);

          if (value >= GOAL && !completed) {
            setCompleted(true);
            setShowConfetti(true);
            bannerAnim.current = { transform: `translateY(0)` };
            setTimeout(() => {
              bannerAnim.current = { transform: `translateY(-25vh)` };
            }, 4800);
            setTimeout(() => setShowConfetti(false), 5000);
          }
        }
        setLoading(false);
      },
      (err) => {
        console.error("Firebase error:", err);
        setError("Connection error");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [completed, counterRef]);

  useEffect(() => {
    init();
  }, [init]);

  const animateButton = useCallback((pressed) => {
    buttonScale.current = pressed ? 0.95 : 1;
  }, []);

  const handlePress = useCallback(async () => {
    const now = Date.now();
    if (now - lastTap.current < DEBOUNCE) return;
    lastTap.current = now;

    if (count >= GOAL) {
      alert("🎉 Already Complete! The club has been inaugurated!");
      return;
    }

    setPressing(true);
    animateButton(true);

    try {
      const newCount = count + 10;
      await setDoc(
        counterRef,
        { value: newCount, lastUpdated: serverTimestamp() },
        { merge: true }
      );
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update counter. Please try again.");
    } finally {
      setPressing(false);
      animateButton(false);
    }
  }, [count, counterRef, animateButton]);

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    init();
  }, [init]);

  if (loading) {
    return (
      <div className="app">
        <div className="center-container">
          <div className="loading-text">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <div className="error-text">⚠ {error}</div>
          <button className="retry-button" onClick={retry}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="banner" style={bannerAnim.current}>
        <div className="banner-text">🎉 Powered Up! 🎉</div>
      </div>

      {showConfetti && (
        <div className="confetti-container">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}vw`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <div className="content">
        <img src="../logo.png" alt="Club Logo" className="logo" />
        <h1 className="title">Club Inauguration</h1>
        <p className="subtitle">Join the collective effort!</p>

        <button
          className={`power-button ${completed ? "completed" : ""} ${pressing ? "pressing" : ""}`}
          onClick={handlePress}
          disabled={pressing}
          style={{ transform: `scale(${buttonScale.current})` }}
        >
          <div className="button-content">
            <div
              className={`button-main-text ${completed ? "completed-text" : ""}`}
            >
              {completed ? "Powered!" : "Power Up"}
            </div>
            {!completed && <div className="button-sub-text">Tap to Power</div>}
          </div>
        </button>

        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressAnim.current * 100}%` }}
            />
          </div>
          <div className="progress-text-container">
            <div className="progress-count">
              {count.toLocaleString()} / {GOAL.toLocaleString()}
            </div>
            <div className="progress-percent">
              {Math.round(progressRatio * 100)}%
            </div>
          </div>
        </div>

        <p className="status-text">
          {completed
            ? "🎊 Congratulations! The club is now officially powered!"
            : `${GOAL - count} more contributions needed`}
        </p>
      </div>
    </div>
  );
}

export default App;
