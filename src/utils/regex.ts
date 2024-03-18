function checkMobile(content: string): boolean {
    // 中国手机号码正则，假设手机号码前可能有+86或86前缀，并考虑到可能的分隔符如空格或短横线
    const mobileRegex = /(?:\+?86)?(?:\s|-)?1[3-9]\d{9}/;
    return mobileRegex.test(content);
}

function checkEmail(content: string): boolean {
    // 简单的邮箱地址正则表达式，有效地匹配大多数邮箱格式
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    return emailRegex.test(content);
}

export { checkMobile, checkEmail };