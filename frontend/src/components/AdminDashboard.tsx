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
    FormControl,
    useMediaQuery,
    Card,
    CardContent,
    CardActions
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Use the centralized axios instance

// ... (Interfaces remain the same)
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

interface CreateUserFormData {
    email: string;
    password?: string;
    name: string;
    employeeId: string;
    department: string;
    jobTitle: string;
    employmentType: string;
    salary: number;
    role: string;
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
    const [currentUser, setCurrentUser] = useState<EditUserFormData>({});
    const navigate = useNavigate();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const initialNewUserData: CreateUserFormData = {
        email: '',
        password: '',
        name: '',
        employeeId: '',
        department: '',
        jobTitle: '',
        employmentType: 'EMPLOYEE',
        salary: 0,
        role: 'EMPLOYEE',
    };

    const [newUserData, setNewUserData] = useState<CreateUserFormData>(initialNewUserData);

    // ... (All handler functions like fetchUsers, handleCreateUser, etc. remain the same)
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get<User[]>('/admin/users');
            setUsers(response.data);
        } catch (err: any) {
            console.error('Error fetching users:', err);
            if (err.response?.status === 403) {
                setError('Access Denied: You do not have administrative privileges.');
            } else if (err.response?.status === 401) {
                setError('Unauthorized. Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError('Failed to fetch users.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async () => {
        try {
            setLoading(true);
            await api.post('/admin/users', newUserData);
            setOpenCreateDialog(false);
            setNewUserData(initialNewUserData); // Reset form
            fetchUsers(); // Refresh list
        } catch (err: any) {
            console.error('Error creating user:', err);
            setError(err.response?.data?.message || 'Failed to create user.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async () => {
        if (!currentUser.id) return;
        try {
            setLoading(true);
            await api.put(`/admin/users/${currentUser.id}`, currentUser);
            setOpenEditDialog(false);
            setCurrentUser({});
            fetchUsers(); // Refresh list
        } catch (err: any) {
            console.error('Error updating user:', err);
            setError(err.response?.data?.message || 'Failed to update user.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            setLoading(true);
            await api.delete(`/admin/users/${userToDelete}`);
            setOpenDeleteConfirm(false);
            setUserToDelete(null);
            fetchUsers(); // Refresh list
        } catch (err: any) {
            console.error('Error deleting user:', err);
            setError(err.response?.data?.message || 'Failed to delete user.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEditDialog = (user: User) => {
        setCurrentUser(user);
        setOpenEditDialog(true);
    };

    const handleOpenDeleteConfirm = (id: number) => {
        setUserToDelete(id);
        setOpenDeleteConfirm(true);
    };

    if (loading && !users.length) {
        return <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Container>;
    }

    const renderDesktopView = () => (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Employee ID</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.employeeId}</TableCell>
                            <TableCell>{user.department}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>
                                <Button variant="outlined" size="small" sx={{ mr: 1 }} onClick={() => handleOpenEditDialog(user)}>Edit</Button>
                                <Button variant="outlined" color="error" size="small" onClick={() => handleOpenDeleteConfirm(user.id)}>Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const renderMobileView = () => (
        <Box>
            {users.map((user) => (
                <Card key={user.id} sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography variant="h6" component="div">{user.name}</Typography>
                        <Typography color="text.secondary">{user.email}</Typography>
                        <Typography variant="body2"><strong>Employee ID:</strong> {user.employeeId}</Typography>
                        <Typography variant="body2"><strong>Department:</strong> {user.department}</Typography>
                        <Typography variant="body2"><strong>Role:</strong> {user.role}</Typography>
                    </CardContent>
                    <CardActions>
                        <Button size="small" onClick={() => handleOpenEditDialog(user)}>Edit</Button>
                        <Button size="small" color="error" onClick={() => handleOpenDeleteConfirm(user.id)}>Delete</Button>
                    </CardActions>
                </Card>
            ))}
        </Box>
    );

    return (
        <Container component="main" maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Admin Dashboard - Employee Management
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button variant="contained" color="primary" onClick={() => setOpenCreateDialog(true)} sx={{ mb: 2 }}>
                Create New User
            </Button>
            
            {isMobile ? renderMobileView() : renderDesktopView()}

            {/* Dialogs remain unchanged and will work for both views */}
            {/* Create User Dialog */}
            <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
                <DialogTitle>Create New User</DialogTitle>
                <DialogContent>
                    {/* Fields for new user data */}
                    <TextField autoFocus margin="dense" label="Name" type="text" fullWidth variant="standard" value={newUserData.name} onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })} />
                    <TextField margin="dense" label="Email Address" type="email" fullWidth variant="standard" value={newUserData.email} onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })} />
                    <TextField margin="dense" label="Password" type="password" fullWidth variant="standard" value={newUserData.password} onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })} />
                    <TextField margin="dense" label="Employee ID" type="text" fullWidth variant="standard" value={newUserData.employeeId} onChange={(e) => setNewUserData({ ...newUserData, employeeId: e.target.value })} />
                    <TextField margin="dense" label="Department" type="text" fullWidth variant="standard" value={newUserData.department} onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })} />
                    <TextField margin="dense" label="Job Title" type="text" fullWidth variant="standard" value={newUserData.jobTitle} onChange={(e) => setNewUserData({ ...newUserData, jobTitle: e.target.value })} />
                    <FormControl fullWidth margin="dense" variant="standard">
                         <InputLabel>Role</InputLabel>
                         <Select value={newUserData.role} label="Role" onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as string })}>
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
                <TextField autoFocus margin="dense" label="Name" type="text" fullWidth variant="standard" value={currentUser.name || ''} onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })} />
                    <TextField margin="dense" label="Email Address" type="email" fullWidth variant="standard" value={currentUser.email || ''} onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })} />
                    <TextField margin="dense" label="Password (leave blank to keep)" type="password" fullWidth variant="standard" onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })} />
                    <TextField margin="dense" label="Employee ID" type="text" fullWidth variant="standard" value={currentUser.employeeId || ''} onChange={(e) => setCurrentUser({ ...currentUser, employeeId: e.target.value })} />
                    <TextField margin="dense" label="Department" type="text" fullWidth variant="standard" value={currentUser.department || ''} onChange={(e) => setCurrentUser({ ...currentUser, department: e.target.value })} />
                    <TextField margin="dense" label="Job Title" type="text" fullWidth variant="standard" value={currentUser.jobTitle || ''} onChange={(e) => setCurrentUser({ ...currentUser, jobTitle: e.target.value })} />
                    <FormControl fullWidth margin="dense" variant="standard">
                         <InputLabel>Role</InputLabel>
                         <Select value={currentUser.role || 'EMPLOYEE'} label="Role" onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value as string })}>
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
            <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this user? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteConfirm(false)}>Cancel</Button>
                    <Button onClick={handleDeleteUser} color="error" autoFocus disabled={loading}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminDashboard;