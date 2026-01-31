/**
 * Returns a ImgProxy-URL signed with your IMGPROXY_KEY
 * and IMGPROXY_SALT enviroment variables
 *
 * @param {string} src - path to your image (see README for more details)
 * @param {number} width - desired width (in px) of the output image
 * @param {number} height - desired height (in px) of the output image
 * @param {string} format - desired format of the output image (defaults to "webp")
 */
export async function getImgProxyURL(
    src: string,
    width?: number,
    height?: number,
    format?: string,
): Promise<string> {
    const params = new URLSearchParams({ src: src });

    if (width) params.append('width', Math.round(width).toString());
    if (height) params.append('height', Math.round(height).toString());
    if (format) params.append('format', format);

    const response = await fetch(`/api/imgproxy?${params.toString()}`);
    let url = response.json();
    return url;
}