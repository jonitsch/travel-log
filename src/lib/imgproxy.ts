export async function getImgProxyURL(src: string, width?: number, height?: number): Promise<string> {
    const params = new URLSearchParams({
        src: src,
        width: width ? Math.round(width)?.toString() : '',
        height: height ? Math.round(height)?.toString() : ''
    });

    const response = await fetch(`/api/imgproxy?${params.toString()}`);
    let url = response.json();
    return url;
}