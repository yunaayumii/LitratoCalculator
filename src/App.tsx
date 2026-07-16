import { useState } from 'react';
import { 
  Camera, 
  Copy, 
  RefreshCw, 
  CheckCircle2
} from 'lucide-react';

function App() {
  // Fixed currency symbol (Philippine Peso only)
  const currency = '₱';

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
      <header className="app-header" style={{ justifyContent: 'center' }}>
        <div className="logo-container">
          <Camera size={22} color="var(--accent-green)" />
          <span className="logo-text">LITRATO STUDIO</span>
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
            <span className="subbar-val" style={{ color: 'var(--accent-green)' }}>{formatVal(rentalPrice)}</span>
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
              <span style={{ color: 'var(--accent-green)', fontWeight: 800 }}>{currency}</span>
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
            <button type="button" className="stepper-btn stepper-minus" onClick={() => setRentalPrice(Math.max(0, rentalPrice - 1000))}>- 1k</button>
            <button type="button" className="stepper-btn stepper-plus" onClick={() => setRentalPrice(rentalPrice + 1000)}>+ 1k</button>
          </div>
        </div>

        {/* Row 2: Photo Prints (Volume & Cost per Print) */}
        <div className="factor-row-dual">
          <div className="dual-header">
            <span className="dual-title">2. Photo Prints</span>
            <span className="dual-badge">Total: {formatVal(totalPrintsCost)}</span>
          </div>
          <div className="dual-controls-grid">
            {/* Volume / Quantity */}
            <div className="dual-control-item">
              <span className="dual-control-label">Volume (pcs)</span>
              <div className="dual-stepper-box">
                <button type="button" className="stepper-btn-mini stepper-minus" onClick={() => setPrintQty(Math.max(0, printQty - 20))} title="Less prints">-</button>
                <div className="dual-input-span">
                  <input 
                    type="number" 
                    className="dual-input" 
                    value={printQty === 0 ? '' : printQty} 
                    onChange={(e) => setPrintQty(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                  />
                </div>
                <button type="button" className="stepper-btn-mini stepper-plus" onClick={() => setPrintQty(printQty + 20)} title="More prints">+</button>
              </div>
            </div>
            {/* Cost per unit */}
            <div className="dual-control-item">
              <span className="dual-control-label">Cost per Print</span>
              <div className="dual-stepper-box">
                <button type="button" className="stepper-btn-mini stepper-minus" onClick={() => setPrintCost(Math.max(0, printCost - 1))} title="Lower print cost">-</button>
                <div className="dual-input-span">
                  <span style={{ color: 'var(--accent-green)', fontSize: '0.85em' }}>{currency}</span>
                  <input 
                    type="number" 
                    className="dual-input" 
                    value={printCost === 0 ? '' : printCost} 
                    onChange={(e) => setPrintCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                  />
                </div>
                <button type="button" className="stepper-btn-mini stepper-plus" onClick={() => setPrintCost(printCost + 1)} title="Higher print cost">+</button>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Staff Helpers (Headcount & Pay Rate) */}
        <div className="factor-row-dual">
          <div className="dual-header">
            <span className="dual-title">3. Staff Helpers</span>
            <span className="dual-badge">Total: {formatVal(totalEmployeesCost)}</span>
          </div>
          <div className="dual-controls-grid">
            {/* Headcount */}
            <div className="dual-control-item">
              <span className="dual-control-label">Headcount</span>
              <div className="dual-stepper-box">
                <button type="button" className="stepper-btn-mini stepper-minus" onClick={() => setEmployeeCount(Math.max(0, employeeCount - 1))} title="Remove assistant">-</button>
                <div className="dual-input-span">
                  <input 
                    type="number" 
                    className="dual-input" 
                    value={employeeCount === 0 ? '' : employeeCount} 
                    onChange={(e) => setEmployeeCount(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                  />
                </div>
                <button type="button" className="stepper-btn-mini stepper-plus" onClick={() => setEmployeeCount(employeeCount + 1)} title="Add assistant">+</button>
              </div>
            </div>
            {/* Pay rate per helper */}
            <div className="dual-control-item">
              <span className="dual-control-label">Pay per Helper</span>
              <div className="dual-stepper-box">
                <button type="button" className="stepper-btn-mini stepper-minus" onClick={() => setEmployeeCost(Math.max(0, employeeCost - 50))} title="Lower pay">-</button>
                <div className="dual-input-span">
                  <span style={{ color: 'var(--accent-green)', fontSize: '0.85em' }}>{currency}</span>
                  <input 
                    type="number" 
                    className="dual-input" 
                    value={employeeCost === 0 ? '' : employeeCost} 
                    onChange={(e) => setEmployeeCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                  />
                </div>
                <button type="button" className="stepper-btn-mini stepper-plus" onClick={() => setEmployeeCost(employeeCost + 50)} title="Higher pay">+</button>
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Gas & Travel Fee */}
        <div className="factor-row">
          <div className="factor-info">
            <span className="factor-title">4. Gas & Travel</span>
            <div className="factor-input-wrapper">
              <span style={{ color: 'var(--accent-green)', fontWeight: 800 }}>{currency}</span>
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
            <button type="button" className="stepper-btn stepper-minus" onClick={() => setTransportCost(Math.max(0, transportCost - 200))}>- 200</button>
            <button type="button" className="stepper-btn stepper-plus" onClick={() => setTransportCost(transportCost + 200)}>+ 200</button>
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
