async function loadPorts() {
    try {
        // 1. Fetch from the test API route
        const response = await fetch('/test-api'); 
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Log to console so you can verify in F12
        console.log("Data received from backend:", data);

        // --- Original logic below ---
        // If the test works, we will revert this to '/api/analytics'
        const grid = document.getElementById('port-grid');
        const ports = [...new Set(data.map(item => item.port_name))];

        ports.forEach(port => {
            const box = document.createElement('div');
            box.className = 'port-box';
            box.innerText = port;
            box.onclick = () => {
                localStorage.setItem('selectedPort', port);
                window.location.href = 'details.html';
            };
            grid.appendChild(box);
        });
    } catch (error) {
        console.error("Error in loadPorts:", error);
    }
}
loadPorts();