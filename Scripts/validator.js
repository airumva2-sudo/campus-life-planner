export const patterns = {
    title: /^\S(?:.*\S)?$/,
    duration: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    tag: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    duplicateWord: /\b(\w+)\s+\1\b/i,
};

export function normalizeTitle(text) {
    return text.trim().replace(/\s{2,}/g, ' ');
}

export function isRealDate(text) {
    if (!patterns.date.test(text)) 
        return false;
    const [year, month, day] = text.split('-').map(Number);
    const d = new Date(Date.UTC(year, month - 1, day));
    return (
        d.getUTCFullYear() === year &&
        d.getUTCMonth() === month - 1 &&
        d.getUTCDate() === day
    );
}

export function validateTitle(value) {
    if (value === '') 
        return 'Title is reqired.';
    if (!patterns.title.test(value))
        return 'Title cannot start or end with space.';
    const dup = normalizeTitle(value).match(patterns.duplicateWord);
    if (dup)
        return `Repeated word found: "${dup[0]}". Please fix the typo.`;
        return '';
}

export function validateDuration(value) {
    if (value === '')
        return 'Duration is required.';
    if (!patterns.duration.test(value)) {
        return 'Use a number like 30 or 45.5 (no leading zeros, max 2 decimals).';  
    }
    return '';
}

export function validateDate(value) {
    if (value === '')
        return 'Date is required.';
    if (!patterns.date.test(value))
        return 'Use the format YYYY-MM-DD, e.g: 2026-10-15';
    if (!isRealDate(value))
        return 'The date does not exist on the calendar.';
        return '';
}

export function validateTag(value) {
    if (value === '')
        return 'Tag is required.';
    if (!patterns.tag.test(value)) {
        return 'Tag may only use letters, with single space or hyphens between words.';
    }
    return '';
}

export function validateRecord({title, date, duration, tag}) {
    const errors = {};
    const checks = {
        title: validateTitle(title),
        date: validateDate(date),
        duration: validateDuration(duration),
        tag: validateTag(tag),
    };
    for (const [field, message] of Object.entries(checks)) {
        if (message) errors[field] = message;
    }
    return errors;
}