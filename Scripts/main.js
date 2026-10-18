import { validateRecord, normalizeTitle } from './validator.js';
import { state, loadSeed, addRecord, updateRecord, deleteRecord, getRecord, sortRecords } from './state.js';
import { compileRegex } from './search.js';
import { renderRecords, renderStats, renderCap } from './ui.js';
import { computeStats, capStatus, validateCap } from './stats.js';

const form = document.querySelector('#record');
const status = document.querySelector('#form-status');
const formHeading = document.querySelector('#form-heading');
const submitButton = form.querySelector('button[type="submit"]');
const searchBox = document.querySelector('#search');
const caseBox = document.querySelector('#case-sensitive');
const sortMenu = document.querySelector('#sort');
const searchMessage = document.querySelector('#search-message');
const resultCount = document.querySelector('#result-count');
const list = document.querySelector('#records-list');
const fieldIds = ['title', 'date', 'duration', 'tag'];

function refresh() {
    const { re, error } = compileRegex(searchBox.value, caseBox.checked);
    searchMessage.textContent = error;

    let shown = state.records;
    if (re) {
        shown = shown.filter((r) => re.test(r.title) || re.test(r.tag) || re.test(r.dueDate));  
    }
    shown = sortRecords(shown, sortMenu.value);
    renderRecords(shown, re);
    const stats = computeStats(state.records);
    renderStates(stats, state.cap);
    renderCap(capStatus(stats.totalDuration, state.cap));
    resultCount.textContent = `Showing ${shown.length} of ${state.records.length} records.`;  
}

searchBox.addEventListener('input', refresh);
caseBox.addEventListener('change', refresh);
sortMenu.addEventListener('change', refresh);

function showError(id, message) {
    const input = document.querySelector('#' + id);
    document.querySelector('#' + id + '-error').textContent = message;
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
}

function resetForm() {
    form.reset();
    fieldIds.forEach((id) => showError(id, ''));
    state.editingId = null;
    formHeading.textContent = 'Add a record';
    submitButton.textContent = 'Add Record';
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const values = {};
    fieldIds.forEach((id) => {
        values[id] = document.querySelector('#' + id).value;
    });

    const errors = validateRecord(values);
    fieldIds.forEach((id) => showError(id, errors[id] || ''));

    const firstBad = fieldIds.find((id) => errors[id]);
    if (firstBad) {
        document.querySelector('#' + firstBad).focus();
        status.textContent = 'Please fix the errors in the form.';
        return;
    }

    const data = {
        title: normalizeTitle(values.title),
        dueDate: values.date,
        duration: values.duration,
        tag: values.tag,
    };

    if (state.editingId) {
        updateRecord(state.editingId, data);
        status.textContent = 'Record updated.';
    }
    else {
        addRecord(data);
        status.textContent = 'Record added.';
    }
    resetForm();
    refresh();
});

fieldIds.forEach((id) => {
    document.querySelector('#' + id).addEventListener('input', () => showError(id, ''));
});

list.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-id]');
    if (!button) 
        return;
    const id = button.dataset.id;

    if (button.classList.contains('delete-button')) {
        const record = getRecord(id);
        if (record && confirm(`Delete "${record.title}"?`)) {
            deleteRecord(id);
            status.textContent = 'Record deleted.';
            refresh();
        }
        
    }
    if (button.classList.contains('edit-button')) {
        const record = getRecord(id);
        if (!record) 
            return;
        state.editingId = id;
        document.querySelector('#title').value = record.title;
        document.querySelector('#date').value = record.dueDate;
        document.querySelector('#duration').value = record.duration;
        document.querySelector('#tag').value = record.tag;
        formHeading.textContent = 'Edit record';
        submitButton.textContent = 'Save changes';
        status.textContent = 'Editing a record. Change it and press Save changes.';
        document.querySelector('#add-record').scrollIntoView();
        document.querySelector('#title').focus();
    }
}); 
const capFrom = document.querySelector('#cap-form');
const capInput = document.querySelector('#cap');
const capError = document.querySelector('#cap-error');
const capSaved = document.querySelector('#cap-status');

capFrom.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = validateCap(capInput.value);
    capError.textContent = message;
    if (message) {
        capInput.setAttribute('aria-invalid', 'true');
        capInput.focus();
        capSaved.textContent = '';
        return;
    }
    capInput.removeAttribute('aria-invalid');
    state.cap = Number(capInput.value);
    capSaved.textContent = state.cap ? 'Weekly target saved.' : 'Weekly target removed.';
    refresh();
});
capInput.addEventListener('input', () =>{
    capError.textContent = '';
    capInput.removeAttribute('aria-invalid');
});

await loadSeed();
refresh();
