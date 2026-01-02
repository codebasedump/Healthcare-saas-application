import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './FilterBar.css';

export default function FilterBar({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  handleExportCSV
}) {
  const handleReset = () => {
    setSearchTerm('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
  };

  const activeFilters = [
    searchTerm && { label: `Search: ${searchTerm}` },
    statusFilter && { label: `Status: ${statusFilter}` },
    startDate && { label: `From: ${startDate}` },
    endDate && { label: `To: ${endDate}` }
  ].filter(Boolean);

  return (
    <div className="filter-bar container-fluid py-3">
      <div className="row g-3 align-items-center">
        <div className="col-md-3 col-sm-6">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search doctor or patient"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="col-md-2 col-sm-6">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div className="col-md-2 col-sm-6">
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="col-md-2 col-sm-6">
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="col-md-3 col-sm-12 d-flex gap-3 justify-content-end">
          <button onClick={handleExportCSV} className="action-btn info">
            Export CSV
          </button>
          <button onClick={handleReset} className="btn btn-outline-secondary">
            Reset
          </button>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="row mt-3">
          <div className="col">
            <div className="d-flex flex-wrap gap-2">
              {activeFilters.map((filter, index) => (
                <span key={index} className="badge bg-primary">
                  {filter.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}