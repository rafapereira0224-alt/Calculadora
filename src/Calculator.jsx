import { useState } from "react";
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

  const exprText =
    stored !== null && operator ? `${stored} ${operator}` : "";

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
    setDisplay((d) => (d.startsWith("-") ? d.slice(1) : d === "0" ? d : "-" + d));
  }

  function percent() {
    setDisplay((d) => formatNumber(parseFloat(d) / 100));
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
    setDisplay(formatNumber(result));
    setStored(null);
    setOperator(null);
    setOverwrite(true);
  }

  return (
    <div className="calc-wrap">
      <div className="calc">
        <div className="calc-display">
          <div className="calc-expr">{exprText}</div>
          <div className="calc-value">{display}</div>
        </div>
        <div className="calc-grid">
          <button className="calc-key clear" onClick={clearAll}>AC</button>
          <button className="calc-key" onClick={toggleSign}>±</button>
          <button className="calc-key" onClick={percent}>%</button>
          <button className="calc-key op" onClick={() => chooseOperator("÷")}>÷</button>

          <button className="calc-key" onClick={() => inputDigit("7")}>7</button>
          <button className="calc-key" onClick={() => inputDigit("8")}>8</button>
          <button className="calc-key" onClick={() => inputDigit("9")}>9</button>
          <button className="calc-key op" onClick={() => chooseOperator("×")}>×</button>

          <button className="calc-key" onClick={() => inputDigit("4")}>4</button>
          <button className="calc-key" onClick={() => inputDigit("5")}>5</button>
          <button className="calc-key" onClick={() => inputDigit("6")}>6</button>
          <button className="calc-key op" onClick={() => chooseOperator("−")}>−</button>

          <button className="calc-key" onClick={() => inputDigit("1")}>1</button>
          <button className="calc-key" onClick={() => inputDigit("2")}>2</button>
          <button className="calc-key" onClick={() => inputDigit("3")}>3</button>
          <button className="calc-key op" onClick={() => chooseOperator("+")}>+</button>

          <button className="calc-key zero" onClick={() => inputDigit("0")}>0</button>
          <button className="calc-key" onClick={() => inputDigit(".")}>.</button>
          <button className="calc-key equals" onClick={equals}>=</button>
        </div>
      </div>
    </div>
  );
}