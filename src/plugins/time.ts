function formatTimestamp(timestamp: number): string {
    // 创建一个新的Date对象
    const date = new Date(timestamp * 1000);

    // 使用Intl.DateTimeFormat来格式化日期
    const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
    const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
    const hour = new Intl.DateTimeFormat('en', { hour: '2-digit', hour12: false }).format(date);
    const minute = new Intl.DateTimeFormat('en', { minute: '2-digit' }).format(date);

    // 组合成最终的字符串
    return `${day} ${month} ${hour}:${minute}`;
}

export default formatTimestamp;