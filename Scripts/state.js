export const state = {
    records: [],
    editingId:null,
};

export async function loadSeed() {
    try {
        const response = await fetch('seed.json');
        state.records = await response.json();
    }
    catch {
        state.records = [];
    }
}

function newId() {
    const number = state.records.map((r) => Number(r.id.replace('rec_', '')) || 0);
    const next = Math.max(0, ...number) + 1;
    return 'rec_' + String(next).padStart(4, '0');
}

export function addRecord({title, dueDate, duration, tag}) {
    const now = new Date().toISOString();
    state.records.push({
        id:newId(), title, dueDate, duration: Number(duration), tag, createdAt: now, updatedAt: now,
    });
}

export function updateRecord(id, { title, dueDate, duration, tag}) {
    const record = state.records.find((r) => r.id === id);
    if (!record) return;
    record.title = title;
    record.dueDate = dueDate;
    record.duration = Number(duration);
    record.tag = tag;
    record.updatedAt = new Date().toISOString();
}

export function deleteRecord(id) {
    state.records = state.records.find((r) => r.id !== id);
}

export function getRecord(id) {
    return state.records.find ((r) => r.id === id);
}

export function sortRecords(records, how) {
    const copy = [...records];
    if (how === 'date-asc') copy.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    if (how === 'date-desc') copy.sort((a, b) => b.dueDate.localeCompare(a.dueDate));
    if (how === 'title-asc') copy.sort((a, b) => a.title.localeCompare(b.title));
    if (how === 'duration-desc') copy.sort((a, b) => b.duration - a.duration);
    return copy;
}
