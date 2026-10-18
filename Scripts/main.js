import { validateRecord, normalizeTitle } from './validator.js';
import { state, loadSeed, addRecord, updateRecord, deleteRecord, getRecord, sortRecords } from './state.js';
import { compileRegex } from './search.js';
import { renderRecords, renderStats, renderCap } from './ui.js';
import { computeStats, capStatus, validateCap } from './stats.js';
import { loadRecords, saveRecords, loadSettings, saveSettings } from './storage.js';
import { validateImport, recordsToJson } from './portability.js';


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
const unitMenu = document.querySelector('#unit');
const capForm = document.querySelector('#cap-form');
const capInput = document.querySelector('#cap');
const capError = document.querySelector('#cap-error');
const capSaved = document.querySelector('#cap-status');
const exportButton = document.querySelector('#export-btn');
const sampleButton = document.querySelector('#sample-btn');
const importFile = document.querySelector('#import-file');
const dataStatus = document.querySelector('#data-status');
const importError = document.querySelector('#import-error');
const fieldIds = ['title', 'date', 'duration', 'tag'];


function persist() {
    const savedRecords = saveRecords(state.records);
    const savedSettings = saveSettings({unit: state.unit, cap: state.cap});
    if ( !savedRecords || !savedSettings) {
        dataStatus.textContent = 'Warning: your browser would not save your data, so it will be lost when you close this page.';
    }
}

function changed () {
    persist();
    refresh();
}

function refresh() {
    const { re, error } = compileRegex(searchBox.value, caseBox.checked);
    searchMessage.textContent = error;

    let shown = state.records;
    if (re) {
        shown = shown.filter((r) => re.test(r.title) || re.test(r.tag) || re.test(r.dueDate));  
    }
    shown = sortRecords(shown, sortMenu.value);
    renderRecords(shown, re, state.unit);
    const stats = computeStats(state.records);
    renderStats(stats, state.cap, state.unit);
    renderCap(capStatus(stats.totalDuration, state.cap, state.unit));
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

unitMenu.addEventListener('change', () => {
    state.unit = unitMenu.value;
    changed();
});

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

exportButton.addEventListener('click', () => {
    const blob = new Blog([recordsToJson(state.records)], { type: 'application/json'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `campus-life-planne-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    importError.textContent = '';
    dataStatus.textContent = `Exported ${state.records.length} records.`; 
});

importFile.addEventListener('change', async() => {
    const file = importFile.files[0];
    importError.textContent = '';
    dataStatus.textContent = '';
    if (!file)
        return;

    let data;
    try {
        data = JSON.parse(await file.text());
    }
    catch {
        importError.textContent = 'That file is not valid JSON, so nothing was imported.';
        importFile.value = '';
        return;
    }

    const {records, errors} = validateImport(data);
    if (errors.length > 0) {
        const shown = errors.slice(0,5).join('');
        const more = errors.length > 5 ? ` ...and ${errors.length - 5} more problems.` : '';
        importError.textContent = `Nothing was imported. ${shown}${more}`;
        importFile.value = '';
        return;
    }

    if (!confirm(`Replace your ${state.records.length} records with the ${records.length} records in this file?`)) {
        importFile.value = '';
        return;
    }
    state.records = records;
    resetForm();
    changed();
    dataStatus.textContent = `Imported ${records.length} records.`;
    importFile.value = '';
});

sampleButton.addEventListener('click', async() => {
    if (!confirm('Replace your records with the sample data?'))
        return;
    await loadSeed();
    resetForm();
    changed();
    importError.textContent = '';
    dataStatus.textContent = 'Sample data loaded.';
});

const savedRecords = loadRecords();
if (savedRecords) {
    state.records = savedRecords;
} else {
    await loadSeed();
}

const settings = loadSettings();
state.unit = settings.unit;
state.cap = settings.cap;
unitMenu.value = state.unit;
capInput.value = state.cap ? state.cap : '';
changed();
