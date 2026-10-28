
import { useState } from 'react';
import './App.css';


const API_URL =
  `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/calculate-fee`;


function App() {
  const [tradeAmount, setTradeAmount] = useState("");
  const [buyRate, setBuyRate] = useState("");
  const [sellRate, setSellRate] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function calculateFees(event) {
    event.preventDefault();
    setError("");
    setResult(null);

    const amount = Number(tradeAmount);
    const buyFeeRate = Number(buyRate);
    const sellFeeRate = Number(sellRate);

    if (
      !tradeAmount.trim() ||
      !buyRate.trim() ||
      !sellRate.trim() ||
      !Number.isFinite(amount) ||
      !Number.isFinite(buyFeeRate) ||
      !Number.isFinite(sellFeeRate) ||
      amount <= 0 ||
      buyFeeRate < 0 ||
      sellFeeRate < 0 ||
      buyFeeRate > 100 ||
      sellFeeRate > 100
    ) {
      setError(
        "Enter a positive trade amount and fee rates between 0 and 100."
      );
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tradeAmount: amount,
          buyFeeRate: buyFeeRate,
          sellFeeRate: sellFeeRate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to calculate fees.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the API. Make sure your backend is running."
          : err.message
      );
    }
  }

  return (
    <>
      <header>
        <p className="brand">FeeWise</p>
        <p className="header-label">Crypto Tools</p>
      </header>

      <main>
        <h2>TRADING COST CALCULATOR</h2>
        <h3 className="subtitle">Know your fees. Trade with clarity.</h3>

        <section className="main-part">
          <p className="section-title">Calculate trading fees</p>

          <section className="calculator">
            <form onSubmit={calculateFees}>
              <table>
                <tbody>
                  <tr>
                    <td>
                      <label htmlFor="tradeAmount">Trade amount (INR)</label>
                    </td>
                    <td>
                      <input
                        type="number"
                        id="tradeAmount"
                        min="0.01"
                        step="any"
                        value={tradeAmount}
                        onChange={(e) => setTradeAmount(e.target.value)}
                        placeholder="e.g. 12000"
                        required
                      />
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <label htmlFor="buyFee">Buying fee (%)</label>
                    </td>
                    <td>
                      <input
                        type="number"
                        id="buyFee"
                        min="0"
                        max="100"
                        step="any"
                        value={buyRate}
                        onChange={(e) => setBuyRate(e.target.value)}
                        placeholder="e.g. 0.2"
                        required
                      />
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <label htmlFor="sellFee">Selling fee (%)</label>
                    </td>
                    <td>
                      <input
                        type="number"
                        id="sellFee"
                        min="0"
                        max="100"
                        step="any"
                        value={sellRate}
                        onChange={(e) => setSellRate(e.target.value)}
                        placeholder="e.g. 0.2"
                        required
                      />
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={2}>
                      <button type="submit" className="calculate-button">
                        Calculate fees →
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={2}>
                      {error && <p className="error">{error}</p>}
                    </td>
                  </tr>
                </tbody>
              </table>
            </form>
          </section>

          <section className="result">
            {result ? (
              <>
                <div className="total-box">
                  <span>Total estimated fees</span>
                  <strong>
                    ₹{Number(result.totalTradingFee).toFixed(2)}
                  </strong>
                </div>

                <div className="result-row">
                  <span>Buying fee</span>
                  <strong>₹{Number(result.buyingFee).toFixed(2)}</strong>
                </div>

                <div className="result-row">
                  <span>Selling fee</span>
                  <strong>₹{Number(result.sellingFee).toFixed(2)}</strong>
                </div>

                <div className="result-row">
                  <span>Amount + buying fee</span>
                  <strong>₹{Number(result.buyTotal).toFixed(2)}</strong>
                </div>

                <div className="result-row">
                  <span>Amount after selling fee</span>
                  <strong>₹{Number(result.sellNet).toFixed(2)}</strong>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setResult(null);
                    setError("");
                  }}
                >
                  Reset results
                </button>
              </>
            ) : (
              <>
                <div className="empty-state">
                  <div className="empty-icon">₹</div>
                  <h3>Your results will appear here</h3>
                  <p>
                    Enter your trading details and calculate your estimated
                    costs.
                  </p>
                </div>
              </>
            )}
          </section>
        </section>
      </main>
    </>
  );
}

export default App;
