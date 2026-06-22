async function loadPorts() {
    // CHANGE THIS: Use the relative API path instead of the website URL
    const response = await fetch('/api/analytics'); 
    
    if (!response.ok) {
        console.error("Failed to fetch data:", response.statusText);
        return;
    }

    const data = await response.json();
    const grid = document.getElementById('port-grid');

    // Create a unique list of ports
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
}
loadPorts();