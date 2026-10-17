import { validateRecord } from './validator.js';
const form = document.querySelector('#record');
const status = document.querySelector('#form-status');
const fieldIds = ['title', 'date', 'duration', 'tag'];

function showError(id, message) {
    const input = document.querySelector('#' + id);
    document.querySelector('#' + id + '-error').textContent = message;
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
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
    status.textContent = 'Looks good!';
});
fieldIds.forEach((id) => {
    document.querySelector('#' + id).addEventListener('input', () => showError(id, ''));
});