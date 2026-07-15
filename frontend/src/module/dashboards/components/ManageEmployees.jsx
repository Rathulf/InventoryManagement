import React, { useState, useEffect } from 'react';

export default function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'Staff', status: 'Active'
  });

  const fetchEmployees = () => {
    fetch('http://localhost:8080/api/employees')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEmployees(data);
        else setEmployees([]);
      })
      .catch(err => console.error("Error fetching employees:", err));
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    fetch('http://localhost:8080/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to add employee");
        return res.json();
      })
      .then(() => {
        fetchEmployees();
        setFormData({ name: '', email: '', password: '', role: 'Staff', status: 'Active' });
      })
      .catch(err => console.error("Error adding employee:", err));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to remove this employee's access?")) return;
    fetch(`http://localhost:8080/api/employees/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error("Failed to delete employee");
        fetchEmployees();
      })
      .catch(err => console.error("Error deleting employee:", err));
  };

  return (
    <div className="inventory-section mt-0">
      <div className="creation-form-block">
        <h3>Register New Staff</h3>
        <form className="add-item-fluid-form" onSubmit={handleAddEmployee}>
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} required />
          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} required />
          <input type="text" name="password" placeholder="Initial Password" value={formData.password} onChange={handleInputChange} required />
          
          <select name="role" value={formData.role} onChange={handleInputChange} required>
            <option value="Staff">Staff</option>
            <option value="Admin">Admin</option>
          </select>
          
          <select name="status" value={formData.status} onChange={handleInputChange} required>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          
          <button type="submit" className="commit-record-btn">+ Add Employee</button>
        </form>
      </div>

      <hr className="section-divider" />

      <h3>Employee Directory</h3>
      <table className="ledger-table-view">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th className="center-cell">Role</th>
            <th className="center-cell">Status</th>
            <th className="center-cell">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.length === 0 ? (
            <tr><td colSpan="5" className="empty-table-state">No employees found.</td></tr>
          ) : (
            employees.map((emp) => (
              <tr key={emp.id}>
                <td><strong>{emp.name}</strong></td>
                <td>{emp.email}</td>
                <td className="center-cell">
                  <span className="badge-cat" style={{ backgroundColor: emp.role === 'Admin' ? '#38bdf8' : '#e2e8f0', color: emp.role === 'Admin' ? '#fff' : '#475569' }}>
                    {emp.role}
                  </span>
                </td>
                <td className="center-cell">
                  {emp.status === 'Active' ? <span className="normal-stock">Active</span> : <span className="danger-stock">Inactive</span>}
                </td>
                <td className="center-cell">
                  <button onClick={() => handleDelete(emp.id)} className="ledger-row-purge-btn">Revoke</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}