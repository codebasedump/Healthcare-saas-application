import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { searchUsers, fetchRoles } from '../../../services/userService';
import UserTable from '../../components/user/UserTable';
import useDebounce from '../../../utils/useDebounce';
import { toast } from 'react-toastify';
import useDelayFetch from '../../../hooks/useDelayFetch';
import { CSVLink } from 'react-csv';
import '../../pages/pages-common.css';

const ITEMS_PER_PAGE = 5;

export default function AdminUsers() {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const debouncedSearch = useDebounce(searchTerm, 300);

  // ✅ Fetch roles from backend
  useEffect(() => {
    const loadRoles = async () => {
      const fetchedRoles = await fetchRoles(); // returns [{ name: "admin" }, ...]
      setRoles([{ name: 'all' }, ...fetchedRoles]);
    };
    loadRoles();
  }, []);

  // ✅ Fetch users based on filters
  const fetchFilteredUsers = async () => {
    setLoading(true);
    try {
      const { users: fetchedUsers, pagination } = await searchUsers(
        debouncedSearch,
        roleFilter,
        page,
        ITEMS_PER_PAGE
      );
      setUsers(fetchedUsers || []);
      setTotalPages(pagination?.totalPages || 1);
    } catch (err) {
      toast.error('❌ Failed to fetch users');
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Trigger user fetch on filter change
  useEffect(() => {
    if (!initialLoading) {
      fetchFilteredUsers();
    }
  }, [debouncedSearch, roleFilter, page]);


  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFilteredUsers();
      setInitialLoading(false);
    }, 1500); // shorter delay for smoother UX

    return () => clearTimeout(timer);
  }, []);



  return (
    <DashboardLayout>
      <div className="page-header">
        <h2 className="page-title">All Users</h2>
        <CSVLink data={users} filename="users.csv" className="action-btn info">
          Export CSV
        </CSVLink>
      </div>

      <div className="filters">
        <div className="container-fluid py-3">
          <div className="row g-3 align-items-start">
            {/* Search Input */}
            <div className="col-md-2 col-sm-6">
              <label htmlFor="searchInput" className="form-label">Search</label>
              <input
                id="searchInput"
                type="text"
                className="form-control"
                placeholder="Search by name, email, or role"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Role Select */}
            <div className="col-md-2 col-sm-6">
              <label htmlFor="roleSelect" className="form-label">Role</label>
              <select
                id="roleSelect"
                className="form-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                {roles.map((role) => (
                  <option key={role.name} value={role.name} title={role.description}>
                    {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="col-md-2 col-sm-6 d-flex align-items-end">
              <button
                className="btn-reset"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setPage(1);
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Filter Tags */}
          {(searchTerm || roleFilter !== 'all') && (
            <div className="row mt-3">
              <div className="col">
                <div className="d-flex flex-wrap gap-2">
                  {searchTerm && <span className="badge bg-primary">Search: {searchTerm}</span>}
                  {roleFilter !== 'all' && <span className="badge bg-success">Role: {roleFilter}</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {initialLoading || loading ? (
         <div className="table-loader">
          <div className="spinner" />
          <p>Loading Users</p>
        </div>
      ) : users.length === 0 ? (
        <div className="no-records">
          <p>No users found matching your criteria.</p>
        </div>
      ) : (
        <>
          <UserTable
            users={users}
            currentUser={currentUser}
            fetchUsers={fetchFilteredUsers}
          />

          <div className="pagination-container mt-5">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="page-nav"
            >
              ◀ Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`page-btn ${page === i + 1 ? 'active' : ''}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="page-nav"
            >
              Next ▶
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}