import {patterns} from './validator.js';

export function round2(number) {
    return Math.round(number*100) / 100;
}

export function formatDuration(minutes, unit = 'minutes') {
    return unit === 'hours' ? `${round2(minutes / 60)} h` : `${round2(minutes)} min`;
}

export function toDateString(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}

export function computeStats(records, today = new Date()) {
    const totalRecords = records.length;
    const totalDuration = round2(records.reduce((sum, r) => sum + r.duration, 0));

    const counts = {};
    const firstSpelling ={};
    records.forEach((r) => {
        const key = r.tag.toLowerCase();
        counts[key] = (counts[key] || 0) + 1;
        if (!firstSpelling[key]) firstSpelling[key] = r.tag;
    });
    let topTag = 'None';
    let best = 0;
    Object.keys(counts).sort().forEach((key) => {
        if (counts[key] > best) {
            best = counts[key];
            topTag = firstSpelling[key];
        }
    });

    const trend = [];
    for (let back = 6; back >= 0; back--) {
        const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - back);
        const date = toDateString(day);
        const minutes = round2(
            records.filter((r) => r.dueDate === date).reduce((sum, r) => sum + r.duration, 0)
        );
        trend.push({date, minutes});
    }
    return {totalRecords, totalDuration, topTag, trend};
}

export function validateCap(value) {
    if (value === '')
        return 'Please enter a number (0 is not allowed).';
    if (!patterns.duration.test(value)) {
        return 'Use a number like 600 or 345.5 (no leading zeros, max 2 decimals).';
    }
    return '';
}

export function capStatus(totalDuration, cap, unit = 'minutes') {
    if (!cap) 
        return null;
    const words = unit === 'hours' ? ['hours', 'hour'] : ['minutes', 'minute'];
    const show = (minutes) => round2(unit === 'hours' ? minutes / 60 : minutes);
    const difference = round2(cap - totalDuration);
    if (difference >= 0) {
        return {
            level: 'polite',
            text: `${show(difference)} ${words[0]} remaining of your ${show(cap)} ${words[1]} target.`,
        };
    }
    return {
        level: 'assertive',
        text: `Over your weekly target by ${show(-difference)} ${words[0]}!`,
    };
}
