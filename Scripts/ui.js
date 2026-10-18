import {escapeHtml, highlight} from './search.js';
const list = document.querySelector('#records-list');
const $ = (selector) => document.querySelector(selector);

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

export function renderStats(stats, cap) {
    $('#total-records').textContent = stats.totalRecords;
    $('#total-duration').textContent = stats.totalDuration + ' min';
    $('#used-tag').textContent = stats.topTag;
    $('#target').textContent = cap ? cap + ' min' : 'Not set';

    const biggest = Math.max(1, ...stats.trend.map((day) => day.minutes));
    $('#trend-chart').innerHTML = stats.trend.map((day) => {
       const percent = Math.round((day.minutes / biggest) * 100);
       const label = `${day.date}: ${day.minutes} minutes`;
       return 
       `<li>
        <div class="bar-wrap">
        <span class="bar" style="height:${percent}%" role="img" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}"></span>
        </div>
        <span class="bar-label">${escapeHtml(day.date.slice(5))}</span>
        </li>`;
    }).join('');
}

export function renderCap(status) {
    const polite = $('#cap-polite');
    const assertive = $('#cap-assertive');
    polite.textContent = '';
    assertive.textContent = '';
    if (!status)
        return;
    (status.level === 'polite' ? polite : assertive).textContent = status.text;
}
