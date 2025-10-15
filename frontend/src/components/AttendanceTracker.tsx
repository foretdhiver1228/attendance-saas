import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Box,
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
import api from '../api'; // Import the centralized api client

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
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(true); // Start with loading true

    // Effect for fetching initial data (user profile and attendance)
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setMessage('Loading your profile...');
            try {
                // Fetch current user's profile
                const profileResponse = await api.get<UserProfile>('/users/me');
                const profile = profileResponse.data;
                setUserProfile(profile);
                setMessage(`Welcome, ${profile.name}!`);

                // Fetch attendance records for the current user
                const recordsResponse = await api.get<AttendanceRecord[]>(`/attendance/${profile.employeeId}`);
                const records = recordsResponse.data;
                setAttendanceRecords(records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

            } catch (error) {
                console.error('Error fetching initial data:', error);
                setMessage('Could not load your data. Please try logging in again.');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []); // Empty dependency array means this runs once on mount

    // Effect for WebSocket connection
    useEffect(() => {
        if (!userProfile) return; // Don't connect until user profile is loaded

        const socket = new SockJS(WEBSOCKET_URL);
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                setIsConnected(true);
                setStompClient(client);

                // Subscribe to topics relevant to the user
                client.subscribe('/topic/attendance', (attendanceRecord) => {
                    const record: AttendanceRecord = JSON.parse(attendanceRecord.body);
                    // Only update if the record belongs to the current user
                    if (userProfile.employeeId === record.employeeId) {
                        setMessage(`New attendance recorded: ${record.type}`);
                        setAttendanceRecords((prevRecords) => [record, ...prevRecords].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error:' + frame.headers['message']);
                setMessage('WebSocket connection failed.');
                setIsConnected(false);
            },
            onWebSocketError: (event) => {
                console.error('WebSocket error:', event);
                setMessage('WebSocket connection failed.');
                setIsConnected(false);
            },
            onDisconnect: () => {
                setIsConnected(false);
            }
        });

        client.activate();

        return () => {
            if (client && client.connected) {
                client.deactivate();
            }
        };
    }, [userProfile]); // Re-run if userProfile changes

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
        if (!userProfile) {
            setMessage('User profile not loaded yet.');
            return;
        }

        const attendanceData = {
            employeeId: userProfile.employeeId,
            type: type,
            latitude: location.latitude,
            longitude: location.longitude,
        };

        stompClient.publish({
            destination: '/app/attendance',
            body: JSON.stringify(attendanceData),
        });
        setMessage(`Sending ${type} request...`);
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
                {message && <Alert severity={message.includes('failed') || message.includes('Error') || message.includes('Could not') ? 'error' : 'info'} sx={{ mb: 2 }}>{message}</Alert>}
                
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : userProfile ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>User Profile</Typography>
                                    <Typography><strong>Employee ID:</strong> {userProfile.employeeId}</Typography>
                                    <Typography><strong>Name:</strong> {userProfile.name}</Typography>
                                    <Typography><strong>Department:</strong> {userProfile.department}</Typography>
                                    <Typography><strong>Job Title:</strong> {userProfile.jobTitle}</Typography>
                                </CardContent>
                            </Card>
                        </Box>
                        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>Attendance Actions</Typography>
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
                                    <Typography>No attendance records found.</Typography>
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
                    </Box>
                ) : (
                    <Typography>Could not load user profile. Please log in again.</Typography>
                )}
            </Container>
        </ThemeProvider>
    );
};

export default AttendanceTracker;