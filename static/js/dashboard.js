// Dashboard.js - Handles the dashboard functionality and real-time charts

// Global chart objects
let trafficChart = null;
let entropyChart = null;
let anomalyChart = null;
let ipRequestsChart = null;

// Data storage
let trafficData = {
    labels: [],
    requests: [],
    uniqueIPs: []
};

let entropyData = {
    labels: [],
    values: [],
    bursts: []
};

let anomalyData = {
    labels: [],
    scores: []
};

let topIPsData = [];

// Refresh intervals
const CHART_REFRESH_INTERVAL = 2000; // 2 seconds
const TABLE_REFRESH_INTERVAL = 5000; // 5 seconds

// Maximum data points to display
const MAX_DATA_POINTS = 60;

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initializing...');
    
    // Initialize charts
    initCharts();
    
    // Start the data refresh timers
    startDataRefresh();
    
    // Initialize event listeners
    document.getElementById('timeRangeSelector').addEventListener('change', updateTimeRange);
});

function initCharts() {
    // Traffic Chart - Requests per second and unique IPs
    const trafficCtx = document.getElementById('trafficChart').getContext('2d');
    trafficChart = new Chart(trafficCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Requests/Second',
                    data: [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 1,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Unique IPs',
                    data: [],
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderWidth: 1,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    display: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Count'
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                tooltip: {
                    enabled: true
                },
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Traffic Overview'
                }
            }
        }
    });
    
    // Entropy Chart
    const entropyCtx = document.getElementById('entropyChart').getContext('2d');
    entropyChart = new Chart(entropyCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'IP Entropy',
                    data: [],
                    borderColor: 'rgba(255, 159, 64, 1)',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    borderWidth: 1,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Burst Score',
                    data: [],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 1,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    display: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                tooltip: {
                    enabled: true
                },
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Traffic Patterns'
                }
            }
        }
    });
    
    // Anomaly Score Chart
    const anomalyCtx = document.getElementById('anomalyChart').getContext('2d');
    anomalyChart = new Chart(anomalyCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Anomaly Score',
                    data: [],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    display: true,
                    beginAtZero: true,
                    max: 1,
                    title: {
                        display: true,
                        text: 'Score (0-1)'
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                tooltip: {
                    enabled: true
                },
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Anomaly Detection'
                }
            }
        }
    });
    
    // Top IPs Chart (Horizontal Bar)
    const ipRequestsCtx = document.getElementById('ipRequestsChart').getContext('2d');
    ipRequestsChart = new Chart(ipRequestsCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Requests',
                    data: [],
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Requests'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'IP Address'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Top IPs by Request Count'
                }
            }
        }
    });
}

function startDataRefresh() {
    // Start refreshing chart data
    refreshChartData();
    setInterval(refreshChartData, CHART_REFRESH_INTERVAL);
    
    // Start refreshing table data
    refreshTableData();
    setInterval(refreshTableData, TABLE_REFRESH_INTERVAL);
    
    // Check if an attack simulation is running
    checkAttackSimulationStatus();
    setInterval(checkAttackSimulationStatus, 5000);
}

function refreshChartData() {
    // Fetch anomalies and log for debugging
    fetch('/api/anomalies')
        .then(response => {
            console.log('API response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Fetched anomalies from /api/anomalies:', data);
            console.log('Number of anomalies:', data.length);
            if (data.length > 0) {
                console.log('First anomaly:', data[0]);
                console.log('First anomaly timestamp type:', typeof data[0].timestamp);
                console.log('First anomaly score type:', typeof data[0].anomaly_score);
            }
            updateAnomalyData(data);
        })
        .catch(error => {
            console.error('Error fetching anomalies:', error);
        });
    // Fetch current traffic data
    fetch('/api/traffic/current')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Check if we have data
            if (!data || Object.keys(data).length === 0) {
                // If no data, create a placeholder with default values
                data = {
                    timestamp: new Date().toISOString(),
                    requests_per_second: 0,
                    unique_ips: 0,
                    entropy_value: 0,
                    burst_score: 0,
                    total_requests: 0
                };
            }
            updateTrafficData(data);
        })
        .catch(error => {
            console.error('Error fetching traffic data:', error);
            // Generate a default data point to keep chart continuity
            const defaultData = {
                timestamp: new Date().toISOString(),
                requests_per_second: 0,
                unique_ips: 0,
                entropy_value: 0,
                burst_score: 0,
                total_requests: 0
            };
            updateTrafficData(defaultData);
        });
    
    // Fetch anomaly data
    fetch('/api/anomalies')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Even if we get an empty array, that's valid
            updateAnomalyData(data);
        })
        .catch(error => {
            console.error('Error fetching anomaly data:', error);
            // Pass empty array to maintain chart
            updateAnomalyData([]);
        });
    
    // Fetch traffic history for more comprehensive view
    fetch('/api/traffic/history')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            processTrafficHistory(data);
        })
        .catch(error => {
            console.error('Error fetching traffic history:', error);
            // Call process with empty array to handle properly
            processTrafficHistory([]);
        });
}

function refreshTableData() {
    // Fetch mitigation status
    fetch('/api/mitigation/status')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            updateMitigationStatus(data);
        })
        .catch(error => {
            console.error('Error fetching mitigation status:', error);
            // Display error in status
            const statusTable = document.getElementById('mitigationStatusTable');
            if (statusTable) {
                statusTable.innerHTML = `
                    <tr>
                        <td colspan="2" class="text-center text-danger py-3">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Error loading mitigation status. Will retry automatically.
                        </td>
                    </tr>
                `;
            }
        });
    
    // Fetch blocked IPs
    fetch('/api/mitigation/blocked')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            updateBlockedIPs(data);
        })
        .catch(error => {
            console.error('Error fetching blocked IPs:', error);
            // Display error in blocked IPs table
            const blockedTable = document.getElementById('blockedIPsTableBody');
            if (blockedTable) {
                blockedTable.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center text-danger py-3">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Error loading blocked IP data. Will retry automatically.
                        </td>
                    </tr>
                `;
            }
        });
}

function updateTrafficData(data) {
    const timestamp = new Date(data.timestamp).toLocaleTimeString();
    
    // Add new data points
    trafficData.labels.push(timestamp);
    trafficData.requests.push(data.requests_per_second);
    trafficData.uniqueIPs.push(data.unique_ips);
    
    // Keep only the most recent data points
    if (trafficData.labels.length > MAX_DATA_POINTS) {
        trafficData.labels.shift();
        trafficData.requests.shift();
        trafficData.uniqueIPs.shift();
    }
    
    // Update traffic chart
    trafficChart.data.labels = trafficData.labels;
    trafficChart.data.datasets[0].data = trafficData.requests;
    trafficChart.data.datasets[1].data = trafficData.uniqueIPs;
    trafficChart.update();
    
    // Update entropy data
    entropyData.labels.push(timestamp);
    entropyData.values.push(data.entropy_value);
    entropyData.bursts.push(data.burst_score);
    
    // Keep only the most recent data points
    if (entropyData.labels.length > MAX_DATA_POINTS) {
        entropyData.labels.shift();
        entropyData.values.shift();
        entropyData.bursts.shift();
    }
    
    // Update entropy chart
    entropyChart.data.labels = entropyData.labels;
    entropyChart.data.datasets[0].data = entropyData.values;
    entropyChart.data.datasets[1].data = entropyData.bursts;
    entropyChart.update();
    
    // Update current metrics display
    document.getElementById('currentRPS').textContent = data.requests_per_second.toFixed(2);
    document.getElementById('currentUniqueIPs').textContent = data.unique_ips;
    document.getElementById('currentEntropy').textContent = data.entropy_value.toFixed(4);
    document.getElementById('currentBurst').textContent = data.burst_score.toFixed(4);
}

function updateAnomalyData(data) {
    console.log('updateAnomalyData called with:', data);
    // Only use the most recent anomalies
    const recentAnomalies = data.slice(-MAX_DATA_POINTS);
    
    if (recentAnomalies.length > 0) {
        // Get timestamps and scores from new data
        const newTimestamps = recentAnomalies.map(anomaly => 
            new Date(anomaly.timestamp).toLocaleTimeString());
        const newScores = recentAnomalies.map(anomaly => 
            anomaly.anomaly_score);
            
        // Check if we have new data to add
        let hasNewData = false;
        
        // We only add data points that we don't already have
        const timestampsToAdd = [];
        const scoresToAdd = [];
        
        // Check each new timestamp to see if we already have it
        for (let i = 0; i < newTimestamps.length; i++) {
            const timestamp = newTimestamps[i];
            if (anomalyData.labels.indexOf(timestamp) === -1) {
                hasNewData = true;
                timestampsToAdd.push(timestamp);
                scoresToAdd.push(newScores[i]);
            }
        }
        
        if (hasNewData) {
            console.log(`Adding ${timestampsToAdd.length} new anomaly data points`);
            
            // Add the new data points
            anomalyData.labels = [...anomalyData.labels, ...timestampsToAdd];
            anomalyData.scores = [...anomalyData.scores, ...scoresToAdd];
            
            // Keep only the most recent MAX_DATA_POINTS
            if (anomalyData.labels.length > MAX_DATA_POINTS) {
                const removeCount = anomalyData.labels.length - MAX_DATA_POINTS;
                anomalyData.labels = anomalyData.labels.slice(removeCount);
                anomalyData.scores = anomalyData.scores.slice(removeCount);
            }
            
            // Sort the data by timestamp to ensure proper ordering
            const combinedData = anomalyData.labels.map((timestamp, index) => {
                return { timestamp, score: anomalyData.scores[index] };
            });
            
            combinedData.sort((a, b) => {
                // Parse timestamps back to Date objects for comparison
                const timeA = a.timestamp.split(':');
                const timeB = b.timestamp.split(':');
                
                // Compare hours, minutes, seconds
                for (let i = 0; i < 3; i++) {
                    if (parseInt(timeA[i]) > parseInt(timeB[i])) return 1;
                    if (parseInt(timeA[i]) < parseInt(timeB[i])) return -1;
                }
                return 0;
            });
            
            // Update our data arrays with sorted values
            anomalyData.labels = combinedData.map(item => item.timestamp);
            anomalyData.scores = combinedData.map(item => item.score);
        }
    }
    
    // Update anomaly chart
    anomalyChart.data.labels = anomalyData.labels;
    anomalyChart.data.datasets[0].data = anomalyData.scores;
    anomalyChart.update();
    
    // Update attack intensity visualization
    // If we have a high anomaly score, get attack status to update intensity indicator
    const highestScore = Math.max(...anomalyData.scores, 0);
    if (highestScore > 0.6) {
        checkAttackSimulationStatus();
    }
    
    // Update threat level indicator
    updateThreatLevel(recentAnomalies.length > 0 ? recentAnomalies : data);
}

function processTrafficHistory(data) {
    // Process historical data for IP requests chart
    if (!data || data.length === 0) {
        console.log("No traffic history data available");
        return;
    }
    
    // Process the historical data
    const timestamps = data.map(entry => new Date(entry.timestamp).toLocaleTimeString());
    const requests = data.map(entry => entry.requests_per_second);
    const uniqueIps = data.map(entry => entry.unique_ips);
    const entropyValues = data.map(entry => entry.entropy_value);
    const burstScores = data.map(entry => entry.burst_score);
    
    // Only take the most recent MAX_DATA_POINTS
    const sliceStart = Math.max(0, timestamps.length - MAX_DATA_POINTS);
    
    // Update our persistent data storage
    // This ensures that data persists between refreshes
    if (timestamps.length > 0) {
        // Merge with existing data, avoiding duplicates
        const latestTimestamp = timestamps[timestamps.length - 1];
        const existingLastIndex = trafficData.labels.indexOf(latestTimestamp);
        
        if (existingLastIndex === -1) {
            // New data, append it
            trafficData.labels = [...trafficData.labels, ...timestamps.slice(sliceStart)];
            trafficData.requests = [...trafficData.requests, ...requests.slice(sliceStart)];
            trafficData.uniqueIPs = [...trafficData.uniqueIPs, ...uniqueIps.slice(sliceStart)];
            
            entropyData.labels = [...entropyData.labels, ...timestamps.slice(sliceStart)];
            entropyData.values = [...entropyData.values, ...entropyValues.slice(sliceStart)];
            entropyData.bursts = [...entropyData.bursts, ...burstScores.slice(sliceStart)];
            
            // Keep only the latest MAX_DATA_POINTS
            if (trafficData.labels.length > MAX_DATA_POINTS) {
                const removeCount = trafficData.labels.length - MAX_DATA_POINTS;
                trafficData.labels = trafficData.labels.slice(removeCount);
                trafficData.requests = trafficData.requests.slice(removeCount);
                trafficData.uniqueIPs = trafficData.uniqueIPs.slice(removeCount);
                
                entropyData.labels = entropyData.labels.slice(removeCount);
                entropyData.values = entropyData.values.slice(removeCount);
                entropyData.bursts = entropyData.bursts.slice(removeCount);
            }
        } else {
            // We already have this data, no need to append
            console.log("Data already in chart, not appending duplicates");
        }
    }
    
    // Update traffic chart with our persistent data
    trafficChart.data.labels = trafficData.labels;
    trafficChart.data.datasets[0].data = trafficData.requests;
    trafficChart.data.datasets[1].data = trafficData.uniqueIPs;
    trafficChart.update();
    
    // Update the entropy chart with persistent data
    entropyChart.data.labels = entropyData.labels;
    entropyChart.data.datasets[0].data = entropyData.values;
    entropyChart.data.datasets[1].data = entropyData.bursts;
    entropyChart.update();
    
    // For IP chart, we need to get data from the backend
    // This will be fixed in a later update
    // For now, we'll just show dummy data based on unique IPs
    if (data[0] && data[0].unique_ips > 0) {
        const dummyIps = Array.from({length: Math.min(10, data[0].unique_ips)}, 
            (_, i) => `192.168.1.${i+1}`);
        const dummyCounts = Array.from({length: dummyIps.length}, 
            () => Math.floor(Math.random() * 100) + 1);
            
        ipRequestsChart.data.labels = dummyIps;
        ipRequestsChart.data.datasets[0].data = dummyCounts;
        ipRequestsChart.update();
    }
}

function updateMitigationStatus(data) {
    const statusTable = document.getElementById('mitigationStatusTable').getElementsByTagName('tbody')[0];
    statusTable.innerHTML = '';
    
    // Add active mitigations count
    const row1 = statusTable.insertRow();
    row1.insertCell(0).textContent = 'Active Mitigations';
    row1.insertCell(1).textContent = data.active_mitigations;
    
    // Add rate-limited IPs count
    const row2 = statusTable.insertRow();
    row2.insertCell(0).textContent = 'Rate-Limited IPs';
    row2.insertCell(1).textContent = data.rate_limited_ips;
    
    // Add blocked IPs count
    const row3 = statusTable.insertRow();
    row3.insertCell(0).textContent = 'Blocked IPs';
    row3.insertCell(1).textContent = data.blocked_ips_count;
    
    // Add recent actions to the recent actions table
    const actionsTable = document.getElementById('recentActionsTable').getElementsByTagName('tbody')[0];
    actionsTable.innerHTML = '';
    
    if (data.recent_actions && data.recent_actions.length > 0) {
        data.recent_actions.forEach(action => {
            const row = actionsTable.insertRow();
            row.insertCell(0).textContent = new Date(action.timestamp).toLocaleTimeString();
            row.insertCell(1).textContent = action.ip_address;
            row.insertCell(2).textContent = action.action;
            
            // Color-code by action severity
            const scoreCell = row.insertCell(3);
            scoreCell.textContent = action.score.toFixed(3);
            
            if (action.score >= 0.8) {
                scoreCell.classList.add('text-danger');
            } else if (action.score >= 0.6) {
                scoreCell.classList.add('text-warning');
            } else {
                scoreCell.classList.add('text-info');
            }
        });
    } else {
        const row = actionsTable.insertRow();
        row.insertCell(0).colSpan = 4;
        row.textContent = 'No recent mitigation actions';
        row.classList.add('text-center');
    }
}

function updateBlockedIPs(data) {
    const blockedTable = document.getElementById('blockedIPsTable').getElementsByTagName('tbody')[0];
    blockedTable.innerHTML = '';
    
    if (data.length > 0) {
        data.forEach(block => {
            const row = blockedTable.insertRow();
            row.insertCell(0).textContent = block.ip_address;
            row.insertCell(1).textContent = new Date(block.blocked_at).toLocaleString();
            
            const severityCell = row.insertCell(2);
            severityCell.textContent = block.severity;
            
            // Color-code by severity
            if (block.severity === 'severe') {
                severityCell.classList.add('text-danger');
            } else if (block.severity === 'medium') {
                severityCell.classList.add('text-warning');
            } else {
                severityCell.classList.add('text-info');
            }
            
            // Format expiration
            const expirationCell = row.insertCell(3);
            if (block.expiration) {
                expirationCell.textContent = new Date(block.expiration).toLocaleString();
            } else {
                expirationCell.textContent = 'Permanent';
                expirationCell.classList.add('text-danger');
            }
            
            row.insertCell(4).textContent = block.reason;
        });
    } else {
        const row = blockedTable.insertRow();
        row.insertCell(0).colSpan = 5;
        row.textContent = 'No IPs currently blocked';
        row.classList.add('text-center');
    }
}

function updateThreatLevel(anomalies) {
    console.log('updateThreatLevel called with anomalies:', anomalies);
    console.log('Number of anomalies passed to updateThreatLevel:', anomalies.length);
    const threatLevelElement = document.getElementById('threatLevel');
    const threatStatusElement = document.getElementById('threatStatus');
    
    // Calculate current threat level based on recent anomaly scores
    let maxScore = 0;
    if (anomalies.length > 0) {
        // Use the most recent anomaly scores (last 5)
        const recentScores = anomalies.slice(-5).map(a => {
            console.log('Processing anomaly score:', a.anomaly_score, 'type:', typeof a.anomaly_score);
            return a.anomaly_score;
        });
        console.log('Recent scores:', recentScores);
        maxScore = Math.max(...recentScores);
        console.log('Max score calculated:', maxScore);
    }
    
    // Update threat meter
    const widthPercentage = `${maxScore * 100}%`;
    console.log('Setting threat bar width to:', widthPercentage);
    threatLevelElement.style.width = widthPercentage;
    
    // Update status text and colors
    if (maxScore >= 0.8) {
        threatLevelElement.className = 'progress-bar bg-danger';
        threatStatusElement.textContent = 'CRITICAL';
        threatStatusElement.className = 'badge bg-danger';
    } else if (maxScore >= 0.6) {
        threatLevelElement.className = 'progress-bar bg-warning';
        threatStatusElement.textContent = 'WARNING';
        threatStatusElement.className = 'badge bg-warning';
    } else if (maxScore >= 0.4) {
        threatLevelElement.className = 'progress-bar bg-info';
        threatStatusElement.textContent = 'ELEVATED';
        threatStatusElement.className = 'badge bg-info';
    } else {
        threatLevelElement.className = 'progress-bar bg-success';
        threatStatusElement.textContent = 'NORMAL';
        threatStatusElement.className = 'badge bg-success';
    }
}

function updateTimeRange() {
    const timeRange = document.getElementById('timeRangeSelector').value;
    
    // Adjust the chart data based on selected time range
    // This would typically involve fetching data with the appropriate time range
    console.log(`Time range changed to: ${timeRange} minutes`);
    
    // Fetch traffic history with new time range
    fetch(`/api/traffic/history?minutes=${timeRange}`)
        .then(response => response.json())
        .then(data => {
            processTrafficHistory(data);
        })
        .catch(error => console.error('Error fetching traffic history:', error));
    
    // Fetch anomaly data with new time range
    fetch(`/api/anomalies?minutes=${timeRange}`)
        .then(response => response.json())
        .then(data => {
            updateAnomalyData(data);
        })
        .catch(error => console.error('Error fetching anomaly data:', error));
}

function checkAttackSimulationStatus() {
    // Check if an attack simulation is running
    fetch('/api/simulate/status')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // If an attack just ended (attack_type exists but is_running is false),
            // reload the attack history to make sure it's current
            if (!data.is_running && data.attack_type) {
                setTimeout(() => {
                    // Only reload if we're on the reports page
                    if (window.location.pathname.includes('reports')) {
                        console.log('Attack ended, reloading attack history...');
                        if (typeof loadAttackHistory === 'function') {
                            loadAttackHistory();
                        }
                    }
                }, 2000); // Small delay to ensure database is updated
            }
            
            // Get or create the alert banner
            let alertBanner = document.getElementById('attackSimulationAlert');
            
            if (data.is_running) {
                // If no alert exists, create one
                if (!alertBanner) {
                    alertBanner = document.createElement('div');
                    alertBanner.id = 'attackSimulationAlert';
                    alertBanner.className = 'alert alert-danger alert-dismissible fade show mb-4';
                    alertBanner.role = 'alert';
                    
                    // Add it at the top of the main content area
                    const mainContent = document.querySelector('main .container-fluid');
                    if (mainContent) {
                        mainContent.prepend(alertBanner);
                    } else {
                        document.querySelector('main').prepend(alertBanner);
                    }
                }
                
                // Format attack details
                const attackName = data.attack_type || "Unknown";
                const duration = data.duration || "Unknown";
                const intensity = data.intensity || "Unknown";
                
                // Update alert content
                alertBanner.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>Attack Simulation Running:</strong> 
                            ${attackName} attack (Intensity: ${intensity}/10, Duration: ${duration}s)
                        </div>
                        <div>
                            <a href="/simulator" class="btn btn-sm btn-outline-light me-2">
                                <i class="fas fa-cog me-1"></i>Manage Simulation
                            </a>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    </div>
                `;
            } else if (alertBanner) {
                // Remove the alert if no attack is running
                alertBanner.remove();
            }
        })
        .catch(error => {
            console.error('Error checking attack simulation status:', error);
            // Update the attack status indicator to show an error
            const mainContent = document.querySelector('main .container-fluid');
            if (mainContent) {
                let errorBanner = document.getElementById('attackStatusError');
                if (!errorBanner) {
                    errorBanner = document.createElement('div');
                    errorBanner.id = 'attackStatusError';
                    errorBanner.className = 'alert alert-warning alert-dismissible fade show mb-4';
                    errorBanner.innerHTML = `
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                Error checking attack status. Will retry automatically.
                            </div>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    `;
                    mainContent.prepend(errorBanner);
                    
                    // Auto-remove after 10 seconds to avoid cluttering UI
                    setTimeout(() => {
                        const banner = document.getElementById('attackStatusError');
                        if (banner) {
                            banner.remove();
                        }
                    }, 10000);
                }
            }
        });
}
