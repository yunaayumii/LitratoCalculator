import { useState } from 'react';
import {
  Copy,
  RefreshCw,
  CheckCircle2,
  Plus,
  Trash2
} from 'lucide-react';

export interface CustomMiscFee {
  id: string;
  name: string;
  type: 'flat' | 'unit';
  amount: number;
  unitCount: number;
  unitPrice: number;
}

function App() {
  // Fixed currency symbol (Philippine Peso only)
  const currency = '₱';

  // Active mode switcher tab
  const [activeTab, setActiveTab] = useState<'package' | 'retail' | 'percent'>('package');

  // Mode 1 (Package Rental) Input states
  const [rentalPrice, setRentalPrice] = useState<number>(15000);

  // Mode 2 (Retail Booth / Copies) Input states
  const [sellingPricePerPrint, setSellingPricePerPrint] = useState<number>(150);
  const [printsSoldQty, setPrintsSoldQty] = useState<number>(150);
  const [spaceRentalCost, setSpaceRentalCost] = useState<number>(3500);

  // Mode 3 (Percentage Cut) Input states
  const [commissionRate, setCommissionRate] = useState<number>(20); // e.g. 20% cut to the organizer

  // Shared / Operational factor states
  const [printCost, setPrintCost] = useState<number>(12);
  const [printQty, setPrintQty] = useState<number>(100);
  const [employeeCost, setEmployeeCost] = useState<number>(500);
  const [employeeCount, setEmployeeCount] = useState<number>(2);
  const [transportCost, setTransportCost] = useState<number>(1000);
  const [miscCost, setMiscCost] = useState<number>(500);

  // Custom Misc Fees dynamic state
  const [customMiscFees, setCustomMiscFees] = useState<CustomMiscFee[]>([]);
  const [isAddingMiscFee, setIsAddingMiscFee] = useState<boolean>(false);
  const [newFeeName, setNewFeeName] = useState<string>('');
  const [newFeeType, setNewFeeType] = useState<'flat' | 'unit'>('flat');
  const [newFeeAmount, setNewFeeAmount] = useState<number>(0);
  const [newFeeUnitCount, setNewFeeUnitCount] = useState<number>(1);
  const [newFeeUnitPrice, setNewFeeUnitPrice] = useState<number>(0);

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

  // Add custom misc fee item
  const handleAddCustomMiscFee = () => {
    const name = newFeeName.trim() || 'Misc Item';
    const newItem: CustomMiscFee = {
      id: Date.now().toString(),
      name,
      type: newFeeType,
      amount: newFeeAmount,
      unitCount: newFeeUnitCount,
      unitPrice: newFeeUnitPrice
    };
    setCustomMiscFees([...customMiscFees, newItem]);
    setNewFeeName('');
    setNewFeeAmount(0);
    setNewFeeUnitCount(1);
    setNewFeeUnitPrice(0);
    setIsAddingMiscFee(false);
    triggerToast(`Added misc fee: ${name}`);
  };

  // Remove custom misc fee item
  const handleRemoveCustomMiscFee = (id: string) => {
    const target = customMiscFees.find(f => f.id === id);
    setCustomMiscFees(customMiscFees.filter(f => f.id !== id));
    triggerToast(`Removed: ${target?.name || 'fee item'}`);
  };

  // Update inline custom misc fee item
  const handleUpdateCustomMiscFee = (id: string, field: keyof CustomMiscFee, value: any) => {
    setCustomMiscFees(customMiscFees.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Compute Total Misc Expenses (Base + Custom Items)
  const totalMiscCost = miscCost + customMiscFees.reduce((sum, item) => {
    return sum + (item.type === 'flat' ? item.amount : item.unitCount * item.unitPrice);
  }, 0);

  // Math logic: Mode 1 (Package Rental)
  const tab1PrintsCost = printCost * printQty;
  const tab1EmployeesCost = employeeCost * employeeCount;
  const tab1TotalExpenses = tab1PrintsCost + tab1EmployeesCost + transportCost + totalMiscCost;
  const tab1NetProfit = rentalPrice - tab1TotalExpenses;
  const tab1ProfitMargin = rentalPrice > 0 ? (tab1NetProfit / rentalPrice) * 100 : 0;

  // Math logic: Mode 2 (Retail Booth / Copies Mode)
  const tab2Revenue = sellingPricePerPrint * printsSoldQty;
  const tab2PrintProdCost = printCost * printsSoldQty;
  const tab2StaffCost = employeeCost * employeeCount;
  const tab2TotalExpenses = spaceRentalCost + tab2PrintProdCost + tab2StaffCost + transportCost + totalMiscCost;
  const tab2NetProfit = tab2Revenue - tab2TotalExpenses;
  const tab2ProfitMargin = tab2Revenue > 0 ? (tab2NetProfit / tab2Revenue) * 100 : 0;

  // Math logic: Mode 3 (Percentage Cut Mode)
  const tab3GrossRevenue = sellingPricePerPrint * printsSoldQty;
  const tab3OrganizerCut = tab3GrossRevenue * (commissionRate / 100);
  const tab3PrintProdCost = printCost * printsSoldQty;
  const tab3StaffCost = employeeCost * employeeCount;
  const tab3TotalExpenses = tab3OrganizerCut + tab3PrintProdCost + tab3StaffCost + transportCost + totalMiscCost;
  const tab3NetProfit = tab3GrossRevenue - tab3TotalExpenses;
  const tab3ProfitMargin = tab3GrossRevenue > 0 ? (tab3NetProfit / tab3GrossRevenue) * 100 : 0;

  // Break-even copies needed to cover fixed overhead (space + staff + travel + total misc)
  const breakEvenCopies = (sellingPricePerPrint - printCost) > 0
    ? Math.ceil((spaceRentalCost + tab2StaffCost + transportCost + totalMiscCost) / (sellingPricePerPrint - printCost))
    : 0;

  // Active dashboard metrics
  const currentRevenue = activeTab === 'package' ? rentalPrice : activeTab === 'retail' ? tab2Revenue : tab3GrossRevenue;
  const currentExpenses = activeTab === 'package' ? tab1TotalExpenses : activeTab === 'retail' ? tab2TotalExpenses : tab3TotalExpenses;
  const currentNetProfit = activeTab === 'package' ? tab1NetProfit : activeTab === 'retail' ? tab2NetProfit : tab3NetProfit;
  const currentProfitMargin = activeTab === 'package' ? tab1ProfitMargin : activeTab === 'retail' ? tab2ProfitMargin : tab3ProfitMargin;

  // Format currency helper
  const formatVal = (val: number) => {
    return `${currency}${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // Format misc breakdown text for clipboard report
  const getMiscBreakdownText = () => {
    if (customMiscFees.length === 0) {
      return `• Misc Fees: ${formatVal(miscCost)}`;
    }
    let text = `• Base Misc Fee: ${formatVal(miscCost)}`;
    customMiscFees.forEach(fee => {
      if (fee.type === 'flat') {
        text += `\n• ${fee.name} (Flat): ${formatVal(fee.amount)}`;
      } else {
        const itemTotal = fee.unitCount * fee.unitPrice;
        text += `\n• ${fee.name} (${fee.unitCount} units @ ${formatVal(fee.unitPrice)}): ${formatVal(itemTotal)}`;
      }
    });
    text += `\n• TOTAL MISC EXPENSES: ${formatVal(totalMiscCost)}`;
    return text;
  };

  // Copy report
  const copyReportToClipboard = () => {
    let reportText = '';
    const miscText = getMiscBreakdownText();

    if (activeTab === 'package') {
      reportText = `📸 --- LITRATO PACKAGE RENTAL REPORT ---
💵 Package Price (Revenue): ${formatVal(rentalPrice)}

💸 EXPENSES BREAKDOWN:
• Photo Prints (${printQty} pcs @ ${formatVal(printCost)}): ${formatVal(tab1PrintsCost)}
• Staff / Assistants (${employeeCount} people @ ${formatVal(employeeCost)}): ${formatVal(tab1EmployeesCost)}
• Gas & Travel: ${formatVal(transportCost)}
${miscText}

📊 TOTAL EXPENSES: ${formatVal(tab1TotalExpenses)}
💰 YOUR TAKE-HOME PROFIT: ${formatVal(tab1NetProfit)}
📈 PROFIT MARGIN: ${tab1ProfitMargin.toFixed(1)}%
--------------------------------------`;
    } else if (activeTab === 'retail') {
      reportText = `🏪 --- LITRATO RETAIL BOOTH REPORT ---
💵 Photo Sales (${printsSoldQty} copies @ ${formatVal(sellingPricePerPrint)}): ${formatVal(tab2Revenue)}

💸 EXPENSES BREAKDOWN:
• Space / Booth Rental: ${formatVal(spaceRentalCost)}
• Print Production (${printsSoldQty} copies @ ${formatVal(printCost)}): ${formatVal(tab2PrintProdCost)}
• Staff / Assistants (${employeeCount} people @ ${formatVal(employeeCost)}): ${formatVal(tab2StaffCost)}
• Gas & Travel: ${formatVal(transportCost)}
${miscText}

📊 TOTAL EXPENSES: ${formatVal(tab2TotalExpenses)}
🎯 BREAK-EVEN POINT: ${breakEvenCopies} copies sold
💰 YOUR TAKE-HOME PROFIT: ${formatVal(tab2NetProfit)}
📈 PROFIT MARGIN: ${tab2ProfitMargin.toFixed(1)}%
--------------------------------------`;
    } else {
      reportText = `✂️ --- LITRATO PERCENTAGE CUT REPORT ---
💵 Gross Photo Sales (${printsSoldQty} copies @ ${formatVal(sellingPricePerPrint)}): ${formatVal(tab3GrossRevenue)}

💸 EXPENSES BREAKDOWN:
• Organizer Cut (${commissionRate}%): ${formatVal(tab3OrganizerCut)}
• Print Production (${printsSoldQty} copies @ ${formatVal(printCost)}): ${formatVal(tab3PrintProdCost)}
• Staff / Assistants (${employeeCount} people @ ${formatVal(employeeCost)}): ${formatVal(tab3StaffCost)}
• Gas & Travel: ${formatVal(transportCost)}
${miscText}

📊 TOTAL EXPENSES: ${formatVal(tab3TotalExpenses)}
💰 YOUR TAKE-HOME PROFIT: ${formatVal(tab3NetProfit)}
📈 PROFIT MARGIN: ${tab3ProfitMargin.toFixed(1)}%
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
    setCustomMiscFees([]);
    setIsAddingMiscFee(false);
    setNewFeeName('');
    setNewFeeAmount(0);
    setNewFeeUnitCount(1);
    setNewFeeUnitPrice(0);

    if (activeTab === 'package') {
      setRentalPrice(15000);
      setPrintCost(12);
      setPrintQty(100);
      setEmployeeCost(500);
      setEmployeeCount(2);
      setTransportCost(1000);
      setMiscCost(500);
      triggerToast('Reset Package Rental defaults');
    } else if (activeTab === 'retail') {
      setSellingPricePerPrint(150);
      setPrintsSoldQty(150);
      setSpaceRentalCost(3500);
      setPrintCost(12);
      setEmployeeCost(500);
      setEmployeeCount(2);
      setTransportCost(1000);
      setMiscCost(500);
      triggerToast('Reset Retail Booth defaults');
    } else {
      setSellingPricePerPrint(150);
      setPrintsSoldQty(150);
      setCommissionRate(20);
      setPrintCost(12);
      setEmployeeCost(500);
      setEmployeeCount(2);
      setTransportCost(1000);
      setMiscCost(500);
      triggerToast('Reset Percentage Cut defaults');
    }
  };

  // Helper for determining profit level styling class
  const getProfitClass = (val: number) => {
    if (val < 0) return 'negative';
    if (currentRevenue > 0 && (val / currentRevenue) < 0.3) return 'warning'; // low margin (<30%)
    return 'positive';
  };

  // Render Miscellaneous Fees Card with dynamic custom rows
  const renderMiscFeesSection = () => {
    return (
      <div className="misc-fees-container expense-row">
        <div className="misc-header">
          <span className="factor-title">5. Misc Fees</span>
          <span className="dual-badge">Total: {formatVal(totalMiscCost)}</span>
        </div>

        {/* Base General Misc Fee input */}
        <div className="misc-base-row">
          <span className="misc-base-label">Base Fee:</span>
          <div className="factor-input-wrapper">
            <span className="currency-symbol">{currency}</span>
            <input
              type="number"
              className="factor-input"
              value={miscCost === 0 ? '' : miscCost}
              onChange={(e) => setMiscCost(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="0"
            />
          </div>
        </div>

        {/* Added custom misc fee items list */}
        {customMiscFees.length > 0 && (
          <div className="custom-misc-list">
            {customMiscFees.map((item) => {
              const itemSubtotal = item.type === 'flat' ? item.amount : item.unitCount * item.unitPrice;
              return (
                <div key={item.id} className="custom-misc-card">
                  <div className="custom-misc-top">
                    <div className="custom-misc-info">
                      <span className="custom-misc-name">{item.name}</span>
                      <span className="custom-misc-type-tag">
                        {item.type === 'flat' ? 'Flat Fee' : `${item.unitCount} pcs × ${formatVal(item.unitPrice)}`}
                      </span>
                    </div>
                    <div className="custom-misc-right">
                      <span className="custom-misc-amount">{formatVal(itemSubtotal)}</span>
                      <button
                        type="button"
                        className="trash-btn"
                        onClick={() => handleRemoveCustomMiscFee(item.id)}
                        title="Delete this item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Inline quick edit controls */}
                  <div className="custom-misc-edit-bar">
                    {item.type === 'flat' ? (
                      <div className="inline-edit-field">
                        <span className="inline-label">Amount:</span>
                        <div className="inline-input-box">
                          <span className="currency-symbol" style={{ fontSize: '0.85em' }}>{currency}</span>
                          <input
                            type="number"
                            className="dual-input"
                            style={{ width: '70px', textAlign: 'right' }}
                            value={item.amount === 0 ? '' : item.amount}
                            onChange={(e) => handleUpdateCustomMiscFee(item.id, 'amount', Math.max(0, parseFloat(e.target.value) || 0))}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="inline-edit-dual">
                        <div className="inline-edit-field">
                          <span className="inline-label">Units:</span>
                          <input
                            type="number"
                            className="dual-input"
                            style={{ width: '55px', textAlign: 'center' }}
                            value={item.unitCount === 0 ? '' : item.unitCount}
                            onChange={(e) => handleUpdateCustomMiscFee(item.id, 'unitCount', Math.max(0, parseInt(e.target.value) || 0))}
                          />
                        </div>
                        <div className="inline-edit-field">
                          <span className="inline-label">Price/Unit:</span>
                          <div className="inline-input-box">
                            <span className="currency-symbol" style={{ fontSize: '0.85em' }}>{currency}</span>
                            <input
                              type="number"
                              className="dual-input"
                              style={{ width: '65px', textAlign: 'right' }}
                              value={item.unitPrice === 0 ? '' : item.unitPrice}
                              onChange={(e) => handleUpdateCustomMiscFee(item.id, 'unitPrice', Math.max(0, parseFloat(e.target.value) || 0))}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Row Section */}
        {!isAddingMiscFee ? (
          <button
            type="button"
            className="add-misc-trigger-btn"
            onClick={() => setIsAddingMiscFee(true)}
          >
            <Plus size={16} />
            <span>Add Misc Fee Item</span>
          </button>
        ) : (
          <div className="add-misc-form-box">
            <span className="form-box-title">➕ Add New Misc Fee Item</span>

            <div className="form-field-group">
              <label className="form-field-label">Item Name</label>
              <input
                type="text"
                className="form-text-input"
                placeholder="e.g. Parking, Props, Backdrop..."
                value={newFeeName}
                onChange={(e) => setNewFeeName(e.target.value)}
              />
            </div>

            <div className="form-field-group">
              <label className="form-field-label">Fee Input Type</label>
              <div className="type-toggle-grid">
                <button
                  type="button"
                  className={`type-btn ${newFeeType === 'flat' ? 'active' : ''}`}
                  onClick={() => setNewFeeType('flat')}
                >
                  💵 Flat Amount
                </button>
                <button
                  type="button"
                  className={`type-btn ${newFeeType === 'unit' ? 'active' : ''}`}
                  onClick={() => setNewFeeType('unit')}
                >
                  📦 Units × Price
                </button>
              </div>
            </div>

            {newFeeType === 'flat' ? (
              <div className="form-field-group">
                <label className="form-field-label">Expense Amount ({currency})</label>
                <div className="factor-input-wrapper">
                  <span className="currency-symbol">{currency}</span>
                  <input
                    type="number"
                    className="factor-input"
                    value={newFeeAmount === 0 ? '' : newFeeAmount}
                    onChange={(e) => setNewFeeAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                  />
                </div>
              </div>
            ) : (
              <div className="form-dual-grid">
                <div className="form-field-group">
                  <label className="form-field-label">Number of Units</label>
                  <input
                    type="number"
                    className="dual-input"
                    style={{ width: '100%', height: '36px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0 8px', fontSize: '0.95rem' }}
                    value={newFeeUnitCount === 0 ? '' : newFeeUnitCount}
                    onChange={(e) => setNewFeeUnitCount(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                  />
                </div>
                <div className="form-field-group">
                  <label className="form-field-label">Price per Unit ({currency})</label>
                  <div className="factor-input-wrapper">
                    <span className="currency-symbol">{currency}</span>
                    <input
                      type="number"
                      className="factor-input"
                      value={newFeeUnitPrice === 0 ? '' : newFeeUnitPrice}
                      onChange={(e) => setNewFeeUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="form-actions-row">
              <button
                type="button"
                className="form-btn-save"
                onClick={handleAddCustomMiscFee}
              >
                Save Item
              </button>
              <button
                type="button"
                className="form-btn-cancel"
                onClick={() => {
                  setIsAddingMiscFee(false);
                  setNewFeeName('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
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
          <img src="/litrato.svg" alt="Litrato Logo" style={{ height: '24px', width: 'auto' }} />
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
          🏪 Retail Booth
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'percent' ? 'active' : ''}`}
          onClick={() => setActiveTab('percent')}
        >
          ✂️ Percentage Cut
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
            <div className="section-divider revenue-divider">
              <span>💵 REVENUE & INCOME</span>
            </div>

            {/* Mode 1 - Row 1: Package Price */}
            <div className="factor-row revenue-row">
              <div className="factor-info">
                <span className="factor-title">1. Package Price</span>
                <div className="factor-input-wrapper">
                  <span className="currency-symbol">{currency}</span>
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

            <div className="section-divider expense-divider">
              <span>💸 OPERATIONAL EXPENSES</span>
            </div>

            {/* Mode 1 - Row 2: Photo Prints (Volume & Cost per Print) */}
            <div className="factor-row-dual expense-row">
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
                      <span className="currency-symbol" style={{ fontSize: '0.85em' }}>{currency}</span>
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
            <div className="factor-row-dual expense-row">
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
                      <span className="currency-symbol" style={{ fontSize: '0.85em' }}>{currency}</span>
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
            <div className="factor-row expense-row">
              <div className="factor-info">
                <span className="factor-title">4. Gas & Travel</span>
              </div>
              <div className="factor-input-wrapper">
                <span className="currency-symbol">{currency}</span>
                <input
                  type="number"
                  className="factor-input"
                  value={transportCost === 0 ? '' : transportCost}
                  onChange={(e) => setTransportCost(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Mode 1 - Row 5: Miscellaneous Fees Container */}
            {renderMiscFeesSection()}
          </>
        ) : activeTab === 'retail' ? (
          <>
            <div className="section-divider revenue-divider">
              <span>💵 REVENUE & INCOME</span>
            </div>

            {/* Mode 2 - Row 1: Photo Sales (Price per Print & Copies Sold) */}
            <div className="factor-row-dual revenue-row">
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
                      <span className="currency-symbol" style={{ fontSize: '0.85em' }}>{currency}</span>
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

            <div className="section-divider expense-divider">
              <span>💸 OPERATIONAL EXPENSES</span>
            </div>

            {/* Mode 2 - Row 2: Space / Booth Rental Fee */}
            <div className="factor-row expense-row">
              <div className="factor-info">
                <span className="factor-title">2. Space Rental Fee</span>
                <div className="factor-input-wrapper">
                  <span className="currency-symbol">{currency}</span>
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

            {/* Mode 2 - Row 3: Staff Helpers + Print Production Cost (Dual Card) */}
            <div className="factor-row-dual expense-row">
              <div className="dual-header">
                <span className="dual-title">3. Production & Staff</span>
                <span className="dual-badge">Total: {formatVal(tab2StaffCost + tab2PrintProdCost)}</span>
              </div>
              <div className="dual-controls-grid">
                <div className="dual-control-item">
                  <span className="dual-control-label">Staff Count ({employeeCount})</span>
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
                      <span className="currency-symbol" style={{ fontSize: '0.85em' }}>{currency}</span>
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
              <div className="dual-controls-grid" style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid var(--border-color)' }}>
                <div className="dual-control-item" style={{ gridColumn: 'span 2' }}>
                  <span className="dual-control-label">Print Production Cost ({formatVal(printCost)}/copy × {printsSoldQty} pcs) = <strong>{formatVal(tab2PrintProdCost)}</strong></span>
                  <div className="dual-stepper-box" style={{ width: '100%', maxWidth: '240px' }}>
                    <button type="button" className="stepper-btn-mini stepper-minus" onClick={() => setPrintCost(Math.max(0, printCost - 1))} title="Lower production cost">-</button>
                    <div className="dual-input-span">
                      <span className="currency-symbol" style={{ fontSize: '0.85em' }}>{currency}</span>
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
              </div>
            </div>

            {/* Mode 2 - Row 4: Gas & Travel */}
            <div className="factor-row expense-row">
              <div className="factor-info">
                <span className="factor-title">4. Gas & Travel</span>
              </div>
              <div className="factor-input-wrapper">
                <span className="currency-symbol">{currency}</span>
                <input
                  type="number"
                  className="factor-input"
                  value={transportCost === 0 ? '' : transportCost}
                  onChange={(e) => setTransportCost(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Mode 2 - Row 5: Miscellaneous Fees Container */}
            {renderMiscFeesSection()}
          </>
        ) : (
          /* Mode 3 - Percentage Cut Mode */
          <>
            <div className="section-divider revenue-divider">
              <span>💵 REVENUE & COMMISSION</span>
            </div>

            {/* Mode 3 - Row 1: Gross Photo Sales */}
            <div className="factor-row-dual revenue-row">
              <div className="dual-header">
                <span className="dual-title">1. Gross Photo Sales</span>
                <span className="dual-badge">Gross: {formatVal(tab3GrossRevenue)}</span>
              </div>
              <div className="dual-controls-grid">
                <div className="dual-control-item">
                  <span className="dual-control-label">Price / Copy</span>
                  <div className="dual-stepper-box">
                    <button type="button" className="stepper-btn-mini stepper-minus" onClick={() => setSellingPricePerPrint(Math.max(0, sellingPricePerPrint - 10))} title="Lower price">-</button>
                    <div className="dual-input-span">
                      <span className="currency-symbol" style={{ fontSize: '0.85em' }}>{currency}</span>
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

            <div className="section-divider expense-divider">
              <span>💸 OPERATIONAL EXPENSES</span>
            </div>

            {/* Mode 3 - Row 2: Organizer Cut (%) */}
            <div className="factor-row expense-row">
              <div className="factor-info">
                <span className="factor-title">2. Organizer Cut (%)</span>
                <div className="factor-input-wrapper">
                  <input
                    type="number"
                    className="factor-input"
                    value={commissionRate === 0 ? '' : commissionRate}
                    onChange={(e) => setCommissionRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                  />
                  <span className="currency-symbol" style={{ marginLeft: '4px' }}>% ({formatVal(tab3OrganizerCut)})</span>
                </div>
              </div>
              <div className="row-steppers">
                <button type="button" className="stepper-btn stepper-minus" onClick={() => setCommissionRate(Math.max(0, commissionRate - 5))}>- 5%</button>
                <button type="button" className="stepper-btn stepper-plus" onClick={() => setCommissionRate(commissionRate + 5)}>+ 5%</button>
              </div>
            </div>

            {/* Mode 3 - Row 3: Staff Helpers + Print Production Cost (Dual Card) */}
            <div className="factor-row-dual expense-row">
              <div className="dual-header">
                <span className="dual-title">3. Production & Staff</span>
                <span className="dual-badge">Total: {formatVal(tab3StaffCost + tab3PrintProdCost)}</span>
              </div>
              <div className="dual-controls-grid">
                <div className="dual-control-item">
                  <span className="dual-control-label">Staff Count ({employeeCount})</span>
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
                      <span className="currency-symbol" style={{ fontSize: '0.85em' }}>{currency}</span>
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
              <div className="dual-controls-grid" style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid var(--border-color)' }}>
                <div className="dual-control-item" style={{ gridColumn: 'span 2' }}>
                  <span className="dual-control-label">Print Production Cost ({formatVal(printCost)}/copy × {printsSoldQty} pcs) = <strong>{formatVal(tab3PrintProdCost)}</strong></span>
                  <div className="dual-stepper-box" style={{ width: '100%', maxWidth: '240px' }}>
                    <button type="button" className="stepper-btn-mini stepper-minus" onClick={() => setPrintCost(Math.max(0, printCost - 1))} title="Lower production cost">-</button>
                    <div className="dual-input-span">
                      <span className="currency-symbol" style={{ fontSize: '0.85em' }}>{currency}</span>
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
              </div>
            </div>

            {/* Mode 3 - Row 4: Gas & Travel */}
            <div className="factor-row expense-row">
              <div className="factor-info">
                <span className="factor-title">4. Gas & Travel</span>
              </div>
              <div className="factor-input-wrapper">
                <span className="currency-symbol">{currency}</span>
                <input
                  type="number"
                  className="factor-input"
                  value={transportCost === 0 ? '' : transportCost}
                  onChange={(e) => setTransportCost(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Mode 3 - Row 5: Miscellaneous Fees Container */}
            {renderMiscFeesSection()}
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

