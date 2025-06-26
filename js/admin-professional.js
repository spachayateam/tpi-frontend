import { decodeJWT } from "./jwt-decode.js";
import endpoint from "./endpoint.js";

const session = sessionStorage.getItem('session');
const tokenPayload = decodeJWT(session);

if (tokenPayload.role !== 'ADMIN') {
    window.location.href = '/index.html';
}

async function getProfessionals() {
    const response = await fetch(`${endpoint}/professionals`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Role": `${tokenPayload.role}`,
        },
    });
    const profesionales = await response.json();
    if (profesionales) {
        renderTable(profesionales);
    }
    else {
        renderTable([]);z
    }
}

function renderTable(data) {
    const container = document.getElementById('table-container');
    const table = document.createElement('table');
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.fontFamily = "Arial, sans-serif";

    const headers = ["ID", "Email", "Nombre", "Teléfono", "Sección", "Edad", "Rol", "Creado", "Actualizado", "Acciones"];
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        th.style.border = "1px solid #ccc";
        th.style.padding = "8px";
        th.style.background = "#f4f4f4";
        th.style.textAlign = "left";
        headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach(pro => {
        const row = document.createElement('tr');

        [
            pro.id, pro.email, pro.name, pro.phone, pro.section,
            pro.age, pro.role, pro.created_at, pro.updated_at
        ].forEach(val => {
            const td = document.createElement('td');
            td.textContent = val;
            td.style.border = "1px solid #ccc";
            td.style.padding = "8px";
            td.style.maxWidth = "250px"
            td.style.overflowX = "auto";
            row.appendChild(td);
        });

        const actionTd = document.createElement('td');
        actionTd.style.display = 'flex';
        actionTd.style.flexDirection = 'column';
        actionTd.style.gap = '6px';
        actionTd.style.padding = '10px';

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = "Eliminar cuenta";
        deleteBtn.style.cssText = "background:#e74c3c;color:white;border:none;padding:6px;border-radius:4px;cursor:pointer";
        deleteBtn.onclick = () => deleteProfessional(pro.id);

        const demoteBtn = document.createElement('button');
        demoteBtn.textContent = "Eliminar rango";
        demoteBtn.style.cssText = "background:#f39c12;color:white;border:none;padding:6px;border-radius:4px;cursor:pointer";
        demoteBtn.onclick = () => updateRole(pro.id, "PREPROFESSIONAL");

        const promoteBtn = document.createElement('button');
        promoteBtn.textContent = "Hacer profesional";
        promoteBtn.style.cssText = "background:#2ecc71;color:white;border:none;padding:6px;border-radius:4px;cursor:pointer";
        promoteBtn.onclick = () => updateRole(pro.id, "PROFESSIONAL");

        actionTd.appendChild(deleteBtn);
        actionTd.appendChild(demoteBtn);
        actionTd.appendChild(promoteBtn);
        row.appendChild(actionTd);
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.innerHTML = '';
    container.appendChild(table);
}

async function deleteProfessional(id) {
    if (!confirm("¿Estás seguro de eliminar este profesional?")) return;
    const response = await fetch(`${endpoint}/professionals/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "Role": `${tokenPayload.role}` },
    });
    
    const data = await response.json();
    alert(data.message);
    getProfessionals();
}

async function updateRole(id, newRole) {
    const response = await fetch(`${endpoint}/professionals/${id}/role`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ role: newRole, roleOfAdmin: tokenPayload.role })
    });
    const data = await response.json();
    alert(data.message)
    getProfessionals();
}

  document.addEventListener("DOMContentLoaded", () => {
    getProfessionals();
  });