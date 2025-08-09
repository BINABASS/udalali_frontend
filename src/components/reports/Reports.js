import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Reports.css';
import ReportForm from './ReportForm';
import ReportDetails from './ReportDetails';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faPlus, faFileAlt, faDownload, faPrint, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';

const Reports = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sample report types
  const REPORT_TYPES = [
    { id: 1, name: 'Financial Report', description: 'Detailed financial analysis' },
    { id: 2, name: 'Property Performance', description: 'Property performance metrics' },
    { id: 3, name: 'Client Distribution', description: 'Client distribution analysis' }
  ];

  useEffect(() => {
    // Load reports from localStorage
    const savedReports = localStorage.getItem('reports');
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    }
  }, []);

  const handleGenerateReport = (reportData) => {
    setLoading(true);
    
    try {
      // Validate required fields
      if (!reportData.type) {
        throw new Error('Please select a report type');
      }
      if (!reportData.startDate || !reportData.endDate) {
        throw new Error('Please select both start and end dates');
      }

      // Simulate report generation
      setTimeout(() => {
        const newReport = {
          id: Date.now().toString(),
          name: `Report ${reports.length + 1}`,
          type: reportData.type, // Store the type ID instead of name
          startDate: reportData.startDate,
          endDate: reportData.endDate,
          properties: reportData.properties,
          clients: reportData.clients,
          date: new Date().toLocaleDateString(),
          status: 'Generated'
        };
        
        setReports([...reports, newReport]);
        localStorage.setItem('reports', JSON.stringify([...reports, newReport]));
        setLoading(false);
        setShowGenerateModal(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
      alert(error.message);
    }
  };

  const handleDeleteReport = (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      const updatedReports = reports.filter(report => report.id !== reportId);
      setReports(updatedReports);
      localStorage.setItem('reports', JSON.stringify(updatedReports));
      window.location.href = '/dashboard/reports'; // Redirect back to reports list
    }
  };

  const handleDownloadReport = (report) => {
    const reportData = {
      name: report.name,
      type: report.type,
      startDate: report.startDate,
      endDate: report.endDate,
      dateGenerated: report.date,
      properties: report.properties,
      clients: report.clients
    };

    // Convert report data to JSON string
    const reportJson = JSON.stringify(reportData, null, 2);
    const blob = new Blob([reportJson], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handlePrintReport = (report) => {
    // Create a temporary print window
    const printWindow = window.open('', '_blank');
    
    // Create HTML content for printing
    const printContent = `
      <html>
        <head>
          <title>${report.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .report-header { text-align: center; margin-bottom: 20px; }
            .report-info { margin: 20px 0; }
            .report-data { margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 8px; border: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="report-header">
            <h1>${report.name}</h1>
            <p>Generated on ${report.date}</p>
          </div>
          
          <div class="report-info">
            <p><strong>Type:</strong> ${report.type}</p>
            <p><strong>Period:</strong> ${report.startDate} - ${report.endDate}</p>
          </div>
          
          <div class="report-data">
            <h2>Properties</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${report.properties.map(prop => `
                  <tr>
                    <td>${prop.name}</td>
                    <td>${prop.location}</td>
                    <td>${prop.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    // Write content to print window
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Print after a small delay
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleViewReport = (report) => {
    navigate(`/dashboard/reports/${report.id}`);
  };

  if (reportId) {
    // If we have a reportId in the URL, show the report details
    const selectedReport = reports.find(r => r.id === reportId);
    return (
      <ReportDetails 
        report={selectedReport}
        onDownload={handleDownloadReport}
        onPrint={handlePrintReport}
        onDelete={handleDeleteReport}
      />
    );
  }

  return (
    <div className="reports-page-pro">
      <div className="reports-header-pro">
        <div className="reports-header-title-pro">
          <FontAwesomeIcon icon={faChartBar} className="reports-header-icon-pro" />
          <div>
            <h1>Reports</h1>
            <p className="reports-header-subtitle-pro">Generate and manage your reports</p>
          </div>
        </div>
        <button 
          className="generate-report-btn-pro" 
          onClick={() => setShowGenerateModal(true)}
        >
          <FontAwesomeIcon icon={faPlus} /> Generate Report
        </button>
      </div>
      {loading ? (
        <div className="reports-loading-state-pro">
          <div className="reports-spinner-pro"></div>
          <p>Generating report...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="reports-empty-state-pro">
          <FontAwesomeIcon icon={faChartBar} size="3x" className="reports-empty-icon-pro" />
          <h2>No reports found</h2>
          <p>Click 'Generate Report' to create your first report.</p>
        </div>
      ) : (
        <div className="reports-cards-grid-pro">
          {reports.map((report) => (
            <div key={report.id} className="report-card-pro">
              <div className="report-card-header-pro">
                <FontAwesomeIcon icon={faFileAlt} className="report-card-icon-pro" />
                <div className="report-card-title-group-pro">
                  <h3 className="report-card-title-pro">{report.name}</h3>
                  <span className={`report-type-badge-pro`}>{report.type}</span>
                  <span className={`report-status-badge-pro ${report.status.toLowerCase()}`}>{report.status}</span>
                </div>
              </div>
              <div className="report-card-meta-pro">
                <span>Date: {report.date}</span>
                <span>Period: {report.startDate} - {report.endDate}</span>
              </div>
              <div className="report-card-actions-pro">
                <button className="report-action-btn-pro view" onClick={() => handleViewReport(report)}><FontAwesomeIcon icon={faEye} /> View</button>
                <button className="report-action-btn-pro download" onClick={() => handleDownloadReport(report)}><FontAwesomeIcon icon={faDownload} /> Download</button>
                <button className="report-action-btn-pro print" onClick={() => handlePrintReport(report)}><FontAwesomeIcon icon={faPrint} /> Print</button>
                <button className="report-action-btn-pro delete" onClick={() => handleDeleteReport(report.id)}><FontAwesomeIcon icon={faTrash} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showGenerateModal && (
        <ReportForm
          reportTypes={REPORT_TYPES}
          onGenerate={handleGenerateReport}
          onClose={() => setShowGenerateModal(false)}
        />
      )}
    </div>
  );
};

export default Reports;
