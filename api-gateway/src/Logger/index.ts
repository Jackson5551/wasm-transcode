const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // Use 24-hour format
});

const colors = {
    reset: "\x1b[0m",
    blue: "\x1b[34m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    gray: "\x1b[90m",
    cyan: "\x1b[36m",
    magenta: "\x1b[35m",
    brightCyan: "\x1b[96m",
    brightYellow: "\x1b[93m",
};

function getTimestamp(): string {
    return dateTimeFormatter.format(new Date());
}

export function log(type: keyof typeof colors, label: string, message: string) {
    const timestamp = getTimestamp();
    console.log(`${colors[type]}[${timestamp}] [${label}]${colors.reset} ${message}`);
}