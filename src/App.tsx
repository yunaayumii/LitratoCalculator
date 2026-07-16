import { useState } from 'react';
import { 
  Camera, 
  Copy, 
  RefreshCw, 
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
    }, 2500);
  };

  // Math logic
  const totalPrintsCost = printCost * printQty;
  const totalEmployeesCost = employeeCost * employeeCount;
  
  const totalExpenses = totalPrintsCost + totalEmployeesCost + transportCost;
  const netProfit = rentalPrice - totalExpenses;
  const profitMargin = rentalPrice > 0 ? (netProfit / rentalPrice) * 100 : 0;

  // Format currency helper
  const formatVal = (val: number) => {
    return `${currency}${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
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
      triggerToast('Summary copied! Ready to send in SMS/Viber.');
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
        <CheckCircle2 size={18} style={{ verticalAlign: 'middle', marginRight: '6px', display: 'inline' }} />
        {toastMessage}
      </div>

      {/* Compact Header Bar */}
      <header className="app-header">
        <div className="logo-container">
          <Camera size={20} color="var(--accent-gold)" />
          <span className="logo-text">LITRATO STUDIO</span>
        </div>
        <div className="currency-switcher">
          <button 
            type="button" 
            className={`currency-btn ${currency === '₱' ? 'active' : ''}`}
            onClick={() => setCurrency('₱')}
          >
            ₱ PHP
          </button>
          <button 
            type="button" 
            className={`currency-btn ${currency === '$' ? 'active' : ''}`}
            onClick={() => setCurrency('$')}
          >
            $ USD
          </button>
        </div>
      </header>

      {/* Top Prominent Profit Dashboard Card */}
      <section className="dashboard-card">
        <span className="profit-main-label">⭐ ESTIMATED NET PROFIT ⭐</span>
        <h1 className={`profit-main-value ${getProfitClass(netProfit)}`}>
          {formatVal(netProfit)}
        </h1>
        
        <div className="dashboard-subbar">
          <div className="subbar-item">
            <span className="subbar-label">REVENUE</span>
            <span className="subbar-val" style={{ color: 'var(--accent-gold)' }}>{formatVal(rentalPrice)}</span>
          </div>
          <div className="subbar-item">
            <span className="subbar-label">EXPENSES</span>
            <span className="subbar-val" style={{ color: 'var(--color-danger)' }}>{formatVal(totalExpenses)}</span>
          </div>
          <div className="subbar-item">
            <span className="subbar-label">MARGIN</span>
            <span className="subbar-val" style={{ color: 'var(--text-primary)' }}>{profitMargin.toFixed(0)}%</span>
          </div>
        </div>
      </section>

      {/* 4 Interactive Factors in Single Viewport (No Scrolling) */}
      <main className="factors-container">
        {/* Row 1: Package Price */}
        <div className="factor-row">
          <div className="factor-info">
            <span className="factor-title">1. Package Price</span>
            <div className="factor-input-wrapper">
              <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>{currency}</span>
              <input 
                type="number" 
                className="factor-input" 
                value={rentalPrice === 0 ? '' : rentalPrice} 
                onChange={(e) => setRentalPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0"
              />
            </div>
          </div>
          <div className="row-steppers">
            <button type="button" className="stepper-btn" onClick={() => setRentalPrice(Math.max(0, rentalPrice - 1000))}>- 1k</button>
            <button type="button" className="stepper-btn" onClick={() => setRentalPrice(rentalPrice + 1000)}>+ 1k</button>
          </div>
        </div>

        {/* Row 2: Photo Prints */}
        <div className="factor-row">
          <div className="factor-info">
            <span className="factor-title">2. Photo Prints</span>
            <span className="factor-desc">{printQty} pcs @ {formatVal(printCost)} ({formatVal(totalPrintsCost)})</span>
          </div>
          <div className="row-steppers">
            <button type="button" className="stepper-btn" onClick={() => setPrintQty(Math.max(0, printQty - 20))} title="Less prints">- 20</button>
            <button type="button" className="stepper-btn" onClick={() => setPrintQty(printQty + 20)} title="More prints">+ 20</button>
          </div>
        </div>

        {/* Row 3: Staff / Assistants */}
        <div className="factor-row">
          <div className="factor-info">
            <span className="factor-title">3. Staff Helpers</span>
            <span className="factor-desc">{employeeCount} staff @ {formatVal(employeeCost)} ({formatVal(totalEmployeesCost)})</span>
          </div>
          <div className="row-steppers">
            <button type="button" className="stepper-btn" onClick={() => setEmployeeCount(Math.max(0, employeeCount - 1))} title="Remove assistant">- 1</button>
            <button type="button" className="stepper-btn" onClick={() => setEmployeeCount(employeeCount + 1)} title="Add assistant">+ 1</button>
          </div>
        </div>

        {/* Row 4: Gas & Travel Fee */}
        <div className="factor-row">
          <div className="factor-info">
            <span className="factor-title">4. Gas & Travel</span>
            <div className="factor-input-wrapper">
              <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>{currency}</span>
              <input 
                type="number" 
                className="factor-input" 
                value={transportCost === 0 ? '' : transportCost} 
                onChange={(e) => setTransportCost(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0"
              />
            </div>
          </div>
          <div className="row-steppers">
            <button type="button" className="stepper-btn" onClick={() => setTransportCost(Math.max(0, transportCost - 200))}>- 200</button>
            <button type="button" className="stepper-btn" onClick={() => setTransportCost(transportCost + 200)}>+ 200</button>
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <footer className="actions-bar">
        <button type="button" className="action-btn btn-primary" onClick={copyReportToClipboard}>
          <Copy size={20} />
          <span>Copy Summary</span>
        </button>
        <button type="button" className="action-btn btn-secondary" onClick={handleReset}>
          <RefreshCw size={20} />
          <span>Reset</span>
        </button>
      </footer>
    </>
  );
}

export default App;
