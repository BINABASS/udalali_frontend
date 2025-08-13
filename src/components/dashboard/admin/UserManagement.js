import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { userService } from '../../../services/api';
import { toast } from '../../ui/Toaster';
import UserForm from './UserForm';
import './UserManagement.css';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userForm, setUserForm] = useState(null);
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading } = useQuery('users', 
    () => userService.getUsers()
  );

  // Update user status
  const updateUserStatus = useMutation(
    ({ userId, isActive }) => userService.updateUser(userId, { is_active: isActive }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('User status updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to update user status');
      }
    }
  );

  // Delete user
  const deleteUser = useMutation(
    (userId) => userService.deleteUser(userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('User deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to delete user');
      }
    }
  );

  const filteredUsers = users?.filter(user => 
    `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="loading">Loading users...</div>;

  return (
    <div className="user-management">
      <div className="user-actions">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button 
          className="btn btn-primary"
          onClick={() => setUserForm({})}
        >
          Add New User
        </button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers?.map(user => (
              <tr key={user.id}>
                <td>{user.first_name} {user.last_name}</td>
                <td>{user.email}</td>
                <td>{user.user_type}</td>
                <td>
                  <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="actions">
                  <button 
                    className="btn btn-sm btn-edit"
                    onClick={() => setUserForm(user)}
                  >
                    Edit
                  </button>
                  <button 
                    className={`btn btn-sm ${user.is_active ? 'btn-warning' : 'btn-success'}`}
                    onClick={() => updateUserStatus.mutate({
                      userId: user.id,
                      isActive: !user.is_active
                    })}
                    disabled={updateUserStatus.isLoading}
                  >
                    {user.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this user?')) {
                        deleteUser.mutate(user.id);
                      }
                    }}
                    disabled={deleteUser.isLoading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {userForm && (
        <UserForm 
          user={userForm}
          onClose={() => setUserForm(null)}
        />
      )}
    </div>
  );
};

export default UserManagement;
