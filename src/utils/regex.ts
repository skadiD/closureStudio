function checkIsMobile(content: string): boolean {
    // 中国手机号码正则，假设手机号码前可能有+86或86前缀，并考虑到可能的分隔符如空格或短横线
    const mobileRegex = /(?:\+?86)?(?:\s|-)?1[3-9]\d{9}/;
    return mobileRegex.test(content);
}

function checkIsEmail(content: string): boolean {
    // 简单的邮箱地址正则表达式，有效地匹配大多数邮箱格式
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    return emailRegex.test(content);
}

function getEmailUsernameLength(email: string): number {
    // 使用split方法按'@'分割邮箱地址，并取第一个元素（即邮箱名）
    const username = email.split("@")[0];
    // 返回邮箱名的长度
    return username.length;
}

export { checkIsMobile, checkIsEmail, getEmailUsernameLength };
