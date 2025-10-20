import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Card, 
    CardContent, 
    Typography, 
    TextField, 
    Button, 
    Box, 
    CircularProgress, 
    Alert 
} from '@mui/material';
import { getUserProfile, updateUserProfile, changeUserPassword } from '../api';

// Define the structure of the user profile data
interface UserProfile {
    email: string;
    employeeId: string;
    name: string;
    department: string;
    jobTitle: string;
    employmentType: string;
    salary: number;
    role: string;
}

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [initialProfile, setInitialProfile] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // State for password change form
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
    const [passwordChangeError, setPasswordChangeError] = useState('');
    const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await getUserProfile();
                setProfile(response.data);
                setInitialProfile(response.data); // Store initial state for cancel
            } catch (err) {
                setError('Failed to fetch profile data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (profile) {
            setProfile({ ...profile, [e.target.name]: e.target.value });
        }
    };

    const handleSave = async () => {
        if (!profile) return;

        try {
            setLoading(true);
            setError('');
            setSuccess('');
            const updateData = {
                name: profile.name,
                employeeId: profile.employeeId,
                department: profile.department,
                jobTitle: profile.jobTitle,
                employmentType: profile.employmentType,
                salary: profile.salary,
            };
            const response = await updateUserProfile(updateData);
            setProfile(response.data);
            setInitialProfile(response.data);
            setIsEditing(false);
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError('Failed to update profile.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setProfile(initialProfile); // Revert changes
        setIsEditing(false);
    };

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            setPasswordChangeError('All password fields are required.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setPasswordChangeError('New password and confirmation do not match.');
            return;
        }
        if (newPassword.length < 6) { // Example: minimum password length
            setPasswordChangeError('New password must be at least 6 characters long.');
            return;
        }

        try {
            setPasswordChangeLoading(true);
            setPasswordChangeError('');
            setPasswordChangeSuccess('');
            await changeUserPassword({ oldPassword, newPassword });
            setPasswordChangeSuccess('Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err: any) {
            const errorMessage = err.response?.data || 'Failed to change password.';
            setPasswordChangeError(errorMessage);
            console.error('Password change error:', err);
        } finally {
            setPasswordChangeLoading(false);
        }
    };

    if (loading && !profile) {
        return <CircularProgress />;
    }

    if (error && !profile) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (!profile) {
        return <Typography>No profile data found.</Typography>;
    }

    return (
        <Container maxWidth="md">
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h5" component="div" gutterBottom>
                        My Profile
                    </Typography>
                    
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <Box component="form" noValidate autoComplete="off">
                        <TextField
                            label="Email"
                            value={profile.email}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Employee ID"
                            name="employeeId"
                            value={profile.employeeId || ''}
                            fullWidth
                            margin="normal"
                            disabled={!isEditing}
                            onChange={handleInputChange}
                        />
                        <TextField
                            label="Name"
                            name="name"
                            value={profile.name}
                            fullWidth
                            margin="normal"
                            disabled={!isEditing}
                            onChange={handleInputChange}
                        />
                        <TextField
                            label="Department"
                            name="department"
                            value={profile.department || ''}
                            fullWidth
                            margin="normal"
                            disabled={!isEditing}
                            onChange={handleInputChange}
                        />
                        <TextField
                            label="Job Title"
                            name="jobTitle"
                            value={profile.jobTitle || ''}
                            fullWidth
                            margin="normal"
                            disabled={!isEditing}
                            onChange={handleInputChange}
                        />
                        <TextField
                            label="Employment Type"
                            name="employmentType"
                            value={profile.employmentType || ''}
                            fullWidth
                            margin="normal"
                            disabled={!isEditing}
                            onChange={handleInputChange}
                        />
                        <TextField
                            label="Salary"
                            name="salary"
                            type="number"
                            value={profile.salary || 0}
                            fullWidth
                            margin="normal"
                            disabled={!isEditing}
                            onChange={handleInputChange}
                        />
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        {isEditing ? (
                            <>
                                <Button variant="outlined" onClick={handleCancel} sx={{ mr: 1 }} disabled={loading}>
                                    Cancel
                                </Button>
                                <Button variant="contained" onClick={handleSave} disabled={loading}>
                                    {loading ? <CircularProgress size={24} /> : 'Save'}
                                </Button>
                            </>
                        ) : (
                            <Button variant="contained" onClick={() => setIsEditing(true)}>
                                Edit
                            </Button>
                        )}
                    </Box>
                </CardContent>
            </Card>

            {/* Password Change Section */}
            <Card>
                <CardContent>
                    <Typography variant="h5" component="div" gutterBottom>
                        Change Password
                    </Typography>

                    {passwordChangeError && <Alert severity="error" sx={{ mb: 2 }}>{passwordChangeError}</Alert>}
                    {passwordChangeSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passwordChangeSuccess}</Alert>}

                    <Box component="form" noValidate autoComplete="off">
                        <TextField
                            label="Current Password"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                        <TextField
                            label="New Password"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <TextField
                            label="Confirm New Password"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                        />
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                            variant="contained" 
                            onClick={handleChangePassword} 
                            disabled={passwordChangeLoading}
                        >
                            {passwordChangeLoading ? <CircularProgress size={24} /> : 'Change Password'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Profile;
