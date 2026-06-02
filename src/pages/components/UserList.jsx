import { Trash2, Edit2, Shield, User } from 'lucide-react'
import './UserList.css'

export default function UserList({ users, onEdit, onDelete, onChangeRole, currentUserId }) {
    const handleRoleChange = (userId, event) => {
        const newRole = event.target.value
        if (newRole !== users.find(u => u.id === userId)?.role) {
            onChangeRole(userId, newRole)
        }
    }

    return (
        <div className="user-list">
            <div className="table-responsive">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className={currentUserId === user.id ? 'current-user' : ''}>
                                <td>
                                    <div className="user-name">
                                        <div className="user-avatar">
                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <span>{user.name}</span>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <select
                                        value={user.role || 'user'}
                                        onChange={(e) => handleRoleChange(user.id, e)}
                                        className="role-select"
                                        disabled={currentUserId === user.id}
                                        title={currentUserId === user.id ? 'Cannot change your own role' : ''}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td>
                                    <span className={`status ${user.status === 'active' ? 'active' : 'inactive'}`}>
                                        {user.status === 'active' ? '✓ Active' : '○ Inactive'}
                                    </span>
                                </td>
                                <td className="created-date">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td>
                                    <div className="actions">
                                        <button
                                            className="btn-icon btn-edit"
                                            onClick={() => onEdit(user)}
                                            title="Edit user"
                                            aria-label="Edit user"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            className="btn-icon btn-delete"
                                            onClick={() => onDelete(user.id)}
                                            disabled={currentUserId === user.id}
                                            title={currentUserId === user.id ? 'Cannot delete yourself' : 'Delete user'}
                                            aria-label="Delete user"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
