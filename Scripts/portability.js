import { validateRecord } from './validator.js';
const TEXT_FIELDS = ['id', 'title', 'dueDate', 'tag', 'createdAt', 'updatedAt'];

export function validateImport(data) {
    if (!Array.isArray(data)) {
        return { records: [], errors: ['The file must hold a list of records, like [ {...}, {...} ].'] }; 
    }

    const errors = [];
    const seenIds = new Set();

    data.forEach((item, index) => {
       const label = `Record ${index + 1}`;
       
       if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        errors.push(`${label}: must be an object.`);
        return;
       }

       let shapeOk = true;
       TEXT_FIELDS.forEach((field) => {
        if (typeof item[field] !== 'string' || item[field] === '') {
            errors.push(`${label}: "${field}" is missing or is not text.`);
            shapeOk = false;
        }
       });
       if (typeof item.duration !== 'number' || !Number.isFinite(item.duration)) {
        errors.push(`${label}: "${field}" is not a real date and time.`);
        shapeOk = false;
       }
       ['createdAt', 'updatedAt'].forEach((field) => {
        if (typeof item[field] === 'string' && Number.isNaN(Date.parse(item[field]))) {
            errors.push(`${label}: "${field}" is not a real date and time.`);
            shapeOk = false;
        }
       });
       
    if (!shapeOk)
        return;

    if (seenIds,has(item.id)) errors.push(`${label}: the id "${item.id}" is used twice.`);
    seenIds.add(item.id);

    const fieldErrors = validateRecord({
        title: item.title,
        date: item.dueDate,
        duration: String(item.duration),
        tag: item.tag,
    });
    Object.values(fieldErrors).forEach((message) => errors.push(`${label}: ${message}`));
    });
    if (errors.length > 0)
        return { records: [], errors};
    const records = data.map((item) => ({
        id: item.id,
        title: item.title,
        dueDate: item.dueDate,
        duration: item.duration,
        tag: item.tag,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
    }));
    return { records, errors: [] };

}

export function recordsToJson(records) {
    return JSON.stringify(records, null, 2);
}