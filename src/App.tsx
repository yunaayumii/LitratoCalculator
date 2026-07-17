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

  // Active mode switcher tab
  const [activeTab, setActiveTab] = useState<'package' | 'retail'>('package');

  // Mode 1 (Package Rental) Input states
  const [rentalPrice, setRentalPrice] = useState<number>(15000);
  
  // Mode 2 (Retail Booth / Copies) Input states
  const [sellingPricePerPrint, setSellingPricePerPrint] = useState<number>(150);
  const [printsSoldQty, setPrintsSoldQty] = useState<number>(150);
  const [spaceRentalCost, setSpaceRentalCost] = useState<number>(3500);

  // Shared / Operational factor states
  const [printCost, setPrintCost] = useState<number>(12);
  const [printQty, setPrintQty] = useState<number>(100);
  const [employeeCost, setEmployeeCost] = useState<number>(500);
  const [employeeCount, setEmployeeCount] = useState<number>(2);
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

  // Math logic: Mode 1 (Package Rental)
  const tab1PrintsCost = printCost * printQty;
  const tab1EmployeesCost = employeeCost * employeeCount;
  const tab1TotalExpenses = tab1PrintsCost + tab1EmployeesCost + transportCost;
  const tab1NetProfit = rentalPrice - tab1TotalExpenses;
  const tab1ProfitMargin = rentalPrice > 0 ? (tab1NetProfit / rentalPrice) * 100 : 0;

  // Math logic: Mode 2 (Retail Booth / Copies Mode)
  const tab2Revenue = sellingPricePerPrint * printsSoldQty;
  const tab2PrintProdCost = printCost * printsSoldQty;
  const tab2StaffCost = employeeCost * employeeCount;
  const tab2TotalExpenses = spaceRentalCost + tab2PrintProdCost + tab2StaffCost + transportCost;
  const tab2NetProfit = tab2Revenue - tab2TotalExpenses;
  const tab2ProfitMargin = tab2Revenue > 0 ? (tab2NetProfit / tab2Revenue) * 100 : 0;

  // Break-even copies needed to cover fixed overhead (space + staff + travel)
  const breakEvenCopies = (sellingPricePerPrint - printCost) > 0 
    ? Math.ceil((spaceRentalCost + tab2StaffCost + transportCost) / (sellingPricePerPrint - printCost)) 
    : 0;

  // Active dashboard metrics
  const currentRevenue = activeTab === 'package' ? rentalPrice : tab2Revenue;
  const currentExpenses = activeTab === 'package' ? tab1TotalExpenses : tab2TotalExpenses;
  const currentNetProfit = activeTab === 'package' ? tab1NetProfit : tab2NetProfit;
  const currentProfitMargin = activeTab === 'package' ? tab1ProfitMargin : tab2ProfitMargin;

  // Format currency helper
  const formatVal = (val: number) => {
    return `${currency}${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // Copy report
  const copyReportToClipboard = () => {
    let reportText = '';
    if (activeTab === 'package') {
      reportText = `📸 --- LITRATO PACKAGE RENTAL REPORT ---
💵 Package Price (Revenue): ${formatVal(rentalPrice)}

💸 EXPENSES BREAKDOWN:
• Photo Prints (${printQty} pcs @ ${formatVal(printCost)}): ${formatVal(tab1PrintsCost)}
• Staff / Assistants (${employeeCount} people @ ${formatVal(employeeCost)}): ${formatVal(tab1EmployeesCost)}
• Gas & Travel: ${formatVal(transportCost)}

📊 TOTAL EXPENSES: ${formatVal(tab1TotalExpenses)}
💰 YOUR TAKE-HOME PROFIT: ${formatVal(tab1NetProfit)}
📈 PROFIT MARGIN: ${tab1ProfitMargin.toFixed(1)}%
--------------------------------------`;
    } else {
      reportText = `🏪 --- LITRATO RETAIL BOOTH REPORT ---
💵 Photo Sales (${printsSoldQty} copies @ ${formatVal(sellingPricePerPrint)}): ${formatVal(tab2Revenue)}

💸 EXPENSES BREAKDOWN:
• Space / Booth Rental: ${formatVal(spaceRentalCost)}
• Print Production (${printsSoldQty} copies @ ${formatVal(printCost)}): ${formatVal(tab2PrintProdCost)}
• Staff / Assistants (${employeeCount} people @ ${formatVal(employeeCost)}): ${formatVal(tab2StaffCost)}
• Gas & Travel: ${formatVal(transportCost)}

📊 TOTAL EXPENSES: ${formatVal(tab2TotalExpenses)}
🎯 BREAK-EVEN POINT: ${breakEvenCopies} copies sold
💰 YOUR TAKE-HOME PROFIT: ${formatVal(tab2NetProfit)}
📈 PROFIT MARGIN: ${tab2ProfitMargin.toFixed(1)}%
--------------------------------------`;
    }

    navigator.clipboard.writeText(reportText).then(() => {
      triggerToast('Summary copied! Ready to send in SMS/Viber.');
    }).catch(() => {
      triggerToast('Could not copy. Please copy manually.');
    });
  };

  // Reset to defaults
  const handleReset = () => {
    if (activeTab === 'package') {
      setRentalPrice(15000);
      setPrintCost(12);
      setPrintQty(100);
      setEmployeeCost(500);
      setEmployeeCount(2);
      setTransportCost(1000);
      triggerToast('Reset Package Rental defaults');
    } else {
      setSellingPricePerPrint(150);
      setPrintsSoldQty(150);
      setSpaceRentalCost(3500);
      setPrintCost(12);
      setEmployeeCost(500);
      setEmployeeCount(2);
      setTransportCost(1000);
      triggerToast('Reset Retail Booth defaults');
    }
  };

  // Helper for determining profit level styling class
  const getProfitClass = (val: number) => {
    if (val < 0) return 'negative';
    if (currentRevenue > 0 && (val / currentRevenue) < 0.3) return 'warning'; // low margin (<30%)
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

      {/* Tab Bar Mode Switcher */}
      <nav className="tab-bar">
        <button 
          type="button" 
          className={`tab-btn ${activeTab === 'package' ? 'active' : ''}`}
          onClick={() => setActiveTab('package')}
        >
          💼 Package Rental
        </button>
        <button 
          type="button" 
          className={`tab-btn ${activeTab === 'retail' ? 'active' : ''}`}
          onClick={() => setActiveTab('retail')}
        >
          🏪 Retail Booth (Copies)
        </button>
      </nav>

      {/* Top Prominent Profit Dashboard Card */}
      <section className="dashboard-card">
        <span className="profit-main-label">⭐ ESTIMATED NET PROFIT ⭐</span>
        <h1 className={`profit-main-value ${getProfitClass(currentNetProfit)}`}>
          {formatVal(currentNetProfit)}
        </h1>
        {activeTab === 'retail' && (
          <div className="breakeven-tag">
            🎯 Break-even: {breakEvenCopies} copies sold
          </div>
        )}
        
        <div className="dashboard-subbar">
          <div className="subbar-item">
            <span className="subbar-label">REVENUE</span>
            <span className="subbar-val" style={{ color: 'var(--accent-green)' }}>{formatVal(currentRevenue)}</span>
          </div>
          <div className="subbar-item">
            <span className="subbar-label">EXPENSES</span>
            <span className="subbar-val" style={{ color: 'var(--color-danger)' }}>{formatVal(currentExpenses)}</span>
          </div>
          <div className="subbar-item">
            <span className="subbar-label">MARGIN</span>
            <span className="subbar-val" style={{ color: 'var(--text-primary)' }}>{currentProfitMargin.toFixed(0)}%</span>
          </div>
        </div>
      </section>

      {/* 4 Interactive Factors in Single Viewport (No Scrolling) */}
      <main className="factors-container">
        {activeTab === 'package' ? (
          <>
            {/* Mode 1 - Row 1: Package Price */}
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

            {/* Mode 1 - Row 2: Photo Prints (Volume & Cost per Print) */}
            <div className="factor-row-dual">
              <div className="dual-header">
                <span className="dual-title">2. Photo Prints</span>
                <span className="dual-badge">Total: {formatVal(tab1PrintsCost)}</span>
              </div>
              <div className="dual-controls-grid">
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

            {/* Mode 1 - Row 3: Staff Helpers (Headcount & Pay Rate) */}
            <div className="factor-row-dual">
              <div className="dual-header">
                <span className="dual-title">3. Staff Helpers</span>
                <span className="dual-badge">Total: {formatVal(tab1EmployeesCost)}</span>
              </div>
              <div className="dual-controls-grid">
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

            {/* Mode 1 - Row 4: Gas & Travel Fee */}
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
          </>
        ) : (
          <>
            {/* Mode 2 - Row 1: Photo Sales (Price per Print & Copies Sold) */}
            <div className="factor-row-dual">
              <div className="dual-header">
                <span className="dual-title">1. Photo Sales</span>
                <span className="dual-badge">Revenue: {formatVal(tab2Revenue)}</span>
              </div>
              <div className="dual-controls-grid">
                <div className="dual-control-item">
                  <span className="dual-control-label">Price / Copy</span>
                  <div className="dual-stepper-box">
                    <button type="button" className="stepper-btn-mini stepper-minus" onClick={() => setSellingPricePerPrint(Math.max(0, sellingPricePerPrint - 10))} title="Lower price">-</button>
                    <div className="dual-input-span">
                      <span style={{ color: 'var(--accent-green)', fontSize: '0.85em' }}>{currency}</span>
                      <input 
                        type="number" 
                        className="dual-input" 
                        value={sellingPricePerPrint === 0 ? '' : sellingPricePerPrint} 
                        onChange={(e) => setSellingPricePerPrint(Math.max(0, parseFloat(e.target.value) || 0))}
                        placeholder="0"
                      />
                    </div>
                    <button type="button" className="stepper-btn-mini stepper-plus" onClick={() => setSellingPricePerPrint(sellingPricePerPrint + 10)} title="Higher price">+</button>
                  </div>
                </div>
                <div className="dual-control-item">
                  <span className="dual-control-label">Copies Sold</span>
                  <div className="dual-stepper-box">
                    <button type="button" className="stepper-btn-mini stepper-minus" onClick={() => setPrintsSoldQty(Math.max(0, printsSoldQty - 10))} title="Less copies">-</button>
                    <div className="dual-input-span">
                      <input 
                        type="number" 
                        className="dual-input" 
                        value={printsSoldQty === 0 ? '' : printsSoldQty} 
                        onChange={(e) => setPrintsSoldQty(Math.max(0, parseInt(e.target.value) || 0))}
                        placeholder="0"
                      />
                    </div>
                    <button type="button" className="stepper-btn-mini stepper-plus" onClick={() => setPrintsSoldQty(printsSoldQty + 10)} title="More copies">+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mode 2 - Row 2: Space / Booth Rental Fee */}
            <div className="factor-row">
              <div className="factor-info">
                <span className="factor-title">2. Space Rental Fee</span>
                <div className="factor-input-wrapper">
                  <span style={{ color: 'var(--accent-green)', fontWeight: 800 }}>{currency}</span>
                  <input 
                    type="number" 
                    className="factor-input" 
                    value={spaceRentalCost === 0 ? '' : spaceRentalCost} 
                    onChange={(e) => setSpaceRentalCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="row-steppers">
                <button type="button" className="stepper-btn stepper-minus" onClick={() => setSpaceRentalCost(Math.max(0, spaceRentalCost - 500))}>- 500</button>
                <button type="button" className="stepper-btn stepper-plus" onClick={() => setSpaceRentalCost(spaceRentalCost + 500)}>+ 500</button>
              </div>
            </div>

            {/* Mode 2 - Row 3: Staff Helpers (Headcount & Pay Rate) */}
            <div className="factor-row-dual">
              <div className="dual-header">
                <span className="dual-title">3. Staff Helpers</span>
                <span className="dual-badge">Total: {formatVal(tab2StaffCost)}</span>
              </div>
              <div className="dual-controls-grid">
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

            {/* Mode 2 - Row 4: Print Prod Cost & Gas/Travel */}
            <div className="factor-row-dual">
              <div className="dual-header">
                <span className="dual-title">4. Print Prod & Travel</span>
                <span className="dual-badge">Total: {formatVal(tab2PrintProdCost + transportCost)}</span>
              </div>
              <div className="dual-controls-grid">
                <div className="dual-control-item">
                  <span className="dual-control-label">Prod / Copy</span>
                  <div className="dual-stepper-box">
                    <button type="button" className="stepper-btn-mini stepper-minus" onClick={() => setPrintCost(Math.max(0, printCost - 1))} title="Lower production cost">-</button>
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
                    <button type="button" className="stepper-btn-mini stepper-plus" onClick={() => setPrintCost(printCost + 1)} title="Higher production cost">+</button>
                  </div>
                </div>
                <div className="dual-control-item">
                  <span className="dual-control-label">Gas & Travel</span>
                  <div className="dual-stepper-box">
                    <button type="button" className="stepper-btn-mini stepper-minus" onClick={() => setTransportCost(Math.max(0, transportCost - 200))} title="Lower travel cost">-</button>
                    <div className="dual-input-span">
                      <span style={{ color: 'var(--accent-green)', fontSize: '0.85em' }}>{currency}</span>
                      <input 
                        type="number" 
                        className="dual-input" 
                        value={transportCost === 0 ? '' : transportCost} 
                        onChange={(e) => setTransportCost(Math.max(0, parseFloat(e.target.value) || 0))}
                        placeholder="0"
                      />
                    </div>
                    <button type="button" className="stepper-btn-mini stepper-plus" onClick={() => setTransportCost(transportCost + 200)} title="Higher travel cost">+</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
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

