import { useState, useEffect } from "react";
import "./Calculator.css";

const OPS = {
  "÷": (a, b) => a / b,
  "×": (a, b) => a * b,
  "−": (a, b) => a - b,
  "+": (a, b) => a + b,
};

function formatNumber(n) {
  if (!isFinite(n)) return "Error";
  const str = String(n);
  if (str.length > 12) return n.toPrecision(8).replace(/\.?0+$/, "");
  return str;
}

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState(null);
  const [operator, setOperator] = useState(null);
  const [overwrite, setOverwrite] = useState(true);
  const [theme, setTheme] = useState("light");
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("calc-history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState(false);

  const exprText = stored !== null && operator ? `${stored} ${operator}` : "";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    function handleKeyDown(e) {
      const { key } = e;

      if (key >= "0" && key <= "9") {
        e.preventDefault();
        inputDigit(key);
        return;
      }

      switch (key) {
        case ".":
        case ",":
          e.preventDefault();
          inputDigit(".");
          break;
        case "+":
          e.preventDefault();
          chooseOperator("+");
          break;
        case "-":
          e.preventDefault();
          chooseOperator("−");
          break;
        case "*":
        case "x":
        case "X":
          e.preventDefault();
          chooseOperator("×");
          break;
        case "/":
          e.preventDefault();
          chooseOperator("÷");
          break;
        case "Enter":
        case "=":
          e.preventDefault();
          equals();
          break;
        case "Escape":
        case "c":
        case "C":
          e.preventDefault();
          clearAll();
          break;
        case "Backspace":
          e.preventDefault();
          backspace();
          break;
        case "%":
          e.preventDefault();
          percent();
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  useEffect(() => {
    try {
      localStorage.setItem("calc-history", JSON.stringify(history));
    } catch {}
  }, [history]);

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  function inputDigit(d) {
    if (overwrite) {
      setDisplay(d === "." ? "0." : d);
      setOverwrite(false);
    } else {
      if (d === "." && display.includes(".")) return;
      if (display.replace("-", "").replace(".", "").length >= 12) return;
      setDisplay(display === "0" && d !== "." ? d : display + d);
    }
  }

  function clearAll() {
    setDisplay("0");
    setStored(null);
    setOperator(null);
    setOverwrite(true);
  }

  function toggleSign() {
    setDisplay((d) =>
      d.startsWith("-") ? d.slice(1) : d === "0" ? d : "-" + d,
    );
  }

  function percent() {
    setDisplay((d) => formatNumber(parseFloat(d) / 100));
  }

  function backspace() {
    if (overwrite) return;
    setDisplay((d) => {
      const isNegative = d.startsWith("-");
      const digits = isNegative ? d.slice(1) : d;
      const next = digits.slice(0, -1);
      if (next === "" || next === "-") return "0";
      return isNegative ? "-" + next : next;
    });
  }

  function chooseOperator(nextOp) {
    const current = parseFloat(display);
    if (operator && !overwrite) {
      const result = OPS[operator](stored, current);
      setStored(result);
      setDisplay(formatNumber(result));
    } else {
      setStored(current);
    }
    setOperator(nextOp);
    setOverwrite(true);
  }

  function equals() {
    if (operator === null || stored === null) return;
    const current = parseFloat(display);
    const result = OPS[operator](stored, current);
    const formatted = formatNumber(result);
    setDisplay(formatted);
    setStored(null);
    setOperator(null);
    setOverwrite(true);
    setHistory((prev) =>
      [
        {
          expr: `${formatNumber(stored)} ${operator} ${formatNumber(current)}`,
          result: formatted,
        },
        ...prev,
      ].slice(0, 50),
    );
  }

  function clearHistory() {
    setHistory([]);
  }

  function useHistoryEntry(entry) {
    setDisplay(entry.result);
    setStored(null);
    setOperator(null);
    setOverwrite(true);
    setShowHistory(false);
  }

  function sqrt() {
    setDisplay((d) => formatNumber(Math.sqrt(parseFloat(d))));
  }

  function square() {
    setDisplay((d) => {
      const num = parseFloat(d);
      return formatNumber(num * num);
    });
  }

  function inverse() {
    setDisplay((d) => {
      const num = parseFloat(d);
      if (num === 0) return "Error";
      return formatNumber(1 / num);
    });
  }

  return (
    <div className="calc-wrap">
      <div className="calc">
        <button
          type="button"
          className="calc-theme-toggle"
          onClick={toggleTheme}
          aria-label={
            theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"
          }
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        <button
          type="button"
          className="calc-history-toggle"
          onClick={() => setShowHistory((v) => !v)}
          aria-label="Ver histórico"
        >
          🕘
        </button>

        {showHistory && (
          <div className="calc-history-panel">
            <div className="calc-history-header">
              <span>Histórico</span>
              <button
                type="button"
                className="calc-history-clear"
                onClick={clearHistory}
                disabled={history.length === 0}
              >
                Limpar
              </button>
            </div>
            {history.length === 0 ? (
              <div className="calc-history-empty">Nenhum cálculo ainda</div>
            ) : (
              <ul className="calc-history-list">
                {history.map((entry, i) => (
                  <li
                    key={i}
                    className="calc-history-item"
                    onClick={() => useHistoryEntry(entry)}
                  >
                    <span className="calc-history-expr">{entry.expr} =</span>
                    <span className="calc-history-result">{entry.result}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="calc-display">
          <div className="calc-expr">{exprText}</div>
          <div className="calc-value">{display}</div>
        </div>
        <div className="calc-grid">
          <button className="calc-key clear" onClick={clearAll}>
            AC
          </button>
          <button className="calc-key clear" onClick={backspace}>
            Del
          </button>
          <button className="calc-key" onClick={toggleSign}>
            ±
          </button>
          <button className="calc-key" onClick={percent}>
            %
          </button>
          <button className="calc-key" onClick={sqrt}>
            √
          </button>
          <button className="calc-key" onClick={square}>
            x²
          </button>
          <button className="calc-key" onClick={inverse}>
            1/x
          </button>

          <button className="calc-key op" onClick={() => chooseOperator("÷")}>
            ÷
          </button>

          <button className="calc-key" onClick={() => inputDigit("7")}>
            7
          </button>
          <button className="calc-key" onClick={() => inputDigit("8")}>
            8
          </button>
          <button className="calc-key" onClick={() => inputDigit("9")}>
            9
          </button>
          <button className="calc-key op" onClick={() => chooseOperator("×")}>
            ×
          </button>

          <button className="calc-key" onClick={() => inputDigit("4")}>
            4
          </button>
          <button className="calc-key" onClick={() => inputDigit("5")}>
            5
          </button>
          <button className="calc-key" onClick={() => inputDigit("6")}>
            6
          </button>
          <button className="calc-key op" onClick={() => chooseOperator("−")}>
            −
          </button>

          <button className="calc-key" onClick={() => inputDigit("1")}>
            1
          </button>
          <button className="calc-key" onClick={() => inputDigit("2")}>
            2
          </button>
          <button className="calc-key" onClick={() => inputDigit("3")}>
            3
          </button>
          <button className="calc-key op" onClick={() => chooseOperator("+")}>
            +
          </button>

          <button className="calc-key zero" onClick={() => inputDigit("0")}>
            0
          </button>
          <button className="calc-key" onClick={() => inputDigit(".")}>
            .
          </button>
          <button className="calc-key equals" onClick={equals}>
            =
          </button>
        </div>
      </div>
    </div>
  );
}
