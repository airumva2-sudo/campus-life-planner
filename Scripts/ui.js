import {escapeHtml, highlight} from './search.js';
const list = document.querySelector('#records-list');

export function renderRecords(records, re) {
    if (records.length === 0) {
        list.innerHTML = '<p class="empty-message">No records to show.</p>';
        return;
    }

    list.innerHTML = records.map((r) => 
    `<article class="record">
    <div class="record-info">
    <h3>${highlight(r.title, re)}</h3>
    <p>Date: ${highlight(r.dueDate, re)}</p>
    <p>Duration: ${escapeHtml(r.duration)} min</p>
    <p>Tag: ${highlight(r.tag, re)}</p>
    </div>
    <div class="record-actions">
    <button type="button" class="edit-button" data-id="${escapeHtml(r.id)}">Edit</button>
    <button type="button" class="delete-button" data-id="${escapeHtml(r.id)}">Delete</button>
    </div>
    </article>`).join('');
}
