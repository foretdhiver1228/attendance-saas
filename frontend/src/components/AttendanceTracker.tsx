import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Box,
    TextField,
    Button,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Alert,
    Paper,
    CssBaseline
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

const WEBSOCKET_URL = 'http://localhost:8080/ws'; // Backend WebSocket endpoint
const API_BASE_URL = 'http://localhost:8080/api'; // Backend API base URL

interface UserProfile {
    employeeId: string;
    name: string;
    department: string;
    jobTitle: string;
    employmentType: string;
    salary: number;
}

interface AttendanceRecord {
    id: number;
    employeeId: string;
    timestamp: string;
    type: 'CHECK_IN' | 'CHECK_OUT';
    latitude: number;
    longitude: number;
}

const AttendanceTracker: React.FC = () => {
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [message, setMessage] = useState<string>('');
    const [employeeIdInput, setEmployeeIdInput] = useState<string>('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const socket = new SockJS(WEBSOCKET_URL);
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                setIsConnected(true);
                setMessage('Connected to WebSocket!');
                setStompClient(client);

                client.subscribe('/topic/attendance', (attendanceRecord) => {
                    const record: AttendanceRecord = JSON.parse(attendanceRecord.body);
                    setMessage(`Attendance recorded: ${record.type} for ${record.employeeId}`);
                    if (selectedEmployeeId === record.employeeId) {
                        setAttendanceRecords((prevRecords) => [record, ...prevRecords]);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error:' + frame.headers['message']);
                console.error('Additional details:' + frame.body);
                setMessage('WebSocket connection failed.');
                setIsConnected(false);
            },
            onWebSocketError: (event) => {
                console.error('WebSocket error:', event);
                setMessage('WebSocket connection failed.');
                setIsConnected(false);
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket');
                setIsConnected(false);
            }
        });

        client.activate();

        return () => {
            if (client && client.connected) {
                client.deactivate();
            }
        };
    }, [selectedEmployeeId]);

    const fetchUserProfile = async (employeeId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/users/${employeeId}`);
            if (response.ok) {
                const profile: UserProfile = await response.json();
                setUserProfile(profile);
                setSelectedEmployeeId(employeeId);
                setMessage(`User profile for ${employeeId} loaded.`);
                fetchAttendanceRecords(employeeId);
            } else if (response.status === 404) {
                setUserProfile(null);
                setSelectedEmployeeId(null);
                setMessage(`User profile for ${employeeId} not found.`);
            } else {
                setMessage(`Error fetching user profile: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setMessage('Network error fetching user profile.');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceRecords = async (employeeId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/attendance/${employeeId}`);
            if (response.ok) {
                const records: AttendanceRecord[] = await response.json();
                setAttendanceRecords(records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
                setMessage(`Attendance records for ${employeeId} loaded.`);
            } else {
                setMessage(`Error fetching attendance records: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error fetching attendance records:', error);
            setMessage('Network error fetching attendance records.');
        }
    };

    const handleEmployeeIdSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (employeeIdInput) {
            fetchUserProfile(employeeIdInput);
        }
    };

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    setMessage('Location obtained.');
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setMessage('Error getting location. Please enable location services.');
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setMessage('Geolocation is not supported by this browser.');
        }
    };

    const sendAttendance = (type: 'CHECK_IN' | 'CHECK_OUT') => {
        if (!stompClient || !isConnected) {
            setMessage('Not connected to WebSocket.');
            return;
        }
        if (!location) {
            setMessage('Please get your location first.');
            return;
        }
        if (!selectedEmployeeId) {
            setMessage('Please select an employee first.');
            return;
        }

        const attendanceData = {
            employeeId: selectedEmployeeId,
            type: type,
            latitude: location.latitude,
            longitude: location.longitude,
        };

        stompClient.publish({
            destination: '/app/attendance',
            body: JSON.stringify(attendanceData),
        });
        setMessage(`Sending ${type} request for ${selectedEmployeeId}...`);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Attendance Tracker
                    </Typography>
                    <Typography variant="subtitle1">
                        Status: {isConnected ? 'Connected' : 'Disconnected'}
                    </Typography>
                </Toolbar>
            </AppBar>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ width: '100%' }}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h5" gutterBottom>
                                Employee Selection
                            </Typography>
                            <Box component="form" onSubmit={handleEmployeeIdSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <TextField
                                    label="Enter Employee ID"
                                    variant="outlined"
                                    value={employeeIdInput}
                                    onChange={(e) => setEmployeeIdInput(e.target.value)}
                                    fullWidth
                                />
                                <Button type="submit" variant="contained" disabled={loading}>
                                    {loading ? <CircularProgress size={24} /> : 'Select Employee'}
                                </Button>
                            </Box>
                            {message && <Alert severity={message.includes('failed') || message.includes('Error') ? 'error' : 'info'} sx={{ mt: 2 }}>{message}</Alert>}
                        </Paper>
                    </Box>

                    {selectedEmployeeId && userProfile && (
                        <React.Fragment>
                            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>User Profile</Typography>
                                        <Typography><strong>Employee ID:</strong> {userProfile.employeeId}</Typography>
                                        <Typography><strong>Name:</strong> {userProfile.name}</Typography>
                                        <Typography><strong>Department:</strong> {userProfile.department}</Typography>
                                        <Typography><strong>Job Title:</strong> {userProfile.jobTitle}</Typography>
                                        <Typography><strong>Employment Type:</strong> {userProfile.employmentType}</Typography>
                                        <Typography><strong>Salary:</strong> {userProfile.salary}</Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="h6" gutterBottom>Attendance Actions for {selectedEmployeeId}</Typography>
                                    {location && (
                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                            Current Location: Lat {location.latitude.toFixed(4)}, Lon {location.longitude.toFixed(4)}
                                        </Typography>
                                    )}
                                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                        <Button variant="outlined" onClick={getLocation} disabled={!isConnected}>Get Location</Button>
                                        <Button variant="contained" color="primary" onClick={() => sendAttendance('CHECK_IN')} disabled={!isConnected || !location}>Check In</Button>
                                        <Button variant="contained" color="secondary" onClick={() => sendAttendance('CHECK_OUT')} disabled={!isConnected || !location}>Check Out</Button>
                                    </Box>
                                    <Typography variant="h6" gutterBottom>Attendance Records</Typography>
                                    {attendanceRecords.length === 0 ? (
                                        <Typography>No attendance records found for {selectedEmployeeId}.</Typography>
                                    ) : (
                                        <List dense>
                                            {attendanceRecords.map((record) => (
                                                <ListItem key={record.id}>
                                                    <ListItemText
                                                        primary={`${new Date(record.timestamp).toLocaleString()}: ${record.type}`}
                                                        secondary={`Location: (${record.latitude.toFixed(4)}, ${record.longitude.toFixed(4)})`}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </Paper>
                            </Box>
                        </React.Fragment>
                    )}
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default AttendanceTracker;
