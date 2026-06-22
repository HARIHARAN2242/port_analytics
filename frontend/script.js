// frontend/script.js
async function loadPorts() {
    const response = await fetch('http://localhost:5000/api/analytics');
    const data = await response.json();
    const grid = document.getElementById('port-grid');

    // Create a unique list of ports
    const ports = [...new Set(data.map(item => item.port_name))];

    ports.forEach(port => {
        const box = document.createElement('div');
        box.className = 'port-box';
        box.innerText = port;
        // Clicking a box saves the port name in browser storage and redirects
        box.onclick = () => {
            localStorage.setItem('selectedPort', port);
            window.location.href = 'details.html';
        };
        grid.appendChild(box);
    });
}
loadPorts();