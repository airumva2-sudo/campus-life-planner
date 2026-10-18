const RECORDS_KEY = 'campus-life-planner:records';
const SETTINGS_KEY = 'campus-life-planner:settings';

export function loadRecords(key = RECORDS_KEY) {
    try {
        const text = localStorage.getItem(key);
        if (text === null)
            return null;
        const data = JSON.parse(text);
        return Array.isArray(data) ? data : null;
    }
    catch {
        return null;
    }
}

export function saveRecords(records, key = RECORDS_KEY) {
    try {
        localStorage.setItem(key, JSON.stringify(records));
        return true;
    }
    catch {
        return false;
    }
}

export function loadSettings(key = SETTINGS_KEY) {
    const defaults = { 
        unit: 'minutes',
        cap: 0
    };
    try {
        const data = JSON.parse(localStorage.getItem(key));
        if (!data) 
            return defaults;
        return {
            unit: data.unit === 'hours' ? 'hours' : 'minutes',
            cap: Number.isFinite(data.cap) && data.cap >= 0 ? data.cap : 0,
        };
    }
    catch {
        return defaults;
    }
}

export function saveSettings(settings, key = SETTINGS_KEY) {
    try {
        localStorage.setItem(key, JSON.stringify(settings));
        return true;
    }
    catch {
        return false;
    }
}