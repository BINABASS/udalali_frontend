import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import './Reports.css';

// Report types
const REPORT_TYPES = [
  { id: 1, name: 'Financial Report', description: 'Detailed financial analysis' },
  { id: 2, name: 'Property Performance', description: 'Property performance metrics' },
  { id: 3, name: 'Client Distribution', description: 'Client distribution analysis' }
];

const ReportDetails = ({ report, onDownload, onPrint, onDelete }) => {
  // Chart references
  const revenueChartRef = useRef(null);
  const propertyChartRef = useRef(null);
  const clientChartRef = useRef(null);

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      if (revenueChartRef.current) {
        revenueChartRef.current.destroy();
      }
      if (propertyChartRef.current) {
        propertyChartRef.current.destroy();
      }
      if (clientChartRef.current) {
        clientChartRef.current.destroy();
      }
    };
  }, []);
  // Sample chart data - will be replaced with actual data from the report
  const chartData = {
    revenue: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Revenue',
        data: [12000, 19000, 15000, 17000, 18000, 21000],
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 2
      }]
    },
    property: {
      labels: ['Property A', 'Property B', 'Property C', 'Property D'],
      datasets: [{
        data: [30, 20, 45, 5],
        backgroundColor: [
          'rgba(79, 70, 229, 0.7)',
          'rgba(220, 38, 38, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(245, 158, 11, 0.7)'
        ]
      }]
    },
    client: {
      labels: ['Client A', 'Client B', 'Client C', 'Client D'],
      datasets: [{
        data: [30, 20, 45, 5],
        backgroundColor: [
          'rgba(79, 70, 229, 0.7)',
          'rgba(220, 38, 38, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(245, 158, 11, 0.7)'
        ]
      }]
    }
  };

  useEffect(() => {
    // Update charts when report data changes
    if (!report) return;

    // Cleanup existing charts
    if (revenueChartRef.current) {
      revenueChartRef.current.destroy();
    }
    if (propertyChartRef.current) {
      propertyChartRef.current.destroy();
    }
    if (clientChartRef.current) {
      clientChartRef.current.destroy();
    }

    // Revenue chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    revenueChartRef.current = new Chart(revenueCtx, {
      type: 'line',
      data: chartData.revenue,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Revenue Trend'
          }
        }
      }
    });

    // Property performance chart
    const propertyCtx = document.getElementById('propertyChart').getContext('2d');
    propertyChartRef.current = new Chart(propertyCtx, {
      type: 'bar',
      data: chartData.property,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Property Performance'
          }
        }
      }
    });

    // Client distribution chart
    const clientCtx = document.getElementById('clientChart').getContext('2d');
    clientChartRef.current = new Chart(clientCtx, {
      type: 'pie',
      data: chartData.client,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Client Distribution'
          }
        }
      }
    });
  }, [report, chartData.revenue, chartData.property, chartData.client]);

  // Get report type name
  const reportType = REPORT_TYPES.find(type => type.id === report?.type);

  return (
    <div className="report-details">
      <div className="report-details-header">
        <h2 className="report-details-title">{report.name}</h2>
        <div className="report-details-meta">
          <span className="report-date">{report.date}</span>
          <span className="report-type">{reportType?.name || 'Unknown'}</span>
        </div>
      </div>

      <div className="report-details-content">
        <div className="report-charts">
          <div className="chart-container">
            <canvas id="revenueChart"></canvas>
            <h3>Revenue Trend</h3>
          </div>
          <div className="chart-container">
            <canvas id="propertyChart"></canvas>
            <h3>Property Performance</h3>
          </div>
          <div className="chart-container">
            <canvas id="clientChart"></canvas>
            <h3>Client Distribution</h3>
          </div>
        </div>

        <div className="report-actions">
          <div className="action-group">
            <button 
              className="action-btn download-btn" 
              onClick={() => onDownload(report)}
              title="Download report as JSON"
            >
              <i className="fas fa-download"></i>
              <span>Download</span>
            </button>
            <button 
              className="action-btn print-btn" 
              onClick={() => onPrint(report)}
              title="Print report"
            >
              <i className="fas fa-print"></i>
              <span>Print</span>
            </button>
          </div>
          <button 
            className="action-btn delete-btn" 
            onClick={() => onDelete(report.id)}
            title="Delete report"
          >
            <i className="fas fa-trash"></i>
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
