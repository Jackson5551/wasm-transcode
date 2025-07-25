class Utils {
    static formatFileSize(bytes: number, decimals = 2): string {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const size = bytes / Math.pow(k, i);

        return `${size.toFixed(decimals)} ${sizes[i]}`;
    }
}

export default Utils;