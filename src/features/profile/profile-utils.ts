export function maskPhone(phone?: string) {
    if (!phone) return "휴대폰";
    const digits = phone.replace(/\D/g, "");
    return `010-****-${digits.slice(-4)}`;
}

export function resizeProfileImage(file: File) {
    return new Promise<string>((resolve, reject) => {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);
        image.onload = () => {
            try {
                const size = Math.min(image.naturalWidth, image.naturalHeight);
                const canvas = document.createElement("canvas");
                canvas.width = 320;
                canvas.height = 320;
                const context = canvas.getContext("2d");
                if (!context) throw new Error("이미지를 처리하지 못했습니다.");
                context.drawImage(
                    image,
                    (image.naturalWidth - size) / 2,
                    (image.naturalHeight - size) / 2,
                    size,
                    size,
                    0,
                    0,
                    320,
                    320,
                );
                resolve(canvas.toDataURL("image/webp", 0.82));
            } catch (error) {
                reject(error);
            } finally {
                URL.revokeObjectURL(objectUrl);
            }
        };
        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("이미지를 읽지 못했습니다."));
        };
        image.src = objectUrl;
    });
}
