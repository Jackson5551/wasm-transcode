class MimeTypeUtils {
    private static _mimeMap: Record<string, string> = {
        mp3: "audio/mpeg",
        wav: "audio/wav",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        mp4: "video/mp4",
        mov: "video/quicktime",
        avi: "video/x-msvideo",
    };

    public static getMimeFromExtension(ext: string): string {
        return MimeTypeUtils._mimeMap[ext.toLowerCase()] || "application/octet-stream";
    }
}

export default MimeTypeUtils;