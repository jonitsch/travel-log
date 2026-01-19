export async function getImgProxyURL(
    src: string,
    width?: number,
    height?: number,
    format?: string): Promise<string> {
    const params = new URLSearchParams();
    params.append('src', src);
    if (width) params.append('width', Math.round(width).toString());
    if (height) params.append('height', Math.round(height).toString());
    if (format) params.append('format', format);

    const response = await fetch(`/api/imgproxy?${params.toString()}`);
    let url = response.json();
    return url;
}