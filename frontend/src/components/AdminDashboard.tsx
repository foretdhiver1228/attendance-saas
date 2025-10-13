import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080/api';

interface User {
    id: number;
    email: string;
    employeeId: string;
    name: string;
    department: string;
    jobTitle: string;
    employmentType: string;
    salary: number;
    role: string; // ADMIN or EMPLOYEE
}

interface CreateUserFormData extends Partial<User> {
    password?: string;
}

interface EditUserFormData extends Partial<User> {
    password?: string;
}

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [openCreateDialog, setOpenCreateDialog] = useState<boolean>(false);
    const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState<boolean>(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const [newUserData, setNewUserData] = useState<CreateUserFormData>({
        email: '',
        password: '',
        name: '',
        employeeId: '',
        department: '',
        jobTitle: '',
        employmentType: 'EMPLOYEE',
        salary: 0,
        role: 'EMPLOYEE',
    });
    const [editUserData, setEditUserData] = useState<EditUserFormData>({});
    const navigate = useNavigate();

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        const jwtToken = localStorage.getItem('jwtToken');

        if (!jwtToken) {
            setError('Authentication token not found. Please log in.');
            setLoading(false);
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                }
            });

            if (response.ok) {
                const data: User[] = await response.json();
                setUsers(data);
            } else if (response.status === 403) {
                setError('Access Denied: You do not have administrative privileges.');
            } else if (response.status === 401) {
                setError('Unauthorized: Invalid or expired token. Please log in again.');
                localStorage.removeItem('jwtToken');
                navigate('/login');
            } else {
                setError(`Failed to fetch users: ${response.statusText}`);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Network error while fetching users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async () => {
        setLoading(true);
        setError(null);
        const jwtToken = localStorage.getItem('jwtToken');

        if (!jwtToken) {
            setError('Authentication token not found. Please log in.');
            setLoading(false);
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`,
                },
                body: JSON.stringify(newUserData),
            });

            if (response.ok) {
                setOpenCreateDialog(false);
                setNewUserData({
                    email: '',
                    password: '',
                    name: '',
                    employeeId: '',
                    department: '',
                    jobTitle: '',
                    employmentType: 'EMPLOYEE',
                    salary: 0,
                    role: 'EMPLOYEE',
                });
                fetchUsers(); // Refresh the list
            } else if (response.status === 403) {
                setError('Access Denied: You do not have administrative privileges.');
            } else if (response.status === 401) {
                setError('Unauthorized: Invalid or expired token. Please log in again.');
                localStorage.removeItem('jwtToken');
                navigate('/login');
            } else {
                const errorData = await response.text();
                setError(`Failed to create user: ${errorData || response.statusText}`);
            }
        } catch (err) {
            console.error('Error creating user:', err);
            setError('Network error while creating user.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async () => {
        setLoading(true);
        setError(null);
        const jwtToken = localStorage.getItem('jwtToken');

        if (!jwtToken) {
            setError('Authentication token not found. Please log in.');
            setLoading(false);
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${editUserData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`,
                },
                body: JSON.stringify(editUserData),
            });

            if (response.ok) {
                setOpenEditDialog(false);
                setEditUserData({});
                fetchUsers(); // Refresh the list
            } else if (response.status === 403) {
                setError('Access Denied: You do not have administrative privileges.');
            } else if (response.status === 401) {
                setError('Unauthorized: Invalid or expired token. Please log in again.');
                localStorage.removeItem('jwtToken');
                navigate('/login');
            } else {
                const errorData = await response.text();
                setError(`Failed to update user: ${errorData || response.statusText}`);
            }
        } catch (err) {
            console.error('Error updating user:', err);
            setError('Network error while updating user.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        setLoading(true);
        setError(null);
        const jwtToken = localStorage.getItem('jwtToken');

        if (!jwtToken) {
            setError('Authentication token not found. Please log in.');
            setLoading(false);
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                },
            });

            if (response.ok) {
                setOpenDeleteConfirm(false);
                setUserToDelete(null);
                fetchUsers(); // Refresh the list
            } else if (response.status === 403) {
                setError('Access Denied: You do not have administrative privileges.');
            } else if (response.status === 401) {
                setError('Unauthorized: Invalid or expired token. Please log in again.');
                localStorage.removeItem('jwtToken');
                navigate('/login');
            } else {
                const errorData = await response.text();
                setError(`Failed to delete user: ${errorData || response.statusText}`);
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            setError('Network error while deleting user.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container component="main" maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
                {error.includes('Access Denied') || error.includes('Unauthorized') && (
                    <Box sx={{ mt: 2 }}>
                        <Button variant="contained" onClick={() => navigate('/login')}>Go to Login</Button>
                    </Box>
                )}
            </Container>
        );
    }

    return (
        <Container component="main" maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Admin Dashboard - Employee Management
            </Typography>
            <Button variant="contained" color="primary" onClick={() => setOpenCreateDialog(true)} sx={{ mb: 2 }}>
                Create New User
            </Button>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="employee table">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Employee ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Job Title</TableCell>
                            <TableCell>Employment Type</TableCell>
                            <TableCell>Salary</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow
                                key={user.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {user.id}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.employeeId}</TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.department}</TableCell>
                                <TableCell>{user.jobTitle}</TableCell>
                                <TableCell>{user.employmentType}</TableCell>
                                <TableCell>{user.salary}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>
                                    <Button variant="outlined" size="small" sx={{ mr: 1 }} onClick={() => {
                                        setEditUserData(user);
                                        setOpenEditDialog(true);
                                    }}>Edit</Button>
                                    <Button variant="outlined" color="error" size="small" onClick={() => {
                                        setUserToDelete(user.id);
                                        setOpenDeleteConfirm(true);
                                    }}>Delete</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create User Dialog */}
            <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
                <DialogTitle>Create New User</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="email"
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="standard"
                        value={newUserData.email}
                        onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        id="password"
                        label="Password"
                        type="password"
                        fullWidth
                        variant="standard"
                        value={newUserData.password}
                        onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        id="name"
                        label="Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={newUserData.name}
                        onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        id="employeeId"
                        label="Employee ID"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={newUserData.employeeId}
                        onChange={(e) => setNewUserData({ ...newUserData, employeeId: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        id="department"
                        label="Department"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={newUserData.department}
                        onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        id="jobTitle"
                        label="Job Title"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={newUserData.jobTitle}
                        onChange={(e) => setNewUserData({ ...newUserData, jobTitle: e.target.value })}
                    />
                    <FormControl fullWidth margin="dense" variant="standard">
                        <InputLabel id="employment-type-label">Employment Type</InputLabel>
                        <Select
                            labelId="employment-type-label"
                            id="employmentType"
                            value={newUserData.employmentType}
                            label="Employment Type"
                            onChange={(e) => setNewUserData({ ...newUserData, employmentType: e.target.value as string })}
                        >
                            <MenuItem value="EMPLOYEE">Employee</MenuItem>
                            <MenuItem value="CONTRACTOR">Contractor</MenuItem>
                            <MenuItem value="PART_TIME">Part-Time</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        id="salary"
                        label="Salary"
                        type="number"
                        fullWidth
                        variant="standard"
                        value={newUserData.salary}
                        onChange={(e) => setNewUserData({ ...newUserData, salary: parseFloat(e.target.value) })}
                    />
                    <FormControl fullWidth margin="dense" variant="standard">
                        <InputLabel id="role-label">Role</InputLabel>
                        <Select
                            labelId="role-label"
                            id="role"
                            value={newUserData.role}
                            label="Role"
                            onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as string })}
                        >
                            <MenuItem value="ADMIN">ADMIN</MenuItem>
                            <MenuItem value="EMPLOYEE">EMPLOYEE</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateUser} disabled={loading}>Create</Button>
                </DialogActions>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        id="edit-email"
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="standard"
                        value={editUserData.email || ''}
                        onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        id="edit-password"
                        label="Password (leave blank to keep current)"
                        type="password"
                        fullWidth
                        variant="standard"
                        value={editUserData.password || ''}
                        onChange={(e) => setEditUserData({ ...editUserData, password: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        id="edit-name"
                        label="Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={editUserData.name || ''}
                        onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        id="edit-employeeId"
                        label="Employee ID"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={editUserData.employeeId || ''}
                        onChange={(e) => setEditUserData({ ...editUserData, employeeId: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        id="edit-department"
                        label="Department"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={editUserData.department || ''}
                        onChange={(e) => setEditUserData({ ...editUserData, department: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        id="edit-jobTitle"
                        label="Job Title"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={editUserData.jobTitle || ''}
                        onChange={(e) => setEditUserData({ ...editUserData, jobTitle: e.target.value })}
                    />
                    <FormControl fullWidth margin="dense" variant="standard">
                        <InputLabel id="edit-employment-type-label">Employment Type</InputLabel>
                        <Select
                            labelId="edit-employment-type-label"
                            id="edit-employmentType"
                            value={editUserData.employmentType || 'EMPLOYEE'}
                            label="Employment Type"
                            onChange={(e) => setEditUserData({ ...editUserData, employmentType: e.target.value as string })}
                        >
                            <MenuItem value="EMPLOYEE">Employee</MenuItem>
                            <MenuItem value="CONTRACTOR">Contractor</MenuItem>
                            <MenuItem value="PART_TIME">Part-Time</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        id="edit-salary"
                        label="Salary"
                        type="number"
                        fullWidth
                        variant="standard"
                        value={editUserData.salary || 0}
                        onChange={(e) => setEditUserData({ ...editUserData, salary: parseFloat(e.target.value) })}
                    />
                    <FormControl fullWidth margin="dense" variant="standard">
                        <InputLabel id="edit-role-label">Role</InputLabel>
                        <Select
                            labelId="edit-role-label"
                            id="edit-role"
                            value={editUserData.role || 'EMPLOYEE'}
                            label="Role"
                            onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value as string })}
                        >
                            <MenuItem value="ADMIN">ADMIN</MenuItem>
                            <MenuItem value="EMPLOYEE">EMPLOYEE</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button onClick={handleUpdateUser} disabled={loading}>Update</Button>
                </DialogActions>
            </Dialog>

            {/* Delete User Confirmation Dialog */}
            <Dialog
                open={openDeleteConfirm}
                onClose={() => setOpenDeleteConfirm(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Confirm Delete"}
                </DialogTitle>
                <DialogContent>
                    <Typography id="alert-dialog-description">
                        Are you sure you want to delete this user? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteConfirm(false)}>Cancel</Button>
                    <Button onClick={handleDeleteUser} color="error" autoFocus>Delete</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminDashboard;


import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080/api';

interface User {
    id: number;
    email: string;
    employeeId: string;
    name: string;
    department: string;
    jobTitle: string;
    employmentType: string;
    salary: number;
    role: string; // ADMIN or EMPLOYEE
}

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [openCreateDialog, setOpenCreateDialog] = useState<boolean>(false);
    const [newUserData, setNewUserData] = useState<Partial<User>>({
        email: '',
        password: '',
        name: '',
        employeeId: '',
        department: '',
        jobTitle: '',
        employmentType: 'EMPLOYEE',
        salary: 0,
        role: 'EMPLOYEE',
    });
    const navigate = useNavigate();

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        const jwtToken = localStorage.getItem('jwtToken');

        if (!jwtToken) {
            setError('Authentication token not found. Please log in.');
            setLoading(false);
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                }
            });

            if (response.ok) {
                const data: User[] = await response.json();
                setUsers(data);
            } else if (response.status === 403) {
                setError('Access Denied: You do not have administrative privileges.');
            } else if (response.status === 401) {
                setError('Unauthorized: Invalid or expired token. Please log in again.');
                localStorage.removeItem('jwtToken');
                navigate('/login');
            } else {
                setError(`Failed to fetch users: ${response.statusText}`);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Network error while fetching users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async () => {
        setLoading(true);
        setError(null);
        const jwtToken = localStorage.getItem('jwtToken');

        if (!jwtToken) {
            setError('Authentication token not found. Please log in.');
            setLoading(false);
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`,
                },
                body: JSON.stringify(newUserData),
            });

            if (response.ok) {
                setOpenCreateDialog(false);
                setNewUserData({
                    email: '',
                    password: '',
                    name: '',
                    employeeId: '',
                    department: '',
                    jobTitle: '',
                    employmentType: 'EMPLOYEE',
                    salary: 0,
                    role: 'EMPLOYEE',
                });
                fetchUsers(); // Refresh the list
            } else if (response.status === 403) {
                setError('Access Denied: You do not have administrative privileges.');
            } else if (response.status === 401) {
                setError('Unauthorized: Invalid or expired token. Please log in again.');
                localStorage.removeItem('jwtToken');
                navigate('/login');
            } else {
                const errorData = await response.text();
                setError(`Failed to create user: ${errorData || response.statusText}`);
            }
        } catch (err) {
            console.error('Error creating user:', err);
            setError('Network error while creating user.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container component="main" maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
                {error.includes('Access Denied') || error.includes('Unauthorized') && (
                    <Box sx={{ mt: 2 }}>
                        <Button variant="contained" onClick={() => navigate('/login')}>Go to Login</Button>
                    </Box>
                )}
            </Container>
        );
    }

    return (
        <Container component="main" maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Admin Dashboard - Employee Management
            </Typography>
            <Button variant="contained" color="primary" onClick={() => setOpenCreateDialog(true)} sx={{ mb: 2 }}>
                Create New User
            </Button>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="employee table">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Employee ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Job Title</TableCell>
                            <TableCell>Employment Type</TableCell>
                            <TableCell>Salary</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow
                                key={user.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {user.id}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.employeeId}</TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.department}</TableCell>
                                <TableCell>{user.jobTitle}</TableCell>
                                <TableCell>{user.employmentType}</TableCell>
                                <TableCell>{user.salary}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>
                                    <Button variant="outlined" size="small" sx={{ mr: 1 }}>Edit</Button>
                                    <Button variant="outlined" color="error" size="small">Delete</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create User Dialog */}
            <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
                <DialogTitle>Create New User</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="email"
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="standard"
                        value={newUserData.email}
                        onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        id="password"
                        label="Password"
                        type="password"
                        fullWidth
                        variant="standard"
                        value={newUserData.password}
                        onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        id="name"
                        label="Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={newUserData.name}
                        onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        id="employeeId"
                        label="Employee ID"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={newUserData.employeeId}
                        onChange={(e) => setNewUserData({ ...newUserData, employeeId: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        id="department"
                        label="Department"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={newUserData.department}
                        onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        id="jobTitle"
                        label="Job Title"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={newUserData.jobTitle}
                        onChange={(e) => setNewUserData({ ...newUserData, jobTitle: e.target.value })}
                    />
                    <FormControl fullWidth margin="dense" variant="standard">
                        <InputLabel id="employment-type-label">Employment Type</InputLabel>
                        <Select
                            labelId="employment-type-label"
                            id="employmentType"
                            value={newUserData.employmentType}
                            label="Employment Type"
                            onChange={(e) => setNewUserData({ ...newUserData, employmentType: e.target.value as string })}
                        >
                            <MenuItem value="EMPLOYEE">Employee</MenuItem>
                            <MenuItem value="CONTRACTOR">Contractor</MenuItem>
                            <MenuItem value="PART_TIME">Part-Time</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        id="salary"
                        label="Salary"
                        type="number"
                        fullWidth
                        variant="standard"
                        value={newUserData.salary}
                        onChange={(e) => setNewUserData({ ...newUserData, salary: parseFloat(e.target.value) })}
                    />
                    <FormControl fullWidth margin="dense" variant="standard">
                        <InputLabel id="role-label">Role</InputLabel>
                        <Select
                            labelId="role-label"
                            id="role"
                            value={newUserData.role}
                            label="Role"
                            onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as string })}
                        >
                            <MenuItem value="ADMIN">ADMIN</MenuItem>
                            <MenuItem value="EMPLOYEE">EMPLOYEE</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateUser} disabled={loading}>Create</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminDashboard;
