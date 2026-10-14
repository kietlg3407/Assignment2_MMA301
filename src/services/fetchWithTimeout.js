// Bọc fetch để request mạng không quay vô hạn khi máy chủ hoặc mạng bị treo.
export async function fetchWithTimeout(url, options = {}, timeoutMs = 15_000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    // AbortController phát AbortError khi hết thời gian chờ; chuyển thành thông báo dễ hiểu.
    if (controller.signal.aborted || error.name === 'AbortError') {
      throw new Error('Máy chủ phản hồi quá lâu. Vui lòng kiểm tra kết nối và thử lại.');
    }
    throw error;
  } finally {
    // Dọn timer dù request thành công hay lỗi để tránh giữ timer không cần thiết.
    clearTimeout(timeoutId);
  }
}
