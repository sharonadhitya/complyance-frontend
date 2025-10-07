import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from './components/LoadingSpinner';
import Notification from './components/Notification';

const API_BASE = '/api';

function App() {
  const [formData, setFormData] = useState({
    scenario_name: '',
    monthly_invoice_volume: 2000,
    num_ap_staff: 3,
    avg_hours_per_invoice: 0.17,
    hourly_wage: 30,
    error_rate_manual: 0.005,
    error_cost: 100,
    time_horizon_months: 36,
    one_time_implementation_cost: 50000
  });

  const [results, setResults] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadScenarios();
    // Auto-simulate on component mount
    handleSimulate();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numericFields = [
      'monthly_invoice_volume', 'num_ap_staff', 'avg_hours_per_invoice',
      'hourly_wage', 'error_rate_manual', 'error_cost', 
      'time_horizon_months', 'one_time_implementation_cost'
    ];
    
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value
    }));
  };

  const handleSimulate = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/simulate`, formData);
      setResults(response.data.results);
    } catch (error) {
      setMessage('Error calculating ROI: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveScenario = async () => {
    if (!formData.scenario_name.trim()) {
      setMessage('Please enter a scenario name');
      return;
    }
    
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/scenarios`, formData);
      setMessage('Scenario saved successfully!');
      loadScenarios();
    } catch (error) {
      setMessage('Error saving scenario: ' + error.message);
    } finally {
      setLoading(false);
    }
  }; 
 const loadScenarios = async () => {
    try {
      const response = await axios.get(`${API_BASE}/scenarios`);
      setScenarios(response.data.scenarios);
    } catch (error) {
      // Silently handle error - scenarios will be empty
    }
  };

  const loadScenario = async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/scenarios/${id}`);
      const scenario = response.data.scenario;
      setFormData({
        scenario_name: scenario.scenario_name,
        monthly_invoice_volume: scenario.monthly_invoice_volume,
        num_ap_staff: scenario.num_ap_staff,
        avg_hours_per_invoice: parseFloat(scenario.avg_hours_per_invoice),
        hourly_wage: parseFloat(scenario.hourly_wage),
        error_rate_manual: parseFloat(scenario.error_rate_manual),
        error_cost: parseFloat(scenario.error_cost),
        time_horizon_months: scenario.time_horizon_months,
        one_time_implementation_cost: parseFloat(scenario.one_time_implementation_cost)
      });
      setResults(scenario.results);
      setMessage('Scenario loaded successfully!');
    } catch (error) {
      setMessage('Error loading scenario: ' + error.message);
    }
  };

  const deleteScenario = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scenario?')) return;
    
    try {
      await axios.delete(`${API_BASE}/scenarios/${id}`);
      setMessage('Scenario deleted successfully!');
      loadScenarios();
    } catch (error) {
      setMessage('Error deleting scenario: ' + error.message);
    }
  };

  const generateReport = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email address');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/report/generate`, {
        email,
        scenario_data: formData
      });
      
      // Create and download HTML report
      const blob = new Blob([response.data.report], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `roi-report-${formData.scenario_name || 'unnamed'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setMessage('Report generated and downloaded successfully!');
    } catch (error) {
      setMessage('Error generating report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-simulate when form data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSimulate();
    }, 500);
    return () => clearTimeout(timer);
  }, [formData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ROI Calculator
            </h1>
            <p className="text-xl text-gray-600">
              Calculate your savings when switching from manual to automated invoicing
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Input Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-primary-500">
              Business Inputs
            </h2>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Scenario Name</label>
                <input
                  type="text"
                  name="scenario_name"
                  value={formData.scenario_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Q4_Pilot"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Invoice Volume</label>
                  <input
                    type="number"
                    name="monthly_invoice_volume"
                    value={formData.monthly_invoice_volume}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Number of AP Staff</label>
                  <input
                    type="number"
                    name="num_ap_staff"
                    value={formData.num_ap_staff}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Average Hours per Invoice</label>
                  <input
                    type="number"
                    name="avg_hours_per_invoice"
                    value={formData.avg_hours_per_invoice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hourly Wage ($)</label>
                  <input
                    type="number"
                    name="hourly_wage"
                    value={formData.hourly_wage}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Manual Error Rate (%)</label>
                  <input
                    type="number"
                    name="error_rate_manual"
                    value={formData.error_rate_manual * 100}
                    onChange={(e) => handleInputChange({
                      target: { name: 'error_rate_manual', value: e.target.value / 100 }
                    })}
                    step="0.1"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cost per Error ($)</label>
                  <input
                    type="number"
                    name="error_cost"
                    value={formData.error_cost}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time Horizon (Months)</label>
                  <input
                    type="number"
                    name="time_horizon_months"
                    value={formData.time_horizon_months}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">One-time Implementation Cost ($)</label>
                  <input
                    type="number"
                    name="one_time_implementation_cost"
                    value={formData.one_time_implementation_cost}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  type="button" 
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-1" 
                  onClick={handleSimulate}
                  disabled={loading}
                >
                  {loading ? 'Calculating...' : 'Calculate ROI'}
                </button>
                <button 
                  type="button" 
                  className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-1" 
                  onClick={handleSaveScenario}
                  disabled={loading}
                >
                  Save Scenario
                </button>
              </div>
            </form>
          </div>

          {/* Results */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-primary-500">
              ROI Results
            </h2>
            {loading && <LoadingSpinner text="Calculating ROI..." />}
            {results && (
              <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-xl p-6">
                <h3 className="text-xl font-bold text-center mb-6">Financial Impact</h3>
                
                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center py-3 border-b border-white/20">
                    <span>Monthly Savings:</span>
                    <span className="text-xl font-bold">${results.monthly_savings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/20">
                    <span>Payback Period:</span>
                    <span className="text-xl font-bold">{results.payback_months} months</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span>ROI ({formData.time_horizon_months} months):</span>
                    <span className="text-xl font-bold">{results.roi_percentage}%</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 border-b border-white/20">
                    <span>Total Net Savings:</span>
                    <span className="font-bold">${results.net_savings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span>Cumulative Savings:</span>
                    <span className="font-bold">${results.cumulative_savings.toLocaleString()}</span>
                  </div>
                </div>
                
                <h4 className="text-lg font-semibold mt-6 mb-3">Cost Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-3 border-b border-white/20">
                    <span>Current Manual Cost:</span>
                    <span>${results.labor_cost_manual.toLocaleString()}/month</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/20">
                    <span>Automation Cost:</span>
                    <span>${results.auto_cost.toLocaleString()}/month</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span>Error Reduction Savings:</span>
                    <span>${results.error_savings.toLocaleString()}/month</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-8">
            <Notification 
              message={message} 
              type={message.includes('Error') ? 'error' : 'success'}
              onClose={() => setMessage('')}
            />
          </div>
        )}

        {/* Saved Scenarios */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Scenarios</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map(scenario => (
              <div key={scenario.id} className="border-2 border-gray-200 rounded-lg p-5 transition-all duration-200 hover:border-blue-500 hover:shadow-md hover:-translate-y-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  {scenario.scenario_name}
                </h4>
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p>{scenario.monthly_invoice_volume.toLocaleString()} invoices/month</p>
                  <p>{scenario.num_ap_staff} AP staff</p>
                  <p>Created: {new Date(scenario.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors duration-200 flex-1" 
                    onClick={() => loadScenario(scenario.id)}
                  >
                    Load
                  </button>
                  <button 
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors duration-200 flex-1" 
                    onClick={() => deleteScenario(scenario.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {scenarios.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No saved scenarios yet. Create your first scenario above!</p>
            </div>
          )}
        </div>

        {/* Report Generation */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Generate Report</h2>
          <p className="text-gray-600 mb-6">
            Enter your email to download a detailed ROI report
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your.email@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 flex-1"
            />
            <button 
              className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap" 
              onClick={generateReport}
              disabled={loading}
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;