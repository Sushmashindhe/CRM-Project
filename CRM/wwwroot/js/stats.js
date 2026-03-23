function toggleDark() {
            document.body.classList.toggle('dark-mode');
        }

function goBack() {
    window.location.href = "index.html";
}

let totalReqChart, totalChart, empManagerChart, roleChart;

async function loadTotalsNumbers() {

    const managerRes = await fetch("https://localhost:7192/api/employees/total-managers");
    const employeeRes = await fetch("https://localhost:7192/api/emp/total-employees");

    if (!managerRes.ok) {
        console.error("Manager API Error:", await managerRes.text());
        return;
    }

    if (!employeeRes.ok) {
        console.error("Employee API Error:", await employeeRes.text());
        return;
    }

    const mgrData = await managerRes.json();
    const empData = await employeeRes.json();

    document.getElementById("totalManagers").innerText = mgrData;
    document.getElementById("totalEmployees").innerText = empData;
}

async function loadRequirementsPie() {
    const res = await fetch("https://localhost:7192/api/customerrequirements/stats");
    const data = await res.json();

    if (totalReqChart) totalReqChart.destroy();

    totalReqChart = new Chart(document.getElementById("totalReqChart"), {
        type: 'pie',
        data: {
            labels: data.map(x => x.status),
            datasets: [{
                data: data.map(x => x.count),
                backgroundColor: ['#3A9DD2', '#00AD82', '#6BCB77', '#4D96FF']
            }]
        }
    });
}

async function loadTotals() {
    const managerRes = await fetch("https://localhost:7192/api/employees/total-managers");
    const employeeRes = await fetch("https://localhost:7192/api/emp/total-employees");

    if (totalChart) totalChart.destroy();

    totalChart = new Chart(document.getElementById("totalChart"), {
        type: 'doughnut',
        data: {
            labels: ["Managers", "Employees"],
            datasets: [{
                data: [await managerRes.json(), await employeeRes.json()],
                backgroundColor: ['#3A9DD2', '#00AD82']
            }]
        }
    });
}

async function loadEmpPerManager() {
    const res = await fetch("https://localhost:7192/api/employees/manager-count");
    const data = await res.json();

    if (empManagerChart) empManagerChart.destroy();

    empManagerChart = new Chart(document.getElementById("empManagerChart"), {
        type: 'bar',
        data: {
            labels: data.map(x => x.managerName),
            datasets: [{
                data: data.map(x => x.count),
                backgroundColor: ['#3A9DD2', '#00AD82'],
                borderRadius: 6
            }]
        }
    });
}

async function loadEmployeeTypes() {

    const res = await fetch("https://localhost:7192/api/emp/employee-types");

    if (!res.ok) {
        const text = await res.text();
        console.error("Employee Types API Error:", text);
        return;
    }

    const data = await res.json();

    if (roleChart) roleChart.destroy();

    roleChart = new Chart(document.getElementById("roleChart"), {
        type: 'bar',
        data: {
            labels: data.map(x => x.role),
            datasets: [{
                data: data.map(x => x.count),
                backgroundColor: ['#3A9DD2', '#00AD82'],
                borderRadius: 6
            }]
        }
    });
}

function loadAll() {
    document.getElementById("refreshBtn").innerHTML =
        "<i class='bi bi-hourglass-split'></i> Refreshing";

    setTimeout(() => {
        document.getElementById("refreshBtn").innerHTML =
            "<i class='bi bi-arrow-clockwise'></i> Refresh";
    }, 800);

    loadTotalsNumbers();
    loadRequirementsPie();
    loadTotals();
    loadEmployeeTypes();
    loadEmpPerManager();
}

window.onload = function() {
    loadAll();
};