export function escapeHtml(text) {
    return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function compileRegex(input, caseSensitive = false) {
    if (input === '') 
        return {
    re: null, error: ''};
    try {
        return {
            re: new RegExp(input, caseSensitive ? '' : 'i'), error: ''
        };
    }
    catch (err) {
        return {
            re: null, error: 'Not valid yet:' + err.message
        };
    }
}

export function highlight(text, re) {
    const str = String(text);
    if (!re) 
        return escapeHtml(str);
    const globalRe = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');

    let result = '';
    let lastIndex = 0;
    let match;
    while ((match = globalRe.exec(str)) !== null) {
        if (match[0] === '') {
            globalRe.lastIndex++;
            continue;
        }
        result += escapeHtml(str.slice(lastIndex, match.index));
        result += '<mark>' + escapeHtml(match[0]) + '</mark>';
        lastIndex = match.index + match[0].length;
    }
    return result + escapeHtml(str.slice(lastIndex));
}