import { useState } from 'react';
import { 
  Camera, 
  User, 
  Truck, 
  Copy, 
  RefreshCw, 
  Coins,
  CheckCircle2
} from 'lucide-react';

function App() {
  // Config state
  const [currency, setCurrency] = useState<'₱' | '$'>('₱');

  // Input states
  const [rentalPrice, setRentalPrice] = useState<number>(15000);
  
  // Print factors
  const [printCost, setPrintCost] = useState<number>(12);
  const [printQty, setPrintQty] = useState<number>(100);

  // Employee factors
  const [employeeCost, setEmployeeCost] = useState<number>(500);
  const [employeeCount, setEmployeeCount] = useState<number>(2);

  // Transportation factor
  const [transportCost, setTransportCost] = useState<number>(1000);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  // Trigger temporary toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2800);
  };

  // Math logic
  const totalPrintsCost = printCost * printQty;
  const totalEmployeesCost = employeeCost * employeeCount;
  
  const totalExpenses = totalPrintsCost + totalEmployeesCost + transportCost;
  const netProfit = rentalPrice - totalExpenses;
  const profitMargin = rentalPrice > 0 ? (netProfit / rentalPrice) * 100 : 0;

  // Format currency helper
  const formatVal = (val: number) => {
    return `${currency}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Copy report
  const copyReportToClipboard = () => {
    const reportText = `📸 --- LITRATO STUDIO PROFIT REPORT ---
💵 Package Price (Revenue): ${formatVal(rentalPrice)}

💸 EXPENSES BREAKDOWN:
• Photo Prints (${printQty} pcs @ ${formatVal(printCost)}): ${formatVal(totalPrintsCost)}
• Staff / Assistants (${employeeCount} people @ ${formatVal(employeeCost)}): ${formatVal(totalEmployeesCost)}
• Gas & Travel: ${formatVal(transportCost)}

📊 TOTAL EXPENSES: ${formatVal(totalExpenses)}
💰 YOUR TAKE-HOME PROFIT: ${formatVal(netProfit)}
📈 PROFIT MARGIN: ${profitMargin.toFixed(1)}%
--------------------------------------`;

    navigator.clipboard.writeText(reportText).then(() => {
      triggerToast('Summary copied! You can now paste it in SMS/Viber.');
    }).catch(() => {
      triggerToast('Could not copy. Please copy manually.');
    });
  };

  // Reset to defaults
  const handleReset = () => {
    setRentalPrice(15000);
    setPrintCost(12);
    setPrintQty(100);
    setEmployeeCost(500);
    setEmployeeCount(2);
    setTransportCost(1000);
    triggerToast('Reset to default amounts');
  };

  // Helper for determining profit level styling class
  const getProfitClass = (val: number) => {
    if (val < 0) return 'negative';
    if (rentalPrice > 0 && (val / rentalPrice) < 0.3) return 'warning'; // low margin (<30%)
    return 'positive';
  };

  return (
    <>
      {/* Toast message notifications */}
      <div className={`toast-msg ${showToast ? 'show' : ''}`}>
        <CheckCircle2 size={20} style={{ verticalAlign: 'middle', marginRight: '8px', display: 'inline' }} />
        {toastMessage}
      </div>

      <header className="app-header">
        <div className="logo-container">
          <Camera size={18} className="logo-text" />
          <span className="logo-text">Litrato Studio</span>
        </div>
        <h1 className="app-title">Instant Profit Calculator</h1>
        <p className="app-subtitle">Simple decision assistant for event packages</p>

        {/* Currency Switcher */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '14px', gap: '10px' }}>
          <button 
            type="button" 
            onClick={() => setCurrency('₱')}
            style={{ 
              background: currency === '₱' ? 'var(--accent-gold)' : 'var(--bg-surface-elevated)', 
              color: currency === '₱' ? 'var(--bg-main)' : 'var(--text-secondary)',
              border: '2px solid var(--border-color)',
              padding: '8px 18px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1rem',
              transition: 'all 0.2s'
            }}
          >
            ₱ PHP (Pesos)
          </button>
          <button 
            type="button" 
            onClick={() => setCurrency('$')}
            style={{ 
              background: currency === '$' ? 'var(--accent-gold)' : 'var(--bg-surface-elevated)', 
              color: currency === '$' ? 'var(--bg-main)' : 'var(--text-secondary)',
              border: '2px solid var(--border-color)',
              padding: '8px 18px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1rem',
              transition: 'all 0.2s'
            }}
          >
            $ USD (Dollars)
          </button>
        </div>
      </header>

      {/* Immediate Prominent Results Card at the Top */}
      <section className="card dashboard-card">
        <div className="profit-main">
          <span className="profit-main-label">⭐ Your Take-Home Net Profit ⭐</span>
          <h2 className={`profit-main-value ${getProfitClass(netProfit)}`}>
            {formatVal(netProfit)}
          </h2>
          <span className={`profit-badge ${getProfitClass(netProfit)}`}>
            {profitMargin.toFixed(1)}% Profit Margin
          </span>
        </div>

        <div className="metrics-row">
          <div className="metric-box">
            <span className="metric-label">Total Revenue (Client Pays)</span>
            <div className="metric-value" style={{ color: 'var(--accent-gold)' }}>
              {formatVal(rentalPrice)}
            </div>
          </div>
          <div className="metric-box">
            <span className="metric-label">Total Expenses</span>
            <div className="metric-value" style={{ color: 'var(--color-danger)' }}>
              {formatVal(totalExpenses)}
            </div>
          </div>
        </div>
      </section>

      {/* Step 1: Main Income Rental Card */}
      <section className="card revenue-card">
        <div className="card-title">
          <Coins size={24} color="var(--accent-gold)" />
          <span>1. Package Price (Revenue)</span>
        </div>
        <div className="form-group">
          <div className="label-container">
            <span className="input-label">How much will the client pay for this event?</span>
            <span className="input-help">Type the full package amount below:</span>
          </div>
          <div className="currency-input-wrapper">
            <span className="currency-symbol">{currency}</span>
            <input 
              type="number" 
              className="input-field" 
              value={rentalPrice === 0 ? '' : rentalPrice} 
              onChange={(e) => setRentalPrice(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="0.00"
            />
          </div>
        </div>
      </section>

      {/* Step 2: Photo Prints */}
      <section className="card">
        <div className="card-title">
          <Camera size={24} color="var(--accent-gold)" />
          <span>2. Photo Prints</span>
        </div>

        <div className="form-group">
          <div className="grid-2-col">
            {/* Print Cost */}
            <div>
              <div className="label-container">
                <span className="input-label">Cost Per Photo</span>
                <span className="input-help">How much does 1 print cost?</span>
              </div>
              <div className="stepper-control">
                <button type="button" className="stepper-btn" onClick={() => setPrintCost(Math.max(0, printCost - 1))}>-</button>
                <input 
                  type="number" 
                  className="stepper-value" 
                  value={printCost} 
                  onChange={(e) => setPrintCost(Math.max(0, parseFloat(e.target.value) || 0))} 
                />
                <button type="button" className="stepper-btn" onClick={() => setPrintCost(printCost + 1)}>+</button>
              </div>
            </div>

            {/* Print Count */}
            <div>
              <div className="label-container">
                <span className="input-label">Number of Photos</span>
                <span className="input-help">Estimated prints needed</span>
              </div>
              <div className="stepper-control">
                <button type="button" className="stepper-btn" onClick={() => setPrintQty(Math.max(0, printQty - 10))}>-</button>
                <input 
                  type="number" 
                  className="stepper-value" 
                  value={printQty} 
                  onChange={(e) => setPrintQty(Math.max(0, parseInt(e.target.value) || 0))} 
                />
                <button type="button" className="stepper-btn" onClick={() => setPrintQty(printQty + 10)}>+</button>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '12px', textAlign: 'right', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Total Prints Expense: <span style={{ color: 'var(--text-primary)' }}>{formatVal(totalPrintsCost)}</span>
          </div>
        </div>
      </section>

      {/* Step 3: Staff / Assistants */}
      <section className="card">
        <div className="card-title">
          <User size={24} color="var(--accent-gold)" />
          <span>3. Assistants / Staff</span>
        </div>

        <div className="form-group">
          <div className="grid-2-col">
            {/* Employee Cost */}
            <div>
              <div className="label-container">
                <span className="input-label">Pay Per Assistant</span>
                <span className="input-help">Daily rate for 1 helper</span>
              </div>
              <div className="stepper-control">
                <button type="button" className="stepper-btn" onClick={() => setEmployeeCost(Math.max(0, employeeCost - 50))}>-</button>
                <input 
                  type="number" 
                  className="stepper-value" 
                  value={employeeCost} 
                  onChange={(e) => setEmployeeCost(Math.max(0, parseFloat(e.target.value) || 0))} 
                />
                <button type="button" className="stepper-btn" onClick={() => setEmployeeCost(employeeCost + 50)}>+</button>
              </div>
            </div>

            {/* Employee Count */}
            <div>
              <div className="label-container">
                <span className="input-label">Number of Assistants</span>
                <span className="input-help">How many helpers assigned?</span>
              </div>
              <div className="stepper-control">
                <button type="button" className="stepper-btn" onClick={() => setEmployeeCount(Math.max(0, employeeCount - 1))}>-</button>
                <input 
                  type="number" 
                  className="stepper-value" 
                  value={employeeCount} 
                  onChange={(e) => setEmployeeCount(Math.max(0, parseInt(e.target.value) || 0))} 
                />
                <button type="button" className="stepper-btn" onClick={() => setEmployeeCount(employeeCount + 1)}>+</button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '12px', textAlign: 'right', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Total Staff Expense: <span style={{ color: 'var(--text-primary)' }}>{formatVal(totalEmployeesCost)}</span>
          </div>
        </div>
      </section>

      {/* Step 4: Gas & Transportation */}
      <section className="card">
        <div className="card-title">
          <Truck size={24} color="var(--accent-gold)" />
          <span>4. Gas & Travel Fee</span>
        </div>
        <div className="form-group">
          <div className="label-container">
            <span className="input-label">Estimated Transportation Expense</span>
            <span className="input-help">Gas, toll gates, or grab/taxi fares</span>
          </div>
          <div className="stepper-control">
            <button type="button" className="stepper-btn" onClick={() => setTransportCost(Math.max(0, transportCost - 100))}>-</button>
            <input 
              type="number" 
              className="stepper-value" 
              value={transportCost} 
              onChange={(e) => setTransportCost(Math.max(0, parseFloat(e.target.value) || 0))} 
            />
            <button type="button" className="stepper-btn" onClick={() => setTransportCost(transportCost + 100)}>+</button>
          </div>
        </div>
      </section>

      {/* Big Action Buttons */}
      <div className="actions-container">
        <button type="button" className="action-btn btn-primary" onClick={copyReportToClipboard}>
          <Copy size={22} />
          <span>Copy Summary Report</span>
        </button>
        <button type="button" className="action-btn btn-secondary" onClick={handleReset} title="Reset all amounts">
          <RefreshCw size={22} />
          <span>Reset</span>
        </button>
      </div>
    </>
  );
}

export default App;
